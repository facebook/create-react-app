import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stage { id: number; name: string; type: string }
interface User  { id: number; name: string }
interface Lead {
    id: number; title: string; type: string; stage_id: number | null;
    contact_name: string | null; company_name: string | null; email: string | null;
    phone: string | null; website: string | null; source: string | null;
    expected_revenue: number; probability: number; expected_close_date: string | null;
    priority: string; description: string | null; assigned_to: number | null;
}
interface Props extends PageProps { lead: Lead; stages: Stage[]; users: User[] }

const SOURCES = ['website','referral','cold_call','email','social_media','advertisement','other'];

export default function LeadsEdit({ lead, stages, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: lead.title, type: lead.type,
        stage_id: lead.stage_id?.toString() ?? '',
        contact_name: lead.contact_name ?? '', company_name: lead.company_name ?? '',
        email: lead.email ?? '', phone: lead.phone ?? '', website: lead.website ?? '',
        source: lead.source ?? '',
        expected_revenue: lead.expected_revenue?.toString() ?? '',
        probability: lead.probability?.toString() ?? '',
        expected_close_date: lead.expected_close_date ?? '',
        priority: lead.priority, description: lead.description ?? '',
        assigned_to: lead.assigned_to?.toString() ?? '',
    });

    const inputCls = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    const labelCls = 'block text-sm font-medium text-slate-700';
    const errorCls = 'mt-1 text-xs text-red-600';

    return (
        <AppLayout>
            <Head title={`Edit — ${lead.title}`} />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Lead</h1>
                    <p className="mt-1 text-sm text-slate-500">{lead.title}</p>
                </div>
                <form onSubmit={e => { e.preventDefault(); put(`/crm/leads/${lead.id}`); }} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelCls}>Title <span className="text-red-500">*</span></label>
                            <input type="text" className={inputCls} value={data.title} onChange={e => setData('title', e.target.value)} required />
                            {errors.title && <p className={errorCls}>{errors.title}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Type</label>
                            <select className={inputCls} value={data.type} onChange={e => setData('type', e.target.value)}>
                                <option value="lead">Lead</option>
                                <option value="opportunity">Opportunity</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Priority</label>
                            <select className={inputCls} value={data.priority} onChange={e => setData('priority', e.target.value)}>
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Contact Name</label>
                            <input type="text" className={inputCls} value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Company Name</label>
                            <input type="text" className={inputCls} value={data.company_name} onChange={e => setData('company_name', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input type="email" className={inputCls} value={data.email} onChange={e => setData('email', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input type="text" className={inputCls} value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Stage</label>
                            <select className={inputCls} value={data.stage_id} onChange={e => setData('stage_id', e.target.value)}>
                                <option value="">None</option>
                                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Assigned To</label>
                            <select className={inputCls} value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Source</label>
                            <select className={inputCls} value={data.source} onChange={e => setData('source', e.target.value)}>
                                <option value="">None</option>
                                {SOURCES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Expected Close Date</label>
                            <input type="date" className={inputCls} value={data.expected_close_date} onChange={e => setData('expected_close_date', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Expected Revenue</label>
                            <input type="number" min="0" step="0.01" className={inputCls} value={data.expected_revenue} onChange={e => setData('expected_revenue', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Probability (%)</label>
                            <input type="number" min="0" max="100" className={inputCls} value={data.probability} onChange={e => setData('probability', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea rows={4} className={inputCls} value={data.description} onChange={e => setData('description', e.target.value)} />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        <a href={`/crm/leads/${lead.id}`} className="text-sm text-slate-600 hover:text-slate-800">Cancel</a>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
