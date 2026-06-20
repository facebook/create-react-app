import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Currency } from '@/types/finance';

interface Props extends PageProps {
    currency: Currency;
}

export default function CurrencyEdit({ currency }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: currency.code ?? '',
        name: currency.name ?? '',
        symbol: currency.symbol ?? '',
        decimal_places: currency.decimal_places ?? 2,
        rounding: currency.rounding ?? 0,
        is_base: currency.is_base ?? false,
        is_active: currency.is_active ?? true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/finance/currencies/${currency.id}`);
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <AppLayout>
            <Head title={`Edit Currency — ${currency.code}`} />
            <div className="mx-auto max-w-lg space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            <Link href="/finance/currencies" className="text-indigo-600 hover:underline">
                                Currencies
                            </Link>{' '}
                            &rsaquo; Edit
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Edit Currency — {currency.code}</h1>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                ISO Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={3}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                className={inputClass}
                                required
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Symbol <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                value={data.symbol}
                                onChange={(e) => setData('symbol', e.target.value)}
                                className={inputClass}
                                required
                            />
                            {errors.symbol && <p className="mt-1 text-xs text-red-600">{errors.symbol}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Decimal Places</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    value={data.decimal_places}
                                    onChange={(e) => setData('decimal_places', Number(e.target.value))}
                                    className={inputClass}
                                />
                                {errors.decimal_places && (
                                    <p className="mt-1 text-xs text-red-600">{errors.decimal_places}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Rounding</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={data.rounding}
                                    onChange={(e) => setData('rounding', Number(e.target.value))}
                                    className={inputClass}
                                />
                                {errors.rounding && (
                                    <p className="mt-1 text-xs text-red-600">{errors.rounding}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_base}
                                    onChange={(e) => setData('is_base', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                Set as base currency
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                Active
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Link href="/finance/currencies">
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
