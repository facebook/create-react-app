import { Head, Link } from '@inertiajs/react';
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
    status: string;
    next_due_date: string | null;
}

interface Props extends PageProps {
    recurringExpenses: {
        data: RecurringExpense[];
        current_page: number;
        last_page: number;
    };
    filters: { status?: string };
}

export default function Index({ recurringExpenses }: Props) {
    return (
        <AppLayout>
            <Head title="Recurring Expenses" />
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Recurring Expenses</h1>
                    <Link
                        href="/finance/recurring-expenses/create"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        New Recurring Expense
                    </Link>
                </div>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recurringExpenses.data.map((expense) => (
                                <tr key={expense.id}>
                                    <td className="px-6 py-4">
                                        <Link href={`/finance/recurring-expenses/${expense.id}`} className="text-blue-600 hover:underline">
                                            {expense.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">{expense.currency} {expense.amount}</td>
                                    <td className="px-6 py-4 capitalize">{expense.frequency}</td>
                                    <td className="px-6 py-4 capitalize">{expense.status}</td>
                                    <td className="px-6 py-4">{expense.next_due_date ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
