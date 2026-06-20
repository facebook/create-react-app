import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface PutAwayRule {
    id: number;
    name: string;
    sequence: number;
    is_active: boolean;
    notes: string | null;
    warehouse: { id: number; name: string } | null;
    product: { id: number; name: string; sku: string } | null;
    category: { id: number; name: string } | null;
    location_in_zone: { id: number; name: string } | null;
    location_out_bin: { id: number; code: string; name: string } | null;
    location_out_zone: { id: number; name: string } | null;
}

interface Props extends PageProps {
    putAwayRule: PutAwayRule;
}

export default function PutAwayRuleShow({ putAwayRule }: Props) {
    return (
        <AppLayout>
            <Head title={`Put-Away Rule: ${putAwayRule.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{putAwayRule.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">{putAwayRule.warehouse?.name ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${putAwayRule.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {putAwayRule.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <Link href={`/inventory/put-away-rules/${putAwayRule.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Matching Criteria</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Sequence</dt>
                                <dd className="text-sm font-medium text-slate-900">{putAwayRule.sequence}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Product</dt>
                                <dd className="text-sm text-slate-700">{putAwayRule.product ? `${putAwayRule.product.name} (${putAwayRule.product.sku})` : '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Category</dt>
                                <dd className="text-sm text-slate-700">{putAwayRule.category?.name ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Incoming Zone</dt>
                                <dd className="text-sm text-slate-700">{putAwayRule.location_in_zone?.name ?? '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Target Location</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Target Bin</dt>
                                <dd className="text-sm text-slate-700">{putAwayRule.location_out_bin ? `${putAwayRule.location_out_bin.code} — ${putAwayRule.location_out_bin.name}` : '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-slate-500">Target Zone</dt>
                                <dd className="text-sm text-slate-700">{putAwayRule.location_out_zone?.name ?? '—'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {putAwayRule.notes && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-medium text-slate-500 mb-3">Notes</h2>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{putAwayRule.notes}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    {putAwayRule.is_active ? (
                        <button
                            onClick={() => router.post(`/inventory/put-away-rules/${putAwayRule.id}/deactivate`)}
                            className="inline-flex items-center px-4 py-2 text-sm text-yellow-600 border border-yellow-300 rounded-md hover:bg-yellow-50"
                        >
                            Deactivate
                        </button>
                    ) : (
                        <button
                            onClick={() => router.post(`/inventory/put-away-rules/${putAwayRule.id}/activate`)}
                            className="inline-flex items-center px-4 py-2 text-sm text-green-600 border border-green-300 rounded-md hover:bg-green-50"
                        >
                            Activate
                        </button>
                    )}
                    <Link href="/inventory/put-away-rules" className="inline-flex items-center px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                        &larr; Back to Rules
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
