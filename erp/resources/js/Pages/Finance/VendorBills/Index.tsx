import { Head } from '@inertiajs/react';

interface Props {
    bills: {
        data: Array<{
            id: number;
            bill_number: string;
            status: string;
            bill_date: string;
            total: number;
        }>;
    };
    filters?: Record<string, string>;
}

export default function VendorBillsIndex({ bills }: Props) {
    return (
        <>
            <Head title="Vendor Bills" />
            <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900">Vendor Bills</h1>
                <div className="mt-4">
                    {bills.data.length === 0 ? (
                        <p className="text-slate-500">No vendor bills found.</p>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {bills.data.map((bill) => (
                                <li key={bill.id} className="py-3">
                                    <span className="font-medium">{bill.bill_number}</span>
                                    <span className="ml-4 text-slate-500">{bill.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
