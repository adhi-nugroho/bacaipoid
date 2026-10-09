<?php

namespace App\Console\Commands;

use App\Jobs\SyncIpoJob;
use Illuminate\Bus\Batch;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

#[Signature('ipo:sync')]
#[Description('Sinkronisasi data saham IPO terbaru dari e-IPO secara live menggunakan Python scraper')]
class IpoSyncCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Memulai proses sinkronisasi data IPO dari e-IPO...');

        // Existing records are retained until a complete replacement is validated.
        $this->info('Mendapatkan daftar IPO aktif...');
        $pythonBin = (config('services.python.venv') ?: base_path('python/venv')).'/bin/python';
        $result = Process::path(base_path())
            ->timeout(60)
            ->run([$pythonBin, 'python/fetch_ipo_data.py', '--list-only']);

        if (! $result->successful()) {
            $this->error('Gagal mendapatkan daftar IPO aktif!');
            $this->line($result->errorOutput());

            return self::FAILURE;
        }

        $output = trim($result->output());
        $ipos = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Gagal men-decode JSON daftar IPO! Output bukan JSON yang valid.');
            $this->line($output);

            return self::FAILURE;
        }

        if (empty($ipos)) {
            $this->info('Tidak ada saham IPO aktif yang ditemukan untuk disinkronkan.');

            return self::SUCCESS;
        }

        $this->info('Menemukan '.count($ipos).' emiten aktif. Membuat batch sinkronisasi...');

        $jobs = [];
        foreach ($ipos as $ipo) {
            $jobs[] = new SyncIpoJob($ipo);
        }

        $batch = Bus::batch($jobs)
            ->then(function () {
                Log::info('[IpoSyncCommand] Batch sinkronisasi IPO selesai dengan sukses!');
            })
            ->catch(function (Batch $batch, \Throwable $e) {
                Log::error('[IpoSyncCommand] Batch sinkronisasi IPO gagal: '.$e->getMessage());
            })
            ->name('Sync IPO Data')
            ->dispatch();

        $this->info('Batch sinkronisasi berhasil dikirim ke antrean dengan ID: '.$batch->id);

        return self::SUCCESS;
    }
}
