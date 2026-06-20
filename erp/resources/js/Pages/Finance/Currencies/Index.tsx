import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Currency } from '@/types/finance';

interface Props extends PageProps {
    currencies: Currency[];
}

export default function CurrenciesIndex({ currencies }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        symbol: '',
        decimal_places: 2,
        is_base: false,
        is_active: true,
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/currencies', {
            onSuccess: () => reset(),
        });
    }

    function handleDelete(currency: Currency) {
        if (currency.is_base) return;
        if (!confirm(`Delete currency ${currency.code}?`)) return;
        router.delete(`/finance/currencies/${currency.id}`);
    }

    function handleSetBase(currency: Currency) {
        if (!confirm(`Set ${currency.code} as the base currency?`)) return;
        router.post(`/finance/currencies/${currency.id}/set-base`);
    }

    return (
        <AppLayout>
            <Head title="Currencies" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Currencies</h1>
                </div>

                {/* Create Form */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Add Currency</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Code (ISO)</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.code}
                                onChange={e => setData('code', e.target.value.toUpperCase())}
                                placeholder="USD"
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.code && <p className="text-xs text-red-600 mt-0.5">{errors.code}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-slate-600 mb-1">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="US Dollar"
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Symbol</label>
                            <input
                                type="text"
                                maxLength={10}
                                value={data.symbol}
                                onChange={e => setData('symbol', e.target.value)}
                                placeholder="$"
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.symbol && <p className="text-xs text-red-600 mt-0.5">{errors.symbol}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Decimals</label>
                            <input
                                type="number"
                                min={0}
                                max={4}
                                value={data.decimal_places}
                                onChange={e => setData('decimal_places', Number(e.target.value))}
                                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs text-slate-600 mb-1">Options</label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.is_base}
                                    onChange={e => setData('is_base', e.target.checked)}
                                />
                                Base currency
                            </label>
                            <Button type="submit" disabled={processing} className="mt-auto">
                                Add
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Currencies Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h2 className="text-sm font-medium text-slate-700">Currencies ({currencies.length})</h2>
                    </div>
                    {currencies.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">No currencies yet. Add one above.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Code</th>
                                    <th className="px-4 py-2 text-left font-medium">Name</th>
                                    <th className="px-4 py-2 text-left font-medium">Symbol</th>
                                    <th className="px-4 py-2 text-right font-medium">Decimals</th>
                                    <th className="px-4 py-2 text-center font-medium">Base</th>
                                    <th className="px-4 py-2 text-center font-medium">Active</th>
                                    <th className="px-4 py-2 w-40"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currencies.map((currency) => (
                                    <tr key={currency.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono font-semibold">{currency.code}</td>
                                        <td className="px-4 py-3">{currency.name}</td>
                                        <td className="px-4 py-3 font-mono">{currency.symbol}</td>
                                        <td className="px-4 py-3 text-right">{currency.decimal_places}</td>
                                        <td className="px-4 py-3 text-center">
                                            {currency.is_base ? (
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                                    Base
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {currency.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            {!currency.is_base && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetBase(currency)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Set as Base
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(currency)}
                                                disabled={currency.is_base}
                                                className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
            </div>
        </AppLayout>
    );
}
