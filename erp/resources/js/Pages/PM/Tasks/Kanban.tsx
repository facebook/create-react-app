import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef } from 'react';

interface TaskCard {
    id: number;
    title: string;
    priority: string | null;
    due_date: string | null;
    assignee: { name: string } | null;
    is_overdue: boolean;
}

interface Props {
    project: { id: number; name: string };
    columns: Record<string, TaskCard[]>;
}

const COLUMN_LABELS: Record<string, string> = {
    todo:        'To Do',
    in_progress: 'In Progress',
    review:      'Review',
    done:        'Done',
    cancelled:   'Cancelled',
};

const COLUMN_COLORS: Record<string, string> = {
    todo:        'bg-slate-100 border-slate-300',
    in_progress: 'bg-blue-50 border-blue-300',
    review:      'bg-yellow-50 border-yellow-300',
    done:        'bg-green-50 border-green-300',
    cancelled:   'bg-red-50 border-red-300',
};

const PRIORITY_COLORS: Record<string, string> = {
    low:    'bg-slate-100 text-slate-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high:   'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

export default function TaskKanban({ project, columns }: Props) {
    const [board, setBoard] = useState<Record<string, TaskCard[]>>(columns);
    const dragTask = useRef<{ task: TaskCard; fromCol: string } | null>(null);

    function onDragStart(task: TaskCard, fromCol: string) {
        dragTask.current = { task, fromCol };
    }

    function onDrop(toCol: string) {
        if (!dragTask.current || dragTask.current.fromCol === toCol) return;
        const { task, fromCol } = dragTask.current;
        dragTask.current = null;

        setBoard(prev => {
            const next = { ...prev };
            next[fromCol] = next[fromCol].filter(t => t.id !== task.id);
            next[toCol]   = [...next[toCol], { ...task }];
            return next;
        });

        router.patch(`/pm/projects/${project.id}/tasks/${task.id}/move-status`, { status: toCol });
    }

    const allCols = Object.keys(COLUMN_LABELS);

    return (
        <AppLayout>
            <Head title={`Kanban — ${project.name}`} />
            <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Link href={`/pm/projects/${project.id}`} className="text-sm text-slate-500 hover:text-slate-700">
                        ← {project.name}
                    </Link>
                    <span className="text-slate-400">/</span>
                    <h1 className="text-xl font-semibold text-slate-800">Kanban Board</h1>
                    <div className="ml-auto flex gap-2">
                        <Link href={`/pm/projects/${project.id}/tasks`} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                            List
                        </Link>
                        <Link href={`/pm/projects/${project.id}/tasks/calendar`} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                            Calendar
                        </Link>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                    {allCols.map(col => (
                        <div
                            key={col}
                            className={`flex w-64 shrink-0 flex-col rounded-lg border-2 ${COLUMN_COLORS[col]} p-3`}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => onDrop(col)}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">{COLUMN_LABELS[col]}</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                                    {board[col]?.length ?? 0}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {(board[col] ?? []).map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={() => onDragStart(task, col)}
                                        className="cursor-grab rounded-md border border-white bg-white p-3 shadow-sm active:cursor-grabbing hover:shadow-md transition-shadow"
                                    >
                                        <p className="text-sm font-medium text-slate-800">{task.title}</p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {task.priority && (
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                            {task.due_date && (
                                                <span className={`rounded-full px-2 py-0.5 text-xs ${task.is_overdue ? 'bg-red-100 text-red-600 font-medium' : 'bg-slate-100 text-slate-500'}`}>
                                                    {task.due_date}
                                                </span>
                                            )}
                                        </div>
                                        {task.assignee && (
                                            <p className="mt-1.5 text-xs text-slate-500">{task.assignee.name}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {col !== 'cancelled' && (
                                <Link
                                    href={`/pm/projects/${project.id}/tasks/create`}
                                    className="mt-3 block rounded-md border border-dashed border-slate-300 py-1.5 text-center text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600"
                                >
                                    + Add task
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
