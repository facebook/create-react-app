import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {}

interface ImportFormProps {
    title: string;
    description: string;
    columns: string;
    action: string;
    inputName?: string;
}

function ImportCard({ title, description, columns, action }: ImportFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{ file: File | null }>({
        file: null,
    });
    const fileRef = useRef<HTMLInputElement>(null);

    function submit(e: FormEvent) {
        e.preventDefault();
        post(action, {
            forceFormData: true,
            onSuccess: () => {
                reset('file');
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            </div>
            <div className="px-5 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Expected columns: <span className="font-normal text-slate-600 normal-case">{columns}</span>
                </p>
                <form onSubmit={submit} className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="mb-1 block text-sm text-slate-600">CSV File</label>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv,text/csv"
                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {errors.file && (
                            <p className="mt-1 text-xs text-red-600">{errors.file}</p>
                        )}
                    </div>
                    <Button type="submit" disabled={processing || !data.file}>
                        {processing ? 'Importing…' : 'Import'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function ImportIndex({}: Props) {
    const { flash } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Bulk Import" />

            {/* Flash messages */}
            {(flash.success || flash.error) && (
                <div className="mb-5">
                    {flash.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Bulk Import</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Upload CSV files to import products, employees, or contacts in bulk.
                    Existing records are matched and updated; new records are created.
                </p>
            </div>

            <div className="space-y-5">
                <ImportCard
                    title="Import Products"
                    description="Create or update products. Existing products are matched by SKU."
                    columns="name (required), sku, sale_price, cost_price, category"
                    action="/import/products"
                />

                <ImportCard
                    title="Import Employees"
                    description="Create or update employees. Existing employees matched by email."
                    columns="first_name (required), last_name (required), email, department, position, hire_date (YYYY-MM-DD)"
                    action="/import/employees"
                />

                <ImportCard
                    title="Import Contacts"
                    description="Create or update customers or suppliers. Existing contacts matched by email."
                    columns="name (required), email, phone, type (customer / supplier / both)"
                    action="/import/contacts"
                />
            </div>

            {/* Sample download links */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Sample CSV Files</h3>
                <p className="text-xs text-slate-500">
                    Download a sample CSV to see the expected format for each import type.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                    <a
                        href="data:text/csv;charset=utf-8,name,sku,sale_price,cost_price,category%0AWidget%20A,SKU001,19.99,10.00,General%0AWidget%20B,SKU002,29.99,15.00,General"
                        download="sample_products.csv"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Products Sample
                    </a>
                    <a
                        href="data:text/csv;charset=utf-8,first_name,last_name,email,department,position,hire_date%0AJohn,Doe,john@example.com,Engineering,Developer,2025-01-15"
                        download="sample_employees.csv"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Employees Sample
                    </a>
                    <a
                        href="data:text/csv;charset=utf-8,name,email,phone,type%0AAcme%20Corp,acme@example.com,555-1234,customer%0ASupply%20Co,supply@example.com,555-5678,supplier"
                        download="sample_contacts.csv"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Contacts Sample
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
