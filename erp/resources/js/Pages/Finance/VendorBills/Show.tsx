import { Head } from '@inertiajs/react';

interface VendorBillItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

interface VendorBillData {
    id: number;
    bill_number: string;
    status: string;
    bill_date: string;
    due_date: string | null;
    currency: string;
    subtotal: number;
    tax: number;
    total: number;
    notes: string | null;
    items?: VendorBillItem[];
    supplier?: { id: number; name: string } | null;
}

interface Props {
    bill: VendorBillData;
}

export default function VendorBillShow({ bill }: Props) {
    return (
        <>
            <Head title={`Vendor Bill ${bill.bill_number}`} />
            <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Vendor Bill {bill.bill_number}
                </h1>
                <div className="mt-4 space-y-2">
                    <p><span className="font-medium">Status:</span> {bill.status}</p>
                    <p><span className="font-medium">Date:</span> {bill.bill_date}</p>
                    <p><span className="font-medium">Total:</span> {bill.currency} {bill.total}</p>
                </div>
                {bill.items && bill.items.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-800">Items</h2>
                        <ul className="mt-2 divide-y divide-slate-200">
                            {bill.items.map((item) => (
                                <li key={item.id} className="py-2">
                                    <span>{item.description}</span>
                                    <span className="ml-4 text-slate-500">
                                        {item.quantity} x {item.unit_price} = {item.line_total}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
