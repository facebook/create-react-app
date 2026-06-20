import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { CommissionRule, Commission } from '@/types/finance';

interface Props extends PageProps {
    rule: CommissionRule & { commissions: Commission[] };
}

type CommissionStatus = 'pending' | 'approved' | 'paid';

function StatusBadge({ status }: { status: CommissionStatus }) {
    const colors: Record<CommissionStatus, string> = {
        pending:  'bg-amber-100 text-amber-800',
        approved: 'bg-blue-100 text-blue-800',
        paid:     'bg-green-100 text-green-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function CommissionRuleShow({ rule }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this commission rule?')) {
            router.delete(`/finance/commission-rules/${rule.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Commission Rule: ${rule.name}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{rule.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">{rule.user?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/commission-rules">
                            <Button variant="secondary">Back</Button>
                        </Link>
                        {can('finance.delete') && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                {/* Rule Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Sales Rep</dt>
                            <dd className="mt-1 text-sm text-slate-900">{rule.user?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Type</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{rule.type}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">
                                {rule.type === 'percentage' ? 'Rate' : 'Fixed Amount'}
                            </dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {rule.type === 'percentage'
                                    ? `${(Number(rule.rate) * 100).toFixed(2)}%`
                                    : `$${Number(rule.fixed_amount ?? 0).toFixed(2)}`}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Active</dt>
                            <dd className="mt-1 text-sm text-slate-900">{rule.is_active ? 'Yes' : 'No'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Recent Commissions */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Commissions</h2>
                    </div>
                    <Table
                        columns={[
                            {
                                key: 'invoice',
                                header: 'Invoice',
                                render: (c) => c.invoice
                                    ? <Link href={`/finance/commissions/${c.id}`} className="text-indigo-600 hover:text-indigo-800">
                                        {c.invoice.number ?? `#${c.invoice.id}`}
                                      </Link>
                                    : '—',
                            },
                            {
                                key: 'invoice_amount',
                                header: 'Invoice Amount',
                                render: (c) => `$${Number(c.invoice_amount).toFixed(2)}`,
                            },
                            {
                                key: 'commission_amount',
                                header: 'Commission',
                                render: (c) => `$${Number(c.commission_amount).toFixed(2)}`,
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (c) => <StatusBadge status={c.status} />,
                            },
                        ]}
                        data={rule.commissions ?? []}
                        emptyMessage="No commissions yet."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
