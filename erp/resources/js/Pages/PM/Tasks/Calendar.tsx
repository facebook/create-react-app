import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Task {
    id: number;
    title: string;
    status: string;
    priority: string | null;
    due_date: string;
}

interface Props {
    project: { id: number; name: string };
    tasks: Task[];
    year: number;
    month: number;
}

const STATUS_COLORS: Record<string, string> = {
    todo:        'bg-slate-200 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    review:      'bg-yellow-100 text-yellow-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-600',
};

export default function TaskCalendar({ project, tasks, year, month }: Props) {
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDow = firstDay.getDay(); // 0=Sun

    const tasksByDate: Record<string, Task[]> = {};
    for (const task of tasks) {
        if (!tasksByDate[task.due_date]) tasksByDate[task.due_date] = [];
        tasksByDate[task.due_date].push(task);
    }

    function navMonth(delta: number) {
        let m = month + delta;
        let y = year;
        if (m > 12) { m = 1; y++; }
        if (m < 1)  { m = 12; y--; }
        router.get(`/pm/projects/${project.id}/tasks/calendar`, { year: y, month: m }, { preserveState: false });
    }

    const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = new Date().toISOString().slice(0, 10);

    const cells: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <AppLayout>
            <Head title={`Calendar — ${project.name}`} />
            <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Link href={`/pm/projects/${project.id}`} className="text-sm text-slate-500 hover:text-slate-700">
                        ← {project.name}
                    </Link>
                    <span className="text-slate-400">/</span>
                    <h1 className="text-xl font-semibold text-slate-800">Task Calendar</h1>
                    <div className="ml-auto flex gap-2">
                        <Link href={`/pm/projects/${project.id}/tasks`} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">List</Link>
                        <Link href={`/pm/projects/${project.id}/tasks/kanban`} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Kanban</Link>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center border-b border-slate-200 px-4 py-3">
                        <button onClick={() => navMonth(-1)} className="rounded p-1 hover:bg-slate-100">‹</button>
                        <span className="mx-4 text-base font-semibold text-slate-800">{monthName}</span>
                        <button onClick={() => navMonth(1)} className="rounded p-1 hover:bg-slate-100">›</button>
                    </div>

                    <div className="grid grid-cols-7">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="border-b border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-500">
                                {d}
                            </div>
                        ))}

                        {cells.map((day, i) => {
                            if (!day) return <div key={i} className="min-h-[80px] border-b border-r border-slate-100 bg-slate-50" />;
                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayTasks = tasksByDate[dateStr] ?? [];
                            const isToday  = dateStr === today;

                            return (
                                <div key={i} className={`min-h-[80px] border-b border-r border-slate-100 p-1.5 ${isToday ? 'bg-blue-50' : ''}`}>
                                    <span className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                                        {day}
                                    </span>
                                    {dayTasks.slice(0, 3).map(t => (
                                        <Link
                                            key={t.id}
                                            href={`/pm/projects/${project.id}/tasks/${t.id}`}
                                            className={`mb-0.5 block truncate rounded px-1 py-0.5 text-xs ${STATUS_COLORS[t.status] ?? 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {t.title}
                                        </Link>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <p className="text-xs text-slate-400">+{dayTasks.length - 3} more</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
