/**
 * Types for AI-driven valuation and sector peer comparison.
 */

export type ValuationStatus = 'undervalued' | 'fair' | 'overvalued';

/** Result returned by the AI valuation endpoint. */
export interface AiValuationResult {
    fair_price_min: number;
    fair_price_max: number;
    pe_multiplier_min: number | null;
    pe_multiplier_max: number | null;
    valuation_status: ValuationStatus | string;
    methodology: string;
}

/** A single comparable listed company used for sector comparison. */
export interface PeerCompany {
    name: string;
    code: string;
    pe: number;
    pbv: number;
    roe: number;
}

export interface PeerGroup {
    category: string;
    peers: PeerCompany[];
    fairPriceMultiplierMin: number;
    fairPriceMultiplierMax: number;
    valuationDescription: string;
}

/** Error payload shape from the valuation endpoint. */
export interface ValuationError {
    error: string;
    config_missing?: boolean;
}
