import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface LeaveRequest {
    id: number;
    employee: string;
    type: string | null;
    start_date: string;
    end_date: string;
    status: string;
}

interface DepartmentCount {
    name: string;
    count: number;
}

interface Props extends PageProps {
    totalEmployees: number;
    pendingLeaves: number;
    onLeaveToday: number;
    totalDepartments: number;
    openPositions: number;
    newHiresThisMonth: number;
    recentLeaveRequests: LeaveRequest[];
    departmentHeadcount: DepartmentCount[];
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color ?? 'text-slate-900'}`}>{value}</p>
        </div>
    );
}

const LEAVE_STATUS_COLORS: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled:'bg-slate-100 text-slate-500',
};

export default function HRDashboard({
    totalEmployees, pendingLeaves, onLeaveToday, totalDepartments,
    openPositions, newHiresThisMonth, recentLeaveRequests, departmentHeadcount,
}: Props) {
    return (
        <AppLayout>
            <Head title="HR Dashboard" />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">HR Dashboard</h1>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <KpiCard label="Active Employees"    value={totalEmployees} />
                    <KpiCard label="Pending Leave Reqs"  value={pendingLeaves}      color={pendingLeaves > 0 ? 'text-amber-600' : 'text-slate-900'} />
                    <KpiCard label="On Leave Today"      value={onLeaveToday}        color={onLeaveToday > 0 ? 'text-blue-600' : 'text-slate-900'} />
                    <KpiCard label="Departments"         value={totalDepartments} />
                    <KpiCard label="Open Positions"      value={openPositions}       color={openPositions > 0 ? 'text-indigo-600' : 'text-slate-900'} />
                    <KpiCard label="New Hires This Month" value={newHiresThisMonth}   color={newHiresThisMonth > 0 ? 'text-green-600' : 'text-slate-900'} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pending Leave Requests */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">Pending Leave Requests</h2>
                            <Link href="/hr/leave-requests" className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>
                        {recentLeaveRequests.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">No pending leave requests.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Employee</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Type</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Dates</th>
                                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentLeaveRequests.map((lr) => (
                                        <tr key={lr.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3 font-medium text-slate-800">{lr.employee}</td>
                                            <td className="px-5 py-3 text-slate-600">{lr.type ?? '—'}</td>
                                            <td className="px-5 py-3 text-slate-500 text-xs">
                                                {lr.start_date} → {lr.end_date}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${LEAVE_STATUS_COLORS[lr.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {lr.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Department Headcount */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">Department Headcount</h2>
                            <Link href="/hr/departments" className="text-xs text-indigo-600 hover:underline">View all</Link>
                        </div>
                        {departmentHeadcount.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-400">No departments found.</p>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {departmentHeadcount.map((dept) => {
                                    const maxCount = Math.max(...departmentHeadcount.map(d => d.count), 1);
                                    const pct = Math.round((dept.count / maxCount) * 100);
                                    return (
                                        <div key={dept.name} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                                            <div className="w-32 shrink-0 text-sm font-medium text-slate-700 truncate">{dept.name}</div>
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-400 rounded-full"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="w-8 text-right text-sm font-semibold text-slate-700">{dept.count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
