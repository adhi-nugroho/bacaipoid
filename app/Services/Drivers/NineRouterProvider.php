<?php

namespace App\Services\Drivers;

use App\Services\Contracts\AiProvider;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NineRouterProvider implements AiProvider
{
    private string $baseUrl;

    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.ninerouter.base_url'), '/');
        $this->apiKey = config('services.ninerouter.api_key', '');
    }

    /**
     * Send prompts to 9router AI and return response.
     */
    public function generate(
        string $systemPrompt,
        string $userPrompt,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null
    ): string {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => $userPrompt],
        ];

        return $this->generateChat($messages, $model, $maxTokens, $temperature, $timeout);
    }

    /**
     * Send a full chat history to 9router AI and return response.
     */
    public function generateChat(
        array $messages,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null
    ): string {
        $payload = [
            'model' => $model ?? '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
            'messages' => $messages,
            'max_tokens' => $maxTokens ?? 1024,
            'temperature' => $temperature ?? 0.75,
        ];

        $response = Http::withToken($this->apiKey)
            ->withHeaders([
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name', 'Marev Labs'),
            ])
            ->timeout($timeout ?? 180)
            ->post("{$this->baseUrl}/chat/completions", $payload);

        if ($response->failed()) {
            Log::error('[NineRouterProvider] API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new Exception("9router API error [{$response->status()}]: ".$response->body());
        }

        $rawBody = $response->body();

        // Bersihkan suffix 'data: [DONE]' jika ada dari response body
        if (str_contains($rawBody, 'data: [DONE]')) {
            $rawBody = trim(str_replace('data: [DONE]', '', $rawBody));
        }

        $decoded = json_decode($rawBody, true);
        $content = $decoded['choices'][0]['message']['content'] ?? '';

        if ($content === '') {
            Log::warning('[NineRouterProvider] Empty content received', [
                'model' => $model,
                'status' => $response->status(),
                'raw_body' => $response->body(),
                'body' => $decoded,
            ]);
        }

        return $content;
    }
}
