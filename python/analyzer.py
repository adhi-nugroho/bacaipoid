"""Analisis prospektus IPO menggunakan AI untuk ekstraksi data terstruktur."""

import re
import json
import sys
from llm import ask_llm


DEFAULT_LOCKUP = "Larangan pengalihan saham (lock-up) berlaku selama 8 bulan sejak pernyataan pendaftaran efektif sesuai POJK 25/2017."


def _safe_json_parse(text: str) -> dict | list:
    """Parse JSON dari output LLM dengan toleransi terhadap format yang kurang sempurna."""
    # Hapus markdown code fences
    cleaned = re.sub(r'```(?:json)?\s*|\s*```', '', text).strip()

    # Coba parse langsung
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Perbaiki trailing comma sebelum ] atau }
    fixed = re.sub(r',\s*([]}])', r'\1', cleaned)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Perbaiki property names tanpa quotes: {key: value} → {"key": value}
    fixed = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', fixed)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Perbaiki unterminated string: tutup string yang belum selesai
    # Cari pasangan quote yang tidak seimbang dan tutup
    fixed = re.sub(r'"([^"]*)$', r'"\1"', fixed, flags=re.MULTILINE)
    # Tutup array/object yang belum selesai
    open_braces = fixed.count('{') - fixed.count('}')
    open_brackets = fixed.count('[') - fixed.count(']')
    fixed = fixed + '}' * open_braces + ']' * open_brackets
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    print(f"Gagal parse JSON setelah semua perbaikan: {cleaned[:200]}", file=sys.stderr)
    return {} if cleaned.strip().startswith('{') else []


def validate_analysis(analysis: dict) -> None:
    """Reject incomplete extraction before it can replace previously valid data."""
    required_scalars = [
        "code", "company_name", "sector", "ipo_price", "offering_shares",
        "dilution_percentage", "auditor_opinion",
    ]
    missing = [key for key in required_scalars if analysis.get(key) in (None, "")]
    required_collections = ["allocations", "financials", "risks", "underwriters"]
    missing.extend(key for key in required_collections if not analysis.get(key))

    if missing:
        raise ValueError(
            f"Analisis {analysis.get('code', 'N/A')} belum lengkap: {', '.join(missing)}"
        )


def _extract_allocations(pdf_dana: str, ipo_price: int, offering_shares: int, total_funding: int) -> list[dict]:
    """Ekstrak alokasi penggunaan dana IPO dari teks prospektus menggunakan AI."""
    prompt = f"""
Analisis teks penggunaan dana prospektus berikut dan buat alokasi persentase dana IPO ke kategori:
capex, working_capital, debt_repayment, acquisition, subsidiary_investment, atau others.

Panduan kategori:
- capex: belanja modal langsung (pembelian mesin, peralatan, bangunan, infrastruktur)
- subsidiary_investment: penyertaan modal atau setoran ke perusahaan anak/anak usaha/entitas anak
- working_capital: modal kerja operasional
- debt_repayment: pembayaran utang
- acquisition: akuisisi perusahaan lain
- others: penggunaan lain di luar kategori di atas

Hitung nominal dana (amount = percentage/100 * {total_funding}).

PENTING: Jangan terjemahkan kunci JSON (JSON keys) ke bahasa Indonesia. Gunakan kunci bahasa Inggris persis seperti template di bawah.
Kembalikan JSON murni tanpa markdown:
{{
  "allocations": [
    {{
      "category": "capex",
      "percentage": 45.5,
      "amount": 12000000000,
      "description": "Rincian detail penggunaan dana secara mendalam berdasarkan data prospektus."
    }}
  ]
}}

Teks Prospektus:
{pdf_dana[:18000]}
"""
    res = ask_llm(prompt, "You are a financial analyst. Return raw JSON only.")
    if not res:
        return []
    try:
        parsed = _safe_json_parse(res)
        return parsed.get("allocations", [])
    except Exception as e:
        print(f"Gagal parse JSON alokasi dana: {e}", file=sys.stderr)
        return []


def _extract_shareholders(pdf_kepemilikan: str) -> dict:
    """Ekstrak struktur kepemilikan, dilusi, dan lock-up dari teks prospektus menggunakan AI."""
    prompt = f"""
Analisis teks struktur kepemilikan berikut. Temukan dilusi kepemilikan, secondary offering,
lock-up sukarela tambahan, dan kepemilikan sebelum vs sesudah IPO.

PENTING: Jangan terjemahkan kunci JSON (JSON keys) ke bahasa Indonesia. Gunakan kunci bahasa Inggris persis seperti template di bawah.
Kembalikan JSON murni tanpa markdown:
{{
  "dilution_percentage": 25.5,
  "has_secondary_offering": false,
  "has_extra_lockup": false,
  "lockup_details": "deskripsi lock-up sukarela jika ada",
  "shareholders": [
    {{
      "name": "Nama Pemegang Saham",
      "before_percentage": 80.0,
      "after_percentage": 60.0
    }}
  ]
}}

Teks Prospektus:
{pdf_kepemilikan[:18000]}
"""
    res = ask_llm(prompt, "You are a financial analyst. Return raw JSON only.")
    if not res:
        return {}
    try:
        return _safe_json_parse(res)
    except Exception as e:
        print(f"Gagal parse JSON kepemilikan: {e}", file=sys.stderr)
        return {}


def _extract_financials(pdf_keuangan: str) -> dict:
    """Ekstrak ikhtisar keuangan dan opini auditor dari teks prospektus menggunakan AI."""
    prompt = f"""
Analisis teks ikhtisar keuangan berikut. Ekstrak SEMUA periode tahunan yang tersedia
(maksimal 4 tahun/periode terakhir), bukan hanya tahun terbaru:
pendapatan, laba bersih, total aset, total liabilitas, total ekuitas, DER, Current Ratio, ROE, ROA.

Jangan mengarang nilai. Gunakan null untuk metrik yang memang tidak tercantum.
Untuk periode interim, gunakan tahun laporan dan jangan menduplikasi tahun yang sama.
PENTING: Jangan terjemahkan kunci JSON (JSON keys) ke bahasa Indonesia. Gunakan kunci bahasa Inggris persis seperti template di bawah.
Kembalikan JSON murni tanpa markdown:
{{
  "auditor_opinion": "Wajar Tanpa Pengecualian (WTP)",
  "financials": [
    {{
      "year": 2025,
      "revenue": 100000000000,
      "net_income": 5000000000,
      "total_assets": 500000000000,
      "total_liabilities": 200000000000,
      "total_equity": 300000000000,
      "debt_to_equity_ratio": 0.67,
      "current_ratio": 1.5,
      "roe": 1.67,
      "roa": 1.0,
      "is_non_recurring_highlighted": false,
      "non_recurring_details": null
    }}
  ]
}}

Teks Prospektus:
{pdf_keuangan[:18000]}
"""
    res = ask_llm(prompt, "You are a financial analyst. Return raw JSON only.")
    if not res:
        return {}
    try:
        parsed = _safe_json_parse(res)
        financials = parsed.get("financials", [])
        if isinstance(financials, list):
            unique_by_year = {}
            for item in financials:
                if isinstance(item, dict) and item.get("year") is not None:
                    unique_by_year[int(item["year"])] = item
            parsed["financials"] = [
                unique_by_year[year] for year in sorted(unique_by_year, reverse=True)
            ][:4]
        return parsed
    except Exception as e:
        print(f"Gagal parse JSON keuangan: {e}", file=sys.stderr)
        return {}


def _extract_risks(pdf_risiko: str) -> list[dict]:
    """Ekstrak faktor risiko utama dari teks prospektus menggunakan AI (3-5 risiko)."""
    prompt = f"""
Analisis teks faktor risiko prospektus berikut. Identifikasi 3-5 risiko utama perseroan.
Klasifikasikan setiap risiko: 'specific' (risiko khusus perseroan) atau 'generic' (risiko umum/industri).

PENTING: Jangan terjemahkan kunci JSON (JSON keys) ke bahasa Indonesia. Gunakan kunci bahasa Inggris persis seperti template di bawah.
Kembalikan JSON murni tanpa markdown:
{{
  "risks": [
    {{
      "type": "specific",
      "title": "Judul Singkat Risiko",
      "description": "Deskripsi lengkap bagaimana risiko ini mempengaruhi kelangsungan usaha."
    }}
  ]
}}

Teks Prospektus:
{pdf_risiko[:18000]}
"""
    res = ask_llm(prompt, "You are a financial analyst. Return raw JSON only.")
    if not res:
        return []
    try:
        parsed = _safe_json_parse(res)
        return parsed.get("risks", [])
    except Exception as e:
        print(f"Gagal parse JSON risiko: {e}", file=sys.stderr)
        return []


def _extract_related_party(pdf_afiliasi: str) -> dict:
    """Ekstrak transaksi dengan pihak berelasi/afiliasi dari teks prospektus menggunakan AI."""
    prompt = f"""
Analisis teks transaksi pihak berelasi berikut. Ekstrak persentase total transaksi afiliasi
terhadap pendapatan/aset, dan rangkum rincian transaksinya.

PENTING: Jangan terjemahkan kunci JSON (JSON keys) ke bahasa Indonesia. Gunakan kunci bahasa Inggris persis seperti template di bawah.
Kembalikan JSON murni tanpa markdown:
{{
  "related_party_transaction_percentage": 12.5,
  "related_party_details": "Rangkuman transaksi pihak berelasi dari data prospektus."
}}

Teks Prospektus:
{pdf_afiliasi[:18000]}
"""
    res = ask_llm(prompt, "You are a financial analyst. Return raw JSON only.")
    if not res:
        return {}
    try:
        return _safe_json_parse(res)
    except Exception as e:
        print(f"Gagal parse JSON afiliasi: {e}", file=sys.stderr)
        return {}


def generate_analysis(
    code: str,
    company_name: str,
    sector: str,
    ipo_price: int,
    offering_shares: int,
    status: str,
    prospectus_url: str | None,
    pdf_texts: dict[str, str] | None = None,
    scraped_detail: dict | None = None,
) -> dict:
    """
    Menghasilkan analisis prospektus lengkap satu emiten menggunakan AI.
    Jika PDF tersedia, setiap bagian diekstrak oleh LLM secara terpisah.
    Hasil akhir juga diingest ke Qdrant untuk chatbot.
    """
    total_funding = ipo_price * offering_shares

    # Override dengan data hasil scraping halaman detail jika ada
    if scraped_detail:
        sector = scraped_detail.get('sector') or sector
        prospectus_url = scraped_detail.get('prospectus_url') or prospectus_url

    underwriters = []
    if scraped_detail and scraped_detail.get('underwriters'):
        underwriters = scraped_detail['underwriters']

    analysis: dict = {
        "code": code,
        "company_name": company_name,
        "sector": sector,
        "ipo_price": ipo_price,
        "offering_shares": offering_shares,
        "dilution_percentage": None,
        "has_secondary_offering": False,
        "has_extra_lockup": False,
        "lockup_details": None,
        "auditor_opinion": None,
        "related_party_transaction_percentage": None,
        "related_party_details": None,
        "status": status,
        "publish_status": "draft",
        "listing_date": None,
        "prospectus_pdf_url": prospectus_url,
        "shareholders": [],
        "allocations": [],
        "underwriters": underwriters,
        "financials": [],
        "risks": [],
    }

    if pdf_texts:
        print(f"Mengekstrak data prospektus {code} menggunakan AI...", file=sys.stderr)

        if pdf_texts.get("dana"):
            allocations = _extract_allocations(pdf_texts["dana"], ipo_price, offering_shares, total_funding)
            if allocations:
                analysis["allocations"] = allocations

        if pdf_texts.get("kepemilikan"):
            ownership = _extract_shareholders(pdf_texts["kepemilikan"])
            for key in ["dilution_percentage", "has_secondary_offering", "has_extra_lockup",
                        "lockup_details", "shareholders"]:
                val = ownership.get(key)
                if val is None:
                    continue
                if key == "shareholders" and (not isinstance(val, list) or len(val) == 0):
                    continue
                analysis[key] = val

        if pdf_texts.get("keuangan"):
            financials = _extract_financials(pdf_texts["keuangan"])
            if financials:
                if financials.get("auditor_opinion"):
                    analysis["auditor_opinion"] = financials["auditor_opinion"]
                
                financial_data = financials.get("financials")
                if not financial_data and ("revenue" in financials or "total_assets" in financials):
                    financial_data = [financials]
                
                if financial_data:
                    analysis["financials"] = financial_data

        if pdf_texts.get("risiko"):
            risks = _extract_risks(pdf_texts["risiko"])
            if risks:
                analysis["risks"] = risks

        if pdf_texts.get("afiliasi"):
            related = _extract_related_party(pdf_texts["afiliasi"])
            if "related_party_transaction_percentage" in related:
                analysis["related_party_transaction_percentage"] = float(
                    related["related_party_transaction_percentage"]
                )
            if "related_party_details" in related:
                analysis["related_party_details"] = related["related_party_details"]

    return analysis
