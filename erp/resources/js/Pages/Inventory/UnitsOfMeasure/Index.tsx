import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { UnitOfMeasure, Paginator } from '@/types/inventory';

interface Props {
    units: Paginator<UnitOfMeasure>;
}

export default function Index({ units }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        abbreviation: '',
        type: 'unit',
        is_base: false as boolean,
        conversion_factor: 1,
        is_active: true as boolean,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/units-of-measure', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    return (
        <AppLayout>
            <Head title="Units of Measure" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Units of Measure</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                        New Unit
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
                                placeholder="Kilogram"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Abbreviation *</label>
                            <input
                                type="text"
                                value={data.abbreviation}
                                onChange={e => setData('abbreviation', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                                placeholder="kg"
                            />
                            {errors.abbreviation && <p className="text-red-500 text-xs mt-1">{errors.abbreviation}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                            >
                                <option value="unit">Unit</option>
                                <option value="weight">Weight</option>
                                <option value="volume">Volume</option>
                                <option value="length">Length</option>
                                <option value="area">Area</option>
                                <option value="time">Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Conversion Factor</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={data.conversion_factor}
                                onChange={e => setData('conversion_factor', parseFloat(e.target.value))}
                                className="border rounded px-3 py-1.5 text-sm w-32"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_base"
                                checked={data.is_base}
                                onChange={e => setData('is_base', e.target.checked)}
                            />
                            <label htmlFor="is_base" className="text-xs font-medium text-gray-700">Base Unit</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="text-xs font-medium text-gray-700">Active</label>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-1.5 border rounded text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </form>
                )}

                <div className="bg-white rounded border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abbreviation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {units.data.map(unit => (
                                <tr key={unit.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{unit.abbreviation}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{unit.type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{unit.is_base ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{unit.conversion_factor}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${unit.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {unit.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {units.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No units of measure found.
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
