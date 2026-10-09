import type { ReactNode } from 'react';

/**
 * Shared UI primitives types.
 */

export type BadgeVariant =
    | 'neutral'
    | 'copper'
    | 'emerald'
    | 'danger'
    | 'muted'
    | 'cyan'
    // Legacy aliases kept so existing callers keep compiling.
    | 'blue'
    | 'amber'
    | 'slate'
    | 'gray'
    | 'rose';

export interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
}
