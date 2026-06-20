import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Task {
    id: number;
    title: string;
    status: string;
    story_points: number | null;
}

interface Sprint {
    id: number;
    name: string;
    goal: string | null;
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    velocity: number | null;
    tasks: Task[];
}

interface Project {
    id: number;
    name: string;
}

interface Props {
    project: Project;
    sprints: Sprint[];
}

const statusColors: Record<string, string> = {
    planning:  'bg-slate-100 text-slate-700',
    active:    'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

function formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SprintsIndex({ project, sprints }: Props) {
    function activate(sprint: Sprint) {
        router.post(`/pm/projects/${project.id}/sprints/${sprint.id}/activate`);
    }

    function complete(sprint: Sprint) {
        if (confirm('Mark this sprint as completed?')) {
            router.post(`/pm/projects/${project.id}/sprints/${sprint.id}/complete`);
        }
    }

    function createSprint() {
        const name = prompt('Sprint name:');
        if (!name) return;
        router.post(`/pm/projects/${project.id}/sprints`, { name });
    }

    return (
        <AppLayout>
            <Head title={`Sprints — ${project.name}`} />

            <div className="p-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href={`/pm/projects/${project.id}`}
                            className="text-sm text-slate-500 hover:text-slate-700"
                        >
                            &larr; {project.name}
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 mt-1">Sprints</h1>
                    </div>
                    <button
                        onClick={createSprint}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                        + New Sprint
                    </button>
                </div>

                {/* Sprints list */}
                {sprints.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-lg">No sprints yet.</p>
                        <p className="text-sm mt-1">Create a sprint to start organizing your tasks.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sprints.map((sprint) => {
                            const taskCount      = sprint.tasks.length;
                            const completedCount = sprint.tasks.filter((t) => t.status === 'done').length;
                            const progress       = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

                            return (
                                <div
                                    key={sprint.id}
                                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[sprint.status]}`}>
                                                    {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                                                </span>
                                                <h2 className="text-base font-semibold text-slate-900 truncate">
                                                    {sprint.name}
                                                </h2>
                                            </div>

                                            {sprint.goal && (
                                                <p className="text-sm text-slate-500 mb-2 line-clamp-2">{sprint.goal}</p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                <span>
                                                    {formatDate(sprint.start_date)} &mdash; {formatDate(sprint.end_date)}
                                                </span>
                                                <span>{completedCount}/{taskCount} tasks</span>
                                                {sprint.velocity !== null && (
                                                    <span>{sprint.velocity} story points</span>
                                                )}
                                            </div>

                                            {/* Progress bar */}
                                            {taskCount > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                        <div
                                                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: actions */}
                                        <div className="flex flex-col gap-2 shrink-0">
                                            {sprint.status === 'planning' && (
                                                <button
                                                    onClick={() => activate(sprint)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            {sprint.status === 'active' && (
                                                <button
                                                    onClick={() => complete(sprint)}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
