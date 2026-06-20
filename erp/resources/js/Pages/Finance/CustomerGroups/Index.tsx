import { Head, Link, router } from '@inertiajs/react';
import { CustomerGroup } from '@/types/finance';

interface Props {
    customerGroups: {
        data: CustomerGroup[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Index({ customerGroups }: Props) {
    return (
        <>
            <Head title="Customer Groups" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Customer Groups</h1>
                    <button
                        onClick={() => {
                            const name = prompt('Group name:');
                            if (name) {
                                router.post('/finance/customer-groups', { name });
                            }
                        }}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        New Group
                    </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Currency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {customerGroups.data.map((group) => (
                                <tr key={group.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{group.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{group.discount_percent}%</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{group.currency}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${group.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {group.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <Link
                                            href={`/finance/customer-groups/${group.id}`}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {customerGroups.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No customer groups found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
