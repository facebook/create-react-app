interface Props {
    status: 'active' | 'disposed' | 'fully_depreciated';
}

const config: Record<string, { label: string; classes: string }> = {
    active:            { label: 'Active',             classes: 'bg-green-100 text-green-800' },
    disposed:          { label: 'Disposed',           classes: 'bg-slate-100 text-slate-700' },
    fully_depreciated: { label: 'Fully Depreciated',  classes: 'bg-amber-100 text-amber-800' },
};

export function AssetStatusBadge({ status }: Props) {
    const { label, classes } = config[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
            {label}
        </span>
    );
}
