<?php

namespace App\Services\Drivers;

use App\Services\Contracts\AiProvider;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudflareProvider implements AiProvider
{
    private string $baseUrl;

    private string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.cloudflare.api_key') ?? '';
        $accountId = (string) config('services.cloudflare.account_id');
        $base = rtrim((string) config('services.cloudflare.base_url'), '/');
        $this->baseUrl = "{$base}/accounts/{$accountId}/ai/v1";
    }

    /**
     * Send prompts to Cloudflare AI and return response.
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
     * Send a full chat history to Cloudflare AI and return response.
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
            'max_tokens' => $maxTokens ?? 512,
            'temperature' => $temperature ?? 0.75,
        ];

        $response = Http::withToken($this->apiKey)
            ->timeout($timeout ?? 180)
            ->post("{$this->baseUrl}/chat/completions", $payload);

        if ($response->failed()) {
            Log::error('[CloudflareProvider] API error', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);
            throw new Exception("Cloudflare API error [{$response->status()}]: ".$response->body());
        }

        $content = $response->json('choices.0.message.content') ?? '';

        if ($content === '') {
            Log::warning('[CloudflareProvider] Empty content received', [
                'model' => $model,
                'body' => $response->json(),
            ]);
        }

        return $content;
    }
}
