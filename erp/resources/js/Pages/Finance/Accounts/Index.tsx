import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Account, AccountType } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    accounts: Paginator<Account>;
    filters: { search?: string; type?: AccountType };
}

const TYPE_COLORS: Record<AccountType, string> = {
    asset:     'bg-blue-100 text-blue-700',
    liability: 'bg-orange-100 text-orange-700',
    equity:    'bg-purple-100 text-purple-700',
    income:    'bg-green-100 text-green-700',
    expense:   'bg-red-100 text-red-600',
};

export default function AccountsIndex({ accounts, filters }: Props) {
    const { can } = usePermission();

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/finance/accounts', { ...filters, search }, { preserveState: true, replace: true });
    }

    function handleTypeFilter(type: string) {
        router.get('/finance/accounts', { ...filters, type: type || undefined }, { preserveState: true, replace: true });
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete account "${name}"?`)) return;
        router.delete(`/finance/accounts/${id}`);
    }

    const types: Array<{ value: AccountType | ''; label: string }> = [
        { value: '', label: 'All Types' },
        { value: 'asset',     label: 'Asset' },
        { value: 'liability', label: 'Liability' },
        { value: 'equity',    label: 'Equity' },
        { value: 'income',    label: 'Income' },
        { value: 'expense',   label: 'Expense' },
    ];

    return (
        <AppLayout>
            <Head title="Chart of Accounts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Chart of Accounts</h1>
                        <p className="text-sm text-slate-500 mt-1">{accounts.total} accounts</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/accounts/create">
                            <Button>Add Account</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input
                                name="search"
                                type="text"
                                defaultValue={filters.search ?? ''}
                                placeholder="Search by code or name..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                        <select
                            value={filters.type ?? ''}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            {types.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <Table
                        columns={[
                            { key: 'code', header: 'Code', render: (a) => <span className="font-mono text-sm">{a.code}</span> },
                            { key: 'name', header: 'Name', render: (a) => (
                                <div>
                                    <span className="font-medium text-slate-900">{a.name}</span>
                                    {a.parent && <span className="ml-2 text-xs text-slate-400">› {a.parent.name}</span>}
                                </div>
                            )},
                            { key: 'type', header: 'Type', render: (a) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[a.type]}`}>
                                    {a.type}
                                </span>
                            )},
                            { key: 'status', header: 'Status', render: (a) => (
                                <span className={`text-xs ${a.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                                    {a.is_active ? 'Active' : 'Inactive'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (a) => (
                                <div className="flex gap-3">
                                    {can('finance.update') && (
                                        <Link href={`/finance/accounts/${a.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                    {can('finance.delete') && (
                                        <button onClick={() => handleDelete(a.id, a.name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={accounts.data}
                        emptyMessage="No accounts found."
                    />
                    <Pagination paginator={accounts} />
                </div>
            </div>
        </AppLayout>
    );
}
