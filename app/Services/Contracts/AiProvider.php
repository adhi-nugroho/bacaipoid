<?php

namespace App\Services\Contracts;

interface AiProvider
{
    /**
     * Send prompts to the AI provider and return the response text.
     */
    public function generate(
        string $systemPrompt,
        string $userPrompt,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null
    ): string;

    /**
     * Send a full chat history to the AI provider and return the response text.
     *
     * @param  array  $messages  Array of messages with 'role' and 'content' keys.
     */
    public function generateChat(
        array $messages,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null
    ): string;
}
