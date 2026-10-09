/**
 * Domain types for IPO entities.
 *
 * These mirror the shapes serialized by IpoController and the Python
 * pipeline. Keep field names in sync with the API payloads.
 */

export type IpoStatus = 'book_building' | 'offering' | 'listed';

export interface IpoItem {
    id: number | string;
    code: string;
    company_name: string;
    sector: string;
    ipo_price: number;
    offering_shares: number;
    status: IpoStatus;
    listing_date?: string;
    dilution_percentage?: number;
    has_secondary_offering?: boolean;
    has_extra_lockup?: boolean;
}

export interface ProceedAllocation {
    id: number | string;
    category: string;
    percentage: number;
    amount: number;
    description: string;
}

export interface Shareholder {
    name: string;
    before_percentage: number;
    after_percentage: number;
}

export interface IpoDetailsForOwnership {
    dilution_percentage: number;
    has_secondary_offering: boolean;
    has_extra_lockup: boolean;
    lockup_details: string;
    shareholders: Shareholder[];
}

export interface Underwriter {
    id: number | string;
    code: string;
    name: string;
    role: UnderwriterRole;
}

export type UnderwriterRole = 'lead' | 'co-lead' | 'member';

export interface UnderwriterHistoryItem {
    code: string;
    company_name: string;
    ipo_price: number;
    listing_date: string | null;
    status: IpoStatus;
    sector: string;
    source_url?: string | null;
    return_30d: number | null;
    return_90d: number | null;
}

export interface UnderwriterHistoryGroup {
    underwriter: {
        code: string;
        name: string;
        role: UnderwriterRole;
    };
    ipos: UnderwriterHistoryItem[];
}

export interface FinancialYearData {
    id: number;
    year: number | null;
    revenue: number | null;
    net_income: number | null;
    total_assets: number | null;
    total_liabilities: number | null;
    total_equity: number | null;
    debt_to_equity_ratio: number | null;
    current_ratio: number | null;
    roe: number | null;
    roa: number | null;
    is_non_recurring_highlighted: boolean;
    non_recurring_details?: string;
}

export interface FinancialSummaryDetails {
    auditor_opinion: string | null;
    financial_data: FinancialYearData[];
}

export interface IpoRisk {
    id: number | string;
    type: 'specific' | 'generic';
    title: string;
    description: string;
}

export interface RelatedPartyDetails {
    percentage: number;
    details: string;
}

/** The full payload rendered on the IPO detail page. */
export interface IpoDetail {
    code: string;
    company_name: string;
    sector: string;
    status: IpoStatus;
    ipo_price: number;
    offering_shares: number;
    listing_date?: string;
    allocations: ProceedAllocation[];
    ownership: IpoDetailsForOwnership;
    underwriters: Underwriter[];
    financials: FinancialSummaryDetails;
    risks: IpoRisk[];
    related_party: RelatedPartyDetails;
}
