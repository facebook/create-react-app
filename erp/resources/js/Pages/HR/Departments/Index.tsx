import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Department } from '@/types/hr';

interface Props extends PageProps {
    departments: { data: Department[] } | Department[];
}

function getDepts(departments: Props['departments']): Department[] {
    return Array.isArray(departments) ? departments : (departments as any).data ?? departments;
}

export default function DepartmentsIndex({ departments }: Props) {
    const { can } = usePermission();
    const depts = getDepts(departments);

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete department "${name}"?`)) return;
        router.delete(`/hr/departments/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Departments" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Departments</h1>
                        <p className="text-sm text-slate-500 mt-1">{depts.length} departments</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/departments/create"><Button>New Department</Button></Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'name', header: 'Name', render: (d) => (
                                <Link href={`/hr/departments/${d.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                    {d.name}
                                </Link>
                            )},
                            { key: 'description', header: 'Description', render: (d) => (
                                <span className="text-sm text-slate-500">{d.description ?? '—'}</span>
                            )},
                            { key: 'employees_count', header: 'Employees', render: (d) => (
                                <span className="text-sm text-slate-700">{d.employees_count ?? 0}</span>
                            )},
                            { key: 'actions', header: '', render: (d) => (
                                <div className="flex gap-3">
                                    <Link href={`/hr/departments/${d.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                                    {can('hr.update') && (
                                        <Link href={`/hr/departments/${d.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                    {can('hr.delete') && (
                                        <button onClick={() => handleDelete(d.id, d.name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={depts}
                        emptyMessage="No departments found."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
