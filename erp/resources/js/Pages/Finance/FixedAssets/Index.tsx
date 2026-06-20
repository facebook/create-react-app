import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { AssetStatusBadge } from '@/Components/Finance/AssetStatusBadge';
import type { PageProps } from '@/types';

interface Asset {
    id: number;
    code: string | null;
    name: string;
    category: string;
    purchase_cost: number;
    accumulated_depreciation: number;
    net_book_value: number;
    status: 'active' | 'disposed' | 'fully_depreciated';
}

interface Props extends PageProps {
    assets: Asset[];
}

export default function Index({ assets }: Props) {
    return (
        <AppLayout>
            <Head title="Fixed Assets" />
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Fixed Assets</h1>
                    <Link
                        href="/finance/fixed-assets/create"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        New Asset
                    </Link>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Code</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-right font-medium">Purchase Cost</th>
                                <th className="px-4 py-3 text-right font-medium">Accum. Depreciation</th>
                                <th className="px-4 py-3 text-right font-medium">Net Book Value</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                        No fixed assets found.
                                    </td>
                                </tr>
                            ) : assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-600">
                                        <Link href={`/finance/fixed-assets/${asset.id}`} className="hover:text-indigo-600">
                                            {asset.code ?? '—'}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        <Link href={`/finance/fixed-assets/${asset.id}`} className="hover:text-indigo-600">
                                            {asset.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 capitalize text-slate-600">{asset.category}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{asset.purchase_cost.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{asset.accumulated_depreciation.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{asset.net_book_value.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <AssetStatusBadge status={asset.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
