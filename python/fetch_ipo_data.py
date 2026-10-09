#!/usr/bin/env python3
"""
Entry point utama untuk sinkronisasi data IPO dari e-IPO.

Mode penggunaan:
  --list-only              Tampilkan daftar IPO aktif sebagai JSON (tanpa PDF/AI)
  --status-only            Tampilkan status IPO, termasuk yang sudah ditutup
  --sync-one               Sinkronkan satu emiten spesifik (gunakan bersama flag berikut)
    --code CODE            Kode saham emiten (wajib)
    --company NAME         Nama perusahaan (wajib)
    --sector SECTOR        Sektor industri
    --price PRICE          Harga IPO
    --shares SHARES        Jumlah saham ditawarkan
    --status STATUS        Status IPO (book_building/offering/listed)
    --detail-url URL       URL halaman detail e-IPO
    --prospectus-url URL   URL PDF prospektus
"""

import sys
import json
import argparse
from db import connection, insert_ipo
from scraper import scrape_ipo_list, scrape_ipo_detail
from pdf_parser import fetch_pdf_sections
from analyzer import generate_analysis, validate_analysis
from qdrant import ingest


def cmd_list_only() -> None:
    """Keluarkan daftar IPO aktif sebagai JSON ke stdout."""
    active_list = scrape_ipo_list()
    print(json.dumps(active_list))


def cmd_status_only() -> None:
    """Keluarkan snapshot status, termasuk kartu IPO yang sudah ditutup."""
    status_list = scrape_ipo_list(include_closed=True)
    print(json.dumps([
        {"code": item["code"], "status": item["status"], "listing_date": item.get("listing_date")}
        for item in status_list
    ]))


def cmd_sync_one(args: argparse.Namespace) -> None:
    """Sinkronkan satu emiten: scrape detail, parse PDF, analisis AI, simpan ke DB."""
    if not args.code or not args.company:
        print("Error: --code dan --company wajib disertakan untuk --sync-one", file=sys.stderr)
        sys.exit(1)

    scraped_detail = None
    if args.detail_url:
        scraped_detail = scrape_ipo_detail(args.detail_url)

    prospectus_url = args.prospectus_url
    if not prospectus_url and scraped_detail and scraped_detail.get('prospectus_url'):
        prospectus_url = scraped_detail['prospectus_url']

    pdf_texts = None
    if prospectus_url:
        pdf_texts = fetch_pdf_sections(prospectus_url)

    analysis = generate_analysis(
        code=args.code,
        company_name=args.company,
        sector=args.sector or "Barang Konsumen / Consumer Goods",
        ipo_price=args.price or 150,
        offering_shares=args.shares or 1_000_000_000,
        status=args.status or "book_building",
        prospectus_url=prospectus_url,
        pdf_texts=pdf_texts,
        scraped_detail=scraped_detail,
    )
    validate_analysis(analysis)
    analysis["publish_status"] = "published"
    insert_ipo(analysis)
    ingest(analysis)
    print(f"Sinkronisasi emiten {args.code} selesai.", file=sys.stderr)


def cmd_full_sync() -> None:
    """Sinkronkan semua IPO aktif secara penuh (fallback jika tidak ada flag lain)."""
    active_list = scrape_ipo_list()
    if not active_list:
        print("Tidak ada IPO aktif yang ditemukan.", file=sys.stderr)
        return

    for item in active_list:
        scraped_detail = None
        if item.get("detail_url"):
            scraped_detail = scrape_ipo_detail(item["detail_url"])

        prospectus_url = item.get("prospectus_pdf_url")
        if not prospectus_url and scraped_detail and scraped_detail.get('prospectus_url'):
            prospectus_url = scraped_detail['prospectus_url']

        pdf_texts = None
        if prospectus_url:
            pdf_texts = fetch_pdf_sections(prospectus_url)

        analysis = generate_analysis(
            code=item["code"],
            company_name=item["company_name"],
            sector=item["sector"],
            ipo_price=item["ipo_price"],
            offering_shares=item["offering_shares"],
            status=item["status"],
            prospectus_url=prospectus_url,
            pdf_texts=pdf_texts,
            scraped_detail=scraped_detail,
        )
        validate_analysis(analysis)
        analysis["publish_status"] = "published"
        insert_ipo(analysis)
        ingest(analysis)

    print(f"Sinkronisasi penuh {len(active_list)} emiten selesai.", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description="Synchronize IPO data from e-IPO")
    parser.add_argument('--list-only', action='store_true',
                        help="Only return list of active IPOs as JSON to stdout")
    parser.add_argument('--status-only', action='store_true',
                        help="Return IPO status snapshot, including closed IPOs")
    parser.add_argument('--sync-one', action='store_true',
                        help="Sync one specific IPO")
    parser.add_argument('--code', type=str)
    parser.add_argument('--company', type=str)
    parser.add_argument('--sector', type=str)
    parser.add_argument('--price', type=int)
    parser.add_argument('--shares', type=int)
    parser.add_argument('--status', type=str)
    parser.add_argument('--detail-url', type=str)
    parser.add_argument('--prospectus-url', type=str)

    args = parser.parse_args()

    if args.list_only:
        cmd_list_only()
    elif args.status_only:
        cmd_status_only()
    elif args.sync_one:
        cmd_sync_one(args)
    else:
        cmd_full_sync()

    connection.close()


if __name__ == "__main__":
    main()
