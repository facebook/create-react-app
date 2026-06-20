import React, { useState, useMemo, useCallback } from 'react';

export type SortDir = 'asc' | 'desc';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    className?: string;
    render?: (row: T, idx: number) => React.ReactNode;
}

interface Props<T> {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    selectable?: boolean;
    onSelectionChange?: (selected: (string | number)[]) => void;
    pageSize?: number;
    emptyMessage?: string;
    loading?: boolean;
    stickyHeader?: boolean;
    actions?: (row: T) => React.ReactNode;
}

export default function DataGrid<T extends Record<string, unknown>>({
    columns,
    rows,
    rowKey,
    selectable = false,
    onSelectionChange,
    pageSize = 25,
    emptyMessage = 'No records found.',
    loading = false,
    stickyHeader = false,
    actions,
}: Props<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [selected, setSelected] = useState<Set<string | number>>(new Set());
    const [page, setPage] = useState(1);

    const sorted = useMemo(() => {
        if (!sortKey) return rows;
        return [...rows].sort((a, b) => {
            const va = a[sortKey] as string | number | null | undefined;
            const vb = b[sortKey] as string | number | null | undefined;
            if (va == null && vb == null) return 0;
            if (va == null) return 1;
            if (vb == null) return -1;
            const cmp = va < vb ? -1 : va > vb ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [rows, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setPage(1);
    };

    const toggleRow = useCallback((id: string | number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            onSelectionChange?.([...next]);
            return next;
        });
    }, [onSelectionChange]);

    const toggleAll = useCallback(() => {
        if (selected.size === paged.length) {
            setSelected(new Set());
            onSelectionChange?.([]);
        } else {
            const allIds = paged.map((r) => rowKey(r));
            setSelected(new Set(allIds));
            onSelectionChange?.(allIds);
        }
    }, [selected, paged, rowKey, onSelectionChange]);

    const SortIcon = ({ col }: { col: string }) => {
        if (sortKey !== col) return <span className="text-gray-300 text-xs ml-1">↕</span>;
        return <span className="text-blue-500 text-xs ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead className={`bg-gray-50 border-b ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                        <tr>
                            {selectable && (
                                <th className="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selected.size === paged.length && paged.length > 0}
                                        onChange={toggleAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-left text-gray-600 font-medium select-none ${col.sortable ? 'cursor-pointer hover:text-gray-800 hover:bg-gray-100' : ''} ${col.className ?? ''}`}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                >
                                    {col.label}
                                    {col.sortable && <SortIcon col={col.key} />}
                                </th>
                            ))}
                            {actions && <th className="px-4 py-3 w-24 text-right text-gray-600 font-medium">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-4 py-10 text-center text-gray-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Loading…
                                    </div>
                                </td>
                            </tr>
                        ) : paged.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-4 py-10 text-center text-gray-400">{emptyMessage}</td>
                            </tr>
                        ) : (
                            paged.map((row, idx) => {
                                const id = rowKey(row);
                                const isSelected = selected.has(id);
                                return (
                                    <tr
                                        key={id}
                                        className={`border-b transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        {selectable && (
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleRow(id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col) => (
                                            <td key={col.key} className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}>
                                                {col.render ? col.render(row, idx) : String(row[col.key] ?? '—')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-3 text-right">{actions(row)}</td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >«</button>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >‹</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                            const n = start + i;
                            return (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-8 h-8 rounded text-sm ${n === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    {n}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >›</button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >»</button>
                    </div>
                </div>
            )}
        </div>
    );
}
