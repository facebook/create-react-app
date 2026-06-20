import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PayrollRunV2, Payslip } from '@/types/hr';

interface Props extends PageProps {
    payrollRun?: PayrollRunV2;
    run?: any; // legacy prop
}

const STATUS_COLORS: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-700',
    processing: 'bg-yellow-100 text-yellow-700',
    approved:   'bg-green-100 text-green-700',
    paid:       'bg-blue-100 text-blue-700',
    processed:  'bg-green-100 text-green-700',
};

function fmt(n: number | string | undefined | null): string {
    if (n === undefined || n === null) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PayrollShow({ payrollRun: propRun, run: legacyRun }: Props) {
    const { can } = usePermission();
    // Support both new (payrollRun) and legacy (run) prop
    const run = propRun ?? legacyRun;

    if (!run) return null;

    const payslips: Payslip[] = (run as PayrollRunV2).payslips ?? [];
    const isDraftOrProcessing = run.status === 'draft' || run.status === 'processing';

    function handleGenerate() {
        router.post(`/hr/payroll/${run.id}/generate`);
    }

    function handleApprove() {
        router.post(`/hr/payroll/${run.id}/approve`);
    }

    function handleMarkPaid() {
        router.post(`/hr/payroll/${run.id}/mark-paid`);
    }

    return (
        <AppLayout>
            <Head title={`Payroll Run #${run.id}`} />
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Payroll Run #{run.id}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {run.period_start} → {run.period_end}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_COLORS[run.status] ?? 'bg-slate-100 text-slate-700'}`}>
                            {run.status}
                        </span>
                        {can('hr.create') && isDraftOrProcessing && (
                            <Button onClick={handleGenerate}>Generate Payslips</Button>
                        )}
                        {can('hr.create') && isDraftOrProcessing && (
                            <Button variant="secondary" onClick={handleApprove}>Approve</Button>
                        )}
                        {can('hr.create') && run.status === 'approved' && (
                            <Button onClick={handleMarkPaid}>Mark Paid</Button>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Gross', value: fmt(run.total_gross) },
                        { label: 'Total Deductions', value: fmt(run.total_deductions) },
                        { label: 'Total Net', value: fmt(run.total_net) },
                    ].map((s) => (
                        <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">{s.label}</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Payslips table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-700">Payslips</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Employee</th>
                                <th className="px-4 py-2 text-right font-medium">Gross</th>
                                <th className="px-4 py-2 text-right font-medium">Tax</th>
                                <th className="px-4 py-2 text-right font-medium">Deductions</th>
                                <th className="px-4 py-2 text-right font-medium">Net</th>
                                <th className="px-4 py-2 text-right font-medium">Effective Tax Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payslips.map((payslip) => (
                                <tr key={payslip.id}>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {payslip.employee
                                            ? `${payslip.employee.first_name} ${payslip.employee.last_name}`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700">{fmt(payslip.gross_amount)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{fmt(payslip.tax_amount)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{fmt(payslip.total_deductions)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(payslip.net_amount)}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {payslip.effective_tax_rate}%
                                    </td>
                                </tr>
                            ))}
                            {payslips.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No payslips generated yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {run.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{run.notes}</p>
                    </div>
                )}

                <div>
                    <Link href="/hr/payroll">
                        <Button variant="secondary">Back to Payroll</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
