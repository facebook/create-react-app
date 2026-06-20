import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';
import type { NotificationRule } from '@/types/notifications';

interface Props extends PageProps {
    rules: Paginator<NotificationRule>;
}

export default function NotificationRulesIndex({ rules }: Props) {
    return (
        <AppLayout>
            <Head title="Notification Rules" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Notification Rules</h1>
                        <p className="text-sm text-slate-500 mt-1">Configure alerts for business events</p>
                    </div>
                    <Link href="/notification-rules/create">
                        <Button variant="primary" size="sm">
                            Add Rule
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Rule Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Event Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Active
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {rules.data.map((rule) => (
                                <tr key={rule.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                        {rule.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                            {rule.event_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                router.patch(`/notification-rules/${rule.id}/toggle`)
                                            }
                                            className={[
                                                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                                                rule.is_active ? 'bg-indigo-600' : 'bg-slate-200',
                                            ].join(' ')}
                                            aria-checked={rule.is_active}
                                            role="switch"
                                        >
                                            <span
                                                className={[
                                                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                                    rule.is_active ? 'translate-x-4' : 'translate-x-0',
                                                ].join(' ')}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this rule?')) {
                                                    router.delete(`/notification-rules/${rule.id}`);
                                                }
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rules.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                                        No notification rules yet. Click "Add Rule" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination paginator={rules} />
            </div>
        </AppLayout>
    );
}
