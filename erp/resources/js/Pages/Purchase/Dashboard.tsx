import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    total_vendors: number;
    open_rfqs: number;
    open_pos: number;
    received_this_month: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Purchase Dashboard" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Purchase</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage vendors, RFQs, and purchase orders</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Vendors</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total_vendors}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Open RFQs</p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{stats.open_rfqs}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Open POs</p>
                        <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.open_pos}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Received This Month</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">{stats.received_this_month}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link
                        href="/purchase/vendors"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Vendors</p>
                            <p className="text-xs text-slate-500">Manage supplier list</p>
                        </div>
                    </Link>

                    <Link
                        href="/purchase/rfqs"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">RFQs</p>
                            <p className="text-xs text-slate-500">Request for Quotations</p>
                        </div>
                    </Link>

                    <Link
                        href="/purchase/pos"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Purchase Orders</p>
                            <p className="text-xs text-slate-500">Confirmed POs</p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
