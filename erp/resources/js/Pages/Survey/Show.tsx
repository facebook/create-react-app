import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface SurveyQuestion {
    id: number;
    question_text: string;
    question_type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'yes_no';
    is_required: boolean;
    sequence: number;
    options: string[] | null;
}

interface Survey {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'published' | 'closed';
    starts_at: string | null;
    ends_at: string | null;
    questions: SurveyQuestion[];
}

interface Props extends PageProps {
    survey: Survey;
    responseCount: number;
}

const typeIcons: Record<string, string> = {
    text:            '📝',
    single_choice:   '🔘',
    multiple_choice: '☑️',
    rating:          '⭐',
    yes_no:          '✅',
};

const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    closed:    'bg-red-100 text-red-700',
};

export default function SurveyShow({ survey, responseCount }: Props) {
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [options, setOptions] = useState<string[]>(['']);

    const { data, setData, post, processing, reset, errors } = useForm({
        question_text: '',
        question_type: 'text' as SurveyQuestion['question_type'],
        is_required:   true,
        sequence:      0,
        options:       [] as string[],
    });

    const needsOptions = ['single_choice', 'multiple_choice'].includes(data.question_type);

    function handleAddQuestion(e: React.FormEvent) {
        e.preventDefault();
        post(`/surveys/${survey.id}/questions`, {
            data: {
                ...data,
                options: needsOptions ? options.filter(o => o.trim()) : [],
            },
            onSuccess: () => {
                reset();
                setOptions(['']);
                setShowQuestionForm(false);
            },
        });
    }

    function removeQuestion(questionId: number) {
        if (confirm('Remove this question?')) {
            router.delete(`/surveys/${survey.id}/questions/${questionId}`);
        }
    }

    function publish() {
        router.post(`/surveys/${survey.id}/publish`);
    }

    function close() {
        router.post(`/surveys/${survey.id}/close`);
    }

    return (
        <AppLayout>
            <Head title={survey.title} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link href="/surveys" className="text-sm text-slate-500 hover:text-slate-700">Surveys</Link>
                            <span className="text-slate-400">/</span>
                            <h1 className="text-2xl font-semibold text-slate-900">{survey.title}</h1>
                        </div>
                        {survey.description && (
                            <p className="text-sm text-slate-500 mt-1">{survey.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[survey.status]}`}>
                                {survey.status}
                            </span>
                            <span className="text-sm text-slate-500">{responseCount} responses</span>
                            {survey.starts_at && (
                                <span className="text-xs text-slate-400">
                                    Starts: {new Date(survey.starts_at).toLocaleDateString()}
                                </span>
                            )}
                            {survey.ends_at && (
                                <span className="text-xs text-slate-400">
                                    Ends: {new Date(survey.ends_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {survey.status === 'draft' && (
                            <Button onClick={publish}>Publish</Button>
                        )}
                        {survey.status === 'published' && (
                            <button
                                onClick={close}
                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                                Close Survey
                            </button>
                        )}
                        <Link href={`/surveys/${survey.id}/results`}>
                            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                View Results
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Questions */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-slate-800">Questions ({survey.questions.length})</h2>
                        {survey.status === 'draft' && (
                            <Button onClick={() => setShowQuestionForm(!showQuestionForm)}>Add Question</Button>
                        )}
                    </div>

                    {showQuestionForm && (
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <form onSubmit={handleAddQuestion} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Text *</label>
                                        <textarea
                                            value={data.question_text}
                                            onChange={e => setData('question_text', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        {errors.question_text && <p className="text-red-600 text-xs mt-1">{errors.question_text}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select
                                            value={data.question_type}
                                            onChange={e => setData('question_type', e.target.value as SurveyQuestion['question_type'])}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="text">Text</option>
                                            <option value="single_choice">Single Choice</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                            <option value="rating">Rating</option>
                                            <option value="yes_no">Yes / No</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            id="is_required"
                                            checked={data.is_required}
                                            onChange={e => setData('is_required', e.target.checked)}
                                            className="rounded border-slate-300"
                                        />
                                        <label htmlFor="is_required" className="text-sm text-slate-700">Required</label>
                                    </div>
                                </div>

                                {needsOptions && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Options</label>
                                        {options.map((opt, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={e => {
                                                        const next = [...options];
                                                        next[i] = e.target.value;
                                                        setOptions(next);
                                                    }}
                                                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    placeholder={`Option ${i + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setOptions(options.filter((_, j) => j !== i))}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setOptions([...options, ''])}
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            + Add option
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button type="submit" disabled={processing}>Add Question</Button>
                                    <button type="button" onClick={() => setShowQuestionForm(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <ul className="divide-y divide-slate-100">
                        {survey.questions.length === 0 && (
                            <li className="px-6 py-8 text-center text-slate-400 text-sm">No questions yet.</li>
                        )}
                        {survey.questions.map((q, i) => (
                            <li key={q.id} className="px-6 py-4 flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">{typeIcons[q.question_type]}</span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {i + 1}. {q.question_text}
                                            {q.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{q.question_type.replace('_', ' ')}</p>
                                        {q.options && q.options.length > 0 && (
                                            <ul className="mt-1 space-y-0.5">
                                                {q.options.map((opt, j) => (
                                                    <li key={j} className="text-xs text-slate-500">• {opt}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                {survey.status === 'draft' && (
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="text-xs text-red-500 hover:text-red-700 shrink-0 ml-4"
                                    >
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
