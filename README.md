# MariBacaIPO

MariBacaIPO menyajikan katalog dan analisis prospektus IPO Indonesia. Aplikasi terdiri dari Laravel 13, Inertia/React, worker Python untuk scraping dan parsing prospektus, MariaDB, Redis, serta Qdrant untuk pencarian semantik.

## Menjalankan aplikasi

Prasyarat: Docker Compose, atau PHP 8.3+, Composer, Bun/Node, Python 3.12, MariaDB, Redis, dan Qdrant.

```bash
cp .env.example .env
composer install
bun install
python3 -m venv python/venv
python/venv/bin/pip install -r python/requirements.txt
php artisan key:generate
docker compose up -d
php artisan migrate
```

Isi kredensial Cloudflare dan Sumopod di `.env` jika fitur AI diperlukan.

Untuk development tanpa Docker:

```bash
composer run dev
```

## Sinkronisasi IPO

Scheduler menjalankan `php artisan ipo:sync` setiap jam tanpa overlap. Command mengambil daftar e-IPO lalu mengirim satu queue job per emiten. Setiap job:

1. mengambil detail dan prospektus;
2. mengekstrak data sebagai draft;
3. menyimpan satu IPO beserta relasinya dalam transaksi database;
4. mengirim embedding ke Qdrant setelah commit berhasil.

Hasil scraper mulai sebagai draft dan hanya dipublikasikan otomatis setelah validasi kelengkapan scalar utama, alokasi dana, finansial, risiko, dan underwriter. Kegagalan validasi tidak mengganti versi data sebelumnya.

Scheduler juga menjalankan `php artisan ipo:sync-statuses` setiap hari pukul 01:30.
Command ini mengambil snapshot ringan dari e-IPO, termasuk kartu yang sudah ditutup,
dan hanya memajukan status `book_building` → `offering` → `listed` tanpa menjalankan
ulang parsing prospektus atau analisis AI.

Queue worker harus berjalan:

```bash
php artisan queue:work --tries=3 --timeout=240
```

## Verifikasi

```bash
php artisan test
bun run typecheck
bun run build
python/venv/bin/python -m unittest discover -s python/tests
```

PHP test menggunakan SQLite in-memory dan tidak membutuhkan MariaDB. Integrasi HTTP eksternal harus dipalsukan pada test.

## Operasional dan keamanan

- Hanya IPO berstatus `published` yang boleh diakses endpoint publik dan AI.
- Chat dan valuasi memiliki rate limit per menit; chat juga memiliki kuota harian.
- Identitas sesi chat anonim disimpan di session, bukan ditentukan dari IP.
- Data finansial yang tidak ditemukan disimpan sebagai `null`, bukan angka asumsi.
- Database, Redis, dan Qdrant hanya berada pada network internal Compose.
- Endpoint health Laravel tersedia pada `/up`.
