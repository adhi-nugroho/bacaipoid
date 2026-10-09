import { create } from 'zustand';
import type { AiValuationResult } from '../types/valuation';

interface ValuationState {
    /** Result keyed by IPO code so it survives tab switches and navigation. */
    results: Record<string, AiValuationResult>;
    loading: Record<string, boolean>;
    errors: Record<string, string | null>;
    notConfigured: Record<string, boolean>;

    setResult: (code: string, result: AiValuationResult) => void;
    setLoading: (code: string, loading: boolean) => void;
    setError: (code: string, error: string | null) => void;
    setNotConfigured: (code: string) => void;
    reset: (code: string) => void;
}

export const useValuationStore = create<ValuationState>((set) => ({
    results: {},
    loading: {},
    errors: {},
    notConfigured: {},

    setResult: (code, result) =>
        set((state) => ({ results: { ...state.results, [code]: result } })),
    setLoading: (code, loading) =>
        set((state) => ({ loading: { ...state.loading, [code]: loading } })),
    setError: (code, error) =>
        set((state) => ({ errors: { ...state.errors, [code]: error } })),
    setNotConfigured: (code) =>
        set((state) => ({
            notConfigured: { ...state.notConfigured, [code]: true },
        })),
    reset: (code) =>
        set((state) => ({
            results: { ...state.results, [code]: undefined as never },
            loading: { ...state.loading, [code]: false },
            errors: { ...state.errors, [code]: null },
            notConfigured: { ...state.notConfigured, [code]: false },
        })),
}));
