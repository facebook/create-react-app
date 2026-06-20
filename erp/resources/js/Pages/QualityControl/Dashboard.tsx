import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Stats {
    open_ncrs: number;
    failed_inspections: number;
    pending_inspections: number;
    pass_rate: number;
}

interface Props extends PageProps {
    stats: Stats;
}

export default function QualityControlDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Quality Control" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Quality Control</h1>
                    <p className="text-sm text-slate-500 mt-1">Overview of quality metrics and activities</p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Open NCRs</p>
                        <p className="mt-2 text-3xl font-bold text-red-600">{stats.open_ncrs}</p>
                        <p className="mt-1 text-xs text-slate-400">Non-conformance reports</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Failed Inspections</p>
                        <p className="mt-2 text-3xl font-bold text-orange-600">{stats.failed_inspections}</p>
                        <p className="mt-1 text-xs text-slate-400">Total failed</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Pending Inspections</p>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending_inspections}</p>
                        <p className="mt-1 text-xs text-slate-400">Awaiting inspection</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Average Pass Rate</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">{stats.pass_rate}%</p>
                        <p className="mt-1 text-xs text-slate-400">Across all inspections</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link
                        href="/quality/checklists"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Checklists</p>
                            <p className="text-sm text-slate-500">Manage QC checklists</p>
                        </div>
                    </Link>

                    <Link
                        href="/quality/inspections"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Inspections</p>
                            <p className="text-sm text-slate-500">View and manage inspections</p>
                        </div>
                    </Link>

                    <Link
                        href="/quality/ncrs"
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">NCRs</p>
                            <p className="text-sm text-slate-500">Non-conformance reports</p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
