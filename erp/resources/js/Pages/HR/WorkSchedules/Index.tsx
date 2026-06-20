import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { WorkSchedule } from '@/types/hr';

interface Props extends PageProps {
    schedules: Paginator<WorkSchedule>;
    filters: { is_active?: string };
}

export default function WorkSchedulesIndex({ schedules, filters }: Props) {
    const { can } = usePermission();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        timezone: 'UTC',
        hours_per_week: '40',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/work-schedules', { onSuccess: () => reset() });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this work schedule?')) {
            router.delete(`/hr/work-schedules/${id}`);
        }
    }

    function filterByActive(value: string) {
        router.get('/hr/work-schedules', { ...filters, is_active: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Work Schedules" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Work Schedules</h1>
                        <p className="text-sm text-slate-500 mt-1">{schedules.total} schedule{schedules.total !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {['', 'true', 'false'].map((val) => (
                        <button
                            key={val}
                            onClick={() => filterByActive(val)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                                (filters.is_active ?? '') === val
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {val === '' ? 'All' : val === 'true' ? 'Active' : 'Inactive'}
                        </button>
                    ))}
                </div>

                {/* Add Form */}
                {can('hr.create') && (
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-900 mb-3">Add Work Schedule</h2>
                        <div className="flex gap-3 flex-wrap">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Timezone (e.g. UTC)"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Hours/Week"
                                    value={data.hours_per_week}
                                    onChange={(e) => setData('hours_per_week', e.target.value)}
                                    min={1}
                                    max={168}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>Add Schedule</Button>
                        </div>
                    </form>
                )}

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Timezone</th>
                                <th className="px-4 py-3">Hours/Week</th>
                                <th className="px-4 py-3">Shifts</th>
                                <th className="px-4 py-3">Active</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schedules.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No work schedules found.</td>
                                </tr>
                            ) : (
                                schedules.data.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{schedule.name}</td>
                                        <td className="px-4 py-3 text-slate-700">{schedule.timezone}</td>
                                        <td className="px-4 py-3 text-slate-700">{schedule.hours_per_week}h</td>
                                        <td className="px-4 py-3 text-slate-700">{schedule.shift_count}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                schedule.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {schedule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex gap-3">
                                            <Link
                                                href={`/hr/work-schedules/${schedule.id}`}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm"
                                            >
                                                View
                                            </Link>
                                            {can('hr.delete') && (
                                                <button
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination data={schedules} />
            </div>
        </AppLayout>
    );
}
