import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Currency } from '@/types/finance';

interface Props extends PageProps {
    currencies: Currency[];
    result: number | null;
    rate: number | null;
    input: {
        amount?: string | number;
        from?: string;
        to?: string;
        date?: string;
    };
}

export default function ExchangeRatesConvert({ currencies, result, rate, input }: Props) {
    const { data, setData, get, processing } = useForm({
        amount: String(input.amount ?? ''),
        from: input.from ?? '',
        to: input.to ?? '',
        date: input.date ?? '',
    });

    function handleConvert(e: React.FormEvent) {
        e.preventDefault();
        get('/finance/exchange-rates/convert');
    }

    return (
        <AppLayout>
            <Head title="Currency Converter" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Currency Converter</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <form onSubmit={handleConvert} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    placeholder="100.00"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date (optional)</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">From Currency</label>
                                <select
                                    value={data.from}
                                    onChange={e => setData('from', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select currency</option>
                                    {currencies.map(c => (
                                        <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">To Currency</label>
                                <select
                                    value={data.to}
                                    onChange={e => setData('to', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="">Select currency</option>
                                    {currencies.map(c => (
                                        <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>Convert</Button>
                    </form>
                </div>

                {result !== null && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
                        <p className="text-sm text-indigo-600 mb-1">Conversion Result</p>
                        <p className="text-3xl font-bold text-indigo-900">{result}</p>
                        {rate !== null && (
                            <p className="text-sm text-indigo-600 mt-2">
                                Rate used: 1 {input.from} = {rate} {input.to}
                            </p>
                        )}
                    </div>
                )}

                {result === null && input.amount && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-700">No exchange rate found for the selected currencies and date.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
