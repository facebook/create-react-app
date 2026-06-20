import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Lead } from '@/types/finance';

interface Props extends PageProps {
    lead: Lead;
}

const stageColors: Record<string, string> = {
    new:          'bg-slate-100 text-slate-700',
    contacted:    'bg-blue-100 text-blue-700',
    qualified:    'bg-indigo-100 text-indigo-700',
    proposal:     'bg-purple-100 text-purple-700',
    negotiation:  'bg-yellow-100 text-yellow-700',
    won:          'bg-green-100 text-green-700',
    lost:         'bg-red-100 text-red-700',
};

const typeIcon: Record<string, string> = {
    call:    '📞',
    email:   '✉️',
    meeting: '🤝',
    note:    '📝',
    task:    '✅',
};

export default function LeadShow({ lead }: Props) {
    const [showLostForm, setShowLostForm] = useState(false);
    const [lostReason, setLostReason] = useState('');

    const updateForm = useForm({
        stage:               lead.stage,
        probability:         String(lead.probability),
        estimated_value:     lead.estimated_value != null ? String(lead.estimated_value) : '',
        notes:               lead.notes ?? '',
        expected_close_date: lead.expected_close_date ?? '',
    });

    const activityForm = useForm({
        type:             'note' as string,
        description:      '',
        activity_date:    new Date().toISOString().split('T')[0],
        outcome:          '',
        duration_minutes: '',
    });

    function submitUpdate(e: React.FormEvent) {
        e.preventDefault();
        updateForm.patch(`/finance/leads/${lead.id}`);
    }

    function submitActivity(e: React.FormEvent) {
        e.preventDefault();
        activityForm.post(`/finance/leads/${lead.id}/activities`, {
            onSuccess: () => activityForm.reset(),
        });
    }

    function markWon() {
        router.post(`/finance/leads/${lead.id}/mark-won`);
    }

    function markLost() {
        router.post(`/finance/leads/${lead.id}/mark-lost`, { reason: lostReason });
    }

    const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <AppLayout>
            <Head title={`Lead: ${lead.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">{lead.name}</h1>
                        {lead.company && <p className="text-sm text-slate-500">{lead.company}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/finance/leads">
                            <Button variant="secondary">Back</Button>
                        </Link>
                    </div>
                </div>

                {/* Lead Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Info card */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">Stage</p>
                                    <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageColors[lead.stage] ?? ''}`}>
                                        {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">Source</p>
                                    <p className="mt-1 text-sm capitalize">{lead.source.replace(/_/g, ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">Probability</p>
                                    <p className="mt-1 text-sm">{lead.probability}%</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">Estimated Value</p>
                                    <p className="mt-1 text-sm">
                                        {lead.estimated_value != null
                                            ? Number(lead.estimated_value).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">Weighted Value</p>
                                    <p className="mt-1 text-sm">
                                        {Number(lead.weighted_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">Expected Close</p>
                                    <p className="mt-1 text-sm">{lead.expected_close_date ?? '—'}</p>
                                </div>
                                {lead.email && (
                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">Email</p>
                                        <p className="mt-1 text-sm">{lead.email}</p>
                                    </div>
                                )}
                                {lead.phone && (
                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">Phone</p>
                                        <p className="mt-1 text-sm">{lead.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Update form */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-medium text-slate-800">Update Lead</h2>
                            <form onSubmit={submitUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Stage</label>
                                        <select value={updateForm.data.stage} onChange={(e) => updateForm.setData('stage', e.target.value)} className={inputClass}>
                                            {['new','contacted','qualified','proposal','negotiation','won','lost'].map((s) => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Probability (%)</label>
                                        <input type="number" min="0" max="100" value={updateForm.data.probability} onChange={(e) => updateForm.setData('probability', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Estimated Value</label>
                                        <input type="number" step="0.01" value={updateForm.data.estimated_value} onChange={(e) => updateForm.setData('estimated_value', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Expected Close Date</label>
                                        <input type="date" value={updateForm.data.expected_close_date} onChange={(e) => updateForm.setData('expected_close_date', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Notes</label>
                                    <textarea value={updateForm.data.notes} onChange={(e) => updateForm.setData('notes', e.target.value)} rows={3} className={inputClass} />
                                </div>
                                <Button type="submit" disabled={updateForm.processing}>Save Changes</Button>
                            </form>
                        </div>

                        {/* Activities timeline */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-medium text-slate-800">Activities</h2>
                            {lead.activities && lead.activities.length > 0 ? (
                                <ul className="space-y-4">
                                    {lead.activities.map((activity) => (
                                        <li key={activity.id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                            <span className="text-xl">{typeIcon[activity.type] ?? '📌'}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium capitalize text-slate-800">{activity.type}</span>
                                                    <span className="text-xs text-slate-500">{activity.activity_date}</span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                                                {activity.outcome && (
                                                    <p className="mt-1 text-xs text-slate-500">Outcome: {activity.outcome}</p>
                                                )}
                                                {activity.duration_minutes && (
                                                    <p className="text-xs text-slate-500">Duration: {activity.duration_minutes} min</p>
                                                )}
                                                {activity.user && (
                                                    <p className="text-xs text-slate-400">By: {activity.user.name}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">No activities yet.</p>
                            )}

                            {/* Add activity form */}
                            <div className="mt-6 border-t border-slate-200 pt-6">
                                <h3 className="mb-3 text-sm font-medium text-slate-700">Add Activity</h3>
                                <form onSubmit={submitActivity} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Type</label>
                                            <select value={activityForm.data.type} onChange={(e) => activityForm.setData('type', e.target.value)} className={inputClass}>
                                                <option value="call">Call</option>
                                                <option value="email">Email</option>
                                                <option value="meeting">Meeting</option>
                                                <option value="note">Note</option>
                                                <option value="task">Task</option>
                                            </select>
                                            {activityForm.errors.type && <p className="mt-1 text-xs text-red-600">{activityForm.errors.type}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Date *</label>
                                            <input type="date" value={activityForm.data.activity_date} onChange={(e) => activityForm.setData('activity_date', e.target.value)} className={inputClass} />
                                            {activityForm.errors.activity_date && <p className="mt-1 text-xs text-red-600">{activityForm.errors.activity_date}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Description *</label>
                                        <textarea value={activityForm.data.description} onChange={(e) => activityForm.setData('description', e.target.value)} rows={2} className={inputClass} />
                                        {activityForm.errors.description && <p className="mt-1 text-xs text-red-600">{activityForm.errors.description}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Outcome</label>
                                            <input type="text" value={activityForm.data.outcome} onChange={(e) => activityForm.setData('outcome', e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Duration (min)</label>
                                            <input type="number" min="1" value={activityForm.data.duration_minutes} onChange={(e) => activityForm.setData('duration_minutes', e.target.value)} className={inputClass} />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={activityForm.processing}>Add Activity</Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Actions sidebar */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 text-sm font-medium text-slate-700">Actions</h2>
                            <div className="space-y-2">
                                {lead.stage !== 'won' && (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={markWon}
                                    >
                                        Mark Won
                                    </Button>
                                )}
                                {lead.stage !== 'lost' && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={() => setShowLostForm((v) => !v)}
                                        >
                                            Mark Lost
                                        </Button>
                                        {showLostForm && (
                                            <div className="mt-2 space-y-2">
                                                <textarea
                                                    value={lostReason}
                                                    onChange={(e) => setLostReason(e.target.value)}
                                                    placeholder="Reason for losing..."
                                                    rows={2}
                                                    className={inputClass}
                                                />
                                                <Button
                                                    variant="secondary"
                                                    className="w-full"
                                                    onClick={markLost}
                                                    disabled={!lostReason.trim()}
                                                >
                                                    Confirm Lost
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
