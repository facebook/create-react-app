import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import { usePermission } from '@/Hooks/usePermission';
import type { PageProps } from '@/types';
import type { PerformanceKpi } from '@/types/hr';

interface ReviewRatingData {
    id: number;
    competency: string;
    rating: number;
    notes: string | null;
}

interface ReviewData {
    id: number;
    employee_id: number;
    reviewer_id: number | null;
    period: string | null;
    review_period: string | null;
    review_date: string;
    status: 'draft' | 'submitted' | 'acknowledged';
    overall_rating: number | null;
    strengths: string | null;
    improvements: string | null;
    goals: string | null;
    reviewer_notes: string | null;
    employee_comments: string | null;
    is_complete: boolean;
    average_rating: number;
    average_kpi_score: number | null;
    submitted_at: string | null;
    acknowledged_at: string | null;
    employee?: { id: number; first_name: string; last_name: string } | null;
    reviewer?: { id: number; name: string } | null;
    kpis?: PerformanceKpi[];
    ratings?: ReviewRatingData[];
}

interface Props extends PageProps {
    review: ReviewData;
}

const STATUS_COLORS: Record<string, string> = {
    draft:        'bg-slate-100 text-slate-700',
    submitted:    'bg-blue-100 text-blue-700',
    acknowledged: 'bg-green-100 text-green-700',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {status}
        </span>
    );
}

function AddKpiForm({ reviewId }: { reviewId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name:         '',
        target_score: '',
        actual_score: '',
        weight:       '1',
        notes:        '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/hr/performance-reviews/${reviewId}/kpis`, {
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit} className="mt-4 border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Add KPI</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="KPI name"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Target *</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={data.target_score}
                        onChange={(e) => setData('target_score', e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="100"
                    />
                    {errors.target_score && <p className="text-xs text-red-600 mt-1">{errors.target_score}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Actual *</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.actual_score}
                        onChange={(e) => setData('actual_score', e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="0"
                    />
                    {errors.actual_score && <p className="text-xs text-red-600 mt-1">{errors.actual_score}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing} className="text-sm">
                    {processing ? 'Adding…' : 'Add KPI'}
                </Button>
            </div>
        </form>
    );
}

function KpiRow({ kpi, reviewId }: { kpi: PerformanceKpi; reviewId: number }) {
    const { data, setData, patch, processing } = useForm({
        actual_score: String(kpi.actual_score),
    });

    function update(e: React.FormEvent) {
        e.preventDefault();
        patch(`/hr/performance-reviews/${reviewId}/kpis/${kpi.id}`);
    }

    function remove() {
        if (confirm('Remove this KPI?')) {
            router.delete(`/hr/performance-reviews/${reviewId}/kpis/${kpi.id}`);
        }
    }

    return (
        <tr className="border-b border-slate-100 last:border-0">
            <td className="py-3 pr-4 font-medium text-slate-900 text-sm">{kpi.name}</td>
            <td className="py-3 pr-4 text-sm text-slate-700">{kpi.target_score}</td>
            <td className="py-3 pr-4">
                <form onSubmit={update} className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.actual_score}
                        onChange={(e) => setData('actual_score', e.target.value)}
                        className="w-20 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                    <button type="submit" disabled={processing} className="text-xs text-indigo-600 hover:text-indigo-800">
                        Save
                    </button>
                </form>
            </td>
            <td className="py-3 pr-4 text-sm text-slate-700">
                {kpi.achievement_percent != null ? `${kpi.achievement_percent}%` : '—'}
            </td>
            <td className="py-3 pr-4 text-sm text-slate-700">{kpi.weight}</td>
            <td className="py-3">
                <button onClick={remove} className="text-xs text-red-600 hover:text-red-800">
                    Remove
                </button>
            </td>
        </tr>
    );
}

function AcknowledgeForm({ reviewId }: { reviewId: number }) {
    const { data, setData, post, processing } = useForm({ comments: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/hr/performance-reviews/${reviewId}/acknowledge`);
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee Comments (optional)</label>
                <textarea
                    value={data.comments}
                    onChange={(e) => setData('comments', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Add your comments…"
                />
            </div>
            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? 'Acknowledging…' : 'Acknowledge Review'}
            </Button>
        </form>
    );
}

export default function ShowPerformanceReview({ review }: Props) {
    const { can } = usePermission();

    const employeeName = review.employee
        ? `${review.employee.first_name} ${review.employee.last_name}`
        : '—';

    const displayPeriod = review.period ?? review.review_period ?? '—';

    function submitReview() {
        router.post(`/hr/performance-reviews/${review.id}/submit`);
    }

    function deleteReview() {
        if (confirm('Delete this review?')) {
            router.delete(`/hr/performance-reviews/${review.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={`Performance Review — ${employeeName}`} />
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">Performance Review</h1>
                            <StatusBadge status={review.status} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {employeeName} · {displayPeriod}
                        </p>
                    </div>
                    <a href="/hr/performance-reviews" className="text-sm text-slate-600 hover:text-slate-900">
                        Back to Reviews
                    </a>
                </div>

                {/* Meta */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{employeeName}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reviewer</dt>
                            <dd className="mt-1 text-sm text-slate-900">{review.reviewer?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Period</dt>
                            <dd className="mt-1 text-sm text-slate-900">{displayPeriod}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Review Date</dt>
                            <dd className="mt-1 text-sm text-slate-900">{review.review_date}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Overall Rating</dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {review.overall_rating != null ? `${review.overall_rating} / 5` : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Rating</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">
                                {review.average_rating > 0 ? `${review.average_rating} / 5` : '—'}
                            </dd>
                        </div>
                        {review.submitted_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted</dt>
                                <dd className="mt-1 text-sm text-slate-900">{review.submitted_at}</dd>
                            </div>
                        )}
                        {review.acknowledged_at && (
                            <div>
                                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Acknowledged</dt>
                                <dd className="mt-1 text-sm text-slate-900">{review.acknowledged_at}</dd>
                            </div>
                        )}
                    </dl>

                    {review.strengths && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Strengths</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.strengths}</p>
                        </div>
                    )}
                    {review.improvements && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Improvements</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.improvements}</p>
                        </div>
                    )}
                    {review.goals && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Goals</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.goals}</p>
                        </div>
                    )}
                    {review.employee_comments && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Employee Comments</dt>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.employee_comments}</p>
                        </div>
                    )}
                </div>

                {/* Competency Ratings */}
                {review.ratings && review.ratings.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Competency Ratings</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200">
                                    <th className="pb-2 pr-4">Competency</th>
                                    <th className="pb-2 pr-4">Rating</th>
                                    <th className="pb-2">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {review.ratings.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                                        <td className="py-2 pr-4 font-medium text-slate-900">{r.competency}</td>
                                        <td className="py-2 pr-4 text-slate-700">{r.rating} / 5</td>
                                        <td className="py-2 text-slate-500">{r.notes ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* KPIs */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-900">KPIs</h2>
                        {review.average_kpi_score != null && (
                            <span className="text-sm text-slate-600">
                                Average: <span className="font-semibold text-slate-900">{review.average_kpi_score}%</span>
                            </span>
                        )}
                    </div>

                    {review.kpis && review.kpis.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-200">
                                    <th className="pb-2 pr-4">Name</th>
                                    <th className="pb-2 pr-4">Target</th>
                                    <th className="pb-2 pr-4">Actual</th>
                                    <th className="pb-2 pr-4">Achievement %</th>
                                    <th className="pb-2 pr-4">Weight</th>
                                    <th className="pb-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {review.kpis.map((kpi) => (
                                    <KpiRow key={kpi.id} kpi={kpi} reviewId={review.id} />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-slate-500">No KPIs added yet.</p>
                    )}

                    {can('hr.create') && (
                        <AddKpiForm reviewId={review.id} />
                    )}
                </div>

                {/* Actions */}
                {can('hr.create') && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900">Actions</h2>

                        {review.status === 'draft' && (
                            <div>
                                <Button onClick={submitReview} className="bg-blue-600 hover:bg-blue-700">
                                    Submit for Review
                                </Button>
                            </div>
                        )}

                        {review.status === 'submitted' && (
                            <AcknowledgeForm reviewId={review.id} />
                        )}

                        {review.status === 'acknowledged' && (
                            <p className="text-sm text-green-700 font-medium">This review has been acknowledged.</p>
                        )}

                        {can('hr.delete') && (
                            <div className="pt-2 border-t border-slate-100">
                                <button
                                    onClick={deleteReview}
                                    className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 border border-red-200"
                                >
                                    Delete Review
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
