import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { CustomerDiscount } from '@/types/inventory';

interface Props {
    discounts: { data: CustomerDiscount[]; links: unknown[] };
}

export default function Index({ discounts }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: '',
        applies_to: 'all' as 'all' | 'category' | 'product',
        valid_from: '',
        valid_to: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/customer-discounts', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    function deleteDiscount(id: number) {
        if (confirm('Delete this discount?')) {
            router.delete(`/inventory/customer-discounts/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Customer Discounts" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Customer Discounts</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                        New Discount
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={submit} className="mb-6 bg-white border rounded p-4 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                value={data.discount_type}
                                onChange={e => setData('discount_type', e.target.value as 'percentage' | 'fixed')}
                                className="border rounded px-3 py-1.5 text-sm"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                            {errors.discount_type && <p className="text-red-500 text-xs mt-1">{errors.discount_type}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Value *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.discount_value}
                                onChange={e => setData('discount_value', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm w-28"
                                placeholder="0.00"
                            />
                            {errors.discount_value && <p className="text-red-500 text-xs mt-1">{errors.discount_value}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Applies To</label>
                            <select
                                value={data.applies_to}
                                onChange={e => setData('applies_to', e.target.value as 'all' | 'category' | 'product')}
                                className="border rounded px-3 py-1.5 text-sm"
                            >
                                <option value="all">All</option>
                                <option value="category">Category</option>
                                <option value="product">Product</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Valid From</label>
                            <input
                                type="date"
                                value={data.valid_from}
                                onChange={e => setData('valid_from', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Valid To</label>
                            <input
                                type="date"
                                value={data.valid_to}
                                onChange={e => setData('valid_to', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
                        >
                            Create
                        </button>
                    </form>
                )}

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Value</th>
                                <th className="px-4 py-2 text-left">Applies To</th>
                                <th className="px-4 py-2 text-left">Valid From</th>
                                <th className="px-4 py-2 text-left">Valid To</th>
                                <th className="px-4 py-2 text-left">Active</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.data.map(d => (
                                <tr key={d.id} className="border-t">
                                    <td className="px-4 py-2 capitalize">{d.discount_type}</td>
                                    <td className="px-4 py-2">
                                        {d.discount_type === 'percentage'
                                            ? `${d.discount_value}%`
                                            : `$${Number(d.discount_value).toFixed(2)}`}
                                    </td>
                                    <td className="px-4 py-2 capitalize">{d.applies_to}</td>
                                    <td className="px-4 py-2">{d.valid_from ?? '—'}</td>
                                    <td className="px-4 py-2">{d.valid_to ?? '—'}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {d.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => deleteDiscount(d.id)}
                                            className="text-red-600 hover:underline text-xs"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {discounts.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                        No discounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
