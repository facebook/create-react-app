import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DocumentTemplate } from '@/types/finance';

interface Props {
    template: DocumentTemplate;
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

export default function Show({ template }: Props) {
    const [testJson, setTestJson] = useState('{\n  "client_name": "Acme Corp",\n  "invoice_number": "INV-001",\n  "total": "1,250.00"\n}');
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewError, setPreviewError] = useState('');

    const handlePreview = () => {
        setPreviewError('');
        let parsedData: Record<string, string> = {};
        try {
            parsedData = JSON.parse(testJson);
        } catch {
            setPreviewError('Invalid JSON. Please check your test data.');
            return;
        }

        // Client-side preview by substituting variables
        let rendered = template.body;
        for (const [key, value] of Object.entries(parsedData)) {
            rendered = rendered.split(`{{${key}}}`).join(String(value));
        }
        setPreviewHtml(rendered);
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        router.delete(`/finance/document-templates/${template.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Template: ${template.name}`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/finance/document-templates" className="text-gray-500 hover:text-gray-700 text-sm">
                            &larr; Templates
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-900">{template.name}</h1>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeColors[template.type] ?? 'bg-gray-100 text-gray-700'}`}>
                            {typeLabels[template.type] ?? template.type}
                        </span>
                        {template.is_default && (
                            <span className="text-yellow-500 text-lg" title="Default template">&#9733;</span>
                        )}
                        <span className={`inline-block w-2 h-2 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-gray-300'}`} title={template.is_active ? 'Active' : 'Inactive'} />
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/finance/document-templates/${template.id}/edit`}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white shadow rounded-lg p-4">
                        <h2 className="text-sm font-medium text-gray-500 mb-2">Details</h2>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-gray-500">Subject</dt>
                                <dd className="text-gray-900">{template.subject ?? <span className="text-gray-400">—</span>}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Created</dt>
                                <dd className="text-gray-900">{template.created_at ? template.created_at.slice(0, 10) : '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    {template.variables && template.variables.length > 0 && (
                        <div className="bg-white shadow rounded-lg p-4 lg:col-span-2">
                            <h2 className="text-sm font-medium text-gray-500 mb-2">Variables</h2>
                            <div className="flex flex-wrap gap-2">
                                {template.variables.map((v) => (
                                    <code key={v} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded">
                                        {`{{${v}}}`}
                                    </code>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-2">Template Body</h2>
                    <pre className="text-xs text-gray-800 bg-gray-50 rounded p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                        {template.body}
                    </pre>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-base font-medium text-gray-900 mb-4">Live Preview</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Data (JSON)</label>
                        <textarea
                            value={testJson}
                            onChange={(e) => setTestJson(e.target.value)}
                            rows={6}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {previewError && <p className="mt-1 text-xs text-red-600">{previewError}</p>}
                    </div>
                    <button
                        onClick={handlePreview}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 mb-4"
                    >
                        Render Preview
                    </button>
                    {previewHtml && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Rendered Output</h3>
                            <div
                                className="prose max-w-none text-sm"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
