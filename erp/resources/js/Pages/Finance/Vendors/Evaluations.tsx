import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { Contact, VendorEvaluation } from '@/types/finance';
import type { Paginator } from '@/types/inventory';

interface Props extends PageProps {
    contact: Contact;
    evaluations: Paginator<VendorEvaluation>;
}

function StarRating({ value }: { value: number }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={star <= Math.round(value) ? 'text-amber-400' : 'text-slate-300'}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

const RATING_OPTIONS = [
    { value: 1, label: '1 — Poor' },
    { value: 2, label: '2 — Fair' },
    { value: 3, label: '3 — Good' },
    { value: 4, label: '4 — Very Good' },
    { value: 5, label: '5 — Excellent' },
];

const defaultForm = {
    evaluation_date: new Date().toISOString().slice(0, 10),
    quality_rating: '',
    delivery_rating: '',
    price_rating: '',
    communication_rating: '',
    comments: '',
};

export default function EvaluationsPage({ contact, evaluations }: Props) {
    const { can } = usePermission();
    const [form, setForm] = useState({ ...defaultForm });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/finance/vendors/${contact.id}/evaluations`, form, {
            onSuccess: () => setForm({ ...defaultForm }),
        });
    }

    function handleDelete(evalId: number) {
        if (!confirm('Delete this evaluation?')) return;
        router.delete(`/finance/vendors/${contact.id}/evaluations/${evalId}`);
    }

    return (
        <AppLayout>
            <Head title={`${contact.name} — Evaluations`} />
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900">{contact.name} — Vendor Evaluations</h1>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Quality</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Delivery</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Communication</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Overall</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Evaluator</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {evaluations.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No evaluations yet.
                                    </td>
                                </tr>
                            )}
                            {evaluations.data.map((ev) => (
                                <tr key={ev.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm text-slate-900">{ev.evaluation_date}</td>
                                    <td className="px-4 py-3"><StarRating value={ev.quality_rating} /></td>
                                    <td className="px-4 py-3"><StarRating value={ev.delivery_rating} /></td>
                                    <td className="px-4 py-3"><StarRating value={ev.price_rating} /></td>
                                    <td className="px-4 py-3"><StarRating value={ev.communication_rating} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <StarRating value={ev.overall_rating} />
                                            <span className="text-xs text-slate-500">({Number(ev.overall_rating).toFixed(1)})</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {ev.evaluator?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {can('finance.delete') && (
                                            <button
                                                onClick={() => handleDelete(ev.id)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {can('finance.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Add Evaluation</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Evaluation Date
                                    </label>
                                    <input
                                        type="date"
                                        name="evaluation_date"
                                        value={form.evaluation_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                {[
                                    { name: 'quality_rating', label: 'Quality' },
                                    { name: 'delivery_rating', label: 'Delivery' },
                                    { name: 'price_rating', label: 'Price' },
                                    { name: 'communication_rating', label: 'Communication' },
                                ].map(({ name, label }) => (
                                    <div key={name}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {label} Rating
                                        </label>
                                        <select
                                            name={name}
                                            value={(form as Record<string, string>)[name]}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="">Select rating…</option>
                                            {RATING_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Comments
                                </label>
                                <textarea
                                    name="comments"
                                    value={form.comments}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit">Add Evaluation</Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
