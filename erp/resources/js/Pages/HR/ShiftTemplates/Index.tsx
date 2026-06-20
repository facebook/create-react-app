import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { ShiftTemplate } from '@/types/hr';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    shiftTemplates: Paginator<ShiftTemplate>;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ShiftTemplatesIndex({ shiftTemplates }: Props) {
    const { can } = usePermission();

    return (
        <AppLayout>
            <Head title="Shift Templates" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Shift Templates</h1>
                        <p className="text-sm text-slate-500 mt-1">{shiftTemplates.total} template{shiftTemplates.total !== 1 ? 's' : ''}</p>
                    </div>
                    {can('hr.create') && (
                        <Link href="/hr/shift-templates/create">
                            <Button>New Shift Template</Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {shiftTemplates.data.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">No shift templates found.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start / End</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Break</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Active</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assignments</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {shiftTemplates.data.map((template) => (
                                    <tr key={template.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: template.color }}
                                                />
                                                <span className="font-medium text-slate-900">{template.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {template.start_time} &ndash; {template.end_time}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {template.break_minutes} min
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {template.duration_hours}h
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {template.days_of_week && template.days_of_week.length > 0
                                                ? template.days_of_week.map((d) => DAY_NAMES[d]).join(', ')
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {template.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {template.assignments_count ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/hr/shift-templates/${template.id}`}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {shiftTemplates.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Page {shiftTemplates.current_page} of {shiftTemplates.last_page}</span>
                        <div className="flex gap-2">
                            {shiftTemplates.prev_page_url && (
                                <Link href={shiftTemplates.prev_page_url} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50">Previous</Link>
                            )}
                            {shiftTemplates.next_page_url && (
                                <Link href={shiftTemplates.next_page_url} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
