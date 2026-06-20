import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ParentOption {
    id: number;
    code: string;
    name: string;
    type: string;
}

interface Props extends PageProps {
    parentOptions: ParentOption[];
}

const NORMAL_BALANCE_BY_TYPE: Record<string, 'debit' | 'credit'> = {
    asset:     'debit',
    expense:   'debit',
    liability: 'credit',
    equity:    'credit',
    revenue:   'credit',
};

export default function AccountCreate({ parentOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code:           '',
        name:           '',
        type:           'asset' as string,
        sub_type:       '',
        parent_id:      '',
        normal_balance: 'debit' as 'debit' | 'credit',
        description:    '',
        is_active:      true,
    });

    useEffect(() => {
        setData('normal_balance', NORMAL_BALANCE_BY_TYPE[data.type] ?? 'debit');
    }, [data.type]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/accounting/accounts');
    }

    return (
        <AppLayout>
            <Head title="New Account" />
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Account</h1>
                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="e.g. 1000"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Cash"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="asset">Asset</option>
                                <option value="liability">Liability</option>
                                <option value="equity">Equity</option>
                                <option value="revenue">Revenue</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sub-type</label>
                            <input
                                type="text"
                                value={data.sub_type}
                                onChange={(e) => setData('sub_type', e.target.value)}
                                placeholder="e.g. cash, accounts_receivable"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Normal Balance <span className="text-red-500">*</span></label>
                            <select
                                value={data.normal_balance}
                                onChange={(e) => setData('normal_balance', e.target.value as 'debit' | 'credit')}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Parent Account</label>
                            <select
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="">None</option>
                                {parentOptions.map((p) => (
                                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button href="/accounting/accounts" variant="secondary">Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Account</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
