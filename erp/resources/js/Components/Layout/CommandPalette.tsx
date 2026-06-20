import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface SearchResult {
    type: string;
    label: string;
    sub?: string;
    href: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
    'Invoice':        'bg-blue-100 text-blue-700',
    'Contact':        'bg-purple-100 text-purple-700',
    'Product':        'bg-emerald-100 text-emerald-700',
    'Purchase Order': 'bg-amber-100 text-amber-700',
    'Employee':       'bg-teal-100 text-teal-700',
};

export function CommandPalette({ open, onClose }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        if (query.length < 2) { setResults([]); return; }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const data = await res.json();
                setResults(data.results ?? []);
                setSelected(0);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 280);

        return () => clearTimeout(timer);
    }, [query]);

    function navigate(href: string) {
        router.visit(href);
        onClose();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
        if (e.key === 'Enter' && results[selected]) { navigate(results[selected].href); }
    }

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Palette */}
            <div
                className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                    <svg className="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search invoices, employees, products…"
                        className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                {loading && (
                    <div className="px-4 py-3 text-sm text-slate-400">Searching…</div>
                )}

                {!loading && query.length >= 2 && results.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">No results for "{query}"</div>
                )}

                {!loading && results.length > 0 && (
                    <ul className="max-h-80 overflow-y-auto py-1">
                        {results.map((r, i) => (
                            <li key={`${r.type}-${r.href}-${i}`}>
                                <button
                                    className={[
                                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                        i === selected ? 'bg-indigo-50' : 'hover:bg-slate-50',
                                    ].join(' ')}
                                    onClick={() => navigate(r.href)}
                                    onMouseEnter={() => setSelected(i)}
                                >
                                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[r.type] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {r.type}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium text-slate-900 truncate">{r.label}</span>
                                        {r.sub && <span className="block text-xs text-slate-500 truncate">{r.sub}</span>}
                                    </span>
                                    <svg className="h-4 w-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {!query && (
                    <div className="px-4 py-4 text-xs text-slate-400">
                        Type at least 2 characters to search across invoices, employees, products, and more.
                    </div>
                )}
            </div>
        </div>
    );
}
