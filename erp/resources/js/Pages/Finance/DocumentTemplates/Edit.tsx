import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DocumentTemplate } from '@/types/finance';

interface Props {
    template: DocumentTemplate;
}

export default function Edit({ template }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name:       template.name,
        type:       template.type as string,
        subject:    template.subject ?? '',
        body:       template.body,
        variables:  template.variables ?? ([] as string[]),
        is_default: template.is_default,
        is_active:  template.is_active,
    });

    const [variableInput, setVariableInput] = useState('');

    const handleVariableKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = variableInput.trim().replace(/,$/, '');
            if (val && !data.variables.includes(val)) {
                setData('variables', [...data.variables, val]);
            }
            setVariableInput('');
        }
    };

    const removeVariable = (v: string) => {
        setData('variables', data.variables.filter((x) => x !== v));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/finance/document-templates/${template.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Template: ${template.name}`} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Edit Template</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="invoice">Invoice</option>
                                <option value="quote">Quote</option>
                                <option value="letter">Letter</option>
                                <option value="receipt">Receipt</option>
                                <option value="purchase_order">Purchase Order</option>
                            </select>
                            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject (email subject line)</label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Body * <span className="text-gray-400 font-normal">(HTML with {`{{variable}}`} placeholders)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Example variables: <code className="bg-gray-100 px-1 rounded">{'{{invoice_number}}'}</code>{' '}
                            <code className="bg-gray-100 px-1 rounded">{'{{client_name}}'}</code>{' '}
                            <code className="bg-gray-100 px-1 rounded">{'{{total}}'}</code>
                        </p>
                        <textarea
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            rows={12}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
                        <p className="text-xs text-gray-500 mb-2">Type a variable name and press Enter or comma to add it.</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {data.variables.map((v) => (
                                <span key={v} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                    {v}
                                    <button type="button" onClick={() => removeVariable(v)} className="hover:text-red-600">&times;</button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={variableInput}
                            onChange={(e) => setVariableInput(e.target.value)}
                            onKeyDown={handleVariableKeyDown}
                            placeholder="e.g. client_name"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_default}
                                onChange={(e) => setData('is_default', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600"
                            />
                            Set as default for this type
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600"
                            />
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end gap-3">
                        <a href={`/finance/document-templates/${template.id}`} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
