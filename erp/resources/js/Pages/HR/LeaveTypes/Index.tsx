import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';

interface LeaveTypeItem {
    id: number;
    name: string;
    code: string | null;
    default_days: number;
    days_per_year?: number;
    is_paid: boolean;
    is_active: boolean;
    requires_approval: boolean;
    description: string | null;
}

interface Props extends PageProps {
    leaveTypes: {
        data: LeaveTypeItem[];
        total: number;
        current_page: number;
        last_page: number;
    };
}

export default function LeaveTypesIndex({ leaveTypes }: Props) {
    const { can } = usePermission();

    const form = useForm({
        name: '',
        code: '',
        default_days: 0,
        is_paid: true,
        requires_approval: true,
        description: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/hr/leave-types', {
            onSuccess: () => form.reset(),
        });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this leave type?')) {
            router.delete(`/hr/leave-types/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Leave Types" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Leave Types</h1>
                        <p className="text-sm text-slate-500 mt-1">{leaveTypes.total} types</p>
                    </div>
                </div>

                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">Add Leave Type</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                    required
                                />
                                {form.errors.name && <p className="text-xs text-red-600 mt-0.5">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                    maxLength={10}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Default Days</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.default_days}
                                    onChange={(e) => form.setData('default_days', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <label className="flex items-center gap-1.5 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_paid}
                                        onChange={(e) => form.setData('is_paid', e.target.checked)}
                                        className="rounded border-slate-300"
                                    />
                                    Paid
                                </label>
                                <label className="flex items-center gap-1.5 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={form.data.requires_approval}
                                        onChange={(e) => form.setData('requires_approval', e.target.checked)}
                                        className="rounded border-slate-300"
                                    />
                                    Approval
                                </label>
                                <Button type="submit" disabled={form.processing}>Add</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'name',     header: 'Name',     render: (t) => <span className="font-medium text-slate-900">{t.name}</span> },
                            { key: 'code',     header: 'Code',     render: (t) => <span className="text-sm text-slate-500">{t.code ?? '—'}</span> },
                            { key: 'days',     header: 'Days/Year', render: (t) => <span className="text-sm">{t.default_days || t.days_per_year || 0}</span> },
                            { key: 'is_paid',  header: 'Paid',     render: (t) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_paid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {t.is_paid ? 'Paid' : 'Unpaid'}
                                </span>
                            )},
                            { key: 'requires_approval', header: 'Approval', render: (t) => (
                                <span className="text-sm text-slate-500">{t.requires_approval ? 'Required' : 'Auto'}</span>
                            )},
                            { key: 'is_active', header: 'Status', render: (t) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {t.is_active ? 'Active' : 'Inactive'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (t) => can('hr.delete') ? (
                                <button onClick={() => handleDelete(t.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                            ) : null },
                        ]}
                        data={leaveTypes.data}
                        emptyMessage="No leave types found."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
