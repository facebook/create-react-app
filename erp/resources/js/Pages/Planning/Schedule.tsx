import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

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
    status: string;
}

interface Props extends PageProps {
    shifts: Shift[];
    users: User[];
    weekStart: string;
    weekEnd: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
};

function getWeekDates(weekStart: string): Date[] {
    const base = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        return d;
    });
}

function dateKey(d: Date): string {
    return d.toISOString().split('T')[0];
}

function toDateKey(s: string): string {
    return s.split('T')[0].split(' ')[0];
}

export default function PlanningSchedule({ shifts, users, weekStart, weekEnd }: Props) {
    const weekDates = getWeekDates(weekStart);

    const userMap = new Map<number, User>();
    users.forEach(u => userMap.set(u.id, u));

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

    function prevWeek() {
        const d = new Date(weekStart);
        d.setDate(d.getDate() - 7);
        router.get('/planning/schedule', { week: dateKey(d) });
    }

    function nextWeek() {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 7);
        router.get('/planning/schedule', { week: dateKey(d) });
    }

    return (
        <AppLayout>
            <Head title="Weekly Schedule" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Weekly Schedule</h1>
                        <p className="text-sm text-slate-500 mt-1">{weekStart} — {weekEnd}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={prevWeek} className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                            &larr; Prev
                        </button>
                        <button onClick={nextWeek} className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-slate-50">
                            Next &rarr;
                        </button>
                    </div>
                </div>

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
                                    const emp = userMap.get(empId) ?? { id: empId, name: `User #${empId}`, email: '' };
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
