import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Link } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function TaxRateCreate(_: PageProps) {
    const [form, setForm] = useState({
        name:        '',
        rate:        '' as number | '',
        tax_type:    'both' as 'sales' | 'purchase' | 'both',
        is_compound: false,
        is_active:   true,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/tax-rates', form as Record<string, unknown>, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    function fieldClass(name: string) {
        return `mt-1 block w-full rounded-md border ${errors[name] ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none`;
    }

    return (
        <AppLayout>
            <Head title="New Tax Rate" />
            <div className="mx-auto max-w-xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Tax Rate</h1>
                    <Link href="/finance/tax-rates">
                        <Button variant="secondary">Cancel</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className={fieldClass('name')}
                                placeholder="e.g. GST 10%"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Rate (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.0001"
                                value={form.rate}
                                onChange={(e) => setForm({ ...form, rate: e.target.value === '' ? '' : Number(e.target.value) })}
                                className={fieldClass('rate')}
                            />
                            {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tax Type</label>
                            <select
                                value={form.tax_type}
                                onChange={(e) => setForm({ ...form, tax_type: e.target.value as 'sales' | 'purchase' | 'both' })}
                                className={fieldClass('tax_type')}
                            >
                                <option value="sales">Sales</option>
                                <option value="purchase">Purchase</option>
                                <option value="both">Both</option>
                            </select>
                            {errors.tax_type && <p className="mt-1 text-xs text-red-600">{errors.tax_type}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_compound"
                                checked={form.is_compound}
                                onChange={(e) => setForm({ ...form, is_compound: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="is_compound" className="text-sm font-medium text-slate-700">Compound Tax</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Create Tax Rate'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
