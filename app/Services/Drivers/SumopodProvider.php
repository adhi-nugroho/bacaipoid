<?php

namespace App\Services\Drivers;

use App\Services\Contracts\AiProvider;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SumopodProvider implements AiProvider
{
    private string $baseUrl;

    private string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.sumopod.api_key') ?? '';
        $this->baseUrl = rtrim((string) config('services.sumopod.base_url'), '/');
    }

    /**
     * Send prompts to Sumopod AI and return response.
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
     * Send a full chat history to Sumopod AI and return response.
     */
    public function generateChat(
        array $messages,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null
    ): string {
        $payload = [
            'model' => $model ?? 'deepseek-v4-flash',
            'messages' => $messages,
            'max_tokens' => $maxTokens ?? 512,
            'temperature' => $temperature ?? 0.75,
        ];

        $response = Http::withToken($this->apiKey)
            ->timeout($timeout ?? 180)
            ->post("{$this->baseUrl}/chat/completions", $payload);

        if ($response->failed()) {
            Log::error('[SumopodProvider] API error', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);
            throw new Exception("Sumopod API error [{$response->status()}]: ".$response->body());
        }

        $content = $response->json('choices.0.message.content') ?? '';

        if ($content === '') {
            Log::warning('[SumopodProvider] Empty content received', [
                'model' => $model,
                'body' => $response->json(),
            ]);
        }

        return $content;
    }
}
