import { Head, Link, router } from '@inertiajs/react';
import { CustomerGroup, Contact } from '@/types/finance';

interface Props {
    customerGroup: CustomerGroup & {
        payment_term?: { id: number; name: string } | null;
    };
    members: {
        data: Contact[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Show({ customerGroup, members }: Props) {
    const handleAddMember = () => {
        const contactId = prompt('Contact ID to add:');
        if (contactId) {
            router.post(`/finance/customer-groups/${customerGroup.id}/members`, {
                contact_id: parseInt(contactId, 10),
            });
        }
    };

    const handleRemoveMember = (contactId: number) => {
        if (confirm('Remove this contact from the group?')) {
            router.delete(`/finance/customer-groups/${customerGroup.id}/members/${contactId}`);
        }
    };

    return (
        <>
            <Head title={`Customer Group: ${customerGroup.name}`} />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link href="/finance/customer-groups" className="text-sm text-indigo-600 hover:text-indigo-800">
                            &larr; Customer Groups
                        </Link>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">{customerGroup.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddMember}
                            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                            Add Member
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Delete this group?')) {
                                    router.delete(`/finance/customer-groups/${customerGroup.id}`);
                                }
                            }}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Discount</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{customerGroup.discount_percent}%</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Credit Limit</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {customerGroup.credit_limit === 0 ? 'No limit' : customerGroup.credit_limit.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Currency</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{customerGroup.currency}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">Members</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{customerGroup.member_count}</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Members</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {members.data.map((contact) => (
                                <tr key={contact.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{contact.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{contact.email ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{contact.type}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => handleRemoveMember(contact.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {members.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No members in this group yet.
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
