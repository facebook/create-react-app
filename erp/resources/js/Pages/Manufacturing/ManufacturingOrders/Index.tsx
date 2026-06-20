import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Product { id: number; name: string; sku: string; }
interface Bom { id: number; name: string; }

interface MO {
    id: number;
    mo_number: string | null;
    product: Product;
    bom: Bom | null;
    qty_to_produce: number;
    qty_produced: number;
    status: string;
    scheduled_date: string | null;
}

interface Paginator<T> {
    data: T[];
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    orders: Paginator<MO>;
    filters: { search?: string; status?: string };
}

const statusBadge: Record<string, string> = {
    draft:       'bg-slate-100 text-slate-800',
    confirmed:   'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    done:        'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
};

export default function ManufacturingOrdersIndex({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/manufacturing/manufacturing-orders', { search }, { preserveState: true, replace: true });
    }

    function handleAction(id: number, action: string) {
        router.post(`/manufacturing/manufacturing-orders/${id}/${action}`);
    }

    function handleDelete(id: number) {
        if (confirm('Delete this manufacturing order?')) {
            router.delete(`/manufacturing/manufacturing-orders/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Manufacturing Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Manufacturing Orders</h1>
                        <p className="text-sm text-slate-500 mt-1">{orders.total} orders total</p>
                    </div>
                    <Link href="/manufacturing/manufacturing-orders/create">
                        <Button>New MO</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search MO number..." className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">MO #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">BOM</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Qty to Produce</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Qty Produced</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {orders.data.map((mo) => (
                                    <tr key={mo.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <Link href={`/manufacturing/manufacturing-orders/${mo.id}`} className="text-indigo-600 hover:text-indigo-800">
                                                {mo.mo_number ?? `#${mo.id}`}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{mo.product.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{mo.bom?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{mo.qty_to_produce}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{mo.qty_produced}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[mo.status] ?? 'bg-slate-100 text-slate-800'}`}>
                                                {mo.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{mo.scheduled_date ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                {mo.status === 'draft' && (
                                                    <button onClick={() => handleAction(mo.id, 'confirm')} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 hover:bg-blue-200">Confirm</button>
                                                )}
                                                {mo.status === 'confirmed' && (
                                                    <button onClick={() => handleAction(mo.id, 'start')} className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 hover:bg-yellow-200">Start</button>
                                                )}
                                                {mo.status === 'in_progress' && (
                                                    <button onClick={() => handleAction(mo.id, 'complete')} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200">Complete</button>
                                                )}
                                                <button onClick={() => handleDelete(mo.id)} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">No manufacturing orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
