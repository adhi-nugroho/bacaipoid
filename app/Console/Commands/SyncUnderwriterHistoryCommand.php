<?php

namespace App\Console\Commands;

use App\Models\Underwriter;
use App\Models\UnderwriterIpoHistory;
use App\Services\MarketPerformanceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class SyncUnderwriterHistoryCommand extends Command
{
    protected $signature = 'ipo:sync-underwriter-history {--limit=6}';

    protected $description = 'Sinkronisasi histori IPO per underwriter dan performa 30/90 hari';

    public function handle(MarketPerformanceService $performance): int
    {
        $codes = Underwriter::query()->pluck('code')->filter()->unique()->values();
        if ($codes->isEmpty()) {
            $this->warn('Belum ada kode underwriter untuk disinkronkan.');

            return self::SUCCESS;
        }

        $python = (config('services.python.venv') ?: base_path('python/venv')).'/bin/python';
        $result = Process::path(base_path())->timeout(900)->run([
            $python,
            'python/sync_underwriter_history.py',
            '--underwriters', $codes->implode(','),
            '--limit', (string) max(1, (int) $this->option('limit')),
        ]);

        if (! $result->successful()) {
            $this->error($result->errorOutput());

            return self::FAILURE;
        }

        $rows = json_decode($result->output(), true);
        if (! is_array($rows)) {
            $this->error('Output scraper histori bukan JSON valid.');

            return self::FAILURE;
        }

        foreach ($rows as $row) {
            UnderwriterIpoHistory::updateOrCreate(
                ['underwriter_code' => $row['underwriter_code'], 'code' => $row['code']],
                $row
            );
        }

        UnderwriterIpoHistory::query()
            ->whereIn('underwriter_code', $codes)
            ->get()
            ->each(fn (UnderwriterIpoHistory $history) => $performance->update($history));

        $this->info('Histori underwriter tersinkronisasi: '.count($rows).' relasi.');

        return self::SUCCESS;
    }
}
