import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { Department } from '@/types/hr';

interface Props extends PageProps {
    department: Department;
}

export default function DepartmentEdit({ department }: Props) {
    const { data, setData, put, errors, processing } = useForm({
        name: department.name ?? '',
        description: department.description ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/hr/departments/${department.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit ${department.name}`} />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Edit Department</h1>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <a href={`/hr/departments/${department.id}`}>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </a>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
