import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { TaxRate } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    taxRates: Paginator<TaxRate>;
    filters: { tax_type?: string };
}

type TaxType = 'sales' | 'purchase' | 'both';

const TYPE_COLORS: Record<TaxType, string> = {
    sales:    'bg-blue-100 text-blue-800',
    purchase: 'bg-purple-100 text-purple-800',
    both:     'bg-green-100 text-green-800',
};

function TypeBadge({ type }: { type: TaxType }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type]}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
    );
}

export default function TaxRatesIndex({ taxRates, filters }: Props) {
    const { can } = usePermission();

    function setTypeFilter(type: string) {
        router.get('/finance/tax-rates', { ...filters, tax_type: type || undefined }, { preserveState: true, replace: true });
    }

    const TYPE_TABS = [
        { value: '', label: 'All' },
        { value: 'sales', label: 'Sales' },
        { value: 'purchase', label: 'Purchase' },
        { value: 'both', label: 'Both' },
    ];

    return (
        <AppLayout>
            <Head title="Tax Rates" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Tax Rates</h1>
                        <p className="mt-1 text-sm text-slate-500">{taxRates.total} tax rates</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/tax-rates/create">
                            <Button>New Tax Rate</Button>
                        </Link>
                    )}
                </div>

                <div className="flex gap-1 border-b border-slate-200">
                    {TYPE_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setTypeFilter(tab.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                (filters.tax_type ?? '') === tab.value
                                    ? 'border-indigo-600 text-indigo-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'name',
                                header: 'Name',
                                render: (tr) => tr.name,
                            },
                            {
                                key: 'rate',
                                header: 'Rate (%)',
                                render: (tr) => `${Number(tr.rate).toFixed(2)}%`,
                            },
                            {
                                key: 'tax_type',
                                header: 'Tax Type',
                                render: (tr) => <TypeBadge type={tr.tax_type} />,
                            },
                            {
                                key: 'is_compound',
                                header: 'Compound',
                                render: (tr) => tr.is_compound ? 'Yes' : 'No',
                            },
                            {
                                key: 'is_active',
                                header: 'Status',
                                render: (tr) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tr.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {tr.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (tr) => (
                                    <Link href={`/finance/tax-rates/${tr.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                        data={taxRates.data}
                        emptyMessage="No tax rates found."
                    />
                    <Pagination paginator={taxRates} />
                </div>
            </div>
        </AppLayout>
    );
}
