import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Table } from '@/Components/Common/Table';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { TaxGroup, TaxGroupItem, TaxRate } from '@/types/finance';

interface Props extends PageProps {
    taxGroup: TaxGroup & { items?: TaxGroupItem[]; total_rate?: number };
    availableRates?: TaxRate[];
}

export default function TaxGroupShow({ taxGroup }: Props) {
    const { can } = usePermission();
    const [selectedRateId, setSelectedRateId] = useState('');
    const [addProcessing, setAddProcessing] = useState(false);

    function handleDelete() {
        if (confirm('Delete this tax group?')) {
            router.delete(`/finance/tax-groups/${taxGroup.id}`);
        }
    }

    function handleAddRate(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedRateId) return;
        setAddProcessing(true);
        router.post(`/finance/tax-groups/${taxGroup.id}/rates`, { tax_rate_id: selectedRateId }, {
            onFinish: () => { setAddProcessing(false); setSelectedRateId(''); },
        });
    }

    function handleRemoveRate(itemId: number) {
        if (confirm('Remove this tax rate from group?')) {
            router.delete(`/finance/tax-groups/${taxGroup.id}/rates/${itemId}`);
        }
    }

    const items = taxGroup.items ?? [];

    return (
        <AppLayout>
            <Head title={`Tax Group: ${taxGroup.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{taxGroup.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">Created {taxGroup.created_at.slice(0, 10)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/tax-groups">
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

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Name</dt>
                            <dd className="mt-1 text-sm text-slate-900">{taxGroup.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Total Rate</dt>
                            <dd className="mt-1 text-sm text-slate-900">{Number(taxGroup.total_rate ?? 0).toFixed(4)}%</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${taxGroup.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {taxGroup.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        {taxGroup.description && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900">{taxGroup.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-slate-900">Tax Rates in Group</h2>
                    </div>
                    <Table
                        columns={[
                            {
                                key: 'name',
                                header: 'Name',
                                render: (item) => item.tax_rate?.name ?? '—',
                            },
                            {
                                key: 'rate',
                                header: 'Rate (%)',
                                render: (item) => item.tax_rate ? `${Number(item.tax_rate.rate).toFixed(2)}%` : '—',
                            },
                            {
                                key: 'tax_type',
                                header: 'Type',
                                render: (item) => <span className="capitalize">{item.tax_rate?.tax_type ?? '—'}</span>,
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (item) => can('finance.delete') ? (
                                    <button
                                        onClick={() => handleRemoveRate(item.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                ) : null,
                            },
                        ]}
                        data={items}
                        emptyMessage="No tax rates in this group."
                    />
                </div>

                {can('finance.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-medium text-slate-900">Add Tax Rate</h2>
                        <form onSubmit={handleAddRate} className="flex gap-3">
                            <input
                                type="number"
                                placeholder="Tax Rate ID"
                                value={selectedRateId}
                                onChange={(e) => setSelectedRateId(e.target.value)}
                                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                name="tax_rate_id"
                            />
                            <Button type="submit" disabled={addProcessing || !selectedRateId}>
                                {addProcessing ? 'Adding...' : 'Add Rate'}
                            </Button>
                        </form>
                        <p className="mt-2 text-xs text-slate-500">Enter the Tax Rate ID to add it to this group.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
