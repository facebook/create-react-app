import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface GoodsReceipt {
    id: number;
    receipt_number: string | null;
    supplier_name: string;
    supplier_reference: string | null;
    receipt_date: string;
    status: string;
    created_at: string;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props extends PageProps {
    receipts: Paginator<GoodsReceipt>;
}

export default function GoodsReceiptsIndex({ receipts }: Props) {
    return (
        <AppLayout>
            <Head title="Goods Receipts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Goods Receipts</h1>
                    <Link
                        href="/inventory/goods-receipts/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        New Receipt
                    </Link>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Supplier</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {receipts.data.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{receipt.receipt_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        <Link href={`/inventory/goods-receipts/${receipt.id}`} className="hover:underline">
                                            {receipt.supplier_name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{receipt.supplier_reference ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{receipt.receipt_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{receipt.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
