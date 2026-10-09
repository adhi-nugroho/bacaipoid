"""Integrasi Sumopod AI via OpenAI-compatible client: chat completion dan text embedding."""

import sys
import time
from openai import OpenAI
from config import env

_base_url = env.get('SUMOPOD_BASE_URL', 'https://ai.sumopod.com/v1')
_api_key = env.get('SUMOPOD_API_KEY')
_chat_model = 'deepseek-v4-flash'
_embedding_model = 'text-embedding-3-large'

_client = OpenAI(base_url=_base_url, api_key=_api_key, timeout=75.0) if _api_key else None


def ask_llm(prompt: str, system_prompt: str = "You are an expert financial analyst.",
            max_tokens: int = 6000, retries: int = 2) -> str | None:
    """Mengirim prompt ke LLM via Sumopod (OpenAI-compatible) dengan retry."""
    if not _client:
        print("Error: SUMOPOD_API_KEY tidak ditemukan di .env!", file=sys.stderr)
        return None

    last_error = None
    for attempt in range(retries + 1):
        try:
            response = _client.chat.completions.create(
                model=_chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.1,
                max_tokens=max_tokens,
            )
            content = response.choices[0].message.content
            if content:
                return content.strip()

            print(f"Sumopod API mengembalikan konten kosong (attempt {attempt + 1})", file=sys.stderr)
        except Exception as e:
            last_error = e
            print(f"Sumopod API Error (attempt {attempt + 1}): {e}", file=sys.stderr)
            if attempt < retries:
                time.sleep(2 * (attempt + 1))

    print(f"Sumopod API gagal setelah {retries + 1} percobaan: {last_error}", file=sys.stderr)
    return None


def get_embedding(text: str, retries: int = 2) -> list[float] | None:
    """Menghasilkan representasi vektor teks menggunakan Sumopod text-embedding-3-large."""
    if not _client:
        return None

    last_error = None
    for attempt in range(retries + 1):
        try:
            response = _client.embeddings.create(
                model=_embedding_model,
                input=[text],
            )
            return response.data[0].embedding
        except Exception as e:
            last_error = e
            print(f"Sumopod Embedding Error (attempt {attempt + 1}): {e}", file=sys.stderr)
            if attempt < retries:
                time.sleep(2 * (attempt + 1))

    print(f"Sumopod Embedding gagal setelah {retries + 1} percobaan: {last_error}", file=sys.stderr)
    return None
