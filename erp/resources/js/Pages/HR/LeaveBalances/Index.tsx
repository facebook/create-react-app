import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { LeaveBalance } from '@/types/hr';

interface Props extends PageProps {
    balances: Paginator<LeaveBalance>;
    filters: { employee_id?: number; year?: number };
}

export default function LeaveBalancesIndex({ balances, filters }: Props) {
    const { can } = usePermission();
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({ allocated_days: 0 });

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    function startEdit(balance: LeaveBalance) {
        setEditingId(balance.id);
        form.setData('allocated_days', balance.allocated_days);
    }

    function handleUpdate(e: React.FormEvent, balance: LeaveBalance) {
        e.preventDefault();
        form.patch(`/hr/leave-balances/${balance.id}`, {
            onSuccess: () => setEditingId(null),
        });
    }

    return (
        <AppLayout>
            <Head title="Leave Balances" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Leave Balances</h1>
                        <p className="text-sm text-slate-500 mt-1">{balances.total} records</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <select
                            value={filters.year ?? ''}
                            onChange={(e) => router.get('/hr/leave-balances', { ...filters, year: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="">All Years</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'employee',   header: 'Employee',   render: (b) => <span className="font-medium text-slate-900">{(b.employee as any)?.full_name ?? `#${b.employee_id}`}</span> },
                            { key: 'leave_type', header: 'Leave Type', render: (b) => <span className="text-sm text-slate-700">{(b.leave_type as any)?.name ?? `#${b.leave_type_id}`}</span> },
                            { key: 'year',       header: 'Year',       render: (b) => <span className="text-sm">{b.year}</span> },
                            { key: 'allocated',  header: 'Allocated',  render: (b) => (
                                editingId === b.id ? (
                                    <form onSubmit={(e) => handleUpdate(e, b)} className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.5}
                                            value={form.data.allocated_days}
                                            onChange={(e) => form.setData('allocated_days', parseFloat(e.target.value) || 0)}
                                            className="w-20 rounded border border-slate-300 px-2 py-0.5 text-sm"
                                        />
                                        <Button type="submit" disabled={form.processing}>Save</Button>
                                        <button type="button" onClick={() => setEditingId(null)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                                    </form>
                                ) : (
                                    <span className="text-sm">{b.allocated_days}</span>
                                )
                            )},
                            { key: 'used',    header: 'Used',    render: (b) => <span className="text-sm">{b.used_days}</span> },
                            { key: 'pending', header: 'Pending', render: (b) => <span className="text-sm text-amber-600">{b.pending_days}</span> },
                            { key: 'remaining', header: 'Remaining', render: (b) => (
                                <span className={`text-sm font-medium ${(b.remaining_days ?? 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {b.remaining_days ?? (b.allocated_days - b.used_days - b.pending_days)}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (b) => can('hr.create') && editingId !== b.id ? (
                                <button onClick={() => startEdit(b)} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</button>
                            ) : null },
                        ]}
                        data={balances.data}
                        emptyMessage="No leave balances found."
                    />
                    <Pagination paginator={balances} />
                </div>
            </div>
        </AppLayout>
    );
}
