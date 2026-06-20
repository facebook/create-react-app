import { Head } from '@inertiajs/react';
import { SalaryGrade } from '@/types/hr';

interface Props {
    grade: SalaryGrade;
}

export default function SalaryGradeShow({ grade }: Props) {
    return (
        <>
            <Head title={`Salary Grade: ${grade.name}`} />
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">{grade.name}</h1>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm text-slate-500">Code</dt>
                        <dd className="font-medium">{grade.code ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-slate-500">Salary Range</dt>
                        <dd className="font-medium">{grade.salary_range}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-slate-500">Midpoint</dt>
                        <dd className="font-medium">{grade.midpoint.toLocaleString()} {grade.currency}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-slate-500">Status</dt>
                        <dd className="font-medium">{grade.is_active ? 'Active' : 'Inactive'}</dd>
                    </div>
                </dl>
            </div>
        </>
    );
}
