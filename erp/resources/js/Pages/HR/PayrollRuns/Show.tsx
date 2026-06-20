import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { PayrollStatusBadge } from '@/Components/HR/PayrollStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PayrollRun } from '@/types/hr';

interface Props extends PageProps {
    payrollRun: PayrollRun;
}

export default function PayrollRunShow({ payrollRun }: Props) {
    const { can } = usePermission();

    function handleProcess() {
        if (!confirm('Process this payroll run? This will compute totals from active employees.')) return;
        router.post(`/hr/payroll-runs/${payrollRun.id}/process`);
    }

    function fmt(n: number | string | undefined) {
        return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
        <AppLayout>
            <Head title={payrollRun.period_label ?? `Payroll Run #${payrollRun.id}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {payrollRun.period_label ?? `Payroll Run #${payrollRun.id}`}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                            <PayrollStatusBadge status={payrollRun.status} />
                            <span className="text-sm text-slate-500">
                                {payrollRun.period_start} – {payrollRun.period_end}
                            </span>
                        </div>
                    </div>
                    {can('hr.update') && payrollRun.status === 'draft' && (
                        <Button onClick={handleProcess}>Process Payroll</Button>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Summary</h2>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                        <div>
                            <dt className="text-xs text-slate-500">Total Gross</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">{fmt(payrollRun.total_gross)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Total Deductions</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">{fmt(payrollRun.total_deductions)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Total Net</dt>
                            <dd className="mt-0.5 text-lg font-semibold text-slate-900">{fmt(payrollRun.total_net)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Employees</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">{payrollRun.employee_count ?? payrollRun.items_count ?? 0}</dd>
                        </div>
                    </dl>

                    {payrollRun.processed_at && (
                        <p className="mt-4 text-xs text-slate-400">Processed at: {payrollRun.processed_at}</p>
                    )}
                </div>

                {payrollRun.items && payrollRun.items.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <h2 className="text-sm font-medium text-slate-700">Payroll Items</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Employee</th>
                                    <th className="px-4 py-2 text-right font-medium">Gross</th>
                                    <th className="px-4 py-2 text-right font-medium">Deductions</th>
                                    <th className="px-4 py-2 text-right font-medium">Net</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrollRun.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item.employee?.full_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">{fmt(item.gross_salary)}</td>
                                        <td className="px-4 py-3 text-right">{fmt(item.deductions)}</td>
                                        <td className="px-4 py-3 text-right font-medium">{fmt(item.net_salary)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Link href="/hr/payroll-runs">
                    <Button variant="secondary">Back to Payroll Runs</Button>
                </Link>
            </div>
        </AppLayout>
    );
}
