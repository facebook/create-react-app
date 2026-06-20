import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

export default function PayrollRunCreate(_: PageProps) {
    const { data, setData, post, errors, processing } = useForm({
        period_label: '',
        period_start: '',
        period_end: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/payroll-runs');
    }

    return (
        <AppLayout>
            <Head title="New Payroll Run" />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Payroll Run</h1>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Period Label
                            </label>
                            <input
                                type="text"
                                value={data.period_label}
                                onChange={(e) => setData('period_label', e.target.value)}
                                placeholder="e.g. June 2026"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.period_label && <p className="mt-1 text-xs text-red-600">{errors.period_label}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Period Start <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.period_start}
                                    onChange={(e) => setData('period_start', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    required
                                />
                                {errors.period_start && <p className="mt-1 text-xs text-red-600">{errors.period_start}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Period End <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.period_end}
                                    onChange={(e) => setData('period_end', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    required
                                />
                                {errors.period_end && <p className="mt-1 text-xs text-red-600">{errors.period_end}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <a href="/hr/payroll-runs">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </a>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Payroll Run'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
