import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { UnitOfMeasure } from '@/types/inventory';

interface Props {
    unit: UnitOfMeasure;
}

export default function Show({ unit }: Props) {
    return (
        <AppLayout>
            <Head title={`Unit of Measure: ${unit.name}`} />
            <div className="p-6 max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{unit.display_name}</h1>
                    <Link
                        href="/inventory/units-of-measure"
                        className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                    >
                        Back
                    </Link>
                </div>

                <div className="bg-white rounded border p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                            <p className="mt-1 text-sm text-gray-900">{unit.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Abbreviation</p>
                            <p className="mt-1 text-sm text-gray-900">{unit.abbreviation}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Type</p>
                            <p className="mt-1 text-sm text-gray-900 capitalize">{unit.type}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Conversion Factor</p>
                            <p className="mt-1 text-sm text-gray-900">{unit.conversion_factor}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Base Unit</p>
                            <p className="mt-1 text-sm text-gray-900">{unit.is_base ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                            <span className={`mt-1 inline-flex px-2 py-0.5 rounded text-xs font-medium ${unit.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {unit.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
