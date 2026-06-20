import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ShiftSwap {
    id: number;
    shift_id: number;
    requested_by: number;
    requested_to: number;
    requester?: User;
    target?: User;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    responded_at?: string;
}

interface Shift {
    id: number;
    employee_id: number;
    employee?: User;
    title: string;
    starts_at: string;
    ends_at: string;
    break_minutes: number;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    swaps?: ShiftSwap[];
}

interface Props extends PageProps {
    shift: Shift;
    users: User[];
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
};

const swapColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

function durationMinutes(shift: Shift): number {
    const diff = new Date(shift.ends_at).getTime() - new Date(shift.starts_at).getTime();
    return Math.round(diff / 60000) - shift.break_minutes;
}

export default function PlanningShow({ shift, users }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        requested_to: '',
        reason: '',
    });

    function handleSwapSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/planning/${shift.id}/swap`, data, {
            onSuccess: () => reset(),
        });
    }

    function fmt(dt: string) {
        return new Date(dt).toLocaleString();
    }

    const mins = durationMinutes(shift);
    const hrs = (mins / 60).toFixed(1);

    return (
        <AppLayout>
            <Head title={`Shift: ${shift.title}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <a href="/planning" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block">&larr; Back to Planning</a>
                        <h1 className="text-2xl font-semibold text-slate-900">{shift.title}</h1>
                    </div>
                    <div className="flex gap-2">
                        {shift.status === 'scheduled' && (
                            <button
                                onClick={() => router.post(`/planning/${shift.id}/confirm`)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                                Confirm
                            </button>
                        )}
                        {shift.status === 'confirmed' && (
                            <button
                                onClick={() => router.post(`/planning/${shift.id}/complete`)}
                                className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
                            >
                                Complete
                            </button>
                        )}
                        {shift.status !== 'cancelled' && shift.status !== 'completed' && (
                            <button
                                onClick={() => router.post(`/planning/${shift.id}/cancel`)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Employee</dt>
                            <dd className="mt-1 text-slate-900">{shift.employee?.name ?? `User #${shift.employee_id}`}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[shift.status] ?? ''}`}>
                                    {shift.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Starts At</dt>
                            <dd className="mt-1 text-slate-900">{fmt(shift.starts_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Ends At</dt>
                            <dd className="mt-1 text-slate-900">{fmt(shift.ends_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Duration</dt>
                            <dd className="mt-1 text-slate-900">{hrs} hours ({mins} mins, excl. {shift.break_minutes}m break)</dd>
                        </div>
                        {shift.notes && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                                <dd className="mt-1 text-slate-900">{shift.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-medium mb-4">Swap Requests</h2>
                    {(shift.swaps ?? []).length === 0 ? (
                        <p className="text-slate-400 text-sm">No swap requests yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left pb-2 font-medium text-slate-600">Requester</th>
                                    <th className="text-left pb-2 font-medium text-slate-600">Requested To</th>
                                    <th className="text-left pb-2 font-medium text-slate-600">Reason</th>
                                    <th className="text-left pb-2 font-medium text-slate-600">Status</th>
                                    <th className="text-left pb-2 font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(shift.swaps ?? []).map(swap => (
                                    <tr key={swap.id} className="border-b border-slate-100">
                                        <td className="py-2">{swap.requester?.name ?? `User #${swap.requested_by}`}</td>
                                        <td className="py-2">{swap.target?.name ?? `User #${swap.requested_to}`}</td>
                                        <td className="py-2 text-slate-500">{swap.reason ?? '—'}</td>
                                        <td className="py-2">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${swapColors[swap.status] ?? ''}`}>
                                                {swap.status}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            {swap.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.post(`/planning/${shift.id}/swaps/${swap.id}/approve`)}
                                                        className="text-green-600 hover:text-green-800 text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => router.post(`/planning/${shift.id}/swaps/${swap.id}/reject`)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-medium mb-4">Request Swap</h2>
                    <form onSubmit={handleSwapSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Swap With</label>
                            <select
                                value={data.requested_to}
                                onChange={e => setData('requested_to', e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                            >
                                <option value="">Select employee...</option>
                                {users.filter(u => u.id !== shift.employee_id).map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            {errors.requested_to && <p className="text-red-600 text-xs mt-1">{errors.requested_to}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                            <textarea
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                rows={2}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Request Swap
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
