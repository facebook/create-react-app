const map: Record<string, string> = {
    draft:  'bg-slate-100 text-slate-600',
    posted: 'bg-green-100 text-green-700',
};

export function JournalEntryStatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {status}
        </span>
    );
}
