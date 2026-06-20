import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface WorkCenter {
    id: number;
    name: string;
    code: string | null;
    capacity: number | null;
    efficiency_factor: number | null;
    time_efficiency: number | null;
    hourly_cost: number | null;
    is_active: boolean;
    description: string | null;
    created_at: string;
}

interface Props extends PageProps {
    workCenter: WorkCenter;
}

export default function WorkCenterShow({ workCenter }: Props) {
    function handleDelete() {
        if (confirm(`Delete work center "${workCenter.name}"?`)) {
            router.delete(`/manufacturing/work-centers/${workCenter.id}`);
        }
    }

    const fmt = (val: number | null, suffix = '') =>
        val !== null ? `${Number(val).toLocaleString()}${suffix}` : '—';

    return (
        <AppLayout>
            <Head title={`Work Center — ${workCenter.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            <Link
                                href="/manufacturing/work-centers"
                                className="text-indigo-600 hover:underline"
                            >
                                Work Centers
                            </Link>{' '}
                            &rsaquo; {workCenter.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{workCenter.name}</h1>
                            {workCenter.code && (
                                <span className="font-mono text-sm text-slate-500">[{workCenter.code}]</span>
                            )}
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${workCenter.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                            >
                                {workCenter.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {workCenter.description && (
                            <p className="mt-1 text-sm text-slate-500">{workCenter.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/manufacturing/work-centers/${workCenter.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Capacity</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(workCenter.capacity)}</p>
                        <p className="text-xs text-slate-400">units/hour</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Efficiency</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {fmt(workCenter.efficiency_factor, '%')}
                        </p>
                        <p className="text-xs text-slate-400">efficiency factor</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Time Efficiency</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {fmt(workCenter.time_efficiency, '%')}
                        </p>
                        <p className="text-xs text-slate-400">time utilisation</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase text-slate-500">Hourly Cost</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {workCenter.hourly_cost !== null
                                ? `$${Number(workCenter.hourly_cost).toFixed(2)}`
                                : '—'}
                        </p>
                        <p className="text-xs text-slate-400">per hour</p>
                    </div>
                </div>

                {/* Details card */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-slate-700">Details</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Code</dt>
                            <dd className="mt-1 font-mono text-sm text-slate-900">{workCenter.code ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {workCenter.is_active ? 'Active' : 'Inactive'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase text-slate-500">Created</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {new Date(workCenter.created_at).toLocaleDateString()}
                            </dd>
                        </div>
                        {workCenter.description && (
                            <div className="col-span-2">
                                <dt className="text-xs font-medium uppercase text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-700">{workCenter.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
