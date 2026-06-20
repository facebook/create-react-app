import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Contract } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    contracts: Paginator<Contract>;
    filters: { status?: string; type?: string };
}

type ContractType   = 'client' | 'vendor' | 'employment' | 'nda' | 'other';
type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';

const TYPE_COLORS: Record<ContractType, string> = {
    client:     'bg-blue-100 text-blue-800',
    vendor:     'bg-indigo-100 text-indigo-800',
    employment: 'bg-green-100 text-green-800',
    nda:        'bg-amber-100 text-amber-800',
    other:      'bg-slate-100 text-slate-800',
};

const STATUS_COLORS: Record<ContractStatus, string> = {
    draft:      'bg-slate-100 text-slate-800',
    active:     'bg-green-100 text-green-800',
    expired:    'bg-red-100 text-red-800',
    terminated: 'bg-red-100 text-red-800',
};

function TypeBadge({ type }: { type: ContractType }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type]}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
    );
}

function StatusBadge({ status }: { status: ContractStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const STATUS_TABS: Array<{ value: ContractStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'terminated', label: 'Terminated' },
];

const TYPE_OPTIONS: Array<{ value: ContractType | ''; label: string }> = [
    { value: '', label: 'All types' },
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'employment', label: 'Employment' },
    { value: 'nda', label: 'NDA' },
    { value: 'other', label: 'Other' },
];

export default function ContractsIndex({ contracts, filters }: Props) {
    const { can } = usePermission();

    function setStatus(status: string) {
        router.get('/finance/contracts', { ...filters, status: status || undefined }, { preserveState: true, replace: true });
    }

    function setType(type: string) {
        router.get('/finance/contracts', { ...filters, type: type || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Contracts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Contracts</h1>
                        <p className="mt-1 text-sm text-slate-500">{contracts.total} contracts</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/contracts/create">
                            <Button>New Contract</Button>
                        </Link>
                    )}
                </div>

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

                {/* Type filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Filter by type:</label>
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => setType(e.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                        {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'title',
                                header: 'Title',
                                render: (c) => (
                                    <div>
                                        <Link href={`/finance/contracts/${c.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {c.title}
                                        </Link>
                                        {c.is_expiring && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                Expiring Soon
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'reference',
                                header: 'Reference',
                                render: (c) => c.reference ?? '—',
                            },
                            {
                                key: 'contact',
                                header: 'Contact',
                                render: (c) => c.contact?.name ?? '—',
                            },
                            {
                                key: 'type',
                                header: 'Type',
                                render: (c) => <TypeBadge type={c.type} />,
                            },
                            {
                                key: 'status',
                                header: 'Status',
                                render: (c) => <StatusBadge status={c.status} />,
                            },
                            {
                                key: 'value',
                                header: 'Value',
                                render: (c) => c.value !== null
                                    ? `${c.currency_code ?? '$'} ${Number(c.value).toFixed(2)}`
                                    : '—',
                            },
                            {
                                key: 'end_date',
                                header: 'End Date',
                                render: (c) => c.end_date ?? '—',
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (c) => (
                                    <Link href={`/finance/contracts/${c.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        View
                                    </Link>
                                ),
                            },
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
