import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    sub_type: string | null;
    parent_id: number | null;
    normal_balance: 'debit' | 'credit';
    description: string | null;
    is_active: boolean;
}

interface ParentOption {
    id: number;
    code: string;
    name: string;
    type: string;
}

interface Props extends PageProps {
    account: Account;
    parentOptions: ParentOption[];
}

const NORMAL_BALANCE_BY_TYPE: Record<string, 'debit' | 'credit'> = {
    asset:     'debit',
    expense:   'debit',
    liability: 'credit',
    equity:    'credit',
    revenue:   'credit',
};

export default function AccountEdit({ account, parentOptions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code:           account.code,
        name:           account.name,
        type:           account.type,
        sub_type:       account.sub_type ?? '',
        parent_id:      account.parent_id?.toString() ?? '',
        normal_balance: account.normal_balance,
        description:    account.description ?? '',
        is_active:      account.is_active,
    });

    useEffect(() => {
        setData('normal_balance', NORMAL_BALANCE_BY_TYPE[data.type] ?? 'debit');
    }, [data.type]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/accounting/accounts/${account.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Account" />
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Edit Account</h1>
                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
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
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Normal Balance</label>
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
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
