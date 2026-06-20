import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface CompetencyFramework {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    status: string;
    is_default: boolean;
}

interface Props extends PageProps {
    framework: CompetencyFramework;
}

export default function CompetencyFrameworkEdit({ framework }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: framework.name,
        description: framework.description ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/hr/competency-frameworks/${framework.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit ${framework.name}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Competency Framework</h1>
                    <Link href={`/hr/competency-frameworks/${framework.id}`} className="text-sm text-slate-600 hover:text-slate-800">
                        Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={`/hr/competency-frameworks/${framework.id}`}>
                            <button type="button" className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
