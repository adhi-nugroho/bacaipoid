import { router } from '@inertiajs/react';

/**
 * Valuation API facade.
 *
 * The AI valuation is computed server-side and delivered to the page as an
 * Inertia prop. There is no client-side fetch: `reloadValuation` asks Inertia
 * to refresh only the `valuation` prop (used for retry).
 */
export function reloadValuation(): void {
    router.reload({ only: ['valuation'] });
}
