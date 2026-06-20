import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { PayrollRun, PayrollRunV2 } from '@/types/hr';

interface Props extends PageProps {
    runs: Paginator<PayrollRun | PayrollRunV2>;
    filters: { status?: string };
}

const STATUS_COLORS: Record<string, string> = {
    draft:      'bg-slate-100 text-slate-700',
    processing: 'bg-yellow-100 text-yellow-700',
    approved:   'bg-green-100 text-green-700',
    paid:       'bg-blue-100 text-blue-700',
    processed:  'bg-green-100 text-green-700',
};

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'processing', label: 'Processing' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
];

function fmt(n: number | string | undefined | null): string {
    if (n === undefined || n === null) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PayrollIndex({ runs, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/hr/payroll', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Payroll" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Payroll Runs</h1>
                        <p className="text-sm text-slate-500 mt-1">{runs.total} runs</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/payroll/create">
                            <Button>New Payroll Run</Button>
                        </Link>
                    )}
                </div>

                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters?.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Period</th>
                                <th className="px-4 py-2 text-left font-medium">Run Date</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-right font-medium">Total Gross</th>
                                <th className="px-4 py-2 text-right font-medium">Total Net</th>
                                <th className="px-4 py-2 text-right font-medium">Payslips</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {runs.data.map((run) => (
                                <tr key={run.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {run.period_start} → {run.period_end}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {'run_date' in run ? run.run_date : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[run.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700">
                                        {fmt(run.total_gross)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                        {fmt(run.total_net)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {'payslips' in run ? (run.payslips?.length ?? 0) : ('items_count' in run ? (run as any).items_count ?? 0 : 0)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/hr/payroll/${run.id}`}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {runs.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No payroll runs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination paginator={runs} />
                </div>
            </div>
        </AppLayout>
    );
}
