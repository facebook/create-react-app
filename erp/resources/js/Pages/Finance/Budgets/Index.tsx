import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Budget } from '@/types/finance';

interface PaginatedBudgets {
    data: Budget[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props extends PageProps {
    budgets: PaginatedBudgets;
    filters: { fiscal_year?: string; status?: string };
}

const statusColors: Record<string, string> = {
    draft:  'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-orange-100 text-orange-700',
};

export default function Index({ budgets, filters }: Props) {
    function handleFilter(key: string, value: string) {
        router.get('/finance/budgets', { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function handleDelete(budget: Budget) {
        if (!confirm(`Delete budget "${budget.name}"?`)) return;
        router.delete(`/finance/budgets/${budget.id}`);
    }

    return (
        <AppLayout>
            <Head title="Budgets" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Budgets</h1>
                        <p className="mt-1 text-sm text-slate-500">Plan and track budgets with variance analysis</p>
                    </div>
                    <Link
                        href="/finance/budgets/create"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Budget
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        placeholder="Fiscal Year"
                        defaultValue={filters.fiscal_year ?? ''}
                        onBlur={(e) => handleFilter('fiscal_year', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none w-32"
                    />
                    <select
                        defaultValue={filters.status ?? ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium w-24">Year</th>
                                <th className="px-4 py-3 text-left font-medium w-28">Period Type</th>
                                <th className="px-4 py-3 text-left font-medium w-24">Status</th>
                                <th className="px-4 py-3 text-right font-medium w-20">Lines</th>
                                <th className="px-4 py-3 text-right font-medium w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {budgets.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        No budgets yet.{' '}
                                        <Link href="/finance/budgets/create" className="text-indigo-600 hover:underline">
                                            Create one
                                        </Link>.
                                    </td>
                                </tr>
                            ) : budgets.data.map((budget) => (
                                <tr key={budget.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{budget.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{budget.fiscal_year}</td>
                                    <td className="px-4 py-3 capitalize text-slate-600">{budget.period_type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[budget.status] ?? ''}`}>
                                            {budget.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">{budget.lines_count ?? 0}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/finance/budgets/${budget.id}`}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(budget)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {budgets.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Showing {budgets.from ?? 0}–{budgets.to ?? 0} of {budgets.total}</span>
                        <div className="flex gap-2">
                            {budgets.current_page > 1 && (
                                <Link href={`/finance/budgets?page=${budgets.current_page - 1}`} className="text-indigo-600 hover:underline">
                                    Previous
                                </Link>
                            )}
                            {budgets.current_page < budgets.last_page && (
                                <Link href={`/finance/budgets?page=${budgets.current_page + 1}`} className="text-indigo-600 hover:underline">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
