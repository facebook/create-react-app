import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface TypeRow {
    id: number;
    name: string;
    count: number;
    approvedDays: number;
    pendingDays: number;
}

interface DetailRow {
    id: number;
    employee: string;
    leaveType: string;
    start_date: string | null;
    end_date: string | null;
    days: number;
    status: string;
}

interface Props extends PageProps {
    dateFrom: string;
    dateTo: string;
    totalRequests: number;
    totalDays: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    typeBreakdown: TypeRow[];
    details: DetailRow[];
}

const STATUS_COLORS: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled:'bg-slate-100 text-slate-600',
};

function KpiCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color ?? 'text-slate-900'}`}>{value}</p>
        </div>
    );
}

export default function LeaveSummary({
    dateFrom: initialFrom,
    dateTo: initialTo,
    totalRequests,
    totalDays,
    approvedCount,
    pendingCount,
    rejectedCount,
    typeBreakdown,
    details,
}: Props) {
    const [dateFrom, setDateFrom] = useState(initialFrom);
    const [dateTo, setDateTo] = useState(initialTo);

    function applyFilter() {
        router.get('/hr/reports/leave-summary', { date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Leave Summary Report" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leave Summary Report</h1>
                    <p className="mt-1 text-sm text-slate-500">Leave requests and days taken within a date range</p>
                </div>

                {/* Date Filter */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-500">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <Button onClick={applyFilter}>Apply</Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard label="Total Requests" value={totalRequests} />
                    <KpiCard label="Total Days Taken" value={totalDays} />
                    <KpiCard label="Approved" value={approvedCount} color="text-green-600" />
                    <KpiCard label="Pending" value={pendingCount} color="text-amber-600" />
                </div>

                {/* Type Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Leave Type Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Requests</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Approved Days</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {typeBreakdown.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                                            No leave requests in this period.
                                        </td>
                                    </tr>
                                )}
                                {typeBreakdown.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{t.name}</td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-700">{t.count}</td>
                                        <td className="px-6 py-4 text-right text-sm text-green-700">{t.approvedDays}</td>
                                        <td className="px-6 py-4 text-right text-sm text-amber-700">{t.pendingDays}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Detailed Leave Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">End Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {details.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                                {details.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.employee}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.leaveType}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.start_date ?? '—'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.end_date ?? '—'}</td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-700">{row.days}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {row.status}
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
