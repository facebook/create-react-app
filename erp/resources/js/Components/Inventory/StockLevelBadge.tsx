interface Props {
    quantity: number;
    reorderPoint?: number;
}

export function StockLevelBadge({ quantity, reorderPoint }: Props) {
    if (quantity === 0) {
        return (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                Out of stock
            </span>
        );
    }
    if (reorderPoint !== undefined && quantity <= reorderPoint) {
        return (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Low ({quantity})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {quantity}
        </span>
    );
}
