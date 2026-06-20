import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { EmployeeSkill } from '@/types/hr';

interface Props extends PageProps {
    skills: Paginator<EmployeeSkill>;
}

export default function EmployeeSkillsIndex({ skills }: Props) {
    const { can } = usePermission();

    const addForm = useForm({
        employee_id: '',
        skill_name: '',
        skill_definition_id: '',
        proficiency_level: '1',
        acquired_date: '',
        notes: '',
    });

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/hr/employee-skills', {
            onSuccess: () => addForm.reset(),
        });
    }

    function handleDelete(id: number) {
        if (confirm('Delete this skill?')) {
            router.delete(`/hr/employee-skills/${id}`);
        }
    }

    function handleVerify(id: number) {
        router.post(`/hr/employee-skills/${id}/verify`);
    }

    const proficiencyLabels: Record<number, string> = {
        1: 'Beginner', 2: 'Basic', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert',
    };

    return (
        <AppLayout>
            <Head title="Employee Skills" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Employee Skills</h1>
                        <p className="text-sm text-slate-500 mt-1">{skills.total} skills tracked</p>
                    </div>
                </div>

                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Skill</h2>
                        <form onSubmit={submitAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID *</label>
                                <input
                                    type="number"
                                    value={addForm.data.employee_id}
                                    onChange={(e) => addForm.setData('employee_id', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.employee_id && <p className="mt-1 text-xs text-red-600">{addForm.errors.employee_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Skill Name *</label>
                                <input
                                    type="text"
                                    value={addForm.data.skill_name}
                                    onChange={(e) => addForm.setData('skill_name', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {addForm.errors.skill_name && <p className="mt-1 text-xs text-red-600">{addForm.errors.skill_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Proficiency Level *</label>
                                <select
                                    value={addForm.data.proficiency_level}
                                    onChange={(e) => addForm.setData('proficiency_level', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    {[1, 2, 3, 4, 5].map((l) => (
                                        <option key={l} value={l}>{l} - {proficiencyLabels[l]}</option>
                                    ))}
                                </select>
                                {addForm.errors.proficiency_level && <p className="mt-1 text-xs text-red-600">{addForm.errors.proficiency_level}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Acquired Date</label>
                                <input
                                    type="date"
                                    value={addForm.data.acquired_date}
                                    onChange={(e) => addForm.setData('acquired_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                                <input
                                    type="text"
                                    value={addForm.data.notes}
                                    onChange={(e) => addForm.setData('notes', e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                                <Button type="submit" disabled={addForm.processing}>
                                    {addForm.processing ? 'Adding…' : 'Add Skill'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <Table
                        columns={[
                            {
                                key: 'employee',
                                header: 'Employee',
                                render: (s) => (
                                    <span className="text-sm font-medium text-slate-900">
                                        {s.employee ? `${s.employee.first_name} ${s.employee.last_name}` : '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'skill_name',
                                header: 'Skill',
                                render: (s) => <span className="text-sm text-slate-900 font-medium">{s.skill_name}</span>,
                            },
                            {
                                key: 'proficiency_level',
                                header: 'Proficiency',
                                render: (s) => (
                                    <span className="text-sm text-slate-700">{s.proficiency_label ?? proficiencyLabels[s.proficiency_level]}</span>
                                ),
                            },
                            {
                                key: 'is_verified',
                                header: 'Verified',
                                render: (s) => s.is_verified ? (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Verified</span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">Unverified</span>
                                ),
                            },
                            {
                                key: 'actions',
                                header: '',
                                render: (s) => (
                                    <div className="flex gap-2">
                                        {can('hr.create') && !s.is_verified && (
                                            <button
                                                onClick={() => handleVerify(s.id)}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                Verify
                                            </button>
                                        )}
                                        {can('hr.delete') && (
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        data={skills.data}
                        emptyMessage="No skills found."
                    />
                    <Pagination paginator={skills} />
                </div>
            </div>
        </AppLayout>
    );
}
