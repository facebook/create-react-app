import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { CommissionRule } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    rules: Paginator<CommissionRule>;
}

function TypeBadge({ type }: { type: 'percentage' | 'fixed' }) {
    const colors = {
        percentage: 'bg-blue-100 text-blue-800',
        fixed: 'bg-purple-100 text-purple-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[type]}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
    );
}

export default function CommissionRulesIndex({ rules }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Commission Rules" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Commission Rules</h1>
                        <p className="mt-1 text-sm text-slate-500">{rules.total} rules</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/commission-rules/create">
                            <Button>New Rule</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'user',
                                header: 'Sales Rep',
                                render: (rule) => (
                                    <Link href={`/finance/commission-rules/${rule.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        {rule.user?.name ?? '—'}
                                    </Link>
                                ),
                            },
                            { key: 'name', header: 'Rule Name', render: (rule) => rule.name },
                            { key: 'type', header: 'Type', render: (rule) => <TypeBadge type={rule.type} /> },
                            {
                                key: 'rate',
                                header: 'Rate / Amount',
                                render: (rule) => rule.type === 'percentage'
                                    ? `${(Number(rule.rate) * 100).toFixed(2)}%`
                                    : `$${Number(rule.fixed_amount ?? 0).toFixed(2)}`,
                            },
                            {
                                key: 'is_active',
                                header: 'Active',
                                render: (rule) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {rule.is_active ? 'Yes' : 'No'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (rule) => (
                                    <div className="flex items-center gap-2">
                                        <Link href={`/finance/commission-rules/${rule.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                            View
                                        </Link>
                                        {can('finance.delete') && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this rule?')) {
                                                        router.delete(`/finance/commission-rules/${rule.id}`);
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={rules.data}
                        emptyMessage="No commission rules found."
                    />
                    <Pagination paginator={rules} />
                </div>
            </div>
        </AppLayout>
    );
}
