import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { PayrollStatusBadge } from '@/Components/HR/PayrollStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PayrollRun } from '@/types/hr';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    payrollRuns: Paginator<PayrollRun>;
}

export default function PayrollRunsIndex({ payrollRuns }: Props) {
    const { can } = usePermission();

    function fmt(n: number | string | undefined) {
        return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
        <AppLayout>
            <Head title="Payroll Runs" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Payroll Runs</h1>
                        <p className="text-sm text-slate-500 mt-1">{payrollRuns.total} payroll runs</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/payroll-runs/create"><Button>New Payroll Run</Button></Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'period', header: 'Period', render: (r) => (
                                <Link href={`/hr/payroll-runs/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                    {r.period_label ?? `${r.period_start} – ${r.period_end}`}
                                </Link>
                            )},
                            { key: 'status', header: 'Status', render: (r) => <PayrollStatusBadge status={r.status} /> },
                            { key: 'total_gross', header: 'Total Gross', render: (r) => <span className="text-sm">{fmt(r.total_gross)}</span> },
                            { key: 'total_net', header: 'Total Net', render: (r) => <span className="text-sm font-medium">{fmt(r.total_net)}</span> },
                            { key: 'employee_count', header: 'Employees', render: (r) => <span className="text-sm">{r.employee_count ?? r.items_count ?? 0}</span> },
                            { key: 'actions', header: '', render: (r) => (
                                <Link href={`/hr/payroll-runs/${r.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                            )},
                        ]}
                        data={payrollRuns.data}
                        emptyMessage="No payroll runs found."
                    />
                    <Pagination paginator={payrollRuns} />
                </div>
            </div>
        </AppLayout>
    );
}
