import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { TaxGroup } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    taxGroups: Paginator<TaxGroup>;
}

export default function TaxGroupsIndex({ taxGroups }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Tax Groups" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Tax Groups</h1>
                        <p className="mt-1 text-sm text-slate-500">{taxGroups.total} tax groups</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/tax-groups/create">
                            <Button>New Tax Group</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'name',
                                header: 'Name',
                                render: (tg) => tg.name,
                            },
                            {
                                key: 'items_count',
                                header: 'Tax Rates',
                                render: (tg) => tg.items_count ?? 0,
                            },
                            {
                                key: 'is_active',
                                header: 'Status',
                                render: (tg) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tg.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {tg.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (tg) => (
                                    <Link href={`/finance/tax-groups/${tg.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={taxGroups.data}
                        emptyMessage="No tax groups found."
                    />
                    <Pagination paginator={taxGroups} />
                </div>
            </div>
        </AppLayout>
    );
}
