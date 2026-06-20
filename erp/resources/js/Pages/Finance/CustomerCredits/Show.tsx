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
    reason: string | null;
    status: string;
    expiry_date: string | null;
    notes: string | null;
    issued_at: string | null;
    created_at: string;
}

interface Props {
    customerCredit: CustomerCredit;
}

export default function Show({ customerCredit }: Props) {
    const handleIssue = () => {
        router.post(`/finance/customer-credits/${customerCredit.id}/issue`);
    };

    const handleExpire = () => {
        if (confirm('Mark this credit as expired?')) {
            router.post(`/finance/customer-credits/${customerCredit.id}/expire`);
        }
    };

    const handleCancel = () => {
        if (confirm('Cancel this credit?')) {
            router.post(`/finance/customer-credits/${customerCredit.id}/cancel`);
        }
    };

    const handleDelete = () => {
        if (confirm('Delete this credit?')) {
            router.delete(`/finance/customer-credits/${customerCredit.id}`);
        }
    };

    return (
        <>
            <Head title={`Credit ${customerCredit.credit_number ?? customerCredit.id}`} />
            <div className="p-6 max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Customer Credit {customerCredit.credit_number ?? `#${customerCredit.id}`}
                    </h1>
                    <div className="flex gap-2">
                        <Link
                            href={`/finance/customer-credits/${customerCredit.id}/edit`}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Edit
                        </Link>
                        {customerCredit.status === 'active' && !customerCredit.issued_at && (
                            <button
                                onClick={handleIssue}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Issue
                            </button>
                        )}
                        {customerCredit.status === 'active' && (
                            <button
                                onClick={handleExpire}
                                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                            >
                                Expire
                            </button>
                        )}
                        {customerCredit.status !== 'cancelled' && (
                            <button
                                onClick={handleCancel}
                                className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <dl className="divide-y divide-slate-200">
                        <div className="grid grid-cols-3 gap-4 px-6 py-4">
                            <dt className="text-sm font-medium text-slate-500">Customer</dt>
                            <dd className="col-span-2 text-sm text-slate-900">{customerCredit.customer_name}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-4 px-6 py-4">
                            <dt className="text-sm font-medium text-slate-500">Credit Amount</dt>
                            <dd className="col-span-2 text-sm text-slate-900">
                                {customerCredit.currency} {Number(customerCredit.credit_amount).toFixed(2)}
                            </dd>
                        </div>
                        <div className="grid grid-cols-3 gap-4 px-6 py-4">
                            <dt className="text-sm font-medium text-slate-500">Used Amount</dt>
                            <dd className="col-span-2 text-sm text-slate-900">
                                {customerCredit.currency} {Number(customerCredit.used_amount).toFixed(2)}
                            </dd>
                        </div>
                        <div className="grid grid-cols-3 gap-4 px-6 py-4">
                            <dt className="text-sm font-medium text-slate-500">Remaining</dt>
                            <dd className="col-span-2 text-sm font-semibold text-slate-900">
                                {customerCredit.currency} {Number(customerCredit.remaining_amount).toFixed(2)}
                            </dd>
                        </div>
                        <div className="grid grid-cols-3 gap-4 px-6 py-4">
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="col-span-2 text-sm text-slate-900 capitalize">{customerCredit.status}</dd>
                        </div>
                        {customerCredit.expiry_date && (
                            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                                <dt className="text-sm font-medium text-slate-500">Expiry Date</dt>
                                <dd className="col-span-2 text-sm text-slate-900">{customerCredit.expiry_date}</dd>
                            </div>
                        )}
                        {customerCredit.reason && (
                            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                                <dt className="text-sm font-medium text-slate-500">Reason</dt>
                                <dd className="col-span-2 text-sm text-slate-900">{customerCredit.reason}</dd>
                            </div>
                        )}
                        {customerCredit.notes && (
                            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                                <dd className="col-span-2 text-sm text-slate-900 whitespace-pre-wrap">{customerCredit.notes}</dd>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-4 px-6 py-4">
                            <dt className="text-sm font-medium text-slate-500">Issued At</dt>
                            <dd className="col-span-2 text-sm text-slate-900">{customerCredit.issued_at ?? '—'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-4">
                    <Link href="/finance/customer-credits" className="text-sm text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Customer Credits
                    </Link>
                </div>
            </div>
        </>
    );
}
