import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { ContactType, PriceList } from '@/types/finance';

interface Props extends PageProps { priceLists: PriceList[]; }

export default function ContactCreate({ priceLists }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', phone: '', address: '',
        type: 'customer' as ContactType, notes: '', is_active: true,
        price_list_id: '' as string | number,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/finance/contacts');
    }

    return (
        <AppLayout>
            <Head title="New Contact" />
            <div className="mx-auto max-w-xl space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">New Contact</h1>
                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input value={data.name} onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value as ContactType)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price List</label>
                        <select value={data.price_list_id} onChange={(e) => setData('price_list_id', e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option value="">— None —</option>
                            {priceLists.map((pl) => (
                                <option key={pl.id} value={pl.id}>{pl.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600" />
                        <span className="text-slate-700">Active</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Create Contact</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
