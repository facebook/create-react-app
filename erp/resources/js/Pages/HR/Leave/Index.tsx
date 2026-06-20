import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { LeaveRequest, LeaveStatus } from '@/types/hr';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    requests: Paginator<LeaveRequest>;
    employees: { id: number; full_name: string }[];
    filters: { status?: LeaveStatus; employee_id?: number };
}

const STATUS_COLORS: Record<LeaveStatus, string> = {
    pending:   'bg-amber-100 text-amber-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-600',
    cancelled: 'bg-slate-100 text-slate-600',
};

const STATUS_TABS: Array<{ value: LeaveStatus | ''; label: string }> = [
    { value: '',         label: 'All' },
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export default function LeaveIndex({ requests, employees, filters }: Props) {
    const { can } = usePermission();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        employee_id: '' as number | '',
        leave_type_id: '' as number | '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    function submitRequest(e: React.FormEvent) {
        e.preventDefault();
        router.post('/hr/leave', form as any, {
            onSuccess: () => { setShowForm(false); setForm({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', notes: '' }); },
        });
    }

    return (
        <AppLayout>
            <Head title="Leave Requests" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Leave Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">{requests.total} requests</p>
                    </div>
                    {can('hr.create') && (
                        <Button onClick={() => setShowForm(!showForm)}>New Request</Button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={submitRequest} className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-indigo-900 mb-3">Submit Leave Request</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Employee <span className="text-red-500">*</span></label>
                                <select value={form.employee_id}
                                    onChange={(e) => setForm({ ...form, employee_id: e.target.value ? Number(e.target.value) : '' })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                                    <option value="">Select…</option>
                                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">End Date <span className="text-red-500">*</span></label>
                                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" size="sm">Submit</Button>
                        </div>
                    </form>
                )}

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button key={tab.value}
                            onClick={() => router.get('/hr/leave', { ...filters, status: tab.value || undefined }, { preserveState: true, replace: true })}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Employee</th>
                                <th className="px-4 py-2 text-left font-medium">Leave Type</th>
                                <th className="px-4 py-2 text-left font-medium">Period</th>
                                <th className="px-4 py-2 text-right font-medium">Days</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                {can('hr.update') && <th className="px-4 py-2"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.data.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{req.employee?.full_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{req.leave_type ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-500">{req.start_date} → {req.end_date}</td>
                                    <td className="px-4 py-3 text-right">{req.days}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[req.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    {can('hr.update') && (
                                        <td className="px-4 py-3">
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => router.patch(`/hr/leave/${req.id}/approve`)}
                                                        className="text-xs text-green-600 hover:text-green-800 font-medium">Approve</button>
                                                    <button onClick={() => router.patch(`/hr/leave/${req.id}/reject`)}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {requests.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No leave requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination paginator={requests} />
                </div>
            </div>
        </AppLayout>
    );
}
