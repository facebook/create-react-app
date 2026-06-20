import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { QcChecklist, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    checklists: Paginator<QcChecklist>;
}

export default function QcChecklistsIndex({ checklists }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="QC Checklists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">QC Checklists</h1>
                        <p className="text-sm text-slate-500 mt-1">{checklists.total} checklists</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/qc-checklists/create">
                            <Button>New Checklist</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Name</th>
                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                <th className="px-4 py-2 text-left font-medium">Items</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {checklists.data.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No checklists found.</td></tr>
                            ) : checklists.data.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.product?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.items_count ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/qc-checklists/${c.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {checklists.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {checklists.prev_page_url && (
                            <Link href={checklists.prev_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">&larr; Previous</Link>
                        )}
                        <span className="px-3 py-1.5 text-sm text-slate-500">Page {checklists.current_page} of {checklists.last_page}</span>
                        {checklists.next_page_url && (
                            <Link href={checklists.next_page_url} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Next &rarr;</Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
