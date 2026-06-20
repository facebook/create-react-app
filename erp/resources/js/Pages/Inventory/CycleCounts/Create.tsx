import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Warehouse {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    sku: string | null;
}

interface Props extends PageProps {
    warehouses: Warehouse[];
    products: Product[];
}

export default function CycleCountCreate({ warehouses, products }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        warehouse_id: string;
        count_date: string;
        notes: string;
        products: number[];
    }>({
        warehouse_id: '',
        count_date: new Date().toISOString().split('T')[0],
        notes: '',
        products: [],
    });

    const [search, setSearch] = useState('');

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku?.toLowerCase() ?? '').includes(search.toLowerCase()),
    );

    function toggleProduct(id: number) {
        const selected = data.products.includes(id)
            ? data.products.filter((p) => p !== id)
            : [...data.products, id];
        setData('products', selected);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/cycle-counts');
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <AppLayout>
            <Head title="New Cycle Count" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <p className="text-sm text-slate-500">
                        <Link href="/inventory/cycle-counts" className="text-indigo-600 hover:underline">
                            Cycle Counts
                        </Link>{' '}
                        &rsaquo; New
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">New Cycle Count</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Details */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-slate-700">Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Warehouse <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.warehouse_id}
                                    onChange={(e) => setData('warehouse_id', e.target.value)}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">— Select Warehouse —</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.warehouse_id && (
                                    <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Count Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.count_date}
                                    onChange={(e) => setData('count_date', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                {errors.count_date && (
                                    <p className="mt-1 text-xs text-red-600">{errors.count_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Notes</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className={inputClass}
                                    rows={2}
                                    placeholder="Optional notes..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Products to Count{' '}
                                <span className="font-normal text-slate-400">({data.products.length} selected)</span>
                            </h2>
                        </div>
                        <div className="px-4 py-3 border-b border-slate-200">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                            {filteredProducts.length === 0 && (
                                <p className="px-4 py-4 text-center text-sm text-slate-400">No products found.</p>
                            )}
                            {filteredProducts.map((product) => {
                                const isSelected = data.products.includes(product.id);
                                return (
                                    <label
                                        key={product.id}
                                        className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 ${isSelected ? 'bg-indigo-50' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleProduct(product.id)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                        />
                                        <span className="flex-1 text-slate-900">{product.name}</span>
                                        {product.sku && (
                                            <span className="font-mono text-xs text-slate-400">{product.sku}</span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {errors.products && (
                            <p className="px-4 pb-3 text-xs text-red-600">{errors.products}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing || data.products.length === 0}>
                            {processing ? 'Creating...' : 'Create Cycle Count'}
                        </Button>
                        <Link href="/inventory/cycle-counts">
                            <Button variant="secondary" type="button">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
