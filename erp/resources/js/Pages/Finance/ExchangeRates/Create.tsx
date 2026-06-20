import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

export default function Create(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        base_currency:  '',
        quote_currency: '',
        rate:           '',
        effective_date: new Date().toISOString().slice(0, 10),
        source:         '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/exchange-rates');
    }

    return (
        <AppLayout>
            <Head title="Add Exchange Rate" />
            <div className="mx-auto max-w-lg space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Add Exchange Rate</h1>
                    <Link
                        href="/finance/exchange-rates"
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        &larr; Back
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    {/* Base Currency */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Base Currency <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={3}
                            placeholder="USD"
                            value={data.base_currency}
                            onChange={(e) => setData('base_currency', e.target.value.toUpperCase())}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.base_currency && <p className="mt-1 text-xs text-red-600">{errors.base_currency}</p>}
                    </div>

                    {/* Quote Currency */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Quote Currency <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={3}
                            placeholder="EUR"
                            value={data.quote_currency}
                            onChange={(e) => setData('quote_currency', e.target.value.toUpperCase())}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.quote_currency && <p className="mt-1 text-xs text-red-600">{errors.quote_currency}</p>}
                    </div>

                    {/* Rate */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Rate (quote per 1 base) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0.000001"
                            step="0.000001"
                            placeholder="0.920000"
                            value={data.rate}
                            onChange={(e) => setData('rate', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
                    </div>

                    {/* Effective Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Effective Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.effective_date}
                            onChange={(e) => setData('effective_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.effective_date && <p className="mt-1 text-xs text-red-600">{errors.effective_date}</p>}
                    </div>

                    {/* Source */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Source
                        </label>
                        <input
                            type="text"
                            placeholder="manual, ECB, ..."
                            value={data.source}
                            onChange={(e) => setData('source', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Link
                            href="/finance/exchange-rates"
                            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Add Exchange Rate'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
