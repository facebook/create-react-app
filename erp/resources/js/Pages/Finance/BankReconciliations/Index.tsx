import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { BankReconciliation } from '@/types/finance';

interface PaginatedReconciliations {
    data: BankReconciliation[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    reconciliations: PaginatedReconciliations;
    bankAccounts: { id: number; name: string; bank_name: string }[];
    filters: { bank_account_id?: string };
}

export default function BankReconciliationsIndex({ reconciliations, bankAccounts, filters }: Props) {
    const { can } = usePermission();

    function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/finance/bank-reconciliations', { bank_account_id: e.target.value }, { preserveState: true });
    }

    return (
        <AppLayout>
            <Head title="Bank Reconciliations" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bank Reconciliations</h1>
                        <p className="text-sm text-slate-500 mt-1">{reconciliations.total} reconciliations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.bank_account_id ?? ''}
                            onChange={handleFilterChange}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        >
                            <option value="">All Accounts</option>
                            {bankAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} — {a.bank_name}</option>
                            ))}
                        </select>
                        {can('finance.create') && (
                            <Link href="/finance/bank-reconciliations/create">
                                <Button>New Reconciliation</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statement Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Statement Balance</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {reconciliations.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No reconciliations found.
                                    </td>
                                </tr>
                            )}
                            {reconciliations.data.map(rec => (
                                <tr key={rec.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-900">{rec.account?.name ?? '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{rec.statement_date}</td>
                                    <td className="px-6 py-4 text-sm text-right font-mono">{Number(rec.statement_balance).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rec.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {rec.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        <Link href={`/finance/bank-reconciliations/${rec.id}`} className="text-indigo-600 hover:text-indigo-800">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
