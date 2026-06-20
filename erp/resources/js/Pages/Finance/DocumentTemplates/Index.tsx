import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DocumentTemplate } from '@/types/finance';

interface Props {
    templates: {
        data: DocumentTemplate[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filter: { type: string };
}

const typeBadgeColors: Record<string, string> = {
    invoice:        'bg-blue-100 text-blue-700',
    quote:          'bg-indigo-100 text-indigo-700',
    letter:         'bg-slate-100 text-slate-700',
    receipt:        'bg-green-100 text-green-700',
    purchase_order: 'bg-amber-100 text-amber-700',
};

const typeLabels: Record<string, string> = {
    invoice:        'Invoice',
    quote:          'Quote',
    letter:         'Letter',
    receipt:        'Receipt',
    purchase_order: 'Purchase Order',
};

export default function Index({ templates, filter }: Props) {
    const [selectedType, setSelectedType] = useState(filter.type || '');

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedType(val);
        router.get('/finance/document-templates', val ? { type: val } : {}, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Document Templates" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Document Templates</h1>
                    <Link
                        href="/finance/document-templates/create"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                    >
                        New Template
                    </Link>
                </div>

                <div className="mb-4">
                    <select
                        value={selectedType}
                        onChange={handleTypeChange}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Types</option>
                        <option value="invoice">Invoice</option>
                        <option value="quote">Quote</option>
                        <option value="letter">Letter</option>
                        <option value="receipt">Receipt</option>
                        <option value="purchase_order">Purchase Order</option>
                    </select>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {templates.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No document templates found.
                                    </td>
                                </tr>
                            ) : (
                                templates.data.map((tpl) => (
                                    <tr key={tpl.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {tpl.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeColors[tpl.type] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {typeLabels[tpl.type] ?? tpl.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tpl.is_default ? (
                                                <span className="text-yellow-500" title="Default">&#9733;</span>
                                            ) : (
                                                <span className="text-gray-300">&#9734;</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-block w-2 h-2 rounded-full ${tpl.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tpl.created_at ? tpl.created_at.slice(0, 10) : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <Link
                                                href={`/finance/document-templates/${tpl.id}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/finance/document-templates/${tpl.id}/edit`}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {templates.links.length > 3 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {templates.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 text-sm rounded ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                                } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
