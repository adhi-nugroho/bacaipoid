"""Integrasi Qdrant: simpan analisis prospektus sebagai vektor untuk chatbot."""

import sys
import hashlib
from curl_cffi import requests
from llm import get_embedding


from config import env

QDRANT_URL = env.get(
    "QDRANT_URL",
    f"{env.get('QDRANT_HOST', 'http://127.0.0.1')}:{env.get('QDRANT_PORT', '6333')}",
).rstrip("/")
COLLECTION_NAME = env.get("QDRANT_COLLECTION", "ipo_analyses")
VECTOR_DIM = 384  # dimensi @cf/baai/bge-small-en-v1.5


def _build_doc_text(ipo_data: dict) -> str:
    """Menyusun teks deskriptif dari data analisis IPO untuk dijadikan vektor."""
    doc = (
        f"Emiten: {ipo_data['company_name']} ({ipo_data['code']})\n"
        f"Sektor: {ipo_data['sector']}\n"
        f"Harga IPO: Rp {ipo_data['ipo_price']}\n"
        f"Saham Ditawarkan: {ipo_data['offering_shares']} Lembar\n"
        f"Dilusi Kepemilikan Baru: {ipo_data['dilution_percentage']}%\n"
        f"Ketentuan Lock-up: {ipo_data['lockup_details']}\n"
        f"Opini Auditor: {ipo_data['auditor_opinion']}\n\n"
        "Rencana Penggunaan Dana:\n"
    )
    for alloc in ipo_data.get('allocations', []):
        doc += f"- Kategori {alloc['category']} ({alloc['percentage']}%): {alloc['description']}\n"

    doc += "\nStruktur Pemegang Saham:\n"
    for sh in ipo_data.get('shareholders', []):
        doc += f"- {sh['name']}: Sebelum {sh['before_percentage']}% -> Sesudah {sh['after_percentage']}%\n"

    doc += "\nFaktor Risiko Utama:\n"
    for risk in ipo_data.get('risks', []):
        doc += f"- {risk['title']} ({risk['type']}): {risk['description']}\n"

    doc += (
        f"\nTransaksi Afiliasi: {ipo_data['related_party_details']} "
        f"({ipo_data['related_party_transaction_percentage']}% dari total transaksi)"
    )
    return doc


def _ensure_collection() -> bool:
    """Memastikan koleksi Qdrant ada dengan dimensi yang benar, membuat ulang jika perlu."""
    col_res = requests.get(f"{QDRANT_URL}/collections/{COLLECTION_NAME}", timeout=3)
    if col_res.status_code == 200:
        existing_size = (
            col_res.json()
            .get("result", {})
            .get("config", {})
            .get("params", {})
            .get("vectors", {})
            .get("size")
        )
        if existing_size == VECTOR_DIM:
            return True
        print(
            f"Dimensi koleksi Qdrant ({existing_size}) != {VECTOR_DIM}. Membuat ulang...",
            file=sys.stderr,
        )
        print("Koleksi tidak diubah otomatis; perbaiki konfigurasi dimensi.", file=sys.stderr)
        return False

    print(f"Membuat koleksi Qdrant '{COLLECTION_NAME}' dengan dimensi {VECTOR_DIM}...", file=sys.stderr)
    res = requests.put(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}",
        json={"vectors": {"size": VECTOR_DIM, "distance": "Cosine"}},
        timeout=5,
    )
    return res.status_code in (200, 201)


def ingest(ipo_data: dict) -> None:
    """Meng-ingest analisis prospektus emiten ke Qdrant untuk keperluan chatbot."""
    print(f"Sinkronisasi vektor {ipo_data['code']} ke Qdrant...", file=sys.stderr)
    try:
        health = requests.get(f"{QDRANT_URL}/readyz", timeout=3)
        if health.status_code != 200:
            print("Qdrant belum siap.", file=sys.stderr)
            return

        if not _ensure_collection():
            print("Gagal memastikan koleksi Qdrant.", file=sys.stderr)
            return

        doc_text = _build_doc_text(ipo_data)
        vector = get_embedding(doc_text)
        if not vector:
            raise RuntimeError("Embedding tidak tersedia; vektor tidak disimpan")

        point_id = int(hashlib.md5(ipo_data['code'].encode('utf-8')).hexdigest()[:16], 16)
        payload = {
            "points": [{
                "id": point_id,
                "vector": vector,
                "payload": {
                    "code": ipo_data['code'],
                    "company_name": ipo_data['company_name'],
                    "sector": ipo_data['sector'],
                    "doc_text": doc_text,
                },
            }]
        }

        res = requests.put(
            f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points",
            json=payload,
            timeout=5,
        )
        if res.status_code == 200:
            print(f"Vektor {ipo_data['code']} berhasil disimpan di Qdrant!", file=sys.stderr)
        else:
            print(f"Gagal simpan ke Qdrant: {res.text}", file=sys.stderr)

    except Exception as e:
        print(f"Sinkronisasi Qdrant gagal: {e}", file=sys.stderr)
        raise
