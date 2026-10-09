"""Operasi database: insert/update data IPO lengkap ke MySQL."""

import json
import sys
from config import get_connection

connection = get_connection()


def insert_ipo(ipo_data: dict) -> int:
    """Memasukkan atau memperbarui data lengkap satu emiten IPO ke database."""
    cursor = connection.cursor()
    try:
        connection.begin()
        _upsert_ipo_record(cursor, ipo_data)

        cursor.execute("SELECT id FROM ipos WHERE code = %s", (ipo_data['code'],))
        row = cursor.fetchone()
        if not row:
            print(f"Tidak dapat menemukan ID untuk emiten {ipo_data['code']}", file=sys.stderr)
            raise RuntimeError(f"Tidak dapat menemukan ID untuk emiten {ipo_data['code']}")
        ipo_id = row['id']

        # Hapus relasi lama sebelum insert ulang
        cursor.execute("DELETE FROM proceed_allocations WHERE ipo_id = %s", (ipo_id,))
        cursor.execute("DELETE FROM financial_summaries WHERE ipo_id = %s", (ipo_id,))
        cursor.execute("DELETE FROM ipo_risks WHERE ipo_id = %s", (ipo_id,))
        cursor.execute("DELETE FROM ipo_underwriter WHERE ipo_id = %s", (ipo_id,))

        _insert_allocations(cursor, ipo_id, ipo_data.get('allocations', []))
        _insert_financials(cursor, ipo_id, ipo_data.get('financials', []))
        _insert_risks(cursor, ipo_id, ipo_data.get('risks', []))
        _insert_underwriters(cursor, ipo_id, ipo_data.get('underwriters', []))

        connection.commit()
        print(f"Data emiten {ipo_data['code']} berhasil disimpan.", file=sys.stderr)
        return ipo_id
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()


def _upsert_ipo_record(cursor, ipo_data: dict) -> None:
    dilution_percentage = ipo_data.get('dilution_percentage')
    lockup_details = ipo_data.get('lockup_details')
    auditor_opinion = ipo_data.get('auditor_opinion')
    related_party_pct = ipo_data.get('related_party_transaction_percentage')
    related_party_details = ipo_data.get('related_party_details')

    cursor.execute("""
        INSERT INTO ipos (
            code, company_name, sector, ipo_price, offering_shares,
            dilution_percentage, has_secondary_offering, has_extra_lockup,
            lockup_details, shareholders, auditor_opinion,
            related_party_transaction_percentage, related_party_details,
            status, publish_status, listing_date, prospectus_pdf_url,
            data_source, source_synced_at, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s, %s, NOW(),
            NOW(), NOW()
        ) ON DUPLICATE KEY UPDATE
            company_name=VALUES(company_name),
            sector=VALUES(sector),
            ipo_price=VALUES(ipo_price),
            offering_shares=VALUES(offering_shares),
            dilution_percentage=VALUES(dilution_percentage),
            has_secondary_offering=VALUES(has_secondary_offering),
            has_extra_lockup=VALUES(has_extra_lockup),
            lockup_details=VALUES(lockup_details),
            shareholders=VALUES(shareholders),
            auditor_opinion=VALUES(auditor_opinion),
            related_party_transaction_percentage=VALUES(related_party_transaction_percentage),
            related_party_details=VALUES(related_party_details),
            status=VALUES(status),
            publish_status=VALUES(publish_status),
            listing_date=VALUES(listing_date),
            prospectus_pdf_url=VALUES(prospectus_pdf_url),
            data_source=VALUES(data_source),
            source_synced_at=VALUES(source_synced_at),
            updated_at=NOW()
    """, (
        ipo_data['code'], ipo_data['company_name'], ipo_data['sector'],
        ipo_data['ipo_price'], ipo_data['offering_shares'],
        dilution_percentage,
        1 if ipo_data.get('has_secondary_offering') else 0,
        1 if ipo_data.get('has_extra_lockup') else 0,
        lockup_details,
        json.dumps(ipo_data.get('shareholders', [])),
        auditor_opinion,
        related_party_pct,
        related_party_details,
        ipo_data['status'],
        ipo_data.get('publish_status', 'draft'),
        ipo_data.get('listing_date'),
        ipo_data.get('prospectus_pdf_url'),
        ipo_data.get('data_source', 'e-ipo.co.id'),
    ))


def _insert_allocations(cursor, ipo_id: int, allocations: list[dict]) -> None:
    for alloc in allocations:
        cursor.execute("""
            INSERT INTO proceed_allocations
                (ipo_id, category, percentage, amount, description, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        """, (ipo_id, alloc['category'], alloc['percentage'], alloc['amount'], alloc['description']))


def _insert_financials(cursor, ipo_id: int, financials: list[dict]) -> None:
    for fin in financials:
        total_equity = fin.get('total_equity')
        total_assets = fin.get('total_assets')
        net_income = fin.get('net_income')

        der = fin.get('debt_to_equity_ratio')
        if der is None:
            total_liabilities = fin.get('total_liabilities')
            der = round(total_liabilities / total_equity, 2) if total_equity and total_liabilities is not None else None

        curr_ratio = fin.get('current_ratio')
        roe = fin.get('roe')
        if roe is None:
            roe = round((net_income / total_equity) * 100, 2) if total_equity and net_income is not None else None
        roa = fin.get('roa')
        if roa is None:
            roa = round((net_income / total_assets) * 100, 2) if total_assets and net_income is not None else None

        cursor.execute("""
            INSERT INTO financial_summaries (
                ipo_id, year, revenue, net_income, total_assets,
                total_liabilities, total_equity,
                debt_to_equity_ratio, current_ratio, roe, roa,
                is_non_recurring_highlighted, non_recurring_details,
                created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            ipo_id,
            fin.get('year'),
            fin.get('revenue'),
            net_income,
            total_assets,
            fin.get('total_liabilities'),
            total_equity,
            der, curr_ratio, roe, roa,
            1 if fin.get('is_non_recurring_highlighted') else 0,
            fin.get('non_recurring_details'),
        ))


def _insert_risks(cursor, ipo_id: int, risks: list[dict]) -> None:
    for risk in risks:
        cursor.execute("""
            INSERT INTO ipo_risks (ipo_id, type, title, description, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
        """, (ipo_id, risk['type'], risk['title'], risk['description']))


def _insert_underwriters(cursor, ipo_id: int, underwriters: list[dict]) -> None:
    for uw in underwriters:
        cursor.execute("SELECT id FROM underwriters WHERE code = %s", (uw['code'],))
        row = cursor.fetchone()

        if row:
            uw_id = row['id']
            cursor.execute("""
                UPDATE underwriters
                SET name=%s, avg_return_30d=%s, avg_return_90d=%s,
                    underperformed_percentage=%s, updated_at=NOW()
                WHERE id=%s
            """, (uw['name'], uw.get('avg_return_30d'),
                  uw.get('avg_return_90d'), uw.get('underperformed_percentage'), uw_id))
        else:
            cursor.execute("""
                INSERT INTO underwriters
                    (code, name, avg_return_30d, avg_return_90d, underperformed_percentage, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """, (uw['code'], uw['name'], uw.get('avg_return_30d'),
                  uw.get('avg_return_90d'), uw.get('underperformed_percentage')))
            cursor.execute("SELECT id FROM underwriters WHERE code = %s", (uw['code'],))
            uw_id = cursor.fetchone()['id']

        cursor.execute("""
            INSERT INTO ipo_underwriter (ipo_id, underwriter_id, role)
            VALUES (%s, %s, %s)
        """, (ipo_id, uw_id, uw['role']))
