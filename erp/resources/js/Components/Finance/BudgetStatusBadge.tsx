type BudgetStatus = 'draft' | 'active' | 'closed' | 'archived';

const map: Record<BudgetStatus, string> = {
    draft:    'bg-slate-100 text-slate-600',
    active:   'bg-green-100 text-green-700',
    closed:   'bg-red-100 text-red-700',
    archived: 'bg-slate-100 text-slate-500',
};

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status}
        </span>
    );
}
