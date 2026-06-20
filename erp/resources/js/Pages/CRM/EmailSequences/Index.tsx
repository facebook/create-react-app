import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';

interface Sequence {
    id: number;
    name: string;
    description: string | null;
    status: string;
    steps_count: number;
    enrollments_count: number;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-gray-100 text-gray-500',
};

export default function EmailSequencesIndex({ sequences }: { sequences: Sequence[] }) {
    const [form, setForm] = useState({ name: '', description: '' });
    const [showForm, setShowForm] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/crm/sequences', form, {
            onSuccess: () => { setShowForm(false); setForm({ name: '', description: '' }); },
        });
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Email Sequences</h1>
                    <p className="text-sm text-gray-500 mt-1">Automated drip campaigns for leads.</p>
                </div>
                <button onClick={() => setShowForm(v => !v)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    + New Sequence
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sequence Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Create</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {sequences.map(seq => (
                    <div key={seq.id} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Link href={`/crm/sequences/${seq.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                                    {seq.name}
                                </Link>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[seq.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {seq.status}
                                </span>
                            </div>
                            {seq.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{seq.description}</p>}
                            <div className="text-xs text-gray-400 mt-1">
                                {seq.steps_count} steps · {seq.enrollments_count} enrolled
                            </div>
                        </div>
                        <Link href={`/crm/sequences/${seq.id}`} className="text-blue-600 hover:underline text-sm">Manage →</Link>
                    </div>
                ))}
                {sequences.length === 0 && (
                    <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                        No email sequences yet. Create one to start automating outreach.
                    </div>
                )}
            </div>
        </div>
    );
}
