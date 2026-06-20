import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { CreditNoteStatusBadge } from '@/Components/Finance/CreditNoteStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { CreditNote } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    creditNotes: Paginator<CreditNote>;
}

export default function CreditNotesIndex({ creditNotes }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Credit Notes" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Credit Notes</h1>
                        <p className="text-sm text-slate-500 mt-1">{creditNotes.total} credit notes</p>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.create') && (
                            <Link href="/finance/credit-notes/create"><Button>New Credit Note</Button></Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            { key: 'reference', header: 'Reference', render: (cn) => (
                                <Link href={`/finance/credit-notes/${cn.id}`} className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    {cn.reference}
                                </Link>
                            )},
                            { key: 'type', header: 'Type', render: (cn) => (
                                <span className="capitalize">{cn.type}</span>
                            )},
                            { key: 'contact', header: 'Contact', render: (cn) => cn.contact?.name ?? '—' },
                            { key: 'issue_date', header: 'Issue Date', render: (cn) => cn.issue_date },
                            { key: 'total', header: 'Total', render: (cn) => Number(cn.total).toFixed(2) },
                            { key: 'amount_applied', header: 'Applied', render: (cn) => Number(cn.amount_applied).toFixed(2) },
                            { key: 'amount_remaining', header: 'Remaining', render: (cn) => Number(cn.amount_remaining).toFixed(2) },
                            { key: 'status', header: 'Status', render: (cn) => <CreditNoteStatusBadge status={cn.status} /> },
                        ]}
                        data={creditNotes.data}
                        emptyMessage="No credit notes found."
                    />
                    <Pagination paginator={creditNotes} />
                </div>
            </div>
        </AppLayout>
    );
}
