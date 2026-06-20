import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { TaxRate } from '@/types/finance';

interface Props extends PageProps {
    taxRates: TaxRate[];
}

export default function TaxGroupCreate({ taxRates }: Props) {
    const [form, setForm] = useState({
        name:        '',
        description: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/finance/tax-groups', form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    function fieldClass(name: string) {
        return `mt-1 block w-full rounded-md border ${errors[name] ? 'border-red-500' : 'border-slate-300'} px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none`;
    }

    return (
        <AppLayout>
            <Head title="New Tax Group" />
            <div className="mx-auto max-w-xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Tax Group</h1>
                    <Link href="/finance/tax-groups">
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
                                placeholder="e.g. Standard Tax Group"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className={fieldClass('description')}
                                rows={3}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        {taxRates.length > 0 && (
                            <div className="rounded-md bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                    After creating the group, you can add tax rates from the group detail page.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Create Tax Group'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
