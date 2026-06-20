import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface WarehouseCard {
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    country: string | null;
    costing_method: string;
    is_active: boolean;
    product_count: number;
}

interface Summary {
    total_warehouses: number;
    active_warehouses: number;
    total_products: number;
}

interface Props extends PageProps {
    warehouses: WarehouseCard[];
    summary: Summary;
}

const COSTING_COLORS: Record<string, string> = {
    average: 'bg-blue-100 text-blue-700',
    fifo:    'bg-purple-100 text-purple-700',
    lifo:    'bg-orange-100 text-orange-700',
};

export default function MultiWarehouseIndex({ warehouses, summary }: Props) {
    return (
        <AppLayout>
            <Head title="Multi-Warehouse Overview" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Multi-Warehouse Overview</h1>

                {/* KPI Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Warehouses</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{summary.total_warehouses}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Active Warehouses</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-600">{summary.active_warehouses}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Products (in stock)</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{summary.total_products}</p>
                    </div>
                </div>

                {/* Warehouse Cards Grid */}
                {warehouses.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
                        No warehouses found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {warehouses.map(w => (
                            <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="mb-3 flex items-start justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">{w.name}</h2>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COSTING_COLORS[w.costing_method] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {w.costing_method.toUpperCase()}
                                        </span>
                                        {!w.is_active && (
                                            <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                {(w.city || w.country) && (
                                    <p className="mb-1 text-sm text-slate-500">
                                        {[w.city, w.country].filter(Boolean).join(', ')}
                                    </p>
                                )}
                                {w.address && (
                                    <p className="mb-2 text-xs text-slate-400">{w.address}</p>
                                )}
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <div>
                                        <p className="text-xs text-slate-400">Products in stock</p>
                                        <p className="text-xl font-bold text-slate-900">{w.product_count}</p>
                                    </div>
                                    <Link
                                        href={`/inventory/warehouses/${w.id}`}
                                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
