import React from 'react';
import { Head, useForm } from '@inertiajs/react';

interface Parent { id: number; code: string; name: string; }

export default function Create({ parents }: { parents: Parent[] }) {
    const { data, setData, post, errors } = useForm({
        code: '',
        name: '',
        type: 'profit',
        parent_id: '',
        budget: '',
        description: '',
    });

    return (
        <>
            <Head title="New Profit Center" />
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-bold mb-6">New Profit Center</h1>
                <form onSubmit={e => { e.preventDefault(); post('/finance/profit-centers'); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Code *</label>
                            <input value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded px-3 py-2" />
                            {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
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
                        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Parent Center</label>
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
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Create</button>
                </form>
            </div>
        </>
    );
}
