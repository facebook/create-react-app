import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface RentalItem {
    id: number;
    name: string;
}

interface RentalAgreement {
    id: number;
    rental_item_id: number;
    customer_name: string;
    customer_email: string | null;
    start_date: string;
    end_date: string | null;
    daily_rate: string | number;
    deposit: string | number;
    status: 'active' | 'returned' | 'overdue' | 'cancelled';
    notes: string | null;
    item?: RentalItem | null;
}

interface Props extends PageProps {
    agreements: Paginator<RentalAgreement>;
    filters: { status?: string };
}

const AGREEMENT_STATUS_BADGE: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    returned:  'bg-slate-100 text-slate-600',
    overdue:   'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
};

function daysBetween(start: string, end: string | null): number {
    if (!end) return '—' as unknown as number;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
}

export default function AgreementsPage({ agreements, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Rental Agreements" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Rental Agreements</h1>
                        <p className="text-sm text-slate-500 mt-1">{agreements.total} agreements total</p>
                    </div>
                    <a
                        href="/rental/items"
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Back to Items
                    </a>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table<RentalAgreement>
                        columns={[
                            {
                                key: 'item',
                                header: 'Item',
                                render: (ag) => (
                                    <span className="font-medium text-slate-800">
                                        {ag.item?.name ?? `Item #${ag.rental_item_id}`}
                                    </span>
                                ),
                            },
                            {
                                key: 'customer_name',
                                header: 'Customer',
                                render: (ag) => (
                                    <div>
                                        <p className="text-sm text-slate-800">{ag.customer_name}</p>
                                        {ag.customer_email && (
                                            <p className="text-xs text-slate-400">{ag.customer_email}</p>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'start_date',
                                header: 'Start',
                                render: (ag) => <span className="text-sm text-slate-600">{ag.start_date}</span>,
                            },
                            {
                                key: 'end_date',
                                header: 'End',
                                render: (ag) => (
                                    <span className="text-sm text-slate-600">{ag.end_date ?? '—'}</span>
                                ),
                            },
                            {
                                key: 'days',
                                header: 'Days',
                                render: (ag) => (
                                    <span className="text-sm text-slate-600">
                                        {ag.end_date
                                            ? String(daysBetween(ag.start_date, ag.end_date))
                                            : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (ag) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${AGREEMENT_STATUS_BADGE[ag.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
                                    </span>
                                ),
                            },
                        ]}
                        data={agreements.data}
                        emptyMessage="No rental agreements found."
                    />
                    <Pagination paginator={agreements} />
                </div>
            </div>
        </AppLayout>
    );
}
