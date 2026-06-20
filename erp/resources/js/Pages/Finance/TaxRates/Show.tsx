import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { TaxRate } from '@/types/finance';

interface Props extends PageProps {
    taxRate: TaxRate;
}

export default function TaxRateShow({ taxRate }: Props) {
    const { can } = usePermission();

    function handleDelete() {
        if (confirm('Delete this tax rate?')) {
            router.delete(`/finance/tax-rates/${taxRate.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Tax Rate: ${taxRate.name}`} />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{taxRate.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">Created {taxRate.created_at.slice(0, 10)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/tax-rates">
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
                            <dd className="mt-1 text-sm text-slate-900">{taxRate.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Rate</dt>
                            <dd className="mt-1 text-sm text-slate-900">{Number(taxRate.rate).toFixed(4)}%</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Tax Type</dt>
                            <dd className="mt-1 text-sm text-slate-900 capitalize">{taxRate.tax_type}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Compound</dt>
                            <dd className="mt-1 text-sm text-slate-900">{taxRate.is_compound ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${taxRate.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {taxRate.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
