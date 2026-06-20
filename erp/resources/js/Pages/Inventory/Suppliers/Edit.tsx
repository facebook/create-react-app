import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { Input } from '@/Components/Common/Input';
import type { PageProps } from '@/types';
import type { Supplier } from '@/types/inventory';

interface SupplierFormData {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
    [key: string]: string | boolean;
}

interface Props extends PageProps {
    supplier: Supplier;
}

export default function SupplierEdit({ supplier }: Props) {
    const { data, setData, put, processing, errors } = useForm<SupplierFormData>({
        name: supplier.name,
        contact_person: supplier.contact_person ?? '',
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        address: supplier.address ?? '',
        is_active: supplier.is_active,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/inventory/suppliers/${supplier.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit ${supplier.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/inventory/suppliers" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Suppliers
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">Edit Supplier</h1>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                                <Input value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} />
                                {errors.contact_person && <p className="mt-1 text-xs text-red-600">{errors.contact_person}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <Input value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active</label>
                            </div>
                        </div>
                        <div className="flex gap-3 border-t border-slate-200 pt-4">
                            <Button type="submit" loading={processing}>Update Supplier</Button>
                            <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
