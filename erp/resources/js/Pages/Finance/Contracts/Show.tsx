import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Contract } from '@/types/finance';

interface Props extends PageProps {
    contract: Contract;
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

export default function ContractShow({ contract }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this contract?')) {
            router.delete(`/finance/contracts/${contract.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={contract.title} />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{contract.title}</h1>
                        {contract.reference && (
                            <p className="mt-1 text-sm text-slate-500">Ref: {contract.reference}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/contracts">
                            <Button variant="secondary">Back</Button>
                        </Link>
                        {can('finance.create') && (
                            <Link href={`/finance/contracts/${contract.id}/edit`}>
                                <Button variant="secondary">Edit</Button>
                            </Link>
                        )}
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

                {/* Expiring warning banner */}
                {contract.is_expiring && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <p className="text-sm font-medium text-amber-800">
                                This contract is expiring soon (within {contract.renewal_notice_days} days).
                                {contract.auto_renew && ' It is set to auto-renew.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Details */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1"><StatusBadge status={contract.status} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Type</dt>
                            <dd className="mt-1"><TypeBadge type={contract.type} /></dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Contact</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {contract.contact
                                    ? <Link href={`/finance/contacts/${contract.contact_id}`} className="text-indigo-600 hover:text-indigo-800">
                                        {contract.contact.name}
                                      </Link>
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Value</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900">
                                {contract.value !== null
                                    ? `${contract.currency_code ?? ''} ${Number(contract.value).toFixed(2)}`.trim()
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Start Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{contract.start_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">End Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{contract.end_date ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Signed Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{contract.signed_at ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Auto Renew</dt>
                            <dd className="mt-1 text-sm text-slate-900">{contract.auto_renew ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Renewal Notice</dt>
                            <dd className="mt-1 text-sm text-slate-900">{contract.renewal_notice_days} days</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Created</dt>
                            <dd className="mt-1 text-sm text-slate-900">{contract.created_at}</dd>
                        </div>
                        {contract.description && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{contract.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Terms section */}
                {contract.terms && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-3 text-base font-semibold text-slate-900">Terms & Conditions</h2>
                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{contract.terms}</div>
                    </div>
                )}

                {/* Actions */}
                {can('finance.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-slate-700">Actions</h2>
                        <div className="flex flex-wrap gap-2">
                            {contract.status === 'draft' && (
                                <button
                                    onClick={() => router.post(`/finance/contracts/${contract.id}/activate`)}
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Activate
                                </button>
                            )}
                            {(contract.status === 'draft' || contract.status === 'active') && (
                                <button
                                    onClick={() => router.post(`/finance/contracts/${contract.id}/terminate`)}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Terminate
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
