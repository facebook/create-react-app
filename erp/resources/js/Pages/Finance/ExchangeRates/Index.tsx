import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Currency, ExchangeRate } from '@/types/finance';

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    rates: Paginated<ExchangeRate>;
    currencies: Currency[];
}

export default function ExchangeRatesIndex({ rates, currencies }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        from_currency: '',
        to_currency: '',
        rate: '',
        effective_date: new Date().toISOString().split('T')[0],
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        router.post('/finance/exchange-rates', data as Record<string, string>, {
            onSuccess: () => reset(),
        });
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this exchange rate?')) return;
        router.delete(`/finance/exchange-rates/${id}`);
    }

    const fromCurrency = (rate: ExchangeRate) => rate.from_currency || rate.base_currency;
    const toCurrency = (rate: ExchangeRate) => rate.to_currency || rate.quote_currency;

    return (
        <AppLayout>
            <Head title="Exchange Rates" />
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Exchange Rates</h1>
                    <div className="flex items-center gap-3">
                        <Link href="/finance/exchange-rates/convert">
                            <Button variant="secondary">Currency Converter</Button>
                        </Link>
                        <Link href="/finance/exchange-rates/report">
                            <Button variant="secondary">Revaluation Report</Button>
                        </Link>
                        <Link href="/finance/exchange-rates/create">
                            <Button>Add Rate</Button>
                        </Link>
                    </div>
                </div>

                {/* Inline Create Form */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Add Exchange Rate</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">From</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.from_currency}
                                onChange={e => setData('from_currency', e.target.value.toUpperCase())}
                                placeholder="EUR"
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.from_currency && <p className="text-xs text-red-600 mt-0.5">{errors.from_currency}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">To</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.to_currency}
                                onChange={e => setData('to_currency', e.target.value.toUpperCase())}
                                placeholder="USD"
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.to_currency && <p className="text-xs text-red-600 mt-0.5">{errors.to_currency}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Rate</label>
                            <input
                                type="number"
                                step="0.000001"
                                min="0.000001"
                                value={data.rate}
                                onChange={e => setData('rate', e.target.value)}
                                placeholder="1.0856"
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.rate && <p className="text-xs text-red-600 mt-0.5">{errors.rate}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Effective Date</label>
                            <input
                                type="date"
                                value={data.effective_date}
                                onChange={e => setData('effective_date', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.effective_date && <p className="text-xs text-red-600 mt-0.5">{errors.effective_date}</p>}
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={processing} className="w-full">
                                Add
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Rates Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-slate-700">
                            Rates ({rates.total})
                        </h2>
                    </div>
                    {rates.data.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">No exchange rates yet. Add one above.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">From</th>
                                    <th className="px-4 py-2 text-left font-medium">To</th>
                                    <th className="px-4 py-2 text-right font-medium">Rate</th>
                                    <th className="px-4 py-2 text-left font-medium">Effective Date</th>
                                    <th className="px-4 py-2 text-center font-medium">Active</th>
                                    <th className="px-4 py-2 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rates.data.map((rate) => (
                                    <tr key={rate.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{fromCurrency(rate)}</td>
                                        <td className="px-4 py-3 font-medium">{toCurrency(rate)}</td>
                                        <td className="px-4 py-3 text-right font-mono">{Number(rate.rate).toFixed(6)}</td>
                                        <td className="px-4 py-3 text-slate-600">{rate.effective_date}</td>
                                        <td className="px-4 py-3 text-center">
                                            {rate.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Yes</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(rate.id)}
                                                className="text-slate-400 hover:text-red-600 text-xs"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {rates.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: rates.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/finance/exchange-rates?page=${page}`}
                                className={[
                                    'px-3 py-1 rounded text-sm',
                                    page === rates.current_page
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-slate-300 text-slate-600 hover:bg-slate-50',
                                ].join(' ')}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
