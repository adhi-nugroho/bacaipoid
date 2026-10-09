<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Qdrant\Config;
use Qdrant\Http\Builder;
use Qdrant\Models\PointsStruct;
use Qdrant\Models\PointStruct;
use Qdrant\Models\Request\CreateCollection;
use Qdrant\Models\Request\SearchRequest;
use Qdrant\Models\Request\VectorParams;
use Qdrant\Models\VectorStruct;
use Qdrant\Qdrant;

class QdrantService
{
    private Qdrant $client;

    private string $collection;

    public function __construct()
    {
        $config = new Config(config('services.qdrant.host').':'.config('services.qdrant.port'));

        if ($apiKey = config('services.qdrant.api_key')) {
            $config->setApiKey($apiKey);
        }

        $transport = (new Builder)->build($config);
        $this->client = new Qdrant($transport);
        $this->collection = config('services.qdrant.collection', 'chatbot_knowledge');
    }

    public function deleteCollection(): void
    {
        $this->client->collections($this->collection)->delete();
    }

    public function ensureCollection(int $vectorSize = 384): void
    {
        $response = $this->client->collections($this->collection)->exists();

        if (! ($response['result']['exists'] ?? false)) {
            $schema = new CreateCollection;
            $schema->setVectors(new VectorParams($vectorSize, VectorParams::DISTANCE_COSINE));
            $this->client->collections($this->collection)->create($schema);
        }
    }

    public function upsert(string|int $id, array $vector, array $payload = []): array
    {
        $points = new PointsStruct;
        $points->addPoint(new PointStruct($id, new VectorStruct($vector), $payload));

        $response = $this->client->collections($this->collection)->points()->upsert($points, ['wait' => 'true']);

        return $response->__toArray();
    }

    public function search(array $vector, int $limit = 3): array
    {
        $request = (new SearchRequest(new VectorStruct($vector)))
            ->setLimit($limit)
            ->setWithPayload(true);

        $response = $this->client->collections($this->collection)->points()->search($request);

        return $response['result'] ?? [];
    }

    public function getEmbedding(string $text): ?array
    {
        $apiKey = config('services.cloudflare.api_key');
        $accountId = (string) config('services.cloudflare.account_id');
        if ($accountId === '') {
            return null;
        }
        $baseUrl = rtrim((string) config('services.cloudflare.base_url'), '/')
            ."/accounts/{$accountId}/ai/v1";
        $model = '@cf/baai/bge-small-en-v1.5';

        if (! $apiKey) {
            return null;
        }

        $response = Http::withToken($apiKey)
            ->timeout(15)
            ->post("{$baseUrl}/embeddings", [
                'model' => $model,
                'input' => [$text],
            ]);

        if ($response->failed()) {
            return null;
        }

        return $response->json('data.0.embedding');
    }

    public function searchByText(string $query, int $limit = 3): array
    {
        $embedding = $this->getEmbedding($query);

        if (! $embedding) {
            return [];
        }

        try {
            return $this->search($embedding, $limit);
        } catch (\Throwable $exception) {
            Log::warning('[QdrantService] Search unavailable', [
                'error' => $exception->getMessage(),
            ]);

            return [];
        }
    }
}
