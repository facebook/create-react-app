import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Button } from '@/Components/Common/Button';

interface Structure { id: number; name: string; code: string; description: string | null; is_active: boolean; rules_count: number; }
interface Props { structures: { data: Structure[]; links: unknown[] }; }

export default function SalaryStructuresIndex({ structures }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', description: '' });
    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        router.post('/hr/salary-structures', form, { onSuccess: () => setShowCreate(false) });
    }
    return (
        <AppLayout>
            <Head title="Salary Structures" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Salary Structures</h1>
                    <Button onClick={() => setShowCreate(true)}>+ New Structure</Button>
                </div>
                {showCreate && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Standard Package" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Code</label>
                                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono" placeholder="STD_EMP" required />
                            </div>
                            <div className="flex gap-2 sm:col-span-2">
                                <Button type="submit">Create</Button>
                                <button type="button" onClick={() => setShowCreate(false)} className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Rules</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr></thead>
                        <tbody>
                            {structures.data.map(s => (
                                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3 font-medium">{s.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.code}</td>
                                    <td className="px-4 py-3">{s.rules_count}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-4 py-3 text-right"><Link href={`/hr/salary-structures/${s.id}`} className="text-sm text-blue-600 hover:underline">View</Link></td>
                                </tr>
                            ))}
                            {structures.data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No salary structures yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
