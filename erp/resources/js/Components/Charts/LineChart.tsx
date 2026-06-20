interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    valueFormatter?: (n: number) => string;
}

export function LineChart({ data, valueFormatter }: LineChartProps) {
    if (data.length < 2) {
        return <p className="text-sm text-slate-400 text-center py-4">Not enough data</p>;
    }

    const W = 600;
    const H = 140;
    const padX = 10;
    const padY = 12;
    const plotW = W - padX * 2;
    const plotH = H - padY * 2;

    const max = Math.max(...data.map((d) => d.value), 1);

    const pts = data.map((d, i) => ({
        x: padX + (i / (data.length - 1)) * plotW,
        y: H - padY - (d.value / max) * plotH,
        ...d,
    }));

    const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const areaPath = `M${padX},${H - padY} ${pts.map((p) => `L${p.x},${p.y}`).join(' ')} L${W - padX},${H - padY} Z`;

    return (
        <div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line
                        key={t}
                        x1={padX} y1={padY + (1 - t) * plotH}
                        x2={W - padX} y2={padY + (1 - t) * plotH}
                        stroke="#e2e8f0" strokeWidth="1"
                    />
                ))}
                {/* Area fill */}
                <path d={areaPath} fill="#6366f1" fillOpacity="0.08" />
                {/* Line */}
                <polyline
                    points={polyline}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Dots */}
                {pts.map((p) => (
                    <circle key={p.label} cx={p.x} cy={p.y} r="3.5" fill="#6366f1" />
                ))}
            </svg>
            {/* Labels */}
            <div className="flex justify-between mt-1 px-1">
                {data.map((d, i) => (
                    i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0
                        ? <span key={d.label} className="text-[10px] text-slate-400">{d.label}</span>
                        : <span key={d.label} />
                ))}
            </div>
        </div>
    );
}
