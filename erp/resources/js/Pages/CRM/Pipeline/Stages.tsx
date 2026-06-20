import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Stage {
    id: number; name: string; sequence: number; type: string;
    probability: number; color: string | null; is_active: boolean;
}
interface Props extends PageProps { stages: Stage[] }

const typeBadge: Record<string,string> = {
    open:'bg-blue-100 text-blue-700', won:'bg-green-100 text-green-700', lost:'bg-red-100 text-red-700',
};

export default function PipelineStages({ stages }: Props) {
    const form = useForm({
        name:'', sequence:'10', type:'open', probability:'0', color:'', is_active: true,
    });

    const inputCls = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    const labelCls = 'block text-sm font-medium text-slate-700';

    return (
        <AppLayout>
            <Head title="Pipeline Stages" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Pipeline Stages</h1>
                    <p className="text-sm text-slate-500 mt-1">{stages.length} stages configured</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Seq</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Probability</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Color</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Active</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {stages.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No stages yet.</td></tr>
                            )}
                            {stages.map((stage) => (
                                <tr key={stage.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-700">{stage.sequence}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{stage.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${typeBadge[stage.type] ?? typeBadge.open}`}>{stage.type}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">{stage.probability}%</td>
                                    <td className="px-4 py-3 text-sm">
                                        {stage.color ? (
                                            <span className="inline-flex items-center gap-2">
                                                <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: stage.color }} />
                                                {stage.color}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{stage.is_active ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => { if (confirm('Delete stage?')) router.delete(`/crm/stages/${stage.id}`); }}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800 mb-4">Add Stage</h2>
                    <form onSubmit={e => { e.preventDefault(); form.post('/crm/stages', { onSuccess: () => form.reset() }); }} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Name <span className="text-red-500">*</span></label>
                            <input type="text" className={inputCls} value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                        </div>
                        <div>
                            <label className={labelCls}>Sequence</label>
                            <input type="number" min="0" className={inputCls} value={form.data.sequence} onChange={e => form.setData('sequence', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Type</label>
                            <select className={inputCls} value={form.data.type} onChange={e => form.setData('type', e.target.value)}>
                                <option value="open">Open</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Probability (%)</label>
                            <input type="number" min="0" max="100" className={inputCls} value={form.data.probability} onChange={e => form.setData('probability', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Color (hex)</label>
                            <input type="text" className={inputCls} placeholder="#6366f1" value={form.data.color} onChange={e => form.setData('color', e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Adding...' : 'Add Stage'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
