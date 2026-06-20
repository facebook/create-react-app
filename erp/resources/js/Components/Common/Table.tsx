import { ReactNode } from 'react';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
    sortable?: boolean;
    className?: string;
}

interface TableProps<T extends { id: number | string }> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    onSort?: (key: string) => void;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
}

export function Table<T extends { id: number | string }>({
    columns,
    data,
    emptyMessage = 'No records found.',
    onSort,
    sortKey,
    sortDir,
}: TableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                scope="col"
                                className={[
                                    'px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider',
                                    col.sortable ? 'cursor-pointer select-none hover:text-slate-700' : '',
                                    col.className ?? '',
                                ].join(' ')}
                                onClick={col.sortable ? () => onSort?.(col.key) : undefined}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {col.header}
                                    {col.sortable && sortKey === col.key && (
                                        <svg
                                            className={`h-3.5 w-3.5 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                        >
                                            <path d="M8 3.5L13 9H3L8 3.5z" />
                                        </svg>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center text-slate-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={[
                                            'px-4 py-3 text-slate-700',
                                            col.className ?? '',
                                        ].join(' ')}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : String((row as Record<string, unknown>)[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
