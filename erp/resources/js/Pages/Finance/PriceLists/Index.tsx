import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { PriceList } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    priceLists: Paginator<PriceList>;
}

export default function PriceListIndex({ priceLists, auth }: Props) {
    const canCreate = auth.user?.permissions?.includes('finance.create');

    return (
        <AppLayout>
            <Head title="Price Lists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Price Lists</h1>
                    {canCreate && (
                        <Link href="/finance/price-lists/create">
                            <Button>New Price List</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Currency</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Default</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valid From</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valid To</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {priceLists.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No price lists yet. Create one to get started.
                                    </td>
                                </tr>
                            )}
                            {priceLists.data.map((pl) => (
                                <tr key={pl.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        <Link href={`/finance/price-lists/${pl.id}`} className="hover:text-indigo-600">
                                            {pl.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{pl.currency_code}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {pl.is_default && (
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700">
                                                Default
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{pl.items_count ?? 0}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{pl.valid_from ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{pl.valid_to ?? '—'}</td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <Link
                                            href={`/finance/price-lists/${pl.id}`}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {priceLists.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Showing {priceLists.from}–{priceLists.to} of {priceLists.total}</span>
                        <div className="flex gap-2">
                            {priceLists.prev_page_url && (
                                <Link href={priceLists.prev_page_url} className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50">
                                    Previous
                                </Link>
                            )}
                            {priceLists.next_page_url && (
                                <Link href={priceLists.next_page_url} className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
