import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Table } from '@/Components/Common/Table';
import { Button } from '@/Components/Common/Button';
import { Pagination } from '@/Components/Inventory/Pagination';
import type { PageProps } from '@/types';
import type { Paginator } from '@/types/inventory';

interface RentalAgreement {
    id: number;
    rental_item_id: number;
    customer_name: string;
    customer_email: string | null;
    start_date: string;
    end_date: string | null;
    daily_rate: string | number;
    deposit: string | number;
    status: 'active' | 'returned' | 'overdue' | 'cancelled';
    notes: string | null;
    item?: RentalItem;
}

interface RentalItem {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    daily_rate: string | number;
    serial_number: string | null;
    status: 'available' | 'rented' | 'maintenance';
    agreements?: RentalAgreement[];
}

interface Props extends PageProps {
    items: Paginator<RentalItem>;
    filters: { status?: string; category?: string };
}

type Tab = 'items' | 'agreements';

const STATUS_BADGE: Record<string, string> = {
    available:   'bg-green-100 text-green-700',
    rented:      'bg-blue-100 text-blue-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
};

const AGREEMENT_STATUS_BADGE: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    returned:  'bg-slate-100 text-slate-600',
    overdue:   'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
};

interface RentFormState {
    customer_name: string;
    customer_email: string;
    start_date: string;
    end_date: string;
    deposit: string;
    notes: string;
}

interface CreateItemFormState {
    name: string;
    description: string;
    category: string;
    daily_rate: string;
    serial_number: string;
}

export default function RentalIndex({ items, filters }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('items');
    const [rentingItemId, setRentingItemId] = useState<number | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [rentForm, setRentForm] = useState<RentFormState>({
        customer_name: '',
        customer_email: '',
        start_date: '',
        end_date: '',
        deposit: '',
        notes: '',
    });

    const [createForm, setCreateForm] = useState<CreateItemFormState>({
        name: '',
        description: '',
        category: '',
        daily_rate: '',
        serial_number: '',
    });

    function handleRentSubmit(e: React.FormEvent, itemId: number) {
        e.preventDefault();
        router.post(`/rental/items/${itemId}/rent`, {
            customer_name: rentForm.customer_name,
            customer_email: rentForm.customer_email || undefined,
            start_date: rentForm.start_date,
            end_date: rentForm.end_date || undefined,
            deposit: rentForm.deposit || undefined,
            notes: rentForm.notes || undefined,
        }, {
            onSuccess: () => {
                setRentingItemId(null);
                setRentForm({ customer_name: '', customer_email: '', start_date: '', end_date: '', deposit: '', notes: '' });
            },
        });
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/rental/items', {
            name: createForm.name,
            description: createForm.description || undefined,
            category: createForm.category || undefined,
            daily_rate: createForm.daily_rate,
            serial_number: createForm.serial_number || undefined,
        }, {
            onSuccess: () => {
                setShowCreateForm(false);
                setCreateForm({ name: '', description: '', category: '', daily_rate: '', serial_number: '' });
            },
        });
    }

    return (
        <AppLayout>
            <Head title="Rental" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Rental</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage rental items and agreements</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => { window.location.href = '/rental/calendar'; }}
                        >
                            View Calendar
                        </Button>
                        {activeTab === 'items' && (
                            <Button onClick={() => setShowCreateForm((v) => !v)}>
                                Create Item
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex gap-6">
                        {(['items', 'agreements'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={[
                                    'py-2 text-sm font-medium border-b-2 transition-colors',
                                    activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700',
                                ].join(' ')}
                            >
                                {tab === 'items' ? 'Items' : 'Agreements'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Create Item inline form */}
                {activeTab === 'items' && showCreateForm && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-slate-800">New Rental Item</h2>
                        <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={createForm.category}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Daily Rate *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={createForm.daily_rate}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, daily_rate: e.target.value }))}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    value={createForm.serial_number}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, serial_number: e.target.value }))}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2 flex gap-2 sm:col-span-3">
                                <Button type="submit">Save Item</Button>
                                <Button variant="secondary" type="button" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Items Tab */}
                {activeTab === 'items' && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Table<RentalItem>
                            columns={[
                                {
                                    key: 'name',
                                    header: 'Name',
                                    render: (item) => (
                                        <a href={`/rental/items/${item.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                            {item.name}
                                        </a>
                                    ),
                                },
                                {
                                    key: 'category',
                                    header: 'Category',
                                    render: (item) => (
                                        <span className="text-sm text-slate-600">{item.category ?? '—'}</span>
                                    ),
                                },
                                {
                                    key: 'daily_rate',
                                    header: 'Daily Rate',
                                    render: (item) => `$${Number(item.daily_rate).toFixed(2)}`,
                                },
                                {
                                    key: 'status',
                                    header: 'Status',
                                    render: (item) => (
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: 'Actions',
                                    render: (item) => (
                                        <div className="space-y-2">
                                            {item.status === 'available' && (
                                                <button
                                                    onClick={() => setRentingItemId(rentingItemId === item.id ? null : item.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {rentingItemId === item.id ? 'Cancel' : 'Rent'}
                                                </button>
                                            )}
                                            {rentingItemId === item.id && (
                                                <form
                                                    onSubmit={(e) => handleRentSubmit(e, item.id)}
                                                    className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
                                                >
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={rentForm.customer_name}
                                                            onChange={(e) => setRentForm((f) => ({ ...f, customer_name: e.target.value }))}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Customer Email</label>
                                                        <input
                                                            type="email"
                                                            value={rentForm.customer_email}
                                                            onChange={(e) => setRentForm((f) => ({ ...f, customer_email: e.target.value }))}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Start Date *</label>
                                                        <input
                                                            type="date"
                                                            required
                                                            value={rentForm.start_date}
                                                            onChange={(e) => setRentForm((f) => ({ ...f, start_date: e.target.value }))}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                                                        <input
                                                            type="date"
                                                            value={rentForm.end_date}
                                                            onChange={(e) => setRentForm((f) => ({ ...f, end_date: e.target.value }))}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Deposit</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={rentForm.deposit}
                                                            onChange={(e) => setRentForm((f) => ({ ...f, deposit: e.target.value }))}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                                        <input
                                                            type="text"
                                                            value={rentForm.notes}
                                                            onChange={(e) => setRentForm((f) => ({ ...f, notes: e.target.value }))}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex gap-2">
                                                        <Button type="submit" size="sm">Confirm Rent</Button>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => setRentingItemId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                            data={items.data}
                            emptyMessage="No rental items found."
                        />
                        <Pagination paginator={items} />
                    </div>
                )}

                {/* Agreements Tab */}
                {activeTab === 'agreements' && (
                    <AgreementsTab />
                )}
            </div>
        </AppLayout>
    );
}

function AgreementsTab() {
    const [agreements, setAgreements] = useState<{ data: RentalAgreement[]; loaded: boolean }>({ data: [], loaded: false });

    // Fetch agreements via Inertia visit on mount
    useState(() => {
        // The agreements are loaded via a separate Inertia page — redirect to it
    });

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-600">Viewing agreements</span>
                <a
                    href="/rental/agreements"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    Open full Agreements page
                </a>
            </div>
            <AgreementsInline />
        </div>
    );
}

function AgreementsInline() {
    // Static placeholder — actual data is on Rental/Agreements Inertia page
    return (
        <div className="px-4 py-8 text-center text-slate-400 text-sm">
            <p>Agreement list is available on the <a href="/rental/agreements" className="text-indigo-600 hover:underline">Agreements page</a>.</p>
        </div>
    );
}
