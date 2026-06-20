import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Budget, BudgetLine } from '@/types/finance';

interface Props extends PageProps {
    budget: Budget & {
        lines: BudgetLine[];
        total_budgeted: number;
        total_actual: number;
        total_variance: number;
        variance_percent: number;
    };
}

const statusColors: Record<string, string> = {
    draft:  'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-orange-100 text-orange-700',
};

export default function Show({ budget }: Props) {
    const [editingActual, setEditingActual] = useState<number | null>(null);
    const [actualValue, setActualValue] = useState('');

    const addLineForm = useForm({
        category: '',
        line_type: 'expense' as 'income' | 'expense',
        period_number: 1,
        budgeted_amount: '',
        notes: '',
    });

    function handleActivate() {
        if (!confirm('Activate this budget?')) return;
        router.post(`/finance/budgets/${budget.id}/activate`);
    }

    function handleClose() {
        if (!confirm('Close this budget?')) return;
        router.post(`/finance/budgets/${budget.id}/close`);
    }

    function handleDelete() {
        if (!confirm(`Delete budget "${budget.name}"?`)) return;
        router.delete(`/finance/budgets/${budget.id}`);
    }

    function handleAddLine(e: React.FormEvent) {
        e.preventDefault();
        addLineForm.post(`/finance/budgets/${budget.id}/lines`, {
            onSuccess: () => addLineForm.reset(),
        });
    }

    function handleUpdateActual(line: BudgetLine) {
        router.patch(`/finance/budgets/${budget.id}/lines/${line.id}/actual`, {
            actual_amount: parseFloat(actualValue) || 0,
        }, {
            onSuccess: () => { setEditingActual(null); setActualValue(''); },
        });
    }

    function handleRemoveLine(line: BudgetLine) {
        if (!confirm('Remove this line?')) return;
        router.delete(`/finance/budgets/${budget.id}/lines/${line.id}`);
    }

    const isOverBudget = budget.total_variance > 0;

    return (
        <AppLayout>
            <Head title={`Budget: ${budget.name}`} />
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{budget.name}</h1>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[budget.status] ?? ''}`}>
                                {budget.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            FY{budget.fiscal_year} &mdash; <span className="capitalize">{budget.period_type}</span>
                        </p>
                        {budget.notes && <p className="mt-1 text-sm text-slate-600">{budget.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {budget.status === 'draft' && (
                            <button onClick={handleActivate} className="rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50">
                                Activate
                            </button>
                        )}
                        {budget.status === 'active' && (
                            <button onClick={handleClose} className="rounded-md border border-orange-300 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50">
                                Close
                            </button>
                        )}
                        <button onClick={handleDelete} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                        <Link href="/finance/budgets" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            &larr; Back
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 uppercase">Total Budgeted</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{budget.total_budgeted.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 uppercase">Total Actual</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{budget.total_actual.toFixed(2)}</p>
                    </div>
                    <div className={`rounded-lg border p-5 shadow-sm ${isOverBudget ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                        <p className="text-xs font-medium text-slate-500 uppercase">Total Variance</p>
                        <p className={`mt-1 text-2xl font-semibold ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
                            {budget.total_variance.toFixed(2)}
                        </p>
                        <p className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {budget.variance_percent}%
                        </p>
                    </div>
                </div>

                {/* Budget Lines Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Budget Lines</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-left font-medium w-24">Type</th>
                                <th className="px-4 py-3 text-right font-medium w-20">Period</th>
                                <th className="px-4 py-3 text-right font-medium w-28">Budgeted</th>
                                <th className="px-4 py-3 text-right font-medium w-28">Actual</th>
                                <th className="px-4 py-3 text-right font-medium w-28">Variance</th>
                                <th className="px-4 py-3 text-right font-medium w-20">Var %</th>
                                <th className="px-4 py-3 text-right font-medium w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(budget.lines ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        No budget lines yet. Add one below.
                                    </td>
                                </tr>
                            ) : (budget.lines ?? []).map((line) => (
                                <tr key={line.id} className={line.is_over_budget ? 'bg-red-50' : 'hover:bg-slate-50'}>
                                    <td className="px-4 py-3 text-slate-800">{line.category}</td>
                                    <td className="px-4 py-3 capitalize text-slate-600">{line.line_type}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{line.period_number}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{line.budgeted_amount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">
                                        {editingActual === line.id ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <input
                                                    type="number"
                                                    value={actualValue}
                                                    onChange={(e) => setActualValue(e.target.value)}
                                                    className="w-24 rounded border border-slate-300 px-2 py-0.5 text-sm text-right"
                                                    min={0}
                                                    step="0.01"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleUpdateActual(line)} className="text-green-600 hover:text-green-800 text-xs font-medium">Save</button>
                                                <button onClick={() => { setEditingActual(null); setActualValue(''); }} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                                            </div>
                                        ) : (
                                            <span>{line.actual_amount.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-medium ${line.is_over_budget ? 'text-red-700' : 'text-green-700'}`}>
                                        {line.variance.toFixed(2)}
                                    </td>
                                    <td className={`px-4 py-3 text-right ${line.is_over_budget ? 'text-red-700' : 'text-green-700'}`}>
                                        {line.variance_percent}%
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingActual !== line.id && (
                                                <button
                                                    onClick={() => { setEditingActual(line.id); setActualValue(String(line.actual_amount)); }}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                                >
                                                    Edit Actual
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveLine(line)}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Line Form */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Add Budget Line</h2>
                    </div>
                    <form onSubmit={handleAddLine} className="p-6">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={addLineForm.data.category}
                                    onChange={(e) => addLineForm.setData('category', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="e.g. Salaries"
                                />
                                {addLineForm.errors.category && <p className="mt-1 text-xs text-red-600">{addLineForm.errors.category}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
                                <select
                                    value={addLineForm.data.line_type}
                                    onChange={(e) => addLineForm.setData('line_type', e.target.value as 'income' | 'expense')}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Period <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={addLineForm.data.period_number}
                                    onChange={(e) => addLineForm.setData('period_number', parseInt(e.target.value))}
                                    min={1}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Budgeted <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={addLineForm.data.budgeted_amount}
                                    onChange={(e) => addLineForm.setData('budgeted_amount', e.target.value)}
                                    min={0}
                                    step="0.01"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="0.00"
                                />
                                {addLineForm.errors.budgeted_amount && <p className="mt-1 text-xs text-red-600">{addLineForm.errors.budgeted_amount}</p>}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={addLineForm.processing}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {addLineForm.processing ? 'Adding…' : 'Add Line'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
