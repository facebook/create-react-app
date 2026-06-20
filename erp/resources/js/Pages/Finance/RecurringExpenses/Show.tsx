import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface RecurringExpense {
    id: number;
    name: string;
    expense_number: string | null;
    category: string | null;
    amount: string;
    currency: string;
    frequency: string;
    start_date: string;
    end_date: string | null;
    next_due_date: string | null;
    last_processed_date: string | null;
    status: string;
    notes: string | null;
}

interface Props extends PageProps {
    recurringExpense: RecurringExpense;
}

export default function Show({ recurringExpense }: Props) {
    function handlePause() {
        router.post(`/finance/recurring-expenses/${recurringExpense.id}/pause`);
    }
    function handleResume() {
        router.post(`/finance/recurring-expenses/${recurringExpense.id}/resume`);
    }
    function handleCancel() {
        router.post(`/finance/recurring-expenses/${recurringExpense.id}/cancel`);
    }

    return (
        <AppLayout>
            <Head title={recurringExpense.name} />
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">{recurringExpense.name}</h1>
                    <div className="flex gap-2">
                        <Link href={`/finance/recurring-expenses/${recurringExpense.id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit</Link>
                        {recurringExpense.status === 'active' && (
                            <button onClick={handlePause} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Pause</button>
                        )}
                        {recurringExpense.status === 'paused' && (
                            <button onClick={handleResume} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Resume</button>
                        )}
                        {recurringExpense.status !== 'cancelled' && (
                            <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Cancel</button>
                        )}
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Expense Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.expense_number ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Category</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.category ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.currency} {recurringExpense.amount}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">{recurringExpense.frequency}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">{recurringExpense.status}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Next Due Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.next_due_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.start_date}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">End Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.end_date ?? '—'}</dd>
                        </div>
                    </div>
                    {recurringExpense.notes && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Notes</dt>
                            <dd className="mt-1 text-sm text-gray-900">{recurringExpense.notes}</dd>
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <Link href="/finance/recurring-expenses" className="text-blue-600 hover:underline text-sm">
                        Back to Recurring Expenses
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
