import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface ReportRow {
    pair: string;
    base_currency: string;
    quote_currency: string;
    current_rate: number | null;
    prior_rate: number | null;
    change_pct: number | null;
}

interface Props extends PageProps {
    rows: ReportRow[];
    asOf: string;
    ago30: string;
}

export default function ExchangeRatesReport({ rows, asOf, ago30 }: Props) {
    return (
        <AppLayout>
            <Head title="Currency Revaluation Report" />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Currency Revaluation Report</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Current rates as of {asOf} vs. rates 30 days ago ({ago30})
                        </p>
                    </div>
                    <Link
                        href="/finance/exchange-rates"
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        &larr; Back to Rates
                    </Link>
                </div>

                {/* Report Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {rows.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">
                            No exchange rates found. Add rates to see the revaluation report.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Currency Pair</th>
                                    <th className="px-4 py-3 text-right font-medium">Current Rate</th>
                                    <th className="px-4 py-3 text-right font-medium">Rate 30 Days Ago</th>
                                    <th className="px-4 py-3 text-right font-medium">Change (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => {
                                    const changeColor =
                                        row.change_pct === null
                                            ? 'text-slate-400'
                                            : row.change_pct > 0
                                            ? 'text-green-600'
                                            : row.change_pct < 0
                                            ? 'text-red-600'
                                            : 'text-slate-600';

                                    return (
                                        <tr key={row.pair} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {row.base_currency}/{row.quote_currency}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono">
                                                {row.current_rate !== null
                                                    ? row.current_rate.toFixed(6)
                                                    : <span className="text-slate-400">N/A</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-500">
                                                {row.prior_rate !== null
                                                    ? row.prior_rate.toFixed(6)
                                                    : <span className="text-slate-400">N/A</span>
                                                }
                                            </td>
                                            <td className={`px-4 py-3 text-right font-semibold ${changeColor}`}>
                                                {row.change_pct !== null
                                                    ? `${row.change_pct > 0 ? '+' : ''}${row.change_pct.toFixed(2)}%`
                                                    : '—'
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="text-xs text-slate-400 text-center">
                    Read-only report. Rates are sourced from the exchange rate registry.
                </p>
            </div>
        </AppLayout>
    );
}
