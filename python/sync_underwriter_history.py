#!/usr/bin/env python3
"""Collect factual IPO history per underwriter from paginated e-IPO pages."""

import argparse
import json
import re
import sys
from datetime import date, datetime

from bs4 import BeautifulSoup
from curl_cffi import requests

from scraper import BASE_URL

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "mei": 5, "may": 5,
    "jun": 6, "jul": 7, "agu": 8, "aug": 8, "sep": 9, "okt": 10,
    "oct": 10, "nov": 11, "des": 12, "dec": 12,
}


def text_after_label(soup: BeautifulSoup, labels: tuple[str, ...]) -> str:
    for heading in soup.find_all(["h4", "h5", "label"]):
        normalized = heading.get_text(" ", strip=True).lower()
        if any(label in normalized for label in labels):
            values = []
            sibling = heading.find_next_sibling()
            while sibling and sibling.name not in ("h4", "h5", "label"):
                text = sibling.get_text(" ", strip=True)
                if text:
                    values.append(text)
                sibling = sibling.find_next_sibling()
            if values:
                return " ".join(values)
    return ""


def parse_number(value: str) -> int | None:
    digits = re.sub(r"[^\d]", "", value)
    return int(digits) if digits else None


def parse_date(value: str) -> str | None:
    match = re.search(r"(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})", value)
    if not match:
        return None
    month = MONTHS.get(match.group(2).lower()[:3])
    if not month:
        return None
    return datetime(int(match.group(3)), month, int(match.group(1))).date().isoformat()


def parse_detail(url: str, wanted: set[str]) -> list[dict]:
    response = requests.get(url, impersonate="chrome", timeout=20)
    if response.status_code != 200:
        return []
    soup = BeautifulSoup(response.text, "html.parser")

    code = text_after_label(soup, ("kode emiten", "ticker code")).upper()
    if not re.fullmatch(r"[A-Z0-9]{4,6}", code):
        title_match = re.search(r"\[([A-Z0-9]{4,6})\]", soup.title.get_text() if soup.title else "")
        code = title_match.group(1) if title_match else ""
    if not code:
        return []

    title = soup.title.get_text(" ", strip=True) if soup.title else code
    company = re.sub(r"^\[[A-Z0-9]+\]\s*", "", title).split("|")[0].strip()
    sector = text_after_label(soup, ("sektor", "sector")) or None
    shares = parse_number(text_after_label(soup, ("jumlah saham ditawarkan", "number of shares offered")))
    listing_date = parse_date(text_after_label(soup, ("tanggal pencatatan", "listing date")))

    offering_text = text_after_label(soup, ("penawaran umum", "offering"))
    prices = [int(x.replace(".", "").replace(",", "")) for x in re.findall(r"(?:Rp|IDR)\s*([\d.,]+)", offering_text)]
    ipo_price = prices[-1] if prices else None
    if not all((shares, listing_date, ipo_price)) or listing_date > date.today().isoformat():
        return []

    underwriter_text = text_after_label(soup, ("penjamin emisi efek", "underwriter(s)"))
    matches = re.findall(r"\b([A-Z0-9]{2})\s*-\s*([^\n]+?)(?=\s+[A-Z0-9]{2}\s*-|$)", underwriter_text)
    rows = []
    for underwriter_code, _ in matches:
        if underwriter_code not in wanted:
            continue
        rows.append({
            "underwriter_code": underwriter_code,
            "code": code,
            "company_name": company,
            "sector": sector,
            "ipo_price": ipo_price,
            "offering_shares": shares,
            "listing_date": listing_date,
            "source_url": url,
        })
    return rows


def collect(wanted: set[str], limit: int) -> list[dict]:
    found: dict[str, dict[str, dict]] = {code: {} for code in wanted}
    seen_urls = set()

    for page in range(1, 22):
        try:
            response = requests.get(
                f"{BASE_URL}/id/ipo/index?page={page}&per-page=12",
                impersonate="chrome",
                timeout=20,
            )
        except Exception as exc:
            print(f"Gagal memuat halaman katalog {page}: {exc}", file=sys.stderr)
            continue
        if response.status_code != 200:
            continue
        soup = BeautifulSoup(response.text, "html.parser")
        urls = []
        for card in soup.select(".pricing-box"):
            card_text = card.get_text(" ", strip=True).lower()
            if not any(status in card_text for status in ("closed", "selesai", "listed", "tercatat")):
                continue
            link = card.select_one('a[href*="/id/ipo/"]')
            href = link.get("href") if link else None
            if not href or "/index" in href:
                continue
            url = href if href.startswith("http") else f"{BASE_URL}{href}"
            if url not in seen_urls:
                seen_urls.add(url)
                urls.append(url)

        for url in urls:
            try:
                for row in parse_detail(url, wanted):
                    found[row["underwriter_code"]][row["code"]] = row
            except Exception as exc:
                print(f"Gagal parse {url}: {exc}", file=sys.stderr)

        if all(len(items) >= limit for items in found.values()):
            break

    rows = []
    for items in found.values():
        ordered = sorted(items.values(), key=lambda row: row["listing_date"], reverse=True)
        rows.extend(ordered[:limit])
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--underwriters", required=True)
    parser.add_argument("--limit", type=int, default=6)
    args = parser.parse_args()
    wanted = {code.strip().upper() for code in args.underwriters.split(",") if code.strip()}
    print(json.dumps(collect(wanted, max(1, args.limit))))


if __name__ == "__main__":
    main()
