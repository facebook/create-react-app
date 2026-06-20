import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Badge } from '@/Components/Common/Badge';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface SubcontractOrder {
    id: number;
    reference: string;
    vendor_id: number | null;
    finished_product: string;
    finished_qty: number;
    unit_price: number;
    status: 'draft' | 'sent' | 'in_progress' | 'received' | 'cancelled';
    notes: string | null;
    sent_at: string | null;
    received_at: string | null;
}

interface Props extends PageProps {
    orders: Paginator<SubcontractOrder>;
    filters: { status?: string };
}

const STATUS_COLORS: Record<string, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
    draft:       'gray',
    sent:        'blue',
    in_progress: 'yellow',
    received:    'green',
    cancelled:   'red',
};

const STATUS_LABELS: Record<string, string> = {
    draft:       'Draft',
    sent:        'Sent',
    in_progress: 'In Progress',
    received:    'Received',
    cancelled:   'Cancelled',
};

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function SubcontractingIndex({ orders, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        reference: '',
        vendor_id: '',
        finished_product: '',
        finished_qty: '',
        unit_price: '',
        notes: '',
    });

    function setStatus(status: string) {
        router.get('/subcontracting/orders', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/subcontracting/orders', {
            reference:        form.reference,
            vendor_id:        form.vendor_id || undefined,
            finished_product: form.finished_product,
            finished_qty:     form.finished_qty,
            unit_price:       form.unit_price,
            notes:            form.notes || undefined,
        }, {
            onSuccess: () => {
                setShowForm(false);
                setForm({ reference: '', vendor_id: '', finished_product: '', finished_qty: '', unit_price: '', notes: '' });
            },
        });
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const totalCost = (order: SubcontractOrder) => (order.unit_price * order.finished_qty).toFixed(2);

    return (
        <AppLayout>
            <Head title="Subcontracting" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Subcontracting</h1>
                        <p className="text-sm text-slate-500 mt-1">{orders.total} subcontract orders</p>
                    </div>
                    <Button onClick={() => setShowForm(v => !v)}>
                        {showForm ? 'Cancel' : 'New Order'}
                    </Button>
                </div>

                {/* Inline new order form */}
                {showForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">New Subcontract Order</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reference *</label>
                                <input
                                    name="reference"
                                    value={form.reference}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="SC-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor ID</label>
                                <input
                                    name="vendor_id"
                                    value={form.vendor_id}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="(optional)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Finished Product *</label>
                                <input
                                    name="finished_product"
                                    value={form.finished_product}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Widget Assembly"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                                <input
                                    name="finished_qty"
                                    type="number"
                                    step="0.0001"
                                    min="0.0001"
                                    value={form.finished_qty}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price *</label>
                                <input
                                    name="unit_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.unit_price}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2">
                                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit">Create Order</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Status tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.status ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'reference',
                                header: 'Reference',
                                render: (order) => (
                                    <Link
                                        href={`/subcontracting/orders/${order.id}`}
                                        className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        {order.reference}
                                    </Link>
                                ),
                            },
                            {
                                key: 'vendor_id',
                                header: 'Vendor',
                                render: (order) => order.vendor_id ? `Vendor #${order.vendor_id}` : '—',
                            },
                            {
                                key: 'finished_product',
                                header: 'Product',
                                render: (order) => order.finished_product,
                            },
                            {
                                key: 'finished_qty',
                                header: 'Qty',
                                render: (order) => Number(order.finished_qty).toFixed(2),
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (order) => (
                                    <Badge color={STATUS_COLORS[order.status] ?? 'gray'}>
                                        {STATUS_LABELS[order.status] ?? order.status}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'total_cost',
                                header: 'Total Cost',
                                render: (order) => totalCost(order),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (order) => (
                                    <Link
                                        href={`/subcontracting/orders/${order.id}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={orders.data}
                        emptyMessage="No subcontract orders found."
                    />
                    <Pagination paginator={orders} />
                </div>
            </div>
        </AppLayout>
    );
}
