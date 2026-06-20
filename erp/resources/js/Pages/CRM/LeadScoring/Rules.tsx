import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';

interface Rule {
    id: number;
    name: string;
    field: string;
    condition_value: string | null;
    points: number;
    is_active: boolean;
}

const FIELD_LABELS: Record<string, string> = {
    source: 'Source',
    stage: 'Stage',
    tag: 'Tag',
    email_open: 'Email Open',
    email_click: 'Email Click',
    website_visit: 'Website Visit',
};

export default function LeadScoringRules({ rules }: { rules: Rule[] }) {
    const [form, setForm] = useState({ name: '', field: 'source', condition_value: '', points: '' });
    const [showForm, setShowForm] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/crm/scoring/rules', form, {
            onSuccess: () => { setShowForm(false); setForm({ name: '', field: 'source', condition_value: '', points: '' }); },
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lead Scoring Rules</h1>
                    <p className="text-sm text-gray-500 mt-1">Award points to leads based on their attributes and behavior.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/crm/scoring/scores" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                        View Scores
                    </Link>
                    <button onClick={() => setShowForm(v => !v)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        + Add Rule
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                        <select value={form.field} onChange={e => setForm(f => ({ ...f, field: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            {Object.entries(FIELD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition Value</label>
                        <input value={form.condition_value} onChange={e => setForm(f => ({ ...f, condition_value: e.target.value }))}
                            placeholder="e.g. website, referral"
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                        <input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                            placeholder="e.g. 10 or -5"
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <div className="col-span-2 flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Create Rule</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Rule Name</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Field</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Condition</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Points</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map(rule => (
                            <tr key={rule.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{rule.name}</td>
                                <td className="px-4 py-3 text-gray-600">{FIELD_LABELS[rule.field] ?? rule.field}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {rule.condition_value ? <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{rule.condition_value}</code> : '—'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`font-bold ${rule.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {rule.points > 0 ? '+' : ''}{rule.points}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => router.delete(`/crm/scoring/rules/${rule.id}`)}
                                        className="text-red-500 hover:underline text-xs">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {rules.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No scoring rules yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
