import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
}

interface Props extends PageProps {
    products: Product[];
}

export default function PriceListCreate({ products }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        description: string;
        currency_code: string;
        discount_percent: string | number;
        is_active: boolean;
        is_default: boolean;
        valid_from: string;
        valid_to: string;
    }>({
        name: '',
        description: '',
        currency_code: 'USD',
        discount_percent: 0,
        is_active: true,
        is_default: false,
        valid_from: '',
        valid_to: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/price-lists');
    }

    return (
        <AppLayout>
            <Head title="New Price List" />
            <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Price List</h1>
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Currency Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={data.currency_code}
                                    onChange={(e) => setData('currency_code', e.target.value.toUpperCase().slice(0, 3))}
                                    maxLength={3}
                                    placeholder="USD"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {errors.currency_code && <p className="mt-1 text-xs text-red-500">{errors.currency_code}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Global Discount % (0–100)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={data.discount_percent}
                                    onChange={(e) => setData('discount_percent', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valid From</label>
                                <input
                                    type="date"
                                    value={data.valid_from}
                                    onChange={(e) => setData('valid_from', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valid To</label>
                                <input
                                    type="date"
                                    value={data.valid_to}
                                    onChange={(e) => setData('valid_to', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-slate-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-slate-700">Set as Default</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Price List</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
