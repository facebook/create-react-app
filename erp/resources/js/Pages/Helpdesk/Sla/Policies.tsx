import React, { useState } from 'react';
import { router } from '@inertiajs/react';

interface SlaPolicy {
    id: number;
    name: string;
    priority: string;
    response_hours: number;
    resolution_hours: number;
    is_active: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function SlaPolicies({ policies }: { policies: SlaPolicy[] }) {
    const [form, setForm] = useState({ name: '', priority: 'medium', response_hours: '', resolution_hours: '' });
    const [showForm, setShowForm] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/helpdesk/sla/policies', form, {
            onSuccess: () => { setShowForm(false); setForm({ name: '', priority: 'medium', response_hours: '', resolution_hours: '' }); },
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">SLA Policies</h1>
                    <p className="text-sm text-gray-500 mt-1">Define response and resolution time targets by priority.</p>
                </div>
                <div className="flex gap-3">
                    <a href="/helpdesk/sla/escalations" className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-100">
                        View Escalations
                    </a>
                    <button onClick={() => setShowForm(v => !v)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        + Add Policy
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Time (hours)</label>
                        <input type="number" step="0.5" value={form.response_hours} onChange={e => setForm(f => ({ ...f, response_hours: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Time (hours)</label>
                        <input type="number" step="0.5" value={form.resolution_hours} onChange={e => setForm(f => ({ ...f, resolution_hours: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div className="col-span-2 flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Create Policy</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {policies.map(p => (
                    <div key={p.id} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${PRIORITY_COLORS[p.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                            {p.priority}
                        </span>
                        <div className="flex-1">
                            <div className="font-semibold text-gray-800">{p.name}</div>
                            <div className="text-sm text-gray-500 mt-0.5">
                                Response: <span className="font-medium">{p.response_hours}h</span>
                                {' · '}
                                Resolution: <span className="font-medium">{p.resolution_hours}h</span>
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                ))}
                {policies.length === 0 && (
                    <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                        No SLA policies defined yet.
                    </div>
                )}
            </div>
        </div>
    );
}
