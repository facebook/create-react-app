import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

const DAY_OPTIONS = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

export default function ShiftTemplatesCreate(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        start_time: '',
        end_time: '',
        break_minutes: 0,
        days_of_week: [] as number[],
        color: '#6366f1',
        is_active: true,
    });

    function toggleDay(day: number) {
        const current = data.days_of_week;
        if (current.includes(day)) {
            setData('days_of_week', current.filter((d) => d !== day));
        } else {
            setData('days_of_week', [...current, day].sort());
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/shift-templates');
    }

    return (
        <AppLayout>
            <Head title="New Shift Template" />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">New Shift Template</h1>
                    <Link href="/hr/shift-templates" className="text-sm text-slate-500 hover:text-slate-700">Cancel</Link>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            placeholder="e.g. Morning Shift"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                            <input
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.start_time && <p className="mt-1 text-xs text-red-600">{errors.start_time}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time <span className="text-red-500">*</span></label>
                            <input
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            {errors.end_time && <p className="mt-1 text-xs text-red-600">{errors.end_time}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Break (minutes)</label>
                        <input
                            type="number"
                            min={0}
                            value={data.break_minutes}
                            onChange={(e) => setData('break_minutes', parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.break_minutes && <p className="mt-1 text-xs text-red-600">{errors.break_minutes}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Days of Week</label>
                        <div className="flex gap-2 flex-wrap">
                            {DAY_OPTIONS.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                        data.days_of_week.includes(day.value)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                        <input
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            className="h-9 w-16 rounded border border-slate-300 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <Link href="/hr/shift-templates" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Template'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
