"""Unduh dan ekstrak teks bagian penting dari PDF prospektus IPO."""

import os
import sys
import tempfile
import pypdf
from curl_cffi import requests


def download_pdf(url: str) -> str | None:
    """
    Mengunduh PDF prospektus dari URL ke file sementara.
    Mengembalikan path file sementara, atau None jika gagal.
    """
    print(f"Mengunduh prospektus PDF dari: {url}", file=sys.stderr)
    try:
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            temp_path = tmp.name

        r = requests.get(url, impersonate="chrome", timeout=60, stream=True)
        if r.status_code == 200:
            with open(temp_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print("Unduhan prospektus selesai!", file=sys.stderr)
            return temp_path
        else:
            print(f"Gagal mengunduh prospektus: Status {r.status_code}", file=sys.stderr)
            os.unlink(temp_path)
            return None
    except Exception as e:
        print(f"Error mengunduh prospektus: {e}", file=sys.stderr)
        return None


def extract_pdf_sections(pdf_path: str) -> dict[str, str] | None:
    """
    Mengekstrak teks dari halaman-halaman penting PDF prospektus ke dalam
    kamus dengan kunci: dana, kepemilikan, keuangan, risiko, afiliasi.
    Maksimal 200 halaman pertama untuk efisiensi.
    """
    print("Mengekstrak teks dari PDF prospektus...", file=sys.stderr)
    try:
        reader = pypdf.PdfReader(pdf_path)
        num_pages = len(reader.pages)
        print(f"Total halaman prospektus: {num_pages}", file=sys.stderr)

        sections: dict[str, list[str]] = {
            "dana": [],
            "kepemilikan": [],
            "keuangan": [],
            "risiko": [],
            "afiliasi": [],
        }

        continuation = {key: 0 for key in sections}
        keywords = {
            "dana": ("rencana penggunaan dana", "rincian penggunaan dana"),
            "kepemilikan": ("susunan pemegang saham", "struktur kepemilikan", "lock-up"),
            "keuangan": (
                "ikhtisar data keuangan penting",
                "laporan posisi keuangan",
                "laporan laba rugi",
            ),
            "risiko": ("faktor risiko", "risiko utama"),
            "afiliasi": ("transaksi dengan pihak berelasi", "transaksi afiliasi"),
        }

        max_pages = min(300, num_pages)
        for page_num in range(max_pages):
            text = reader.pages[page_num].extract_text()
            if not text:
                continue
            text_lower = text.lower()

            # Skip Table of Contents and definitions pages to avoid matching TOC keywords
            if "daftar isi" in text_lower or "definisi, istilah" in text_lower or "singkatan dan definisi" in text_lower:
                continue

            for section, terms in keywords.items():
                matched = any(term in text_lower for term in terms)
                if matched:
                    continuation[section] = 7 if section == "keuangan" else 4

                if (matched or continuation[section] > 0) and len(sections[section]) < 12:
                    sections[section].append(text)
                    if not matched:
                        continuation[section] -= 1

        return {k: "\n".join(v) for k, v in sections.items()}

    except Exception as e:
        print(f"Gagal membaca PDF: {e}", file=sys.stderr)
        return None


def fetch_pdf_sections(url: str) -> dict[str, str] | None:
    """
    Pipeline lengkap: unduh PDF dari URL lalu ekstrak bagian pentingnya.
    File sementara otomatis dihapus setelah selesai.
    """
    temp_path = download_pdf(url)
    if not temp_path:
        return None
    try:
        return extract_pdf_sections(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
