import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface WorkCenter {
    id: number;
    name: string;
}

interface WorkOrder {
    id: number;
    operation_name: string;
    manufacturing_order_id: number;
}

interface ProductionSchedule {
    id: number;
    work_order_id: number;
    work_center_id: number;
    scheduled_start: string;
    scheduled_end: string;
    status: 'planned' | 'confirmed' | 'in_progress' | 'done';
    notes: string | null;
    work_order: WorkOrder | null;
}

interface Props extends PageProps {
    schedules: Record<string, ProductionSchedule[]>;
    workCenters: WorkCenter[];
    workOrders: WorkOrder[];
    weekStart: string;
    weekEnd: string;
}

const STATUS_COLORS: Record<string, string> = {
    planned:     'bg-blue-400',
    confirmed:   'bg-green-400',
    in_progress: 'bg-yellow-400',
    done:        'bg-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
    planned:     'Planned',
    confirmed:   'Confirmed',
    in_progress: 'In Progress',
    done:        'Done',
};

function getDayHeaders(weekStart: string): string[] {
    const days: string[] = [];
    const start = new Date(weekStart + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    return days;
}

function getBarStyle(schedule: ProductionSchedule, weekStart: string): React.CSSProperties {
    const wsDate = new Date(weekStart + 'T00:00:00');
    const startDate = new Date(schedule.scheduled_start);
    const endDate = new Date(schedule.scheduled_end);

    const weekStartMs = wsDate.getTime();
    const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;

    const clampedStart = Math.max(startDate.getTime(), weekStartMs);
    const clampedEnd = Math.min(endDate.getTime(), weekEndMs);
    const weekDuration = weekEndMs - weekStartMs;

    const leftPct = ((clampedStart - weekStartMs) / weekDuration) * 100;
    const widthPct = ((clampedEnd - clampedStart) / weekDuration) * 100;

    return {
        left: `${leftPct}%`,
        width: `${Math.max(widthPct, 1)}%`,
        position: 'absolute',
        top: '4px',
        bottom: '4px',
    };
}

export default function GanttPage({ schedules, workCenters, workOrders, weekStart, weekEnd }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        work_order_id: '',
        work_center_id: '',
        scheduled_start: '',
        scheduled_end: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const dayHeaders = getDayHeaders(weekStart);

    function prevWeek() {
        const d = new Date(weekStart + 'T00:00:00');
        d.setDate(d.getDate() - 7);
        router.get('/manufacturing/scheduling/gantt', { start: d.toISOString().slice(0, 10) });
    }

    function nextWeek() {
        const d = new Date(weekStart + 'T00:00:00');
        d.setDate(d.getDate() + 7);
        router.get('/manufacturing/scheduling/gantt', { start: d.toISOString().slice(0, 10) });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        router.post('/manufacturing/scheduling', form, {
            onError: (errs) => setErrors(errs),
            onSuccess: () => { setShowForm(false); setForm({ work_order_id: '', work_center_id: '', scheduled_start: '', scheduled_end: '', notes: '' }); },
        });
    }

    function handleAction(scheduleId: number, action: string) {
        router.post(`/manufacturing/scheduling/${scheduleId}/${action}`);
    }

    function handleDelete(scheduleId: number) {
        if (confirm('Delete this schedule?')) {
            router.delete(`/manufacturing/scheduling/${scheduleId}`);
        }
    }

    // Check for overlaps (same work center, overlapping times) for conflict indicator
    function hasConflict(wcId: number): boolean {
        const wcSchedules = schedules[wcId] ?? [];
        for (let i = 0; i < wcSchedules.length; i++) {
            for (let j = i + 1; j < wcSchedules.length; j++) {
                const a = wcSchedules[i];
                const b = wcSchedules[j];
                if (a.status === 'done' || b.status === 'done') continue;
                const aStart = new Date(a.scheduled_start).getTime();
                const aEnd = new Date(a.scheduled_end).getTime();
                const bStart = new Date(b.scheduled_start).getTime();
                const bEnd = new Date(b.scheduled_end).getTime();
                if (aStart < bEnd && aEnd > bStart) return true;
            }
        }
        return false;
    }

    return (
        <AppLayout>
            <Head title="Production Scheduling - Gantt" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Production Scheduling</h1>
                        <p className="text-sm text-slate-500 mt-1">Gantt view — {weekStart} to {weekEnd}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={prevWeek}>Prev Week</Button>
                        <Button variant="secondary" onClick={nextWeek}>Next Week</Button>
                        <Button onClick={() => setShowForm(!showForm)}>New Schedule</Button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <span key={status} className="flex items-center gap-1">
                            <span className={`inline-block w-3 h-3 rounded ${STATUS_COLORS[status]}`} />
                            {label}
                        </span>
                    ))}
                </div>

                {/* New Schedule Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <h2 className="font-semibold text-slate-800">New Production Schedule</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Work Order</label>
                                <select
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.work_order_id}
                                    onChange={e => setForm({ ...form, work_order_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select work order...</option>
                                    {workOrders.map(wo => (
                                        <option key={wo.id} value={wo.id}>
                                            #{wo.id} — {wo.operation_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.work_order_id && <p className="text-red-500 text-xs mt-1">{errors.work_order_id}</p>}
                            </div>
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
                                <label className="block text-xs font-medium text-slate-600 mb-1">Start</label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.scheduled_start}
                                    onChange={e => setForm({ ...form, scheduled_start: e.target.value })}
                                    required
                                />
                                {errors.scheduled_start && <p className="text-red-500 text-xs mt-1">{errors.scheduled_start}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">End</label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.scheduled_end}
                                    onChange={e => setForm({ ...form, scheduled_end: e.target.value })}
                                    required
                                />
                                {errors.scheduled_end && <p className="text-red-500 text-xs mt-1">{errors.scheduled_end}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                <textarea
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Create Schedule</Button>
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </form>
                )}

                {/* Gantt Chart */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 border-r border-slate-200">
                                    Work Center
                                </th>
                                {dayHeaders.map((day, i) => (
                                    <th key={i} className="px-2 py-3 text-center text-xs font-medium text-slate-500 border-r border-slate-100" style={{ width: `${100 / 7}%` }}>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {workCenters.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">
                                        No active work centers found.
                                    </td>
                                </tr>
                            ) : workCenters.map(wc => {
                                const wcSchedules = schedules[wc.id] ?? [];
                                const conflict = hasConflict(wc.id);
                                return (
                                    <tr key={wc.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 text-sm font-medium text-slate-700 border-r border-slate-200 whitespace-nowrap">
                                            {wc.name}
                                            {conflict && (
                                                <span className="ml-2 inline-block bg-red-100 text-red-600 text-xs px-1 rounded" title="Overlapping schedules detected">
                                                    !</span>
                                            )}
                                        </td>
                                        <td colSpan={7} className="px-0 py-0">
                                            <div className="relative h-12">
                                                {wcSchedules.map(schedule => (
                                                    <div
                                                        key={schedule.id}
                                                        className={`${STATUS_COLORS[schedule.status]} text-white text-xs rounded px-1 flex items-center overflow-hidden cursor-pointer group`}
                                                        style={getBarStyle(schedule, weekStart)}
                                                        title={`${schedule.work_order?.operation_name ?? 'Work Order'} — ${schedule.status}`}
                                                    >
                                                        <span className="truncate">{schedule.work_order?.operation_name ?? `WO #${schedule.work_order_id}`}</span>
                                                        <div className="hidden group-hover:flex absolute right-0 top-0 bottom-0 items-center gap-1 bg-black/20 px-1 rounded-r">
                                                            {schedule.status === 'planned' && (
                                                                <button onClick={() => handleAction(schedule.id, 'confirm')} className="text-white hover:underline text-xs">Confirm</button>
                                                            )}
                                                            {schedule.status === 'confirmed' && (
                                                                <button onClick={() => handleAction(schedule.id, 'start')} className="text-white hover:underline text-xs">Start</button>
                                                            )}
                                                            {schedule.status === 'in_progress' && (
                                                                <button onClick={() => handleAction(schedule.id, 'complete')} className="text-white hover:underline text-xs">Done</button>
                                                            )}
                                                            <button onClick={() => handleDelete(schedule.id)} className="text-red-200 hover:text-red-100 text-xs">X</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
