import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface GoodsReceipt {
    id: number;
    supplier_name: string;
    supplier_reference: string | null;
    receipt_date: string;
    notes: string | null;
}

interface Props extends PageProps {
    goodsReceipt: GoodsReceipt;
}

export default function GoodsReceiptsEdit({ goodsReceipt }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        supplier_name: goodsReceipt.supplier_name,
        supplier_reference: goodsReceipt.supplier_reference ?? '',
        receipt_date: goodsReceipt.receipt_date,
        notes: goodsReceipt.notes ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/inventory/goods-receipts/${goodsReceipt.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit Goods Receipt #${goodsReceipt.id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Goods Receipt #{goodsReceipt.id}</h1>
                    <Link
                        href={`/inventory/goods-receipts/${goodsReceipt.id}`}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Back to receipt
                    </Link>
                </div>
                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Supplier Name *</label>
                        <input
                            type="text"
                            value={data.supplier_name}
                            onChange={(e) => setData('supplier_name', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        {errors.supplier_name && <p className="mt-1 text-xs text-red-600">{errors.supplier_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Supplier Reference</label>
                        <input
                            type="text"
                            value={data.supplier_reference}
                            onChange={(e) => setData('supplier_reference', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Receipt Date *</label>
                        <input
                            type="date"
                            value={data.receipt_date}
                            onChange={(e) => setData('receipt_date', e.target.value)}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        {errors.receipt_date && <p className="mt-1 text-xs text-red-600">{errors.receipt_date}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Link
                            href={`/inventory/goods-receipts/${goodsReceipt.id}`}
                            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
