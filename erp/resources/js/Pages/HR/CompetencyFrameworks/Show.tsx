import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';

interface Competency {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    max_level: number;
}

interface CompetencyFramework {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    status: string;
    is_default: boolean;
    is_active: boolean;
    competencies: Competency[];
}

interface Props extends PageProps {
    framework: CompetencyFramework;
}

export default function CompetencyFrameworkShow({ framework }: Props) {
    const { can } = usePermission();

    function handleActivate() {
        router.post(`/hr/competency-frameworks/${framework.id}/activate`);
    }

    function handleArchive() {
        router.post(`/hr/competency-frameworks/${framework.id}/archive`);
    }

    return (
        <AppLayout>
            <Head title={framework.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">{framework.name}</h1>
                        {framework.code && <p className="text-sm text-slate-500 mt-1">Code: {framework.code}</p>}
                    </div>
                    <div className="flex gap-3">
                        {can('hr.create') && framework.status === 'draft' && (
                            <button onClick={handleActivate} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                                Activate
                            </button>
                        )}
                        {can('hr.create') && framework.status === 'active' && (
                            <button onClick={handleArchive} className="px-4 py-2 bg-slate-600 text-white rounded-md text-sm font-medium hover:bg-slate-700">
                                Archive
                            </button>
                        )}
                        {can('hr.create') && (
                            <Link href={`/hr/competency-frameworks/${framework.id}/edit`}>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Edit</button>
                            </Link>
                        )}
                        <Link href="/hr/competency-frameworks" className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Back
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    framework.status === 'active' ? 'bg-green-100 text-green-800' :
                                    framework.status === 'archived' ? 'bg-slate-100 text-slate-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {framework.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Default</dt>
                            <dd className="mt-1 text-sm text-slate-900">{framework.is_default ? 'Yes' : 'No'}</dd>
                        </div>
                        {framework.description && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-slate-500">Description</dt>
                                <dd className="mt-1 text-sm text-slate-900">{framework.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-slate-900 mb-4">Competencies ({framework.competencies?.length ?? 0})</h2>
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Max Level</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {(framework.competencies ?? []).map((c) => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{c.category ?? '—'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{c.max_level}</td>
                                    </tr>
                                ))}
                                {(framework.competencies ?? []).length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">No competencies added yet.</td>
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
