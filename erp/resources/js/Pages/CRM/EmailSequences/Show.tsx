import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';

interface Step { id: number; step_number: number; subject: string; body: string; delay_days: number; }
interface Enrollment { id: number; current_step: number; status: string; next_send_at: string | null; lead: { id: number; contact_name: string; email: string; company_name: string | null; }; }
interface Sequence { id: number; name: string; status: string; total_steps: number; steps: Step[]; enrollments: Enrollment[]; }
interface Lead { id: number; contact_name: string; email: string; company_name: string | null; }

export default function EmailSequenceShow({
    sequence,
    leads,
}: {
    sequence: Sequence;
    leads: Lead[];
}) {
    const [stepForm, setStepForm] = useState({ subject: '', body: '', delay_days: '1' });
    const [showStepForm, setShowStepForm] = useState(false);
    const [enrollLeadId, setEnrollLeadId] = useState('');

    const addStep = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/crm/sequences/${sequence.id}/steps`, stepForm, {
            onSuccess: () => { setShowStepForm(false); setStepForm({ subject: '', body: '', delay_days: '1' }); },
        });
    };

    const enroll = () => {
        if (!enrollLeadId) return;
        router.post(`/crm/sequences/${sequence.id}/enroll`, { lead_id: enrollLeadId }, {
            onSuccess: () => setEnrollLeadId(''),
        });
    };

    const toggleStatus = () => {
        if (sequence.status === 'active') {
            router.post(`/crm/sequences/${sequence.id}/pause`);
        } else {
            router.post(`/crm/sequences/${sequence.id}/activate`);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/crm/sequences" className="text-blue-600 hover:underline text-sm">← Sequences</Link>
                <h1 className="text-2xl font-bold text-gray-800">{sequence.name}</h1>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${sequence.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {sequence.status}
                </span>
                <button onClick={toggleStatus} className="ml-auto text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">
                    {sequence.status === 'active' ? 'Pause' : 'Activate'}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Steps</div>
                    <div className="text-2xl font-bold text-gray-800">{sequence.total_steps}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Enrolled</div>
                    <div className="text-2xl font-bold text-gray-800">{sequence.enrollments.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Active</div>
                    <div className="text-2xl font-bold text-green-600">{sequence.enrollments.filter(e => e.status === 'active').length}</div>
                </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-xl shadow mb-6">
                <div className="px-5 py-3 border-b flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Email Steps</span>
                    <button onClick={() => setShowStepForm(v => !v)} className="text-sm text-blue-600 hover:underline">+ Add Step</button>
                </div>
                {showStepForm && (
                    <form onSubmit={addStep} className="p-5 border-b space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                                <input value={stepForm.subject} onChange={e => setStepForm(f => ({ ...f, subject: e.target.value }))}
                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Delay (days after previous)</label>
                                <input type="number" min="0" value={stepForm.delay_days} onChange={e => setStepForm(f => ({ ...f, delay_days: e.target.value }))}
                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
                            <RichTextEditor
                                content={stepForm.body}
                                onChange={(html) => setStepForm(f => ({ ...f, body: html }))}
                                placeholder="Write email body…"
                                minHeight="150px"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Add Step</button>
                            <button type="button" onClick={() => setShowStepForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm">Cancel</button>
                        </div>
                    </form>
                )}
                <div className="divide-y">
                    {sequence.steps.map(step => (
                        <div key={step.id} className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {step.step_number + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800">{step.subject}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Send after {step.delay_days} day{step.delay_days !== 1 ? 's' : ''}</div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{step.body}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {sequence.steps.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">No steps yet. Add the first email.</div>
                    )}
                </div>
            </div>

            {/* Enrollments */}
            <div className="bg-white rounded-xl shadow">
                <div className="px-5 py-3 border-b flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Enrolled Leads</span>
                    <div className="flex items-center gap-2">
                        <select value={enrollLeadId} onChange={e => setEnrollLeadId(e.target.value)}
                            className="border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="">Select lead...</option>
                            {leads.map(l => <option key={l.id} value={l.id}>{l.contact_name} — {l.company_name ?? l.email}</option>)}
                        </select>
                        <button onClick={enroll} disabled={!enrollLeadId} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                            Enroll
                        </button>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Lead</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Step</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Next Send</th>
                            <th className="px-4 py-3 text-center text-gray-600 font-medium">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sequence.enrollments.map(en => (
                            <tr key={en.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{en.lead.contact_name}</div>
                                    <div className="text-xs text-gray-400">{en.lead.email}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{en.current_step + 1} / {sequence.total_steps}</td>
                                <td className="px-4 py-3 text-gray-600">{en.next_send_at ? new Date(en.next_send_at).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${en.status === 'active' ? 'bg-green-100 text-green-700' : en.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {en.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {en.status === 'active' && (
                                        <button onClick={() => router.post(`/crm/enrollments/${en.id}/unsubscribe`)}
                                            className="text-red-500 hover:underline text-xs">Unsub</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {sequence.enrollments.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">No leads enrolled yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
