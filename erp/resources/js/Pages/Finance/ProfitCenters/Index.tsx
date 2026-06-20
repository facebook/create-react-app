import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface ProfitCenter {
    id: number;
    code: string;
    name: string;
    type: string;
    status: string;
    budget: number | null;
}

interface Props extends PageProps {
    profitCenters: { data: ProfitCenter[]; current_page: number; last_page: number };
}

export default function ProfitCentersIndex({ profitCenters }: Props) {
    return (
        <AppLayout>
            <Head title="Profit Centers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Profit Centers</h1>
                        <p className="text-sm text-slate-500 mt-1">{profitCenters.data.length} profit centers</p>
                    </div>
                    <Link href="/finance/profit-centers/create">
                        <Button>New Center</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {profitCenters.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No profit centers found.
                                    </td>
                                </tr>
                            )}
                            {profitCenters.data.map((pc) => (
                                <tr key={pc.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{pc.code}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/finance/profit-centers/${pc.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {pc.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{pc.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {pc.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                                        {pc.budget != null ? `$${pc.budget.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            {pc.status === 'active' ? (
                                                <button
                                                    onClick={() => router.post(`/finance/profit-centers/${pc.id}/deactivate`)}
                                                    className="text-sm text-amber-600 hover:text-amber-800"
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.post(`/finance/profit-centers/${pc.id}/activate`)}
                                                    className="text-sm text-green-600 hover:text-green-800"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            <Link href={`/finance/profit-centers/${pc.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
                                                Edit
                                            </Link>
                                        </div>
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
