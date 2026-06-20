import { Head } from '@inertiajs/react';
import { SalaryGrade } from '@/types/hr';

interface Props {
    grades: {
        data: SalaryGrade[];
        current_page: number;
        last_page: number;
    };
}

export default function SalaryGradesIndex({ grades }: Props) {
    return (
        <>
            <Head title="Salary Grades" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Salary Grades</h1>
                <div className="mt-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Name</th>
                                <th className="py-2 text-left">Code</th>
                                <th className="py-2 text-left">Salary Range</th>
                                <th className="py-2 text-left">Currency</th>
                                <th className="py-2 text-left">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.data.map((grade) => (
                                <tr key={grade.id} className="border-b">
                                    <td className="py-2">{grade.name}</td>
                                    <td className="py-2">{grade.code ?? '-'}</td>
                                    <td className="py-2">{grade.salary_range}</td>
                                    <td className="py-2">{grade.currency}</td>
                                    <td className="py-2">{grade.is_active ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
