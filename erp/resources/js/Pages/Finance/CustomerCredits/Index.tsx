import { Head, Link, router } from '@inertiajs/react';

interface CustomerCredit {
    id: number;
    credit_number: string | null;
    customer_name: string;
    customer_code: string | null;
    credit_amount: string;
    used_amount: string;
    remaining_amount: number;
    currency: string;
    status: string;
    expiry_date: string | null;
    issued_at: string | null;
}

interface Props {
    customerCredits: {
        data: CustomerCredit[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Index({ customerCredits }: Props) {
    const statusColors: Record<string, string> = {
        active:    'bg-green-100 text-green-700',
        exhausted: 'bg-yellow-100 text-yellow-700',
        expired:   'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-600',
    };

    return (
        <>
            <Head title="Customer Credits" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Customer Credits</h1>
                    <Link
                        href="/finance/customer-credits/create"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Credit
                    </Link>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Credit #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Remaining</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {customerCredits.data.map((credit) => (
                                <tr key={credit.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        {credit.credit_number ?? '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{credit.customer_name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {credit.currency} {Number(credit.credit_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {credit.currency} {Number(credit.remaining_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[credit.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {credit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        <Link
                                            href={`/finance/customer-credits/${credit.id}`}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            View
                                        </Link>
                                        {credit.status === 'active' && !credit.issued_at && (
                                            <button
                                                onClick={() => router.post(`/finance/customer-credits/${credit.id}/issue`)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                Issue
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {customerCredits.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No customer credits found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
