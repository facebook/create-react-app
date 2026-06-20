import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { JobPosition } from '@/types/hr';

interface Props extends PageProps {
    positions: Pick<JobPosition, 'id' | 'title'>[];
}

export default function CreateJobApplication({ positions }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        job_position_id: string;
        applicant_name: string;
        applicant_email: string;
        applicant_phone: string;
        source: string;
        cover_letter: string;
        rating: string;
    }>({
        job_position_id: '',
        applicant_name:  '',
        applicant_email: '',
        applicant_phone: '',
        source:          '',
        cover_letter:    '',
        rating:          '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/job-applications');
    }

    return (
        <AppLayout>
            <Head title="New Job Application" />
            <div className="max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Job Application</h1>
                    <p className="text-sm text-slate-500 mt-1">Submit a new candidate application</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-semibold text-slate-900">Application Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Job Position *</label>
                            <select
                                value={data.job_position_id}
                                onChange={(e) => setData('job_position_id', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">Select position…</option>
                                {positions.map((pos) => (
                                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                                ))}
                            </select>
                            {errors.job_position_id && <p className="text-sm text-red-600 mt-1">{errors.job_position_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Applicant Name *</label>
                            <input
                                type="text"
                                value={data.applicant_name}
                                onChange={(e) => setData('applicant_name', e.target.value)}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Full name"
                            />
                            {errors.applicant_name && <p className="text-sm text-red-600 mt-1">{errors.applicant_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={data.applicant_email}
                                    onChange={(e) => setData('applicant_email', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    placeholder="email@example.com"
                                />
                                {errors.applicant_email && <p className="text-sm text-red-600 mt-1">{errors.applicant_email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={data.applicant_phone}
                                    onChange={(e) => setData('applicant_phone', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    placeholder="+1 555-000-0000"
                                />
                                {errors.applicant_phone && <p className="text-sm text-red-600 mt-1">{errors.applicant_phone}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                                <input
                                    type="text"
                                    value={data.source}
                                    onChange={(e) => setData('source', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    placeholder="e.g. LinkedIn, Referral"
                                />
                                {errors.source && <p className="text-sm text-red-600 mt-1">{errors.source}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
                                <select
                                    value={data.rating}
                                    onChange={(e) => setData('rating', e.target.value)}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">No rating</option>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                {errors.rating && <p className="text-sm text-red-600 mt-1">{errors.rating}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Letter</label>
                            <textarea
                                value={data.cover_letter}
                                onChange={(e) => setData('cover_letter', e.target.value)}
                                rows={5}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Applicant's cover letter…"
                            />
                            {errors.cover_letter && <p className="text-sm text-red-600 mt-1">{errors.cover_letter}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting…' : 'Submit Application'}
                        </Button>
                        <a href="/hr/job-applications" className="text-sm text-slate-600 hover:text-slate-900">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
