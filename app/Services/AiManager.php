<?php

namespace App\Services;

use App\Services\Contracts\AiProvider;
use App\Services\Drivers\CloudflareProvider;
use App\Services\Drivers\NineRouterProvider;
use App\Services\Drivers\SumopodProvider;

class AiManager
{
    /**
     * Resolve the AI provider instance dynamically.
     *
     * @param  string  $provider  Name of the provider ('sumopod', 'cloudflare', 'ninerouter', or '9router')
     */
    public function make(string $provider): AiProvider
    {
        return match (strtolower($provider)) {
            'sumopod' => new SumopodProvider,
            'cloudflare' => new CloudflareProvider,
            'ninerouter', '9router' => new NineRouterProvider,
            default => throw new \InvalidArgumentException("Unknown AI provider: {$provider}"),
        };
    }
}
