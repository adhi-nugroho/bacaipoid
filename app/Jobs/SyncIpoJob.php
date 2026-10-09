<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class SyncIpoJob implements ShouldQueue
{
    use Batchable, Queueable;

    public int $tries = 3;

    public int $timeout = 600;

    public array $backoff = [30, 120, 300];

    /**
     * Create a new job instance.
     */
    public function __construct(public array $ipoData) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Jika batch dibatalkan, batalkan eksekusi
        if ($this->batch() && $this->batch()->cancelled()) {
            return;
        }

        $code = $this->ipoData['code'] ?? null;
        if (! $code) {
            return;
        }

        Log::info("[SyncIpoJob] Memulai sinkronisasi emiten: {$code}");

        $pythonBin = (config('services.python.venv') ?: base_path('python/venv')).'/bin/python';

        $command = [
            $pythonBin,
            'python/fetch_ipo_data.py',
            '--sync-one',
            '--code', $code,
            '--company', $this->ipoData['company_name'] ?? '',
            '--sector', $this->ipoData['sector'] ?? '',
            '--price', (string) ($this->ipoData['ipo_price'] ?? 150),
            '--shares', (string) ($this->ipoData['offering_shares'] ?? 1000000000),
            '--status', $this->ipoData['status'] ?? 'book_building',
        ];

        if (! empty($this->ipoData['detail_url'])) {
            $command[] = '--detail-url';
            $command[] = $this->ipoData['detail_url'];
        }

        if (! empty($this->ipoData['prospectus_pdf_url'])) {
            $command[] = '--prospectus-url';
            $command[] = $this->ipoData['prospectus_pdf_url'];
        }

        $result = Process::path(base_path())
            ->timeout(540)
            ->run($command);

        if ($result->successful()) {
            Log::info("[SyncIpoJob] Sukses sinkronisasi emiten: {$code}.");
        } else {
            Log::error("[SyncIpoJob] Gagal sinkronisasi emiten: {$code}. Error: ".$result->errorOutput());
            throw new \Exception("Gagal sinkronisasi emiten {$code}: ".$result->errorOutput());
        }
    }
}
