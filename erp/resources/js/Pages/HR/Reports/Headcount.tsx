import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface DepartmentRow {
    id: number;
    name: string;
    count: number;
    percentage: number;
}

interface Props extends PageProps {
    totalActive: number;
    newHiresThisMonth: number;
    terminationsThisMonth: number;
    turnoverRate: number;
    departments: DepartmentRow[];
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

export default function Headcount({
    totalActive,
    newHiresThisMonth,
    terminationsThisMonth,
    turnoverRate,
    departments,
}: Props) {
    return (
        <AppLayout>
            <Head title="Headcount Report" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Headcount Report</h1>
                    <p className="mt-1 text-sm text-slate-500">Active employee headcount and department breakdown</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard label="Total Active Employees" value={totalActive} />
                    <KpiCard label="New Hires This Month" value={newHiresThisMonth} />
                    <KpiCard label="Terminations This Month" value={terminationsThisMonth} />
                    <KpiCard label="Turnover Rate" value={`${turnoverRate}%`} sub="this month" />
                </div>

                {/* Department Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-800">Department Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Head Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 w-64">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {departments.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400">
                                            No departments found.
                                        </td>
                                    </tr>
                                )}
                                {departments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{dept.name}</td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-700">{dept.count}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-2 rounded-full bg-indigo-500"
                                                        style={{ width: `${Math.max(dept.percentage, 2)}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right text-xs text-slate-500">
                                                    {dept.percentage}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {departments.length > 0 && (
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td className="px-6 py-3 text-sm font-semibold text-slate-700">Total</td>
                                        <td className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                                            {totalActive}
                                        </td>
                                        <td className="px-6 py-3" />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
