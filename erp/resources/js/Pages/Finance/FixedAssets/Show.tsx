import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { AssetStatusBadge } from '@/Components/Finance/AssetStatusBadge';
import type { PageProps } from '@/types';

interface DepreciationEntry {
    id: number;
    period_date: string;
    amount: number;
    journal_entry_id: number | null;
}

interface Asset {
    id: number;
    code: string | null;
    name: string;
    category: string;
    description: string | null;
    purchase_date: string;
    purchase_cost: number;
    salvage_value: number;
    useful_life_years: number;
    accumulated_depreciation: number;
    net_book_value: number;
    annual_depreciation: number;
    status: 'active' | 'disposed' | 'fully_depreciated';
    disposal_date: string | null;
    disposal_proceeds: number | null;
    asset_account_id: number | null;
    depreciation_account_id: number | null;
}

interface Props extends PageProps {
    asset: Asset;
    entries: DepreciationEntry[];
}

export default function Show({ asset, entries }: Props) {
    const depreciateForm = useForm({ period_date: '' });
    const disposeForm = useForm({ disposal_date: '', disposal_proceeds: '' });

    function handleDepreciate(e: React.FormEvent) {
        e.preventDefault();
        depreciateForm.post(`/finance/fixed-assets/${asset.id}/depreciate`);
    }

    function handleDispose(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm('Are you sure you want to dispose this asset?')) return;
        disposeForm.post(`/finance/fixed-assets/${asset.id}/dispose`);
    }

    function handleDelete() {
        if (!confirm(`Delete asset "${asset.name}"?`)) return;
        router.delete(`/finance/fixed-assets/${asset.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Asset: ${asset.name}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{asset.name}</h1>
                            <AssetStatusBadge status={asset.status} />
                        </div>
                        {asset.code && (
                            <p className="mt-1 text-sm text-slate-500 font-mono">{asset.code}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {asset.status === 'active' && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Delete
                            </button>
                        )}
                        <Link href="/finance/fixed-assets" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            &larr; Back
                        </Link>
                    </div>
                </div>

                {/* Asset Detail Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Category</dt>
                            <dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{asset.category}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Purchase Date</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.purchase_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Purchase Cost</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.purchase_cost.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Salvage Value</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.salvage_value.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Useful Life</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.useful_life_years} years</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Annual Depreciation</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.annual_depreciation.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Accumulated Depreciation</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.accumulated_depreciation.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Net Book Value</dt>
                            <dd className="mt-1 text-sm font-bold text-indigo-700">{asset.net_book_value.toFixed(2)}</dd>
                        </div>
                        {asset.description && (
                            <div className="col-span-3">
                                <dt className="text-xs font-medium uppercase text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-700">{asset.description}</dd>
                            </div>
                        )}
                        {asset.status === 'disposed' && (
                            <>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Disposal Date</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">{asset.disposal_date}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium uppercase text-slate-500">Disposal Proceeds</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                                        {asset.disposal_proceeds !== null ? asset.disposal_proceeds.toFixed(2) : '—'}
                                    </dd>
                                </div>
                            </>
                        )}
                    </dl>
                </div>

                {/* Run Depreciation (only when active) */}
                {asset.status === 'active' && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">Run Depreciation</h2>
                        <form onSubmit={handleDepreciate} className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700">Period Date</label>
                                <input
                                    type="date"
                                    value={depreciateForm.data.period_date}
                                    onChange={e => depreciateForm.setData('period_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {depreciateForm.errors.period_date && (
                                    <p className="mt-1 text-xs text-red-600">{depreciateForm.errors.period_date}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={depreciateForm.processing}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {depreciateForm.processing ? 'Running…' : 'Run Depreciation'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Depreciation History */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Depreciation History</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Period Date</th>
                                <th className="px-4 py-3 text-right font-medium">Amount</th>
                                <th className="px-4 py-3 text-left font-medium">Journal Entry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                        No depreciation entries yet.
                                    </td>
                                </tr>
                            ) : entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-800">{entry.period_date}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{entry.amount.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        {entry.journal_entry_id ? (
                                            <Link
                                                href={`/finance/journal-entries/${entry.journal_entry_id}`}
                                                className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                JE #{entry.journal_entry_id}
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Dispose Asset (only when active) */}
                {asset.status === 'active' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">Dispose Asset</h2>
                        <form onSubmit={handleDispose} className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700">Disposal Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={disposeForm.data.disposal_date}
                                    onChange={e => disposeForm.setData('disposal_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {disposeForm.errors.disposal_date && (
                                    <p className="mt-1 text-xs text-red-600">{disposeForm.errors.disposal_date}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700">Disposal Proceeds</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={disposeForm.data.disposal_proceeds}
                                    onChange={e => disposeForm.setData('disposal_proceeds', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {disposeForm.errors.disposal_proceeds && (
                                    <p className="mt-1 text-xs text-red-600">{disposeForm.errors.disposal_proceeds}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={disposeForm.processing}
                                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                            >
                                {disposeForm.processing ? 'Disposing…' : 'Dispose Asset'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
