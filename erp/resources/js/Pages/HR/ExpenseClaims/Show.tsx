import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ExpenseClaim } from '@/types/hr';

interface Props extends PageProps {
    expenseClaim: ExpenseClaim;
}

const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
    paid:      'bg-blue-100 text-blue-700',
};

const CATEGORIES = ['travel', 'meals', 'accommodation', 'supplies', 'other'];

export default function ExpenseClaimShow({ expenseClaim }: Props) {
    const { can } = usePermission();
    const [showRejectForm, setShowRejectForm] = useState(false);
    const { data: rejectData, setData: setRejectData, post: rejectPost, processing: rejectProcessing, errors: rejectErrors, reset: rejectReset } = useForm({ reason: '' });
    const { data: itemData, setData: setItemData, post: itemPost, processing: itemProcessing, errors: itemErrors, reset: itemReset } = useForm({
        category: 'other',
        description: '',
        amount: '',
        expense_date: '',
        receipt_reference: '',
    });

    function handleSubmit() {
        router.post(`/hr/expense-claims/${expenseClaim.id}/submit`);
    }

    function handleApprove() {
        router.post(`/hr/expense-claims/${expenseClaim.id}/approve`);
    }

    function handleRejectSubmit(e: React.FormEvent) {
        e.preventDefault();
        rejectPost(`/hr/expense-claims/${expenseClaim.id}/reject`, {
            onSuccess: () => {
                setShowRejectForm(false);
                rejectReset();
            },
        });
    }

    function handleMarkPaid() {
        router.post(`/hr/expense-claims/${expenseClaim.id}/mark-paid`);
    }

    function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        itemPost(`/hr/expense-claims/${expenseClaim.id}/items`, {
            onSuccess: () => itemReset(),
        });
    }

    function handleRemoveItem(itemId: number) {
        router.delete(`/hr/expense-claims/${expenseClaim.id}/items/${itemId}`);
    }

    function handleDelete() {
        if (!confirm('Delete this expense claim?')) return;
        router.delete(`/hr/expense-claims/${expenseClaim.id}`);
    }

    const employeeName = expenseClaim.employee
        ? `${expenseClaim.employee.first_name} ${expenseClaim.employee.last_name}`
        : '—';

    return (
        <AppLayout>
            <Head title={`Expense Claim: ${expenseClaim.title}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{expenseClaim.title}</h1>
                        <div className="mt-1 flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[expenseClaim.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                {expenseClaim.status}
                            </span>
                            <span className="text-sm text-slate-500">{employeeName}</span>
                            <span className="text-sm font-medium text-slate-900">${Number(expenseClaim.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {expenseClaim.status === 'draft' && (
                            <Button onClick={handleSubmit}>Submit</Button>
                        )}
                        {expenseClaim.status === 'submitted' && (
                            <>
                                <Button onClick={handleApprove}>Approve</Button>
                                <Button variant="secondary" onClick={() => setShowRejectForm(true)}>Reject</Button>
                            </>
                        )}
                        {expenseClaim.status === 'approved' && (
                            <Button onClick={handleMarkPaid}>Mark Paid</Button>
                        )}
                        {can('hr.delete') && expenseClaim.status === 'draft' && (
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                </div>

                {/* Reject form */}
                {showRejectForm && expenseClaim.status === 'submitted' && (
                    <form onSubmit={handleRejectSubmit} className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                        <p className="text-sm font-medium text-red-800">Rejection reason (required)</p>
                        <textarea
                            value={rejectData.reason}
                            onChange={(e) => setRejectData('reason', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:outline-none"
                            placeholder="Explain why this claim is being rejected…"
                        />
                        {rejectErrors.reason && <p className="text-xs text-red-600">{rejectErrors.reason}</p>}
                        <div className="flex gap-2">
                            <Button type="submit" variant="danger" disabled={rejectProcessing}>
                                {rejectProcessing ? 'Rejecting…' : 'Confirm Rejection'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => { setShowRejectForm(false); rejectReset(); }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <dt className="text-xs text-slate-500">Employee</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">{employeeName}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Status</dt>
                            <dd className="mt-0.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[expenseClaim.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {expenseClaim.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-500">Total Amount</dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">${Number(expenseClaim.total_amount).toFixed(2)}</dd>
                        </div>
                        {expenseClaim.submitted_at && (
                            <div>
                                <dt className="text-xs text-slate-500">Submitted At</dt>
                                <dd className="mt-0.5 text-sm text-slate-700">{expenseClaim.submitted_at.slice(0, 10)}</dd>
                            </div>
                        )}
                        {expenseClaim.rejection_reason && (
                            <div className="col-span-2">
                                <dt className="text-xs text-slate-500">Rejection Reason</dt>
                                <dd className="mt-0.5 text-sm text-red-700">{expenseClaim.rejection_reason}</dd>
                            </div>
                        )}
                    </dl>
                    {expenseClaim.description && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs text-slate-500 mb-1">Description</dt>
                            <dd className="text-sm text-slate-700">{expenseClaim.description}</dd>
                        </div>
                    )}
                </div>

                {/* Items table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-medium text-slate-900">Expense Items</h2>
                    </div>
                    {expenseClaim.items && expenseClaim.items.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Receipt Ref</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenseClaim.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm capitalize text-slate-700">{item.category}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{item.description}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">${Number(item.amount).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.expense_date}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.receipt_reference ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {expenseClaim.status === 'draft' && (
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="px-6 py-4 text-sm text-slate-500">No items yet.</p>
                    )}
                </div>

                {/* Add item form */}
                {expenseClaim.status === 'draft' && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-900 mb-4">Add Item</h2>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        value={itemData.category}
                                        onChange={(e) => setItemData('category', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                    {itemErrors.category && <p className="mt-1 text-xs text-red-600">{itemErrors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={itemData.amount}
                                        onChange={(e) => setItemData('amount', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="0.00"
                                    />
                                    {itemErrors.amount && <p className="mt-1 text-xs text-red-600">{itemErrors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={itemData.description}
                                        onChange={(e) => setItemData('description', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {itemErrors.description && <p className="mt-1 text-xs text-red-600">{itemErrors.description}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Expense Date</label>
                                    <input
                                        type="date"
                                        value={itemData.expense_date}
                                        onChange={(e) => setItemData('expense_date', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {itemErrors.expense_date && <p className="mt-1 text-xs text-red-600">{itemErrors.expense_date}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Receipt Reference <span className="text-slate-400">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={itemData.receipt_reference}
                                        onChange={(e) => setItemData('receipt_reference', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={itemProcessing}>
                                    {itemProcessing ? 'Adding…' : 'Add Item'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <Link href="/hr/expense-claims">
                    <Button variant="secondary">Back to Expense Claims</Button>
                </Link>
            </div>
        </AppLayout>
    );
}
