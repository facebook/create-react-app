import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { SalesOrderStatusBadge } from '@/Components/Finance/SalesOrderStatusBadge';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SalesOrder, SalesOrderStatus, Contact } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    salesOrders: Paginator<SalesOrder>;
    contacts: Pick<Contact, 'id' | 'name'>[];
    filters: { status?: SalesOrderStatus; contact_id?: number; search?: string };
}

const STATUS_TABS: Array<{ value: SalesOrderStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function SalesOrdersIndex({ salesOrders, contacts, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/sales-orders', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/finance/sales-orders', { ...filters, search }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Sales Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Sales Orders</h1>
                        <p className="text-sm text-slate-500 mt-1">{salesOrders.total} sales orders</p>
                    </div>
                    <div className="flex gap-2">
                        {can('finance.create') && (
                            <Link href="/finance/sales-orders/create"><Button>New Sales Order</Button></Link>
                        )}
                    </div>
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input name="search" type="text" defaultValue={filters.search ?? ''}
                                placeholder="Search by order number…"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                        <select value={filters.contact_id ?? ''}
                            onChange={(e) => router.get('/finance/sales-orders', { ...filters, contact_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Contacts</option>
                            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'number', header: 'Number', render: (so) => (
                                <Link href={`/finance/sales-orders/${so.id}`} className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    {so.number ?? `#${so.id}`}
                                </Link>
                            )},
                            { key: 'contact', header: 'Contact', render: (so) => so.contact?.name ?? '—' },
                            { key: 'warehouse', header: 'Warehouse', render: (so) => so.warehouse?.name ?? '—' },
                            { key: 'order_date', header: 'Order Date', render: (so) => so.order_date },
                            { key: 'total', header: 'Total', render: (so) => so.total !== undefined ? Number(so.total).toFixed(2) : '—' },
                            { key: 'status', header: 'Status', render: (so) => <SalesOrderStatusBadge status={so.status} /> },
                            { key: 'actions', header: '', render: (so) => (
                                <Link href={`/finance/sales-orders/${so.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                            )},
                        ]}
                        data={salesOrders.data}
                        emptyMessage="No sales orders found."
                    />
                    <Pagination paginator={salesOrders} />
                </div>
            </div>
        </AppLayout>
    );
}
