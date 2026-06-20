import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';

interface CompetencyFramework {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    status: string;
    is_default: boolean;
    competency_count?: number;
}

interface Props extends PageProps {
    frameworks: { data: CompetencyFramework[] } | CompetencyFramework[];
}

function getFrameworks(frameworks: Props['frameworks']): CompetencyFramework[] {
    return Array.isArray(frameworks) ? frameworks : (frameworks as any).data ?? frameworks;
}

export default function CompetencyFrameworksIndex({ frameworks }: Props) {
    const { can } = usePermission();
    const items = getFrameworks(frameworks);

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete competency framework "${name}"?`)) return;
        router.delete(`/hr/competency-frameworks/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Competency Frameworks" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Competency Frameworks</h1>
                        <p className="text-sm text-slate-500 mt-1">{items.length} frameworks</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/competency-frameworks/create">
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                                New Framework
                            </button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {items.map((framework) => (
                                <tr key={framework.id}>
                                    <td className="px-6 py-4">
                                        <Link href={`/hr/competency-frameworks/${framework.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                            {framework.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{framework.code ?? '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            framework.status === 'active' ? 'bg-green-100 text-green-800' :
                                            framework.status === 'archived' ? 'bg-slate-100 text-slate-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {framework.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <Link href={`/hr/competency-frameworks/${framework.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">View</Link>
                                            {can('hr.create') && (
                                                <Link href={`/hr/competency-frameworks/${framework.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                            )}
                                            {can('hr.delete') && (
                                                <button onClick={() => handleDelete(framework.id, framework.name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">No competency frameworks found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
