import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    sub_type: string | null;
    normal_balance: 'debit' | 'credit';
    is_active: boolean;
    parent: { id: number; code: string; name: string } | null;
}

interface Props extends PageProps {
    accounts: Account[];
    grouped: Record<string, Account[]>;
}

const TYPE_LABELS: Record<string, string> = {
    asset:     'Assets',
    liability: 'Liabilities',
    equity:    'Equity',
    revenue:   'Revenue',
    expense:   'Expenses',
};

const TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense'];

export default function AccountsIndex({ accounts, grouped }: Props) {
    const { flash } = usePage<PageProps>().props as any;

    function seedDefaults() {
        router.post('/accounting/accounts/seed-defaults');
    }

    return (
        <AppLayout>
            <Head title="Chart of Accounts" />
            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Chart of Accounts</h1>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={seedDefaults}>
                            Seed Default Chart of Accounts
                        </Button>
                        <Button href="/accounting/accounts/create">New Account</Button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {TYPE_ORDER.map((type) => {
                    const group = grouped[type] ?? [];
                    if (!group.length) return null;
                    return (
                        <div key={type} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    {TYPE_LABELS[type] ?? type}
                                </h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Code</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Sub-type</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Normal Balance</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Status</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {group.map((account) => (
                                        <tr key={account.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 font-mono text-slate-700">{account.code}</td>
                                            <td className="px-4 py-2 text-slate-900">{account.name}</td>
                                            <td className="px-4 py-2 text-slate-500">{account.sub_type ?? '—'}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    account.normal_balance === 'debit'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {account.normal_balance}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    account.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {account.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <Button
                                                    href={`/accounting/accounts/${account.id}/edit`}
                                                    variant="secondary"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}

                {accounts.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-500">No accounts yet. Seed the default chart of accounts to get started.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
