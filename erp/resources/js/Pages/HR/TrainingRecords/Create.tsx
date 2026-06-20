import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';
import type { TrainingCourse } from '@/types/hr';

interface SimpleEmployee {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props extends PageProps {
    employees: SimpleEmployee[];
    courses: Pick<TrainingCourse, 'id' | 'title'>[];
    employeeId: string | null;
    courseId: string | null;
}

export default function TrainingRecordsCreate({ employees, courses, employeeId, courseId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: employeeId ?? '',
        training_course_id: courseId ?? '',
        course_title: '',
        completed_date: '',
        expiry_date: '',
        score: '',
        passed: true,
        certificate_number: '',
        notes: '',
    });

    function handleCourseChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedId = e.target.value;
        setData('training_course_id', selectedId);
        if (selectedId) {
            const course = courses.find((c) => String(c.id) === selectedId);
            if (course) {
                setData('course_title', course.title);
            }
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/hr/training-records');
    }

    return (
        <AppLayout>
            <Head title="New Training Record" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">New Training Record</h1>
                    <p className="text-sm text-slate-500 mt-1">Record an employee's course completion.</p>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Employee <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Select employee…</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="mt-1 text-xs text-red-600">{errors.employee_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course (optional)</label>
                        <select
                            value={data.training_course_id}
                            onChange={handleCourseChange}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Select course…</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        {errors.training_course_id && <p className="mt-1 text-xs text-red-600">{errors.training_course_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Course Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.course_title}
                            onChange={(e) => setData('course_title', e.target.value)}
                            placeholder="Auto-filled when course selected"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.course_title && <p className="mt-1 text-xs text-red-600">{errors.course_title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Completed Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.completed_date}
                                onChange={(e) => setData('completed_date', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.completed_date && <p className="mt-1 text-xs text-red-600">{errors.completed_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                            <input
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.expiry_date && <p className="mt-1 text-xs text-red-600">{errors.expiry_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Score (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.score}
                            onChange={(e) => setData('score', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.score && <p className="mt-1 text-xs text-red-600">{errors.score}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="passed"
                            type="checkbox"
                            checked={data.passed}
                            onChange={(e) => setData('passed', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="passed" className="text-sm font-medium text-slate-700">Passed</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Number</label>
                        <input
                            type="text"
                            value={data.certificate_number}
                            onChange={(e) => setData('certificate_number', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.certificate_number && <p className="mt-1 text-xs text-red-600">{errors.certificate_number}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Create Record'}
                        </Button>
                        <a href="/hr/training-records" className="text-sm text-slate-600 hover:text-slate-900">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
