import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { EmployeeCertification } from '@/types/hr';

interface Props extends PageProps {
    certifications: Paginator<EmployeeCertification>;
}

export default function EmployeeCertificationsIndex({ certifications }: Props) {
    const { can } = usePermission();

    const addForm = useForm({
        employee_id: '',
        name: '',
        issuing_body: '',
        certificate_number: '',
        issued_date: '',
        expiry_date: '',
    });

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/hr/employee-certifications', {
            onSuccess: () => addForm.reset(),
        });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this certification?')) {
            router.delete(`/hr/employee-certifications/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Employee Certifications" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Employee Certifications</h1>
                        <p className="text-sm text-slate-500 mt-1">{certifications.total} certifications</p>
                    </div>
                </div>

                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Certification</h2>
                        <form onSubmit={submitAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID *</label>
                                <input
                                    type="number"
                                    value={addForm.data.employee_id}
                                    onChange={(e) => addForm.setData('employee_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.employee_id && <p className="mt-1 text-xs text-red-600">{addForm.errors.employee_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Certification Name *</label>
                                <input
                                    type="text"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.name && <p className="mt-1 text-xs text-red-600">{addForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Issuing Body</label>
                                <input
                                    type="text"
                                    value={addForm.data.issuing_body}
                                    onChange={(e) => addForm.setData('issuing_body', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Certificate Number</label>
                                <input
                                    type="text"
                                    value={addForm.data.certificate_number}
                                    onChange={(e) => addForm.setData('certificate_number', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Issued Date *</label>
                                <input
                                    type="date"
                                    value={addForm.data.issued_date}
                                    onChange={(e) => addForm.setData('issued_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.issued_date && <p className="mt-1 text-xs text-red-600">{addForm.errors.issued_date}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={addForm.data.expiry_date}
                                    onChange={(e) => addForm.setData('expiry_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.expiry_date && <p className="mt-1 text-xs text-red-600">{addForm.errors.expiry_date}</p>}
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                                <Button type="submit" disabled={addForm.processing}>
                                    {addForm.processing ? 'Adding…' : 'Add Certification'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (c) => (
                                    <span className="text-sm font-medium text-slate-900">
                                        {c.employee ? `${c.employee.first_name} ${c.employee.last_name}` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'name',
                                header: 'Certification',
                                render: (c) => <span className="text-sm text-slate-900 font-medium">{c.name}</span>,
                            },
                            {
                                key: 'issuing_body',
                                header: 'Issued By',
                                render: (c) => <span className="text-sm text-slate-700">{c.issuing_body ?? '—'}</span>,
                            },
                            {
                                key: 'issued_date',
                                header: 'Issued',
                                render: (c) => <span className="text-sm text-slate-700">{c.issued_date}</span>,
                            },
                            {
                                key: 'expiry_date',
                                header: 'Expires',
                                render: (c) => (
                                    <span className="text-sm text-slate-700">
                                        {c.expiry_date ?? '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'badges',
                                header: 'Status',
                                render: (c) => (
                                    <div className="flex gap-1">
                                        {c.is_expired && (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">Expired</span>
                                        )}
                                        {c.is_expiring && !c.is_expired && (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Expiring Soon</span>
                                        )}
                                        {!c.is_expired && !c.is_expiring && (
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Valid</span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (c) => can('hr.delete') ? (
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                ) : null,
                            },
                        ]}
                        data={certifications.data}
                        emptyMessage="No certifications found."
                    />
                    <Pagination paginator={certifications} />
                </div>
            </div>
        </AppLayout>
    );
}
