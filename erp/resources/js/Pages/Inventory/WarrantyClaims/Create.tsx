import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Warranty {
    id: number;
    name: string;
    product: { id: number; name: string } | null;
}

interface Props extends PageProps {
    warranties: Warranty[];
}

export default function WarrantyClaimCreate({ warranties }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        product_warranty_id: '',
        claim_date:          new Date().toISOString().split('T')[0],
        customer_name:       '',
        customer_email:      '',
        customer_phone:      '',
        purchase_date:       '',
        warranty_expiry:     '',
        issue_description:   '',
        serial_number_id:    '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inventory/warranty-claims');
    }

    return (
        <AppLayout>
            <Head title="New Warranty Claim" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Warranty Claim</h1>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Warranty *</label>
                            <select
                                value={data.product_warranty_id}
                                onChange={(e) => setData('product_warranty_id', e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Select a warranty</option>
                                {warranties.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.product?.name ? `${w.product.name} — ` : ''}{w.name}
                                    </option>
                                ))}
                            </select>
                            {errors.product_warranty_id && <p className="text-red-600 text-sm mt-1">{errors.product_warranty_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                                <input
                                    type="text"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                                {errors.customer_name && <p className="text-red-600 text-sm mt-1">{errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Claim Date *</label>
                                <input
                                    type="date"
                                    value={data.claim_date}
                                    onChange={(e) => setData('claim_date', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                                {errors.claim_date && <p className="text-red-600 text-sm mt-1">{errors.claim_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
                                <input
                                    type="email"
                                    value={data.customer_email}
                                    onChange={(e) => setData('customer_email', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone</label>
                                <input
                                    type="text"
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                                <input
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Expiry</label>
                                <input
                                    type="date"
                                    value={data.warranty_expiry}
                                    onChange={(e) => setData('warranty_expiry', e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description *</label>
                            <textarea
                                value={data.issue_description}
                                onChange={(e) => setData('issue_description', e.target.value)}
                                rows={4}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            />
                            {errors.issue_description && <p className="text-red-600 text-sm mt-1">{errors.issue_description}</p>}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>Submit Claim</Button>
                            <a href="/inventory/warranty-claims" className="inline-flex items-center px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
