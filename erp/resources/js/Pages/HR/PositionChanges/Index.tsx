import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { EmployeePositionChange } from '@/types/hr';

interface Props extends PageProps {
    changes: Paginator<EmployeePositionChange>;
    filters: { employee_id?: number };
}

export default function PositionChangesIndex({ changes, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Position Changes" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Position Changes</h1>
                        <p className="text-sm text-slate-500 mt-1">{changes.total} records</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (r) => (
                                    <Link href={`/hr/position-changes/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—'}
                                    </Link>
                                ),
                            },
                            {
                                key: 'change_type',
                                header: 'Change Type',
                                render: (r) => (
                                    <span className="capitalize text-sm text-slate-700">{r.change_type.replace('_', ' ')}</span>
                                ),
                            },
                            {
                                key: 'effective_date',
                                header: 'Effective Date',
                                render: (r) => <span className="text-sm text-slate-700">{r.effective_date}</span>,
                            },
                            {
                                key: 'is_approved',
                                header: 'Approved',
                                render: (r) => (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {r.is_approved ? 'Approved' : 'Pending'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (r) => (
                                    <Link href={`/hr/position-changes/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={changes.data}
                        emptyMessage="No position changes found."
                    />
                    <Pagination paginator={changes} />
                </div>
            </div>
        </AppLayout>
    );
}
