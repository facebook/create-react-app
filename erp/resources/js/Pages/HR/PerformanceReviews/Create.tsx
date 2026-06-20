import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface EmployeeOption {
    id: number;
    first_name: string;
    last_name: string;
}

interface RatingRow {
    competency: string;
    rating: string;
    notes: string;
}

interface Props extends PageProps {
    employees: EmployeeOption[];
}

export default function CreatePerformanceReview({ employees }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        employee_id: string;
        period: string;
        review_date: string;
        overall_rating: string;
        strengths: string;
        improvements: string;
        goals: string;
        ratings: RatingRow[];
    }>({
        employee_id:    '',
        period:         '',
        review_date:    '',
        overall_rating: '',
        strengths:      '',
        improvements:   '',
        goals:          '',
        ratings:        [],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/performance-reviews');
    }

    function addRating() {
        setData('ratings', [...data.ratings, { competency: '', rating: '', notes: '' }]);
    }

    function removeRating(index: number) {
        setData('ratings', data.ratings.filter((_, i) => i !== index));
    }

    function updateRating(index: number, field: keyof RatingRow, value: string) {
        const updated = data.ratings.map((row, i) => i === index ? { ...row, [field]: value } : row);
        setData('ratings', updated);
    }

    return (
        <AppLayout>
            <Head title="New Performance Review" />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Performance Review</h1>
                    <p className="text-sm text-slate-500 mt-1">Create a new employee performance review</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900">Review Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
                            <select
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">Select employee…</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                            {errors.employee_id && <p className="text-sm text-red-600 mt-1">{errors.employee_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Period *</label>
                                <input
                                    type="text"
                                    value={data.period}
                                    onChange={(e) => setData('period', e.target.value)}
                                    placeholder="e.g. Q1 2026, Annual 2025"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.period && <p className="text-sm text-red-600 mt-1">{errors.period}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Review Date *</label>
                                <input
                                    type="date"
                                    value={data.review_date}
                                    onChange={(e) => setData('review_date', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.review_date && <p className="text-sm text-red-600 mt-1">{errors.review_date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Overall Rating (1–5)</label>
                            <select
                                value={data.overall_rating}
                                onChange={(e) => setData('overall_rating', e.target.value)}
                                className="w-32 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">— Select —</option>
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            {errors.overall_rating && <p className="text-sm text-red-600 mt-1">{errors.overall_rating}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Strengths</label>
                            <textarea
                                value={data.strengths}
                                onChange={(e) => setData('strengths', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Employee strengths…"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Improvements</label>
                            <textarea
                                value={data.improvements}
                                onChange={(e) => setData('improvements', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Areas for improvement…"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Goals</label>
                            <textarea
                                value={data.goals}
                                onChange={(e) => setData('goals', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Goals for next period…"
                            />
                        </div>
                    </div>

                    {/* Competency Ratings */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900">Competency Ratings</h2>
                            <button
                                type="button"
                                onClick={addRating}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                + Add Competency
                            </button>
                        </div>

                        {data.ratings.length === 0 && (
                            <p className="text-sm text-slate-500">No competency ratings added. Click "+ Add Competency" to add one.</p>
                        )}

                        {data.ratings.map((row, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-start border border-slate-100 rounded-md p-3">
                                <div className="col-span-5">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Competency *</label>
                                    <input
                                        type="text"
                                        value={row.competency}
                                        onChange={(e) => updateRating(index, 'competency', e.target.value)}
                                        placeholder="e.g. Communication"
                                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Rating *</label>
                                    <select
                                        value={row.rating}
                                        onChange={(e) => updateRating(index, 'rating', e.target.value)}
                                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">—</option>
                                        {[1, 2, 3, 4, 5].map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                    <input
                                        type="text"
                                        value={row.notes}
                                        onChange={(e) => updateRating(index, 'notes', e.target.value)}
                                        placeholder="Optional notes"
                                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-1 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => removeRating(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create Review'}
                        </Button>
                        <a href="/hr/performance-reviews" className="text-sm text-slate-600 hover:text-slate-900">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
