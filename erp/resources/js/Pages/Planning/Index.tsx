import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Shift {
    id: number;
    employee_id: number;
    employee?: User;
    title: string;
    starts_at: string;
    ends_at: string;
    break_minutes: number;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

interface Props extends PageProps {
    shifts: Shift[];
    users: User[];
    filters: { employee_id?: string; week?: string };
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(weekStr?: string): Date[] {
    const base = weekStr ? new Date(weekStr) : new Date();
    const day = base.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(base);
    monday.setDate(base.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function dateKey(d: Date): string {
    return d.toISOString().split('T')[0];
}

function toDateKey(s: string): string {
    return s.split('T')[0].split(' ')[0];
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function PlanningIndex({ shifts, users, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const weekDates = getWeekDates(filters.week);
    const weekStart = dateKey(weekDates[0]);
    const weekEnd = dateKey(weekDates[6]);

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '',
        title: '',
        starts_at: '',
        ends_at: '',
        break_minutes: '0',
        notes: '',
    });

    function prevWeek() {
        const d = new Date(weekDates[0]);
        d.setDate(d.getDate() - 7);
        router.get('/planning', { ...filters, week: dateKey(d) });
    }

    function nextWeek() {
        const d = new Date(weekDates[0]);
        d.setDate(d.getDate() + 7);
        router.get('/planning', { ...filters, week: dateKey(d) });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/planning', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    // Group shifts by employee then by date
    const employeeMap = new Map<number, User>();
    users.forEach(u => employeeMap.set(u.id, u));

    const grid = new Map<number, Map<string, Shift[]>>();
    shifts.forEach(shift => {
        const empId = shift.employee_id;
        if (!grid.has(empId)) grid.set(empId, new Map());
        const dayKey = toDateKey(shift.starts_at);
        const byDay = grid.get(empId)!;
        if (!byDay.has(dayKey)) byDay.set(dayKey, []);
        byDay.get(dayKey)!.push(shift);
    });

    const employeeIds = Array.from(grid.keys());

    return (
        <AppLayout>
            <Head title="Planning" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Planning / Shifts</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Week of {weekStart} — {weekEnd}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={prevWeek} className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                            &larr; Prev
                        </button>
                        <button onClick={nextWeek} className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                            Next &rarr;
                        </button>
                        <button
                            onClick={() => setShowForm(v => !v)}
                            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                        >
                            {showForm ? 'Cancel' : 'New Shift'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-medium mb-4">Create New Shift</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                                <select
                                    value={data.employee_id}
                                    onChange={e => setData('employee_id', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                >
                                    <option value="">Select employee...</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                {errors.employee_id && <p className="text-red-600 text-xs mt-1">{errors.employee_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                />
                                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Starts At</label>
                                <input
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={e => setData('starts_at', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                />
                                {errors.starts_at && <p className="text-red-600 text-xs mt-1">{errors.starts_at}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ends At</label>
                                <input
                                    type="datetime-local"
                                    value={data.ends_at}
                                    onChange={e => setData('ends_at', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                />
                                {errors.ends_at && <p className="text-red-600 text-xs mt-1">{errors.ends_at}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Break (minutes)</label>
                                <input
                                    type="number"
                                    value={data.break_minutes}
                                    onChange={e => setData('break_minutes', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                    rows={2}
                                />
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Create Shift
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left font-medium text-slate-600 w-40">Employee</th>
                                {weekDates.map((d, i) => (
                                    <th key={i} className="px-2 py-3 text-center font-medium text-slate-600 min-w-[100px]">
                                        <div>{DAYS[i]}</div>
                                        <div className="text-xs text-slate-400">{dateKey(d)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employeeIds.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        No shifts this week.
                                    </td>
                                </tr>
                            ) : (
                                employeeIds.map(empId => {
                                    const emp = employeeMap.get(empId) ?? { id: empId, name: `User #${empId}`, email: '' };
                                    const byDay = grid.get(empId)!;
                                    return (
                                        <tr key={empId} className="border-b border-slate-100">
                                            <td className="px-4 py-2 font-medium text-slate-800">{emp.name}</td>
                                            {weekDates.map((d, i) => {
                                                const dayShifts = byDay.get(dateKey(d)) ?? [];
                                                return (
                                                    <td key={i} className="px-2 py-2 align-top">
                                                        {dayShifts.map(s => (
                                                            <a key={s.id} href={`/planning/${s.id}`}
                                                                className={`block rounded px-2 py-1 mb-1 text-xs font-medium ${statusColors[s.status] ?? 'bg-slate-100'}`}
                                                            >
                                                                <div>{s.title}</div>
                                                                <div className="opacity-70">
                                                                    {s.starts_at.slice(11, 16)}–{s.ends_at.slice(11, 16)}
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
