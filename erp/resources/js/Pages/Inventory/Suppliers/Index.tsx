import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Supplier, Paginator } from '@/types/inventory';

interface Props extends PageProps {
    suppliers: Paginator<Supplier>;
    filters: { search?: string };
}

export default function SuppliersIndex({ suppliers, filters }: Props) {
    const { can } = usePermission();

    function handleDelete(id: number, name: string) {
        if (!confirm(`Delete supplier "${name}"?`)) return;
        router.delete(`/inventory/suppliers/${id}`);
    }

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
        router.get('/inventory/suppliers', { search }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Suppliers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Suppliers</h1>
                        <p className="text-sm text-slate-500 mt-1">{suppliers.total} suppliers</p>
                    </div>
                    {can('inventory.create') && (
                        <Link href="/inventory/suppliers/create">
                            <Button>Add Supplier</Button>
                        </Link>
                    )}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                name="search"
                                type="text"
                                defaultValue={filters.search ?? ''}
                                placeholder="Search by name or email..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                        </form>
                    </div>
                    <Table
                        columns={[
                            { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
                            { key: 'contact_person', header: 'Contact', render: (s) => s.contact_person ?? '—' },
                            { key: 'email', header: 'Email', render: (s) => s.email ? (
                                <a href={`mailto:${s.email}`} className="text-indigo-600 hover:text-indigo-800">{s.email}</a>
                            ) : '—' },
                            { key: 'phone', header: 'Phone', render: (s) => s.phone ?? '—' },
                            { key: 'status', header: 'Status', render: (s) => (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {s.is_active ? 'Active' : 'Inactive'}
                                </span>
                            )},
                            { key: 'actions', header: '', render: (s) => (
                                <div className="flex gap-3">
                                    {can('inventory.update') && (
                                        <Link href={`/inventory/suppliers/${s.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
                                    )}
                                    {can('inventory.delete') && (
                                        <button onClick={() => handleDelete(s.id, s.name)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    )}
                                </div>
                            )},
                        ]}
                        data={suppliers.data}
                        emptyMessage="No suppliers found."
                    />
                    <Pagination paginator={suppliers} />
                </div>
            </div>
        </AppLayout>
    );
}
