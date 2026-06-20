import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Props extends PageProps {
    users: User[];
}

export default function CommissionRuleCreate({ users }: Props) {
    const [form, setForm] = useState({
        user_id: '' as number | '',
        name: '',
        type: 'percentage' as 'percentage' | 'fixed',
        rate: '' as number | '',
        fixed_amount: '' as number | '',
        is_active: true,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/commission-rules', form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AppLayout>
            <Head title="New Commission Rule" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Commission Rule</h1>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Sales Rep *</label>
                        <select
                            value={form.user_id}
                            onChange={(e) => setForm({ ...form, user_id: e.target.value ? Number(e.target.value) : '' })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        >
                            <option value="">Select user…</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        {errors.user_id && <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Rule Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Type *</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                    </div>

                    {form.type === 'percentage' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Rate (0–1, e.g. 0.05 = 5%) *</label>
                            <input
                                type="number"
                                step="0.0001"
                                min="0"
                                max="1"
                                value={form.rate}
                                onChange={(e) => setForm({ ...form, rate: e.target.value ? Number(e.target.value) : '' })}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
                        </div>
                    )}

                    {form.type === 'fixed' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Fixed Amount *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.fixed_amount}
                                onChange={(e) => setForm({ ...form, fixed_amount: e.target.value ? Number(e.target.value) : '' })}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.fixed_amount && <p className="mt-1 text-xs text-red-600">{errors.fixed_amount}</p>}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="rounded border-slate-300"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <a href="/finance/commission-rules" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </a>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Create Rule'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
