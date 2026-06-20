import { Head, Link, useForm } from '@inertiajs/react';

interface FormData {
    customer_name: string;
    customer_code: string;
    credit_amount: string;
    currency: string;
    reason: string;
    expiry_date: string;
    notes: string;
    [key: string]: string;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        customer_name: '',
        customer_code: '',
        credit_amount: '',
        currency: 'USD',
        reason: '',
        expiry_date: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/customer-credits');
    };

    return (
        <>
            <Head title="New Customer Credit" />
            <div className="p-6 max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">New Customer Credit</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Customer Name *</label>
                        <input
                            type="text"
                            value={data.customer_name}
                            onChange={(e) => setData('customer_name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.customer_name && <p className="mt-1 text-xs text-red-600">{errors.customer_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Customer Code</label>
                        <input
                            type="text"
                            value={data.customer_code}
                            onChange={(e) => setData('customer_code', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Credit Amount *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.credit_amount}
                                onChange={(e) => setData('credit_amount', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.credit_amount && <p className="mt-1 text-xs text-red-600">{errors.credit_amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Currency</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Reason</label>
                        <input
                            type="text"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                        <input
                            type="date"
                            value={data.expiry_date}
                            onChange={(e) => setData('expiry_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.expiry_date && <p className="mt-1 text-xs text-red-600">{errors.expiry_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href="/finance/customer-credits"
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating…' : 'Create Credit'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
