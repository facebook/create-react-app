import { Head, router } from '@inertiajs/react';
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
    time_efficiency: number;
    hourly_cost: number;
    is_active: boolean;
    description: string | null;
}

interface Props extends PageProps {
    workCenter: WorkCenter;
}

export default function WorkCenterEdit({ workCenter }: Props) {
    const [form, setForm] = useState({
        name: workCenter.name,
        code: workCenter.code ?? '',
        capacity: String(workCenter.capacity),
        efficiency_factor: String(workCenter.efficiency_factor),
        time_efficiency: String(workCenter.time_efficiency),
        hourly_cost: String(workCenter.hourly_cost),
        is_active: workCenter.is_active,
        description: workCenter.description ?? '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.put(`/manufacturing/work-centers/${workCenter.id}`, form, {
            onError: (errs) => setErrors(errs),
        });
    }

    return (
        <AppLayout>
            <Head title="Edit Work Center" />
            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">Edit Work Center</h1>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name *</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Code</label>
                            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Capacity</label>
                            <input type="number" step="0.01" min="0" value={form.capacity}
                                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Efficiency Factor (%)</label>
                            <input type="number" step="0.01" min="0" max="999" value={form.efficiency_factor}
                                onChange={(e) => setForm({ ...form, efficiency_factor: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Time Efficiency (%)</label>
                            <input type="number" step="0.01" min="0" max="999" value={form.time_efficiency}
                                onChange={(e) => setForm({ ...form, time_efficiency: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Hourly Cost ($)</label>
                            <input type="number" step="0.01" min="0" value={form.hourly_cost}
                                onChange={(e) => setForm({ ...form, hourly_cost: e.target.value })}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="is_active" checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="rounded border-slate-300" />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit">Update Work Center</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
