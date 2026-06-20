import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Department } from '@/types/hr';

interface Props extends PageProps {
    department: Department;
}

export default function DepartmentShow({ department }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title={department.name} />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">{department.name}</h1>
                    <div className="flex gap-2">
                        {can('hr.update') && (
                            <Link href={`/hr/departments/${department.id}/edit`}>
                                <Button variant="secondary">Edit</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-700">{department.description ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Employees</p>
                        <p className="text-sm text-slate-700">{department.employees_count ?? 0}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link href="/hr/departments">
                        <Button variant="secondary">Back to Departments</Button>
                    </Link>
                    <Link href={`/hr/employees?department_id=${department.id}`}>
                        <Button variant="secondary">View Employees</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
