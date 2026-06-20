import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useMemo } from 'react';

interface Dependency {
    task_id: number;
    type: string;
}

interface GanttTask {
    id: number;
    title: string;
    status: string;
    start: string | null;
    end: string | null;
    hours: number | null;
    points: number | null;
    parent: number | null;
    dependencies: Dependency[];
}

interface Milestone {
    id: number;
    name: string;
    due_date: string | null;
    is_completed: boolean;
}

interface Project {
    id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
    tasks: GanttTask[];
    milestones: Milestone[];
}

interface Props {
    project: Project;
}

const statusColors: Record<string, string> = {
    todo:        'bg-slate-400',
    in_progress: 'bg-blue-500',
    review:      'bg-yellow-500',
    done:        'bg-green-500',
    cancelled:   'bg-red-400',
};

const statusBadgeColors: Record<string, string> = {
    todo:        'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-100 text-blue-700',
    review:      'bg-yellow-100 text-yellow-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-600',
};

function parseDate(str: string | null): Date | null {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function diffDays(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonths(start: Date, end: Date): { label: string; days: number }[] {
    const months: { label: string; days: number }[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
        const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        const monthEnd = next < end ? next : addDays(end, 1);
        const monthStart = cur < start ? start : cur;
        months.push({
            label: cur.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            days: diffDays(monthStart, monthEnd),
        });
        cur.setMonth(cur.getMonth() + 1);
    }
    return months;
}

export default function Gantt({ project }: Props) {
    const tasks = project.tasks ?? [];

    // Compute timeline range from tasks (or project dates)
    const allDates = tasks
        .flatMap((t) => [parseDate(t.start), parseDate(t.end)])
        .filter(Boolean) as Date[];

    if (project.start_date) allDates.push(parseDate(project.start_date)!);
    if (project.end_date) allDates.push(parseDate(project.end_date)!);

    const timelineStart = useMemo(
        () => allDates.length > 0 ? new Date(Math.min(...allDates.map((d) => d.getTime()))) : new Date(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [project.id],
    );
    const timelineEnd = useMemo(
        () => allDates.length > 0 ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : addDays(new Date(), 30),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [project.id],
    );

    const totalDays = Math.max(diffDays(timelineStart, timelineEnd), 1);
    const months = getMonths(timelineStart, timelineEnd);

    // Build task title map for dependency labels
    const taskMap = useMemo(() => {
        const map: Record<number, string> = {};
        tasks.forEach((t) => { map[t.id] = t.title; });
        return map;
    }, [tasks]);

    function barStyle(task: GanttTask): React.CSSProperties {
        const start = parseDate(task.start);
        const end   = parseDate(task.end);
        if (!start || !end) return { display: 'none' };

        const left  = (diffDays(timelineStart, start) / totalDays) * 100;
        const width = Math.max((diffDays(start, end) / totalDays) * 100, 0.5);

        return {
            left:  `${left}%`,
            width: `${width}%`,
        };
    }

    return (
        <AppLayout>
            <Head title={`Gantt — ${project.name}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href={`/pm/projects/${project.id}`}
                            className="text-sm text-slate-500 hover:text-slate-700"
                        >
                            &larr; {project.name}
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 mt-1">Gantt Chart</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {formatDate(timelineStart)} &mdash; {formatDate(timelineEnd)}
                        </p>
                    </div>
                </div>

                {tasks.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p>No tasks with dates found. Add start/due dates to tasks to see them here.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-auto shadow-sm">
                        <table className="w-full min-w-[900px] border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {/* Task info column */}
                                    <th className="w-64 min-w-[256px] text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                                        Task
                                    </th>
                                    {/* Timeline header */}
                                    <th className="px-0 py-0">
                                        <div className="flex">
                                            {months.map((m, i) => (
                                                <div
                                                    key={i}
                                                    className="text-xs font-medium text-slate-500 py-3 px-2 border-r border-slate-100 last:border-r-0"
                                                    style={{ width: `${(m.days / totalDays) * 100}%`, minWidth: '60px' }}
                                                >
                                                    {m.label}
                                                </div>
                                            ))}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task, idx) => (
                                    <tr
                                        key={task.id}
                                        className={`border-b border-slate-100 hover:bg-slate-50/50 ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                                    >
                                        {/* Task info */}
                                        <td className="w-64 px-4 py-2.5 border-r border-slate-200 align-top">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate" title={task.title}>
                                                        {task.title}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                        <span className={`inline-flex text-xs px-1.5 py-0.5 rounded font-medium ${statusBadgeColors[task.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                        {task.points && (
                                                            <span className="text-xs text-slate-400">{task.points} pts</span>
                                                        )}
                                                    </div>
                                                    {task.dependencies.length > 0 && (
                                                        <p className="text-xs text-slate-400 mt-1 truncate">
                                                            Blocked by: {task.dependencies.map((d) => taskMap[d.task_id] ?? `#${d.task_id}`).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Timeline bar */}
                                        <td className="px-0 py-2.5 align-middle">
                                            <div className="relative h-6 mx-2" style={{ minWidth: '100px' }}>
                                                {parseDate(task.start) && parseDate(task.end) ? (
                                                    <div
                                                        className={`absolute top-0.5 h-5 rounded ${statusColors[task.status] ?? 'bg-slate-400'} opacity-80 transition-all`}
                                                        style={barStyle(task)}
                                                        title={`${task.start ?? ''} → ${task.end ?? ''}`}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-300 ml-1">No dates</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Milestones section */}
                                {project.milestones?.length > 0 && (
                                    <>
                                        <tr className="bg-slate-100">
                                            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Milestones
                                            </td>
                                        </tr>
                                        {project.milestones.map((m) => (
                                            <tr key={m.id} className="border-b border-slate-100">
                                                <td className="w-64 px-4 py-2.5 border-r border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-700">{m.name}</span>
                                                        {m.is_completed && (
                                                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Done</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-0 py-2.5">
                                                    <div className="relative h-6 mx-2">
                                                        {m.due_date && (() => {
                                                            const d = parseDate(m.due_date);
                                                            if (!d) return null;
                                                            const left = (diffDays(timelineStart, d) / totalDays) * 100;
                                                            return (
                                                                <div
                                                                    className="absolute top-0.5 w-3 h-5 flex items-center justify-center"
                                                                    style={{ left: `calc(${left}% - 6px)` }}
                                                                    title={m.due_date}
                                                                >
                                                                    <div className="w-3 h-3 bg-purple-500 rotate-45" />
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
