import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ExpenseClaim, ExpenseItem } from '@/types/finance';

interface UserRef {
    id: number;
    name: string;
}

interface ClaimDetail extends ExpenseClaim {
    submitted_by_user?: UserRef;
    approved_by_user?: UserRef;
    items?: ExpenseItem[];
}

interface Props extends PageProps {
    claim: ClaimDetail;
}

const statusColors: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
    paid:      'bg-purple-100 text-purple-700',
};

export default function ExpenseClaimsShow({ claim }: Props) {
    const { can } = usePermission();

    function submitClaim() {
        router.post(`/finance/expense-claims/${claim.id}/submit`);
    }

    function approveClaim() {
        router.post(`/finance/expense-claims/${claim.id}/approve`);
    }

    function rejectClaim() {
        router.post(`/finance/expense-claims/${claim.id}/reject`);
    }

    function markPaid() {
        router.post(`/finance/expense-claims/${claim.id}/mark-paid`);
    }

    return (
        <AppLayout>
            <Head title={`Expense Claim ${claim.reference}`} />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">{claim.reference}</h1>
                    <div className="flex items-center gap-2">
                        {claim.status === 'draft' && can('finance.create') && (
                            <Button onClick={submitClaim} className="bg-blue-600 hover:bg-blue-700">
                                Submit
                            </Button>
                        )}
                        {claim.status === 'submitted' && can('finance.create') && (
                            <>
                                <Button onClick={approveClaim} className="bg-green-600 hover:bg-green-700">
                                    Approve
                                </Button>
                                <Button onClick={rejectClaim} className="bg-red-600 hover:bg-red-700">
                                    Reject
                                </Button>
                            </>
                        )}
                        {claim.status === 'approved' && can('finance.create') && (
                            <Button onClick={markPaid} className="bg-purple-600 hover:bg-purple-700">
                                Mark Paid
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
                            <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${statusColors[claim.status] ?? ''}`}>
                                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Claim Date</p>
                            <p className="mt-1 text-sm text-slate-800">{new Date(claim.claim_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Currency</p>
                            <p className="mt-1 text-sm text-slate-800">{claim.currency}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Amount</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">{claim.currency} {Number(claim.total_amount).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted By</p>
                            <p className="mt-1 text-sm text-slate-800">{claim.submitted_by_user?.name ?? claim.submitted_by}</p>
                        </div>
                        {claim.approved_by && (
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Approved By</p>
                                <p className="mt-1 text-sm text-slate-800">{claim.approved_by_user?.name ?? claim.approved_by}</p>
                            </div>
                        )}
                        {claim.notes && (
                            <div className="col-span-2 sm:col-span-3">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</p>
                                <p className="mt-1 text-sm text-slate-800">{claim.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-medium text-slate-800">Expense Items</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(claim.items ?? []).map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-3 capitalize">{item.category}</td>
                                    <td className="px-6 py-3">{new Date(item.expense_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">{item.description}</td>
                                    <td className="px-6 py-3 text-right font-medium">{Number(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                            {(claim.items ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No items.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="border-t border-slate-200 bg-slate-50">
                            <tr>
                                <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-slate-700">Total</td>
                                <td className="px-6 py-3 text-right font-semibold text-slate-800">
                                    {claim.currency} {Number(claim.total_amount).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex items-center gap-3">
                    <a href="/finance/expense-claims" className="text-sm text-slate-600 hover:underline">
                        Back to Expense Claims
                    </a>
                    {can('finance.delete') && (
                        <button
                            onClick={() => router.delete(`/finance/expense-claims/${claim.id}`)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
