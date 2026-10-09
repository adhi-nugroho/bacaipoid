<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'cloudflare' => [
        'api_key' => env('CLOUDFLARE_WORKER_API_TOKEN'),
        'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
        'base_url' => env('CLOUDFLARE_BASE_URL', 'https://api.cloudflare.com/client/v4'),
    ],

    'qdrant' => [
        'host' => env('QDRANT_HOST', 'http://qdrant'),
        'port' => env('QDRANT_PORT', '6333'),
        'collection' => env('QDRANT_COLLECTION', 'ipo_analyses'),
    ],

    'ninerouter' => [
        'api_key' => env('NINEROUTER_API_KEY'),
        'base_url' => env('NINEROUTER_BASE_URL'),
    ],

    'sumopod' => [
        'api_key' => env('SUMOPOD_API_KEY'),
        'base_url' => env('SUMOPOD_BASE_URL'),
    ],

    'python' => [
        'venv' => env('PYTHON_VENV'),
    ],

    'openrouter' => [
        'api_key' => env('OPEN_ROUTER_API_KEY'),
    ],

];
