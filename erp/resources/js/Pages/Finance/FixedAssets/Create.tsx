import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Account {
    id: number;
    code: string;
    name: string;
}

interface Props extends PageProps {
    assetAccounts: Account[];
    expenseAccounts: Account[];
}

const CATEGORIES = ['equipment', 'vehicle', 'building', 'furniture', 'intangible', 'other'] as const;

export default function Create({ assetAccounts, expenseAccounts }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: 'equipment',
        description: '',
        purchase_date: '',
        purchase_cost: '',
        salvage_value: '',
        useful_life_years: '5',
        asset_account_id: '',
        depreciation_account_id: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/fixed-assets');
    }

    return (
        <AppLayout>
            <Head title="New Fixed Asset" />
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Fixed Asset</h1>
                    <Link href="/finance/fixed-assets" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        &larr; Back
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
                        <select
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                        {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    {/* Purchase Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Purchase Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={data.purchase_date}
                            onChange={e => setData('purchase_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.purchase_date && <p className="mt-1 text-xs text-red-600">{errors.purchase_date}</p>}
                    </div>

                    {/* Purchase Cost + Salvage Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Purchase Cost <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.purchase_cost}
                                onChange={e => setData('purchase_cost', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.purchase_cost && <p className="mt-1 text-xs text-red-600">{errors.purchase_cost}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Salvage Value</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.salvage_value}
                                onChange={e => setData('salvage_value', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.salvage_value && <p className="mt-1 text-xs text-red-600">{errors.salvage_value}</p>}
                        </div>
                    </div>

                    {/* Useful Life */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Useful Life (years) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={data.useful_life_years}
                            onChange={e => setData('useful_life_years', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.useful_life_years && <p className="mt-1 text-xs text-red-600">{errors.useful_life_years}</p>}
                    </div>

                    {/* Asset Account */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Asset Account</label>
                        <select
                            value={data.asset_account_id}
                            onChange={e => setData('asset_account_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">— None —</option>
                            {assetAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                        {errors.asset_account_id && <p className="mt-1 text-xs text-red-600">{errors.asset_account_id}</p>}
                    </div>

                    {/* Depreciation Account */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Depreciation Expense Account</label>
                        <select
                            value={data.depreciation_account_id}
                            onChange={e => setData('depreciation_account_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">— None —</option>
                            {expenseAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                        {errors.depreciation_account_id && <p className="mt-1 text-xs text-red-600">{errors.depreciation_account_id}</p>}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/finance/fixed-assets" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Create Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
