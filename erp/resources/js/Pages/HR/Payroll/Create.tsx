import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {}

export default function PayrollCreate(_props: Props) {
    const { data, setData, post, processing, errors } = useForm({
        period_start: '',
        period_end: '',
        run_date: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/payroll');
    }

    return (
        <AppLayout>
            <Head title="New Payroll Run" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Payroll Run</h1>
                    <p className="text-sm text-slate-500 mt-1">Create a new payroll run.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Period Start <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.period_start}
                            onChange={(e) => setData('period_start', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.period_end && <p className="mt-1 text-xs text-red-600">{errors.period_end}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Run Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.run_date}
                            onChange={(e) => setData('run_date', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.run_date && <p className="mt-1 text-xs text-red-600">{errors.run_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Notes <span className="text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/hr/payroll">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create Payroll Run'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
