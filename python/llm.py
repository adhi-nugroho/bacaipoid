"""Integrasi LLM via OpenAI-compatible client (Cloudflare AI / Sumopod): chat completion dan text embedding."""

import sys
import time
from openai import OpenAI
from config import env

_ai_provider = env.get('AI_PROVIDER', '').lower()
_cf_token = env.get('CLOUDFLARE_WORKER_API_TOKEN')
_cf_account = env.get('CLOUDFLARE_ACCOUNT_ID')

# Prioritaskan Cloudflare jika AI_PROVIDER=cloudflare atau jika Cloudflare credentials tersedia (kecuali disetel sumopod)
if _ai_provider == 'cloudflare' or (_cf_token and _cf_account and _ai_provider != 'sumopod'):
    _provider_name = "Cloudflare AI"
    _cf_base = env.get('CLOUDFLARE_BASE_URL', 'https://api.cloudflare.com/client/v4').rstrip('/')
    if f"/accounts/{_cf_account}" in _cf_base:
        _base_url = f"{_cf_base}/ai/v1"
    else:
        _base_url = f"{_cf_base}/accounts/{_cf_account}/ai/v1"
    _api_key = _cf_token
    _chat_model = env.get('CLOUDFLARE_CHAT_MODEL', '@cf/meta/llama-3.3-70b-instruct-fp8-fast')
    _embedding_model = env.get('CLOUDFLARE_EMBEDDING_MODEL', '@cf/baai/bge-small-en-v1.5')
else:
    _provider_name = "Sumopod"
    _base_url = env.get('SUMOPOD_BASE_URL', 'https://ai.sumopod.com/v1')
    _api_key = env.get('SUMOPOD_API_KEY')
    _chat_model = 'deepseek-v4-flash'
    _embedding_model = 'text-embedding-3-large'

_client = OpenAI(base_url=_base_url, api_key=_api_key, timeout=75.0) if _api_key else None


def ask_llm(prompt: str, system_prompt: str = "You are an expert financial analyst.",
            max_tokens: int = 4096, retries: int = 2) -> str | None:
    """Mengirim prompt ke LLM via OpenAI-compatible client dengan retry."""
    if not _client:
        print(f"Error: API key untuk {_provider_name} tidak ditemukan di .env!", file=sys.stderr)
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

            print(f"{_provider_name} API mengembalikan konten kosong (attempt {attempt + 1})", file=sys.stderr)
        except Exception as e:
            last_error = e
            print(f"{_provider_name} API Error (attempt {attempt + 1}): {e}", file=sys.stderr)
            if attempt < retries:
                time.sleep(2 * (attempt + 1))

    print(f"{_provider_name} API gagal setelah {retries + 1} percobaan: {last_error}", file=sys.stderr)
    return None


def get_embedding(text: str, retries: int = 2) -> list[float] | None:
    """Menghasilkan representasi vektor teks menggunakan model embedding."""
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
            print(f"{_provider_name} Embedding Error (attempt {attempt + 1}): {e}", file=sys.stderr)
            if attempt < retries:
                time.sleep(2 * (attempt + 1))

    print(f"{_provider_name} Embedding gagal setelah {retries + 1} percobaan: {last_error}", file=sys.stderr)
    return None
