import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface PutAwayRule {
    id: number;
    name: string;
    sequence: number;
    is_active: boolean;
    warehouse: { id: number; name: string } | null;
    product: { id: number; name: string; sku: string } | null;
    category: { id: number; name: string } | null;
    location_out_bin: { id: number; code: string; name: string } | null;
    location_out_zone: { id: number; name: string } | null;
}

interface Props extends PageProps {
    putAwayRules: { data: PutAwayRule[]; current_page: number; last_page: number };
}

export default function PutAwayRulesIndex({ putAwayRules }: Props) {
    function targetLabel(rule: PutAwayRule): string {
        if (rule.location_out_bin) return rule.location_out_bin.code;
        if (rule.location_out_zone) return rule.location_out_zone.name;
        return '—';
    }

    return (
        <AppLayout>
            <Head title="Put-Away Rules" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Put-Away Rules</h1>
                        <p className="text-sm text-slate-500 mt-1">{putAwayRules.data.length} rules</p>
                    </div>
                    <Link href="/inventory/put-away-rules/create">
                        <Button>New Rule</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Seq</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Warehouse</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Product / Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Target Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {putAwayRules.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No put-away rules found.
                                    </td>
                                </tr>
                            )}
                            {putAwayRules.data.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-600">{r.sequence}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/inventory/put-away-rules/${r.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {r.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{r.warehouse?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {r.product ? (
                                            <span>{r.product.name}</span>
                                        ) : r.category ? (
                                            <span className="text-slate-500 italic">{r.category.name}</span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{targetLabel(r)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {r.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {r.is_active ? (
                                                <button
                                                    onClick={() => router.post(`/inventory/put-away-rules/${r.id}/deactivate`)}
                                                    className="text-sm text-yellow-600 hover:text-yellow-800"
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.post(`/inventory/put-away-rules/${r.id}/activate`)}
                                                    className="text-sm text-green-600 hover:text-green-800"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            <Link href={`/inventory/put-away-rules/${r.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this rule?')) {
                                                        router.delete(`/inventory/put-away-rules/${r.id}`);
                                                    }
                                                }}
                                                className="text-sm text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
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
