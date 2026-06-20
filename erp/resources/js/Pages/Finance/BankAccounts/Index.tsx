import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { BankAccount } from '@/types/finance';

interface PaginatedAccounts {
    data: BankAccount[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    accounts: PaginatedAccounts | BankAccount[];
}

function ispaginated(accounts: PaginatedAccounts | BankAccount[]): accounts is PaginatedAccounts {
    return !Array.isArray(accounts);
}

export default function BankAccountsIndex({ accounts }: Props) {
    const { can } = usePermission();
    const accountList = ispaginated(accounts) ? accounts.data : accounts;
    const total = ispaginated(accounts) ? accounts.total : accounts.length;

    return (
        <AppLayout>
            <Head title="Bank Accounts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Bank Accounts</h1>
                        <p className="text-sm text-slate-500 mt-1">{total} accounts</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/bank-accounts/create">
                            <Button>New Bank Account</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Currency</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Unreconciled</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {accountList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No bank accounts found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                            {accountList.map((account) => (
                                <tr key={account.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        <Link href={`/finance/bank-accounts/${account.id}`} className="text-indigo-600 hover:text-indigo-800">
                                            {account.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{account.bank_name ?? '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{account.account_number ?? '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{account.currency_code}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-mono">
                                        {typeof account.balance === 'number'
                                            ? account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {(account.unreconciled_count ?? 0) > 0 ? (
                                            <Link
                                                href={`/finance/reconciliation?account_id=${account.id}`}
                                                className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200"
                                            >
                                                {account.unreconciled_count}
                                            </Link>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                0
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        <Link href={`/finance/bank-accounts/${account.id}`} className="text-indigo-600 hover:text-indigo-800">View</Link>
                                        {can('finance.create') && (
                                            <Link href={`/finance/bank-accounts/${account.id}/edit`} className="text-slate-600 hover:text-slate-800">Edit</Link>
                                        )}
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
