import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ExpenseBudget {
    id: number;
    department: string;
    period: string;
    allocated_amount: string;
    spent_amount: string;
    currency: string;
    status: string;
    category: string | null;
    budget_code: string | null;
}

interface Props extends PageProps {
    expenseBudgets: {
        data: ExpenseBudget[];
        current_page: number;
        last_page: number;
    };
    filters: {
        department?: string;
        status?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    exceeded:  'bg-red-100 text-red-700',
    closed:    'bg-slate-100 text-slate-600',
    draft:     'bg-amber-100 text-amber-700',
};

export default function ExpenseBudgetsIndex({ expenseBudgets }: Props) {
    return (
        <AppLayout>
            <Head title="Expense Budgets" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Expense Budgets</h1>
                        <p className="text-sm text-slate-500 mt-1">{expenseBudgets.data.length} budgets</p>
                    </div>
                    <Link href="/finance/expense-budgets/create">
                        <Button>New Budget</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Period</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Allocated</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Spent</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {expenseBudgets.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No expense budgets found.
                                    </td>
                                </tr>
                            )}
                            {expenseBudgets.data.map((budget) => (
                                <tr key={budget.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{budget.budget_code ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{budget.department}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{budget.period}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                                        {budget.currency} {Number(budget.allocated_amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                                        {budget.currency} {Number(budget.spent_amount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[budget.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {budget.status}
                                        </span>
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
