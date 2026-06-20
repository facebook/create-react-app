import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Survey {
    id: number;
    title: string;
    description: string | null;
    status: string;
}

interface TextStats {
    type: 'text';
    answers: string[];
}

interface ChoiceStats {
    type: 'single_choice' | 'multiple_choice';
    counts: Record<string, number>;
}

interface RatingStats {
    type: 'rating';
    average: number | null;
    count: number;
}

interface YesNoStats {
    type: 'yes_no';
    yes: number;
    no: number;
}

type QuestionStats = TextStats | ChoiceStats | RatingStats | YesNoStats;

interface QuestionResult {
    id: number;
    question_text: string;
    question_type: string;
    stats: QuestionStats;
}

interface Props extends PageProps {
    survey: Survey;
    questionStats: QuestionResult[];
    responseCount: number;
}

export default function SurveyResults({ survey, questionStats, responseCount }: Props) {
    return (
        <AppLayout>
            <Head title={`Results: ${survey.title}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/surveys" className="text-sm text-slate-500 hover:text-slate-700">Surveys</Link>
                            <span className="text-slate-400">/</span>
                            <Link href={`/surveys/${survey.id}`} className="text-sm text-slate-500 hover:text-slate-700">{survey.title}</Link>
                            <span className="text-slate-400">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">Results</h1>
                        </div>
                        <p className="text-sm text-slate-500">{responseCount} total responses</p>
                    </div>
                    <Link href={`/surveys/${survey.id}`}>
                        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Back to Survey
                        </button>
                    </Link>
                </div>

                {/* Question Results */}
                <div className="space-y-4">
                    {questionStats.length === 0 && (
                        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400">
                            No questions found.
                        </div>
                    )}
                    {questionStats.map((q, i) => (
                        <div key={q.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                            <h3 className="text-base font-medium text-slate-800 mb-4">
                                {i + 1}. {q.question_text}
                                <span className="ml-2 text-xs font-normal text-slate-400 capitalize">
                                    ({q.question_type.replace('_', ' ')})
                                </span>
                            </h3>

                            {q.stats.type === 'text' && (
                                <div className="space-y-2">
                                    {q.stats.answers.length === 0 ? (
                                        <p className="text-sm text-slate-400">No answers yet.</p>
                                    ) : (
                                        q.stats.answers.map((answer, j) => (
                                            <div key={j} className="bg-slate-50 rounded px-3 py-2 text-sm text-slate-700">
                                                {answer}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {(q.stats.type === 'single_choice' || q.stats.type === 'multiple_choice') && (
                                <div className="space-y-2">
                                    {Object.entries(q.stats.counts).map(([option, count]) => {
                                        const total = Object.values(q.stats.counts as Record<string, number>).reduce((a, b) => a + b, 0);
                                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                        return (
                                            <div key={option}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-slate-700">{option}</span>
                                                    <span className="text-slate-500">{count} ({pct}%)</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {q.stats.type === 'rating' && (
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {q.stats.average !== null ? q.stats.average.toFixed(1) : '—'}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        Average rating from {q.stats.count} response{q.stats.count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            )}

                            {q.stats.type === 'yes_no' && (
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">{q.stats.yes}</div>
                                        <div className="text-sm text-slate-500">Yes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-red-500">{q.stats.no}</div>
                                        <div className="text-sm text-slate-500">No</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
