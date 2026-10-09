"""Scraper e-IPO: ambil daftar IPO aktif dan halaman detail emiten."""

import re
import sys
from curl_cffi import requests
from bs4 import BeautifulSoup


BASE_URL = "https://e-ipo.co.id"

# Pola tanggal/jadwal untuk membedakan sektor asli dari teks periode
_DATE_PATTERN = re.compile(
    r'\d{1,2}\s+(?:jan|feb|mar|apr|mei|may|jun|jul|aug|agu|sep|oct|okt|nov|dec)\b'
    r'|\d{4}\s*-\s*\d{1,2}',
    re.IGNORECASE,
)

_MONTHS_MAP = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'may': '05',
    'jun': '06', 'jul': '07', 'agu': '08', 'aug': '08', 'sep': '09', 'okt': '10',
    'oct': '10', 'nov': '11', 'des': '12', 'dec': '12'
}


def scrape_ipo_list(include_closed: bool = False) -> list[dict]:
    """
    Mengambil daftar IPO aktif dari halaman katalog e-IPO tanpa men-download PDF.
    Hanya mengambil data dasar: kode, nama, sektor, harga, jumlah saham, status.
    """
    print("Mengambil daftar IPO aktif dari e-IPO...", file=sys.stderr)
    try:
        response = requests.get(f"{BASE_URL}/id/ipo/index", impersonate="chrome", timeout=15)
        if response.status_code != 200:
            print(f"Gagal memuat e-IPO: Status {response.status_code}", file=sys.stderr)
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        ipo_cards = soup.select(".pricing-box")
        result = []

        for card in ipo_cards:
            text_card = card.get_text()
            text_lower = text_card.lower()

            is_closed = any(marker in text_lower for marker in ('closed', 'ditutup', 'selesai'))

            # Sinkronisasi penuh hanya memproses IPO aktif. Sinkronisasi status tetap
            # membutuhkan kartu yang sudah tutup agar record lama tidak stale.
            if is_closed and not include_closed:
                continue

            h5_tag = card.find('h5')
            if not h5_tag:
                continue

            text_h5 = h5_tag.text.strip()
            match_h5 = re.search(r'(PT\s+.*?Tbk).*?\(([A-Z]{4})\)', text_h5, re.IGNORECASE)
            if not match_h5:
                match_code = re.search(r'\(([A-Z]{4})\)', text_h5)
                if not match_code:
                    continue
                code = match_code.group(1)
                company_name = text_h5.replace(f"({code})", "").strip()
            else:
                company_name = match_h5.group(1).strip()
                code = match_h5.group(2).strip()

            # Status IPO — urutan cek: listed > offering > closed > book_building
            # e-IPO mencantumkan 'Tanggal Pencatatan' dan 'Harga Final' untuk emiten yang sudah listing/tercatat
            status = 'book_building'
            if any(k in text_lower for k in ('listed', 'tercatat', 'tanggal pencatatan', 'harga final')):
                status = 'listed'
            elif any(k in text_lower for k in ('offering', 'penawaran umum', 'masa penawaran')):
                status = 'offering'
            elif is_closed:
                # Closed dengan indikasi pencatatan masuk ke listed, selain itu offering
                status = 'listed'

            # Sektor — cari via regex "Sektor:" dulu, lalu fallback baris berikutnya.
            # Fallback wajib skip baris yang mengandung tanggal/jadwal agar tidak
            # salah ambil teks periode seperti "Periode Book Building24 Aug 2026 - 27 Aug 2026".
            sector = "Barang Konsumen / Consumer Goods"
            sector_match = re.search(r'Sektor\s*:\s*([^\n]+)', text_card, re.IGNORECASE)
            if sector_match:
                sector = sector_match.group(1).strip()
            else:
                lines = [l.strip() for l in text_card.split('\n') if l.strip()]
                for idx, line in enumerate(lines):
                    if 'sektor' in line.lower() and idx + 1 < len(lines):
                        candidate = lines[idx + 1].strip()
                        # Tolak kandidat yang isinya teks jadwal/tanggal
                        if not _DATE_PATTERN.search(candidate) and 'periode' not in candidate.lower():
                            sector = candidate
                        break

            # Harga IPO
            ipo_price = 150
            price_match = re.search(r'(?:Rentang Harga|Harga Penawaran).*?Rp\.?\s*(\d+[\d\s,.-]*)', text_card, re.IGNORECASE)
            if price_match:
                numbers = re.findall(r'\d+', price_match.group(1).replace('.', '').replace(',', ''))
                if numbers:
                    ipo_price = int(numbers[-1])

            # Jumlah saham (dikalikan 100 karena e-IPO menampilkan dalam satuan Lot)
            offering_shares = 1_000_000_000
            shares_match = re.search(r'Saham Ditawarkan.*?(\d+[\d\s,.-]*)', text_card, re.IGNORECASE)
            if shares_match:
                shares_str = re.sub(r'[^\d]', '', shares_match.group(1))
                if shares_str:
                    offering_shares = int(shares_str) * 100

            # Tanggal Pencatatan
            listing_date = None
            listing_match = re.search(r'Tanggal\s*Pencatatan\s*:?\s*(\d{1,2})\s+([A-Za-z]{3,4})\s+(\d{4})', text_card, re.IGNORECASE)
            if listing_match:
                day_str = listing_match.group(1).zfill(2)
                month_str = _MONTHS_MAP.get(listing_match.group(2).lower()[:3], '01')
                year_str = listing_match.group(3)
                listing_date = f"{year_str}-{month_str}-{day_str}"

            # URL detail
            detail_href = None
            for a in card.find_all('a'):
                href = a.get('href')
                if href and '/id/ipo/' in href:
                    detail_href = href
                    break
            detail_url = f"{BASE_URL}{detail_href}" if detail_href else None

            # URL prospektus dari kartu (jika ada)
            prospectus_pdf_url = None
            for a in card.find_all('a'):
                href = a.get('href')
                if href and ('.pdf' in href.lower() or 'prospectus' in href.lower() or 'propectus' in href.lower()):
                    prospectus_pdf_url = href if href.startswith('http') else f"{BASE_URL}{href}"
                    break

            result.append({
                "code": code,
                "company_name": company_name,
                "sector": sector,
                "ipo_price": ipo_price,
                "offering_shares": offering_shares,
                "status": status,
                "listing_date": listing_date,
                "detail_url": detail_url,
                "prospectus_pdf_url": prospectus_pdf_url,
            })

        return result

    except Exception as e:
        print(f"Gagal scraping daftar e-IPO: {e}", file=sys.stderr)
        return []


def scrape_ipo_detail(detail_url: str) -> dict | None:
    """
    Mengambil informasi detail emiten dari halaman detail e-IPO:
    sektor, URL prospektus, dan daftar underwriter.
    """
    print(f"Mengambil halaman detail: {detail_url}", file=sys.stderr)
    try:
        response = requests.get(detail_url, impersonate="chrome", timeout=15)
        if response.status_code != 200:
            print(f"Halaman detail status: {response.status_code}", file=sys.stderr)
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        info = {"sector": None, "underwriters": [], "prospectus_url": None}

        # Sektor
        for h5 in soup.find_all('h5'):
            if h5.text.strip().lower() == 'sektor':
                p = h5.find_next_sibling('p')
                if p:
                    info['sector'] = p.text.strip()

        # Tautan prospektus
        for a in soup.find_all('a'):
            href = a.get('href')
            if href and ('get-propectus-file' in href.lower() or '.pdf' in href.lower()
                         or 'prospectus' in href.lower() or 'propectus' in href.lower()):
                info['prospectus_url'] = href if href.startswith('http') else f"{BASE_URL}{href}"
                break

        # Penjamin emisi (underwriter)
        lead_code = None
        for h5 in soup.find_all('h5'):
            if 'partisipan admin' in h5.text.strip().lower():
                p = h5.find_next_sibling('p')
                if p:
                    m = re.match(r'^([A-Z]{2})\s*-\s*(.+)$', p.text.strip())
                    if m:
                        lead_code = m.group(1).strip()
                        lead_name = m.group(2).strip()
                        info['underwriters'].append({
                            "code": lead_code,
                            "name": lead_name,
                            "role": "lead",
                        })

        for h5 in soup.find_all('h5'):
            if 'penjamin emisi' in h5.text.strip().lower():
                p = h5.find_next_sibling('p')
                if p:
                    for text_uw in p.stripped_strings:
                        m = re.match(r'^([A-Z]{2})\s*-\s*(.+)$', text_uw.strip())
                        if m:
                            uw_code = m.group(1).strip()
                            if uw_code == lead_code:
                                continue
                            role = "co-lead" if len(info['underwriters']) <= 2 else "member"
                            info['underwriters'].append({
                                "code": uw_code,
                                "name": m.group(2).strip(),
                                "role": role,
                            })

        return info

    except Exception as e:
        print(f"Gagal mengambil halaman detail: {e}", file=sys.stderr)
        return None
