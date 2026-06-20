import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Contact, ContactType } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    contacts: Paginator<Contact>;
    filters: { search?: string; type?: ContactType };
}

const TYPE_BADGE: Record<ContactType, string> = {
    customer: 'bg-blue-100 text-blue-700',
    vendor:   'bg-orange-100 text-orange-700',
    both:     'bg-purple-100 text-purple-700',
};

export default function ContactsIndex({ contacts, filters }: Props) {
    const { can } = usePermission();

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/finance/contacts', { ...filters, search }, { preserveState: true, replace: true });
    }

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete contact "${name}"?`)) return;
        router.delete(`/finance/contacts/${id}`);
    }

    return (
        <AppLayout>
            <Head title="Contacts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Contacts</h1>
                        <p className="text-sm text-slate-500 mt-1">{contacts.total} contacts</p>
                    </div>
                    {can('finance.create') && (
                        <Link href="/finance/contacts/create"><Button>Add Contact</Button></Link>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input name="search" type="text" defaultValue={filters.search ?? ''}
                                placeholder="Search by name or email…"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                        <select value={filters.type ?? ''}
                            onChange={(e) => router.get('/finance/contacts', { ...filters, type: e.target.value || undefined }, { preserveState: true, replace: true })}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">All Types</option>
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                    <Table
                        columns={[
                            { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
                            { key: 'type', header: 'Type', render: (c) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_BADGE[c.type]}`}>
                                    {c.type}
                                </span>
                            )},
                            { key: 'email', header: 'Email', render: (c) => c.email
                                ? <a href={`mailto:${c.email}`} className="text-indigo-600 hover:text-indigo-800">{c.email}</a>
                                : '—' },
                            { key: 'phone', header: 'Phone', render: (c) => c.phone ?? '—' },
                            { key: 'status', header: 'Status', render: (c) => (
                                <span className={`text-xs ${c.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                                    {c.is_active ? 'Active' : 'Inactive'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (c) => (
                                <div className="flex gap-3">
                                    {can('finance.update') && (
                                        <Link href={`/finance/contacts/${c.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                    {can('finance.delete') && (
                                        <button onClick={() => handleDelete(c.id, c.name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={contacts.data}
                        emptyMessage="No contacts found."
                    />
                    <Pagination paginator={contacts} />
                </div>
            </div>
        </AppLayout>
    );
}
