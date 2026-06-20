import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface WebMenu {
    id: number;
    name: string;
    location: string;
    items: Record<string, unknown>[];
    is_active: boolean;
    created_at: string;
}

interface Props extends PageProps {
    menus: WebMenu[];
}

const locationBadge = (location: string) => {
    const classes: Record<string, string> = {
        header:  'bg-blue-100 text-blue-700',
        footer:  'bg-slate-100 text-slate-700',
        sidebar: 'bg-purple-100 text-purple-700',
    };
    const cls = classes[location] ?? 'bg-gray-100 text-gray-700';
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
            {location}
        </span>
    );
};

export default function MenusIndex({ menus }: Props) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name:     '',
        location: 'header' as 'header' | 'footer' | 'sidebar',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/website/menus', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    return (
        <AppLayout title="Menus">
            <Head title="Menus" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900">Navigation Menus</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'New Menu'}
                    </button>
                </div>

                {/* Inline Create Form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <h2 className="font-medium text-slate-800">Create Menu</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Location</label>
                                <select
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value as 'header' | 'footer' | 'sidebar')}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="header">Header</option>
                                    <option value="footer">Footer</option>
                                    <option value="sidebar">Sidebar</option>
                                </select>
                                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Menu'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Menus List */}
                <div className="space-y-3">
                    {menus.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                            No menus yet.
                        </div>
                    )}
                    {menus.map((menu) => (
                        <div key={menu.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-slate-900">{menu.name}</span>
                                {locationBadge(menu.location)}
                                {!menu.is_active && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-slate-500">
                                {menu.items.length} item{menu.items.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
