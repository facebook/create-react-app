import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { SupplierContract, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    contracts: Paginator<SupplierContract>;
    suppliers: { id: number; name: string }[];
    filters: { supplier_id?: string; status?: string };
}

const statusColors: Record<string, string> = {
    active:     'bg-green-100 text-green-700',
    expired:    'bg-slate-100 text-slate-500',
    terminated: 'bg-red-100 text-red-600',
};

export default function SupplierContractsIndex({ contracts, suppliers, filters }: Props) {
    const { can } = usePermission();

    const { data, setData, post, processing, reset, errors } = useForm({
        supplier_id: '',
        title: '',
        contract_number: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        value: '',
        status: 'active',
        payment_terms: '',
    });

    function handleFilter(key: string, value: string) {
        router.get('/inventory/supplier-contracts', { ...filters, [key]: value || undefined }, {
            preserveState: true, replace: true,
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/supplier-contracts', { onSuccess: () => reset() });
    }

    function handleTerminate(contract: SupplierContract) {
        if (confirm(`Terminate contract "${contract.title}"?`)) {
            router.post(`/inventory/supplier-contracts/${contract.id}/terminate`);
        }
    }

    return (
        <AppLayout>
            <Head title="Supplier Contracts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Supplier Contracts</h1>
                        <p className="text-sm text-slate-500 mt-1">{contracts.total} contracts total</p>
                    </div>
                </div>

                {can('inventory.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                        <h2 className="text-base font-medium text-slate-800 mb-3">Add Contract</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
                                <select
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select supplier...</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="text-xs text-red-600 mt-1">{errors.supplier_id}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contract title..."
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Contract #</label>
                                <input
                                    type="text"
                                    value={data.contract_number}
                                    onChange={(e) => setData('contract_number', e.target.value)}
                                    placeholder="Optional..."
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Value</label>
                                <input
                                    type="number"
                                    value={data.value}
                                    onChange={(e) => setData('value', e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Terms</label>
                                <input
                                    type="text"
                                    value={data.payment_terms}
                                    onChange={(e) => setData('payment_terms', e.target.value)}
                                    placeholder="e.g. Net 30"
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-4 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Add Contract'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3 flex gap-3">
                        <select
                            value={filters.supplier_id ?? ''}
                            onChange={(e) => handleFilter('supplier_id', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'supplier', header: 'Supplier', render: (c) => c.supplier?.name ?? '—' },
                            { key: 'title', header: 'Title', render: (c) => (
                                <div>
                                    <span className="font-medium text-slate-900">{c.title}</span>
                                    {c.contract_number && (
                                        <span className="ml-2 text-xs text-slate-500">#{c.contract_number}</span>
                                    )}
                                    {c.is_expiring && (
                                        <span className="ml-2 text-xs font-medium text-amber-600">Expiring soon</span>
                                    )}
                                </div>
                            )},
                            { key: 'start_date', header: 'Start Date', render: (c) => c.start_date },
                            { key: 'end_date', header: 'End Date', render: (c) => c.end_date
                                ? <span className={c.is_expiring ? 'text-amber-600 font-medium' : ''}>{c.end_date}</span>
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'value', header: 'Value', render: (c) => c.value != null
                                ? `$${c.value.toLocaleString()}`
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'status', header: 'Status', render: (c) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status] ?? ''}`}>
                                    {c.status}
                                </span>
                            )},
                            { key: 'days_remaining', header: 'Days Left', render: (c) => c.days_remaining != null
                                ? <span className={c.days_remaining <= 30 ? 'text-amber-600 font-medium' : ''}>{c.days_remaining}d</span>
                                : <span className="text-slate-400">—</span>
                            },
                            { key: 'actions', header: '', render: (c) => (
                                <div className="flex items-center gap-2">
                                    {can('inventory.create') && c.status === 'active' && (
                                        <button
                                            onClick={() => handleTerminate(c)}
                                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Terminate
                                        </button>
                                    )}
                                    {can('inventory.delete') && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this contract?')) {
                                                    router.delete(`/inventory/supplier-contracts/${c.id}`);
                                                }
                                            }}
                                            className="text-xs text-slate-500 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={contracts.data}
                        emptyMessage="No contracts found."

                    />
                    <Pagination paginator={contracts} />
                </div>
            </div>
        </AppLayout>
    );
}
