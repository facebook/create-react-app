interface DataPoint {
    label: string;
    value: number;
}

interface BarChartProps {
    data: DataPoint[];
    valueFormatter?: (n: number) => string;
    color?: string;
    horizontal?: boolean;
}

export function BarChart({ data, valueFormatter, color = 'bg-indigo-500', horizontal = false }: BarChartProps) {
    const max = Math.max(...data.map((d) => d.value), 1);
    const fmt = valueFormatter ?? ((n) => String(n));

    if (horizontal) {
        return (
            <div className="space-y-2">
                {data.map((d) => (
                    <div key={d.label} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-xs text-slate-500 text-right truncate">{d.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${color}`}
                                style={{ width: `${(d.value / max) * 100}%` }}
                            />
                        </div>
                        <span className="w-20 shrink-0 text-xs font-medium text-slate-700 text-right">
                            {fmt(d.value)}
                        </span>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No data</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-end gap-1 h-36">
            {data.map((d) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-xs text-slate-600 font-medium hidden sm:block truncate w-full text-center">
                        {d.value > 0 ? fmt(d.value) : ''}
                    </span>
                    <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${color} min-h-[2px]`}
                        style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
                    />
                    <span className="text-[10px] text-slate-400 truncate w-full text-center">{d.label}</span>
                </div>
            ))}
            {data.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4 w-full">No data</p>
            )}
        </div>
    );
}
