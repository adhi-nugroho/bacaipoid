#!/usr/bin/env python3
"""Konfigurasi aplikasi: load .env dan koneksi database."""

import os
import re
import sys
import pymysql


def load_env(env_path: str) -> dict:
    """Membaca file .env Laravel dan mengembalikan kamus variabel lingkungan."""
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                match = re.match(r'^\s*([\w.]+)\s*=\s*(.*)\s*$', line)
                if match:
                    key = match.group(1)
                    val = match.group(2).strip('"').strip("'")
                    env_vars[key] = val
    return env_vars


# Load environment variables first, then use the project .env for local execution.
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = {**load_env(os.path.join(project_root, '.env')), **os.environ}

# Konfigurasi database
db_host = env.get('DB_HOST', '127.0.0.1')
db_user = env.get('DB_USERNAME', '')
db_pass = env.get('DB_PASSWORD', '')
db_name = env.get('DB_DATABASE', '')
db_port = int(env.get('DB_PORT', '3306'))

def get_connection():
    """Create a database connection only for commands that actually need it."""
    print(f"Menghubungkan ke database {db_name} di {db_host}:{db_port}...", file=sys.stderr)
    return pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_pass,
        database=db_name,
        port=db_port,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )
