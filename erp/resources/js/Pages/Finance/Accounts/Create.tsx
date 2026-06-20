import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Account, AccountType } from '@/types/finance';

interface Props extends PageProps {
    parentAccounts: Pick<Account, 'id' | 'code' | 'name' | 'type'>[];
}

const TYPES: AccountType[] = ['asset', 'liability', 'equity', 'income', 'expense'];

export default function AccountCreate({ parentAccounts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '', name: '', type: '' as AccountType | '',
        parent_id: '' as number | '', description: '', is_active: true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/accounts');
    }

    return (
        <AppLayout>
            <Head title="New Account" />
            <div className="mx-auto max-w-xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Account</h1>
                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
                            <input value={data.code} onChange={(e) => setData('code', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value as AccountType)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">Select type…</option>
                                {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                            </select>
                            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parent Account</label>
                        <select value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">None (top-level)</option>
                            {parentAccounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600" />
                        <span className="text-slate-700">Active</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Account</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
