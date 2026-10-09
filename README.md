# MariBacaIPO

IPO prospectus intelligence for the Indonesian market. Catalog, structured analysis, and AI-assisted research on every active IPO, built on verified filing data.

[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Inertia](https://img.shields.io/badge/Inertia-2-9553E9?logo=inertia&logoColor=white)](https://inertiajs.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Semantic%20Search-DC244C?logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey)](#license)

## Overview

MariBacaIPO turns dense Indonesian IPO prospectuses into structured, comparable, decision-ready information.

Indonesia publishes IPO deal flow through the official e-IPO system of the Indonesia Stock Exchange. Each deal ships with a long PDF prospectus: offering terms, use of proceeds, financial statements, risk factors, shareholders, lockups, and underwriters. MariBacaIPO ingests that source material daily, parses it into a relational model, gates publication behind a completeness check, and serves it through a fast catalog with per-issuer analysis pages.

Who it serves:

- Retail and professional investors screening Indonesian IPOs
- Analysts comparing offering structure, dilution, and use of proceeds
- Teams that need a clean, machine-usable record of each deal instead of scattered PDFs

What makes it different from a generic screener:

- Prospectus-first data model, not just price and ticker
- Draft-to-published validation gate so incomplete parses never replace good data
- Underwriter track record attached to every deal
- Semantic search over analyzed content, backed by Qdrant
- Conservative data policy: missing financial values stay `null`, never invented

## Key Features

- IPO catalog limited to verified, published deals in `book_building` and `offering` status
- Per-issuer analysis page: offering terms, proceeds allocation, ownership and dilution, lockups, shareholders, underwriters, multi-year financials, auditor opinion, risk factors, related-party exposure
- Automated e-IPO ingestion: list fetch, per-issuer queue job, prospectus download, PDF parsing, draft extraction, transactional persist
- Validation gate: drafts are published only after core scalars, proceeds allocation, financials, risks, and underwriters pass completeness checks
- Status-only daily sync that advances `book_building` to `offering` to `listed` without re-parsing prospectuses or re-running AI analysis
- Underwriter history: current-issuer matches plus an archived history table with post-listing returns
- AI-assisted valuation estimate, deferred on the detail page and cached for 24 hours, with an explicit `undervalued`, `fair`, or `overvalued` status
- Pluggable AI providers behind one contract: Cloudflare Workers AI, Sumopod, and 9Router-compatible endpoints
- SEO-ready public surface: server-rendered catalog and detail pages, dynamic `sitemap.xml`, `robots.txt`
- Production runtime on FrankenPHP with Laravel Octane, Caddy, queue workers, scheduler, and Reverb for realtime

## Architecture

```text
e-IPO (IDX) --> Laravel scheduler --> queue batch --> Python worker --> MariaDB
                                                        |
                                                        +--> PDF prospectus --> parsed draft --> validation gate --> published IPO
                                                        +--> embeddings --> Qdrant --> semantic search and AI context

MariaDB + Qdrant --> Laravel API + Inertia --> React catalog and issuer pages
```

Request path:

1. Scheduler dispatches `ipo:sync` daily. The command lists active issuers, then dispatches one `SyncIpoJob` per issuer in a Laravel batch.
2. Each job shells out to the Python worker (`fetch_ipo_data.py --sync-one`), which scrapes deal detail, downloads the prospectus PDF, parses it, and persists one IPO with relations inside a database transaction.
3. Parsed rows start as drafts. A completeness check promotes them to `published`. Failed validation keeps the previous published version untouched.
4. After commit, embeddings are pushed to Qdrant for semantic retrieval.
5. The web layer serves published data only. Valuation is computed lazily and cached.

Services:

| Container   | Role                                   | Notes                                              |
|-------------|----------------------------------------|----------------------------------------------------|
| `app`       | HTTP + Octane runtime                  | FrankenPHP, host port `9080` maps to `8000`        |
| `queue`     | Background jobs                        | `queue:work --timeout=600 --tries=3`               |
| `scheduler` | Cron replacement                       | `schedule:work`, three jobs daily at `02:30`       |
| `reverb`    | Websocket server                       | Host port `9085` maps to `8085`                    |
| `mysql`     | Primary store                          | MariaDB 11, persistent volume                      |
| `redis`     | Cache, queues, broadcast               | Redis 7 Alpine                                     |
| `qdrant`    | Vector search                          | Qdrant v1.14.1, persistent volume                  |

All services share one internal bridge network (`appnet`). Only the app and Reverb ports are published. MariaDB, Redis, and Qdrant are not exposed.

## Tech Stack

| Layer    | Technology                                                  |
|----------|-------------------------------------------------------------|
| Backend  | PHP 8.3+, Laravel 13, Inertia Laravel 2, Octane, Sanctum    |
| Frontend | React 18, TypeScript, Tailwind CSS, Vite, Ziggy             |
| Worker   | Python 3.12, BeautifulSoup, pypdf, OpenAI-compatible client |
| Data     | MariaDB 11, Redis 7, Qdrant                                 |
| Realtime | Laravel Reverb, Laravel Echo                                |
| Server   | FrankenPHP, Caddy                                           |
| Testing  | Pest and PHPUnit, `tsc --noEmit`, Python unittest           |

## Quickstart (Docker)

Prerequisites: Docker with Compose support, plus Git.

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

Open `http://localhost:9080`.

Useful follow-ups:

```bash
docker compose ps
docker compose logs -f app
docker compose exec app php artisan ipo:sync
docker compose exec app php artisan queue:work --tries=3 --timeout=240
```

The image builds Python and frontend tooling inside (`php/dockerfile`): a dedicated Python virtualenv at `/opt/ipo-venv` and Bun for asset builds. Production uses the `prod` target with Octane on FrankenPHP, config caching, and compiled Vite assets.

## Local Development (without Docker)

Prerequisites: PHP 8.3+, Composer, Bun, Python 3.12, MariaDB, Redis, Qdrant.

```bash
cp .env.example .env
composer install
bun install
python3 -m venv python/venv
python/venv/bin/pip install -r python/requirements.txt
php artisan key:generate
php artisan migrate
composer run dev
```

Notes:

- `composer run dev` starts the server, queue listener, log tail, and Vite concurrently.
- Point `QDRANT_URL`, `DB_*`, and `REDIS_*` in `.env` at your local services.
- Set `PYTHON_VENV` if your virtualenv lives outside `python/venv`.
- Qdrant must be reachable before embeddings are written. The app still serves catalog pages without it, but semantic features stay empty.

## Configuration

Copy `.env.example` to `.env` first. Values below are the ones operators touch most.

| Key                         | Purpose                                              |
|-----------------------------|------------------------------------------------------|
| `APP_URL`                   | Canonical URL, also drives `sitemap.xml` and robots |
| `DB_*`                      | MariaDB connection and credentials                   |
| `REDIS_*`                   | Redis host, port, client                             |
| `QDRANT_URL`, `QDRANT_COLLECTION` | Vector store endpoint and collection name      |
| `PYTHON_VENV`               | Path to the Python worker virtualenv                 |
| `CLOUDFLARE_*`              | Cloudflare Workers AI credentials and base URL       |
| `SUMOPOD_API_KEY`, `SUMOPOD_BASE_URL` | Sumopod AI provider                        |
| `NINEROUTER_API_KEY`, `NINEROUTER_BASE_URL` | 9Router-compatible provider              |

AI providers are optional. Without credentials, catalog and analysis pages keep working. AI-dependent calls return an explicit configuration error instead of fabricated output.

## Background Jobs

Three scheduled commands run daily at `02:30` Asia/Jakarta, each with overlap protection:

| Command                                 | Cadence | Purpose                                                        |
|-----------------------------------------|---------|----------------------------------------------------------------|
| `php artisan ipo:sync`                  | Daily   | Full ingest: list e-IPO, dispatch one job per issuer           |
| `php artisan ipo:sync-underwriter-history --limit=6` | Daily | Refresh archived underwriter track records             |
| `php artisan ipo:sync-statuses`         | Daily   | Lightweight status roll-forward, no re-parse, no AI re-run     |

Job resilience: `SyncIpoJob` retries 3 times with backoff (30s, 120s, 300s) and a 600s timeout. The worker subprocess itself is capped at 540s. Batches are named (`Sync IPO Data`) and logged on success and failure.

Manual runs:

```bash
php artisan ipo:sync
php artisan ipo:sync-statuses
php artisan ipo:sync-underwriter-history --limit=6
```

In Compose, run these inside the app container (`docker compose exec app ...`). The queue and scheduler containers already run workers continuously.

## Verification

```bash
php artisan test
bun run typecheck
bun run build
python/venv/bin/python -m unittest discover -s python/tests
```

- PHP tests use SQLite in-memory. No MariaDB needed.
- External HTTP integrations must be faked in tests.
- Keep the four suites green before merging. They cover backend logic, frontend types and build, and the Python worker.

## Security and Operations

- Public endpoints serve `published` IPOs only. Drafts are never routable.
- Web routes are throttled per IP (60 and 300 requests per minute tiers).
- Chat and valuation endpoints carry per-minute rate limits plus a daily chat quota.
- Anonymous chat identity lives in the session, not in the IP address.
- Unknown financial values are stored as `null`. The system does not estimate silently.
- Data stores sit on the internal Compose network. Only HTTP and Reverb ports are published.
- Health endpoint: `/up` (Laravel default).
- Crawler endpoints: `/sitemap.xml` and `/robots.txt`, generated from `APP_URL` and published records.

## Project Structure

```text
app/
  Console/Commands/   ipo:sync, ipo:sync-statuses, sync-underwriter-history
  Http/Controllers/   IpoController (catalog, detail, sitemap, robots)
  Jobs/               SyncIpoJob (per-issuer ingest)
  Models/             Ipo, FinancialSummary, ProceedAllocation, IpoRisk,
                      Underwriter, UnderwriterIpoHistory, ChatSession, ChatUsage
  Services/           AiManager, ValuationService, QdrantService,
                      MarketPerformanceService, provider drivers
python/
  scraper.py, fetch_ipo_data.py, pdf_parser.py, analyzer.py,
  llm.py, qdrant.py, db.py, sync_underwriter_history.py
resources/js/         Inertia React pages (Welcome catalog, IpoDetail)
routes/               web.php (public IPO routes), console.php (schedule)
php/dockerfile        multi-target build (dev with --watch, prod with FrankenPHP)
compose.yml           app, queue, scheduler, reverb, mysql, redis, qdrant
```

## Roadmap

- Expanded underwriter analytics with longer post-listing windows
- Richer proceeds-allocation benchmarking across sectors
- Alerting on status transitions (`book_building` to `offering` to `listed`)
- Extended test coverage for edge-case prospectus layouts

## License

Proprietary. All rights reserved. No license is granted to use, copy, modify, or distribute this software unless covered by a separate written agreement with the copyright holder.
