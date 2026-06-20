import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PriceList } from '@/types/inventory';

interface Props {
    priceLists: { data: PriceList[]; links: unknown[] };
}

export default function Index({ priceLists }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        currency: 'USD',
        is_default: false as boolean,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/price-lists', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    return (
        <AppLayout>
            <Head title="Price Lists" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Price Lists</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                        New Price List
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={submit} className="mb-6 bg-white border rounded p-4 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                                placeholder="Price list name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                            <input
                                type="text"
                                value={data.currency}
                                onChange={e => setData('currency', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm w-20"
                                maxLength={3}
                                placeholder="USD"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={data.is_default}
                                onChange={e => setData('is_default', e.target.checked)}
                            />
                            <label htmlFor="is_default" className="text-sm text-gray-700">Default</label>
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
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Currency</th>
                                <th className="px-4 py-2 text-left">Default</th>
                                <th className="px-4 py-2 text-left">Valid From</th>
                                <th className="px-4 py-2 text-left">Valid To</th>
                                <th className="px-4 py-2 text-left">Active</th>
                                <th className="px-4 py-2 text-left">Items</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceLists.data.map(pl => (
                                <tr key={pl.id} className="border-t">
                                    <td className="px-4 py-2 font-medium">{pl.name}</td>
                                    <td className="px-4 py-2">{pl.currency}</td>
                                    <td className="px-4 py-2">
                                        {pl.is_default ? (
                                            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Default</span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-2">{pl.valid_from ?? '—'}</td>
                                    <td className="px-4 py-2">{pl.valid_to ?? '—'}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${pl.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {pl.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{pl.item_count}</td>
                                    <td className="px-4 py-2">
                                        <Link
                                            href={`/inventory/price-lists/${pl.id}`}
                                            className="text-indigo-600 hover:underline text-xs"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {priceLists.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                        No price lists found.
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
