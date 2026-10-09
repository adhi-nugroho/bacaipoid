<?php

namespace App\Console\Commands;

use App\Models\Ipo;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

#[Signature('ipo:sync-statuses')]
#[Description('Perbarui status IPO dari snapshot terbaru e-IPO')]
class SyncIpoStatusesCommand extends Command
{
    private const STATUS_RANK = [
        'book_building' => 0,
        'offering' => 1,
        'listed' => 2,
    ];

    public function handle(): int
    {
        $pythonBin = (config('services.python.venv') ?: base_path('python/venv')).'/bin/python';
        $result = Process::path(base_path())
            ->timeout(60)
            ->run([$pythonBin, 'python/fetch_ipo_data.py', '--status-only']);

        if (! $result->successful()) {
            $this->error('Gagal mengambil snapshot status IPO dari e-IPO.');
            $this->line($result->errorOutput());

            return self::FAILURE;
        }

        $snapshot = json_decode(trim($result->output()), true);

        if (! is_array($snapshot) || json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Snapshot status IPO bukan JSON yang valid.');

            return self::FAILURE;
        }

        $updated = 0;

        foreach ($snapshot as $item) {
            $code = $item['code'] ?? null;
            $newStatus = $item['status'] ?? null;
            $listingDate = $item['listing_date'] ?? null;

            if (! is_string($code) || ! is_string($newStatus) || ! isset(self::STATUS_RANK[$newStatus])) {
                continue;
            }

            $ipo = Ipo::query()->where('code', $code)->first();

            if (! $ipo || ! isset(self::STATUS_RANK[$ipo->status])) {
                continue;
            }

            $updateData = [];

            if (self::STATUS_RANK[$newStatus] > self::STATUS_RANK[$ipo->status]) {
                $updateData['status'] = $newStatus;
            }

            if ($listingDate && ! $ipo->listing_date) {
                $updateData['listing_date'] = $listingDate;
            }

            if (! empty($updateData)) {
                $updateData['source_synced_at'] = now();
                $ipo->update($updateData);
                $updated++;
            }
        }

        $this->info("Status {$updated} IPO berhasil diperbarui.");

        return self::SUCCESS;
    }
}
