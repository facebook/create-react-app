import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Period {
    id: number;
    name: string;
    fiscal_year: number;
    start_date: string;
    end_date: string;
    status: 'open' | 'closed' | 'locked';
    quarter: number | null;
}

interface Props extends PageProps {
    periods: Period[];
}

const STATUS_BADGE: Record<string, string> = {
    open:   'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-600',
    locked: 'bg-red-100 text-red-700',
};

export default function PeriodsIndex({ periods }: Props) {
    const { flash } = usePage<PageProps>().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        name:        '',
        start_date:  '',
        end_date:    '',
        fiscal_year: new Date().getFullYear().toString(),
        quarter:     '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/accounting/periods', {
            onSuccess: () => reset(),
        });
    }

    function closePeriod(id: number) {
        if (confirm('Close this period? No new entries can be posted to a closed period.')) {
            router.post(`/accounting/periods/${id}/close`);
        }
    }

    return (
        <AppLayout>
            <Head title="Accounting Periods" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Accounting Periods</h1>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* New Period Form */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">New Period</h2>
                    <form onSubmit={submit} className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. FY2026 Q1"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={data.fiscal_year}
                                onChange={(e) => setData('fiscal_year', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quarter</label>
                            <select
                                value={data.quarter}
                                onChange={(e) => setData('quarter', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            >
                                <option value="">None</option>
                                <option value="1">Q1</option>
                                <option value="2">Q2</option>
                                <option value="3">Q3</option>
                                <option value="4">Q4</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={processing} className="w-full">Create Period</Button>
                        </div>
                    </form>
                </div>

                {/* Periods Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Fiscal Year</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Start Date</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">End Date</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {periods.map((period) => (
                                <tr key={period.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{period.name}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {period.fiscal_year}{period.quarter ? ` Q${period.quarter}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{period.start_date}</td>
                                    <td className="px-4 py-3 text-slate-600">{period.end_date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[period.status] ?? ''}`}>
                                            {period.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {period.status === 'open' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => closePeriod(period.id)}
                                            >
                                                Close
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {periods.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No periods yet.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
