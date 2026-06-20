import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface WorkCenter {
    id: number;
    name: string;
}

interface WorkCenterCapacity {
    id: number;
    work_center_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    capacity_hours: number;
    work_center: WorkCenter;
}

interface Props extends PageProps {
    capacities: WorkCenterCapacity[];
    workCenters: WorkCenter[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CapacityPage({ capacities, workCenters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        work_center_id: '',
        day_of_week: '',
        start_time: '08:00',
        end_time: '17:00',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        router.post('/manufacturing/capacity', form, {
            onError: (errs) => setErrors(errs),
            onSuccess: () => {
                setShowForm(false);
                setForm({ work_center_id: '', day_of_week: '', start_time: '08:00', end_time: '17:00' });
            },
        });
    }

    function handleRemove(id: number) {
        if (confirm('Remove this capacity entry?')) {
            router.delete(`/manufacturing/capacity/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Work Center Capacity" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Work Center Capacity</h1>
                        <p className="text-sm text-slate-500 mt-1">Available hours per work center per day</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>Add Capacity</Button>
                </div>

                {/* Add Capacity Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <h2 className="font-semibold text-slate-800">Add Capacity</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Work Center</label>
                                <select
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.work_center_id}
                                    onChange={e => setForm({ ...form, work_center_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select work center...</option>
                                    {workCenters.map(wc => (
                                        <option key={wc.id} value={wc.id}>{wc.name}</option>
                                    ))}
                                </select>
                                {errors.work_center_id && <p className="text-red-500 text-xs mt-1">{errors.work_center_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Day of Week</label>
                                <select
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.day_of_week}
                                    onChange={e => setForm({ ...form, day_of_week: e.target.value })}
                                    required
                                >
                                    <option value="">Select day...</option>
                                    {DAY_NAMES.map((day, i) => (
                                        <option key={i} value={i}>{day}</option>
                                    ))}
                                </select>
                                {errors.day_of_week && <p className="text-red-500 text-xs mt-1">{errors.day_of_week}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.start_time}
                                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                                    required
                                />
                                {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
                                <input
                                    type="time"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.end_time}
                                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                                    required
                                />
                                {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Save Capacity</Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </form>
                )}

                {/* Capacity Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Work Center</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Day</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Start</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">End</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Hours</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {capacities.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                                            No capacity entries yet. Add one above.
                                        </td>
                                    </tr>
                                ) : capacities.map(cap => (
                                    <tr key={cap.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{cap.work_center?.name ?? `#${cap.work_center_id}`}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{DAY_NAMES[cap.day_of_week]}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{cap.start_time}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{cap.end_time}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{Number(cap.capacity_hours).toFixed(1)}h</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleRemove(cap.id)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
