import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface AbcRow {
    product_id: number;
    product_name: string;
    sku: string;
    movement_value: number;
    percentage: number;
    cumulative: number;
    bucket: 'A' | 'B' | 'C';
    rank: number;
}

interface BucketSummary {
    A: number;
    B: number;
    C: number;
}

interface Props extends PageProps {
    rows: AbcRow[];
    total_value: number;
    bucket_summary: BucketSummary;
}

const BUCKET_STYLES: Record<string, { badge: string; card: string; label: string }> = {
    A: {
        badge: 'bg-emerald-100 text-emerald-800',
        card:  'border-emerald-200 bg-emerald-50',
        label: 'A — Top Movers (80% of value)',
    },
    B: {
        badge: 'bg-yellow-100 text-yellow-800',
        card:  'border-yellow-200 bg-yellow-50',
        label: 'B — Medium Movers (15% of value)',
    },
    C: {
        badge: 'bg-red-100 text-red-700',
        card:  'border-red-200 bg-red-50',
        label: 'C — Slow Movers (5% of value)',
    },
};

function fmt(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AbcAnalysis({ rows, total_value, bucket_summary }: Props) {
    return (
        <AppLayout>
            <Head title="ABC Analysis Report" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">ABC Analysis</h1>
                <p className="mb-6 text-sm text-slate-500">Based on stock movement value in the last 90 days.</p>

                {/* Bucket Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(['A', 'B', 'C'] as const).map(bucket => (
                        <div key={bucket} className={`rounded-xl border p-5 shadow-sm ${BUCKET_STYLES[bucket].card}`}>
                            <div className="flex items-center gap-2">
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-bold ${BUCKET_STYLES[bucket].badge}`}>{bucket}</span>
                                <span className="text-sm font-medium text-slate-700">{BUCKET_STYLES[bucket].label}</span>
                            </div>
                            <p className="mt-3 text-4xl font-bold text-slate-900">{bucket_summary[bucket]}</p>
                            <p className="text-xs text-slate-500">products</p>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mb-4 text-sm text-slate-600">
                    Total movement value (90 days): <span className="font-semibold text-slate-900">{fmt(total_value)}</span>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700 w-16">Rank</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">SKU</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Movement Value</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">% of Total</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Cumulative %</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Bucket</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-400">No stock movement data for the last 90 days.</td>
                                    </tr>
                                ) : rows.map(row => (
                                    <tr key={row.product_id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-right text-slate-500">{row.rank}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.product_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.sku}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(row.movement_value)}</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{row.percentage.toFixed(2)}%</td>
                                        <td className="px-4 py-3 text-right text-slate-500">{row.cumulative.toFixed(2)}%</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${BUCKET_STYLES[row.bucket].badge}`}>
                                                {row.bucket}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
