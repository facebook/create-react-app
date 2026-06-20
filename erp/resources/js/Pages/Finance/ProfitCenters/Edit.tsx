import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Parent { id: number; code: string; name: string; }
interface ProfitCenter { id: number; code: string; name: string; type: string; parent_id: number | null; budget: number | null; description: string | null; }

export default function Edit({ profitCenter, parents }: { profitCenter: ProfitCenter; parents: Parent[] }) {
    const { data, setData, put } = useForm({
        code: profitCenter.code,
        name: profitCenter.name,
        type: profitCenter.type,
        parent_id: profitCenter.parent_id ? String(profitCenter.parent_id) : '',
        budget: profitCenter.budget ? String(profitCenter.budget) : '',
        description: profitCenter.description ?? '',
    });

    return (
        <>
            <Head title="Edit Profit Center" />
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-bold mb-6">Edit Profit Center</h1>
                <form onSubmit={e => { e.preventDefault(); put(`/finance/profit-centers/${profitCenter.id}`); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Code *</label>
                            <input value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="profit">Profit Center</option>
                                <option value="cost">Cost Center</option>
                                <option value="investment">Investment Center</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Parent</label>
                            <select value={data.parent_id} onChange={e => setData('parent_id', e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">— None —</option>
                                {parents.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Budget</label>
                            <input type="number" value={data.budget} onChange={e => setData('budget', e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Save</button>
                </form>
            </div>
        </>
    );
}
