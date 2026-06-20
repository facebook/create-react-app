import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Contact, VendorProfile } from '@/types/finance';

interface Props extends PageProps {
    contact: Contact;
    profile: VendorProfile;
}

export default function VendorProfilePage({ contact, profile }: Props) {
    const { can } = usePermission();

    const [form, setForm] = useState({
        credit_limit: profile.credit_limit ?? '',
        payment_terms_days: profile.payment_terms_days ?? 30,
        preferred_currency: profile.preferred_currency ?? '',
        bank_name: profile.bank_name ?? '',
        bank_account_number: profile.bank_account_number ?? '',
        bank_routing_number: profile.bank_routing_number ?? '',
        notes: profile.notes ?? '',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.put(`/finance/vendors/${contact.id}/profile`, form);
    }

    return (
        <AppLayout>
            <Head title={`${contact.name} — Vendor Profile`} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold text-slate-900">{contact.name} — Vendor Profile</h1>
                    {profile.is_over_credit_limit && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Over Credit Limit
                        </span>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Credit Limit
                                </label>
                                <input
                                    type="number"
                                    name="credit_limit"
                                    value={form.credit_limit}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="No limit"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Payment Terms (days)
                                </label>
                                <input
                                    type="number"
                                    name="payment_terms_days"
                                    value={form.payment_terms_days}
                                    onChange={handleChange}
                                    min="0"
                                    max="365"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Preferred Currency
                                </label>
                                <input
                                    type="text"
                                    name="preferred_currency"
                                    value={form.preferred_currency}
                                    onChange={handleChange}
                                    maxLength={3}
                                    placeholder="e.g. USD"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={form.bank_name}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Bank Account Number
                                </label>
                                <input
                                    type="text"
                                    name="bank_account_number"
                                    value={form.bank_account_number}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Bank Routing Number
                                </label>
                                <input
                                    type="text"
                                    name="bank_routing_number"
                                    value={form.bank_routing_number}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={4}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        {can('finance.create') && (
                            <div className="flex justify-end">
                                <Button type="submit">Save Profile</Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
