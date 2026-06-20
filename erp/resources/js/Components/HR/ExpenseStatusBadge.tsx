export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';

const map: Record<ExpenseStatus, string> = {
    draft:      'bg-slate-100 text-slate-600',
    submitted:  'bg-blue-100 text-blue-700',
    approved:   'bg-green-100 text-green-700',
    rejected:   'bg-red-100 text-red-600',
    reimbursed: 'bg-purple-100 text-purple-700',
};

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status}
        </span>
    );
}
