import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Button } from '@/Components/Common/Button';

interface Rule { id: number; name: string; code: string; category: string; sequence: number; amount_type: string; amount: number; percentage: number; base_rule_code: string | null; }
interface Structure { id: number; name: string; code: string; description: string | null; is_active: boolean; }
interface Props { structure: Structure; rules: Rule[]; }

const CATEGORY_COLORS: Record<string, string> = { earnings: 'bg-green-100 text-green-700', deductions: 'bg-red-100 text-red-700', net: 'bg-blue-100 text-blue-700' };
const BLANK = { name: '', code: '', category: 'earnings', sequence: '10', amount_type: 'fixed', amount: '', percentage: '', base_rule_code: '' };

export default function SalaryStructureShow({ structure, rules }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ ...BLANK });
    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/hr/salary-structures/${structure.id}/rules`, form as Record<string, string>, { onSuccess: () => { setShowAdd(false); setForm({ ...BLANK }); } });
    }
    function deleteRule(id: number) { if (confirm('Remove?')) router.delete(`/hr/salary-structures/${structure.id}/rules/${id}`); }
    function fmtAmount(r: Rule): string {
        if (r.amount_type === 'fixed') return `$${Number(r.amount).toFixed(2)}`;
        if (r.amount_type === 'percentage_of_basic') return `${r.percentage}% of Basic`;
        if (r.amount_type === 'percentage_of_gross') return `${r.percentage}% of Gross`;
        if (r.amount_type === 'percentage_of_rule')  return `${r.percentage}% of ${r.base_rule_code}`;
        return '—';
    }
    return (
        <AppLayout>
            <Head title={structure.name} />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/hr/salary-structures" className="text-sm text-slate-500 hover:text-slate-700">← Salary Structures</Link>
                    <span className="text-slate-400">/</span>
                    <h1 className="text-xl font-semibold text-slate-800">{structure.name}</h1>
                    <span className="font-mono text-sm text-slate-500">{structure.code}</span>
                    <div className="ml-auto"><Button onClick={() => setShowAdd(true)}>+ Add Rule</Button></div>
                </div>
                {showAdd && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-3">
                            <div><label className="block text-sm font-medium text-slate-700">Name</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" required /></div>
                            <div><label className="block text-sm font-medium text-slate-700">Code</label>
                                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono" required /></div>
                            <div><label className="block text-sm font-medium text-slate-700">Category</label>
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm">
                                    <option value="earnings">Earnings</option><option value="deductions">Deductions</option><option value="net">Net</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-slate-700">Sequence</label>
                                <input type="number" value={form.sequence} onChange={e => setForm(f => ({ ...f, sequence: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" min={1} required /></div>
                            <div><label className="block text-sm font-medium text-slate-700">Type</label>
                                <select value={form.amount_type} onChange={e => setForm(f => ({ ...f, amount_type: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm">
                                    <option value="fixed">Fixed</option><option value="percentage_of_basic">% of Basic</option>
                                    <option value="percentage_of_gross">% of Gross</option><option value="percentage_of_rule">% of Rule</option>
                                </select></div>
                            {form.amount_type === 'fixed'
                                ? <div><label className="block text-sm font-medium text-slate-700">Amount</label>
                                    <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" /></div>
                                : <div><label className="block text-sm font-medium text-slate-700">Percentage (%)</label>
                                    <input type="number" step="0.01" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" /></div>}
                            {form.amount_type === 'percentage_of_rule' && (
                                <div><label className="block text-sm font-medium text-slate-700">Base Rule Code</label>
                                    <input value={form.base_rule_code} onChange={e => setForm(f => ({ ...f, base_rule_code: e.target.value.toUpperCase() }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono" /></div>
                            )}
                            <div className="flex items-end gap-2 sm:col-span-3">
                                <Button type="submit">Add Rule</Button>
                                <button type="button" onClick={() => setShowAdd(false)} className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Seq</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Computation</th>
                            <th className="px-4 py-3"></th>
                        </tr></thead>
                        <tbody>
                            {rules.map(r => (
                                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3 text-slate-500">{r.sequence}</td>
                                    <td className="px-4 py-3 font-medium">{r.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[r.category] ?? ''}`}>{r.category}</span></td>
                                    <td className="px-4 py-3 text-slate-600">{fmtAmount(r)}</td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => deleteRule(r.id)} className="text-xs text-red-500 hover:underline">Remove</button></td>
                                </tr>
                            ))}
                            {rules.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">No rules yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
