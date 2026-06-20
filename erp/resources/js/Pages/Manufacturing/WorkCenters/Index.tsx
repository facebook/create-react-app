import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface WorkCenter {
    id: number;
    name: string;
    code: string | null;
    capacity: number;
    efficiency_factor: number;
    hourly_cost: number;
    is_active: boolean;
}

interface Paginator<T> {
    data: T[];
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    workCenters: Paginator<WorkCenter>;
    filters: { search?: string };
}

export default function WorkCentersIndex({ workCenters, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/manufacturing/work-centers', { search }, { preserveState: true, replace: true });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this work center?')) {
            router.delete(`/manufacturing/work-centers/${id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Work Centers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Work Centers</h1>
                        <p className="text-sm text-slate-500 mt-1">{workCenters.total} work centers</p>
                    </div>
                    <Link href="/manufacturing/work-centers/create">
                        <Button>New Work Center</Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search work centers..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                            />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Capacity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Efficiency %</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Hourly Cost</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {workCenters.data.map((wc) => (
                                    <tr key={wc.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{wc.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{wc.code ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{wc.capacity}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{wc.efficiency_factor}%</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">${wc.hourly_cost.toFixed(2)}/hr</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${wc.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {wc.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <Link href={`/manufacturing/work-centers/${wc.id}/edit`} className="text-indigo-600 hover:text-indigo-800">Edit</Link>
                                                <button onClick={() => handleDelete(wc.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {workCenters.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No work centers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
