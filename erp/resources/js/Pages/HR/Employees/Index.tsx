import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { EmployeeStatusBadge } from '@/Components/HR/EmployeeStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Department, Employee, EmployeeStatus } from '@/types/hr';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    employees: Paginator<Employee>;
    departments: Pick<Department, 'id' | 'name'>[];
    filters: { search?: string; department_id?: number; status?: EmployeeStatus };
}

const EMPLOYMENT_LABELS: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract:  'Contract',
};

export default function EmployeesIndex({ employees, departments, filters }: Props) {
    const { can } = usePermission();

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/hr/employees', { ...filters, search }, { preserveState: true, replace: true });
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete employee "${name}"?`)) return;
        router.delete(`/hr/employees/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Employees" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
                        <p className="text-sm text-slate-500 mt-1">{employees.total} employees</p>
                    </div>
                    <div className="flex gap-2">
                        {can('hr.view') && (
                            <Button variant="secondary" onClick={() => { window.location.href = '/export/employees'; }}>Export CSV</Button>
                        )}
                        {can('hr.create') && (
                            <Link href="/hr/employees/create"><Button>Add Employee</Button></Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input name="search" type="text" defaultValue={filters.search ?? ''}
                                placeholder="Search by name, email, or number…"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                        <select value={filters.department_id ?? ''}
                            onChange={(e) => router.get('/hr/employees', { ...filters, department_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Departments</option>
                            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select value={filters.status ?? ''}
                            onChange={(e) => router.get('/hr/employees', { ...filters, status: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="on_leave">On Leave</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'name', header: 'Employee', render: (e) => (
                                <div>
                                    <Link href={`/hr/employees/${e.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                        {e.full_name}
                                    </Link>
                                    {e.employee_number && <p className="text-xs text-slate-400">{e.employee_number}</p>}
                                </div>
                            )},
                            { key: 'position', header: 'Position / Department', render: (e) => (
                                <div>
                                    <span className="text-sm text-slate-700">{e.position ?? '—'}</span>
                                    {e.department && <p className="text-xs text-slate-400">{e.department.name}</p>}
                                </div>
                            )},
                            { key: 'employment_type', header: 'Type', render: (e) => (
                                <span className="text-xs text-slate-500">{EMPLOYMENT_LABELS[e.employment_type] ?? e.employment_type}</span>
                            )},
                            { key: 'status', header: 'Status', render: (e) => <EmployeeStatusBadge status={e.status} /> },
                            { key: 'start_date', header: 'Start Date', render: (e) => <span className="text-sm text-slate-500">{e.start_date}</span> },
                            { key: 'actions', header: '', render: (e) => (
                                <div className="flex gap-3">
                                    <Link href={`/hr/employees/${e.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                                    {can('hr.update') && (
                                        <Link href={`/hr/employees/${e.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                    {can('hr.delete') && (
                                        <button onClick={() => handleDelete(e.id, e.full_name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={employees.data}
                        emptyMessage="No employees found."
                    />
                    <Pagination paginator={employees} />
                </div>
            </div>
        </AppLayout>
    );
}
