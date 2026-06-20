import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

const DAYS = [
    { key: 'monday',    label: 'Monday' },
    { key: 'tuesday',   label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday',  label: 'Thursday' },
    { key: 'friday',    label: 'Friday' },
    { key: 'saturday',  label: 'Saturday' },
    { key: 'sunday',    label: 'Sunday' },
] as const;

type DayKey = typeof DAYS[number]['key'];
type FormData = {
    name: string;
    is_default: boolean;
} & {
    [K in `${DayKey}_start` | `${DayKey}_end`]: string;
};

export default function CreateWorkSchedule(_props: PageProps) {
    const initialData: FormData = {
        name:       '',
        is_default: false,
        monday_start:    '', monday_end:    '',
        tuesday_start:   '', tuesday_end:   '',
        wednesday_start: '', wednesday_end: '',
        thursday_start:  '', thursday_end:  '',
        friday_start:    '', friday_end:    '',
        saturday_start:  '', saturday_end:  '',
        sunday_start:    '', sunday_end:    '',
    };

    const { data, setData, post, processing, errors } = useForm<FormData>(initialData);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/work-schedules');
    }

    return (
        <AppLayout>
            <Head title="New Work Schedule" />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Work Schedule</h1>
                    <p className="text-sm text-slate-500 mt-1">Define working hours for each day of the week</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="e.g. Standard Week, Night Shift"
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_default" className="text-sm font-medium text-slate-700">
                                Set as default schedule
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Daily Hours</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide pb-2 border-b border-slate-100">
                                <span>Day</span>
                                <span>Start Time</span>
                                <span>End Time</span>
                            </div>
                            {DAYS.map(({ key, label }) => (
                                <div key={key} className="grid grid-cols-3 gap-4 items-center">
                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                    <div>
                                        <input
                                            type="time"
                                            value={data[`${key}_start`]}
                                            onChange={(e) => setData(`${key}_start`, e.target.value)}
                                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        />
                                        {errors[`${key}_start`] && (
                                            <p className="text-xs text-red-600 mt-1">{errors[`${key}_start`]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="time"
                                            value={data[`${key}_end`]}
                                            onChange={(e) => setData(`${key}_end`, e.target.value)}
                                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        />
                                        {errors[`${key}_end`] && (
                                            <p className="text-xs text-red-600 mt-1">{errors[`${key}_end`]}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create Schedule'}
                        </Button>
                        <a href="/hr/work-schedules" className="text-sm text-slate-600 hover:text-slate-900">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
