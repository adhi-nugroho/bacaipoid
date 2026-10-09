import React from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTabId: string;
    onChange: (id: string) => void;
    className?: string;
}

export default function TabNavigation({
    tabs,
    activeTabId,
    onChange,
    className = '',
}: TabNavigationProps) {
    return (
        <div className={className}>
            <div className="scrollbar-hide flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1.5">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-700 ease-silk focus:outline-none active:scale-[0.97] ${
                                isActive
                                    ? 'bg-copper-500 text-ink-950'
                                    : 'text-cream-400 hover:bg-white/5 hover:text-cream-100'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.icon && (
                                <span
                                    className={
                                        isActive
                                            ? 'text-ink-950'
                                            : 'text-cream-400/70'
                                    }
                                >
                                    {tab.icon}
                                </span>
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
