import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Supplier {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    category: string | null;
    is_available: boolean;
    supplier: Supplier;
    description: string | null;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    products: PaginatedProducts;
}

export default function ProductsIndex({ products }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        lunch_supplier_id: '',
        name: '',
        description: '',
        price: '',
        category: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lunch/products', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Lunch Products" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Lunch Products</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage available lunch products.</p>
                </div>

                {/* Add Product Form */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Product</h2>
                    <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier ID *</label>
                            <input
                                type="number"
                                value={data.lunch_supplier_id}
                                onChange={(e) => setData('lunch_supplier_id', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ID"
                            />
                            {errors.lunch_supplier_id && <p className="text-red-500 text-xs mt-1">{errors.lunch_supplier_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Caesar Salad"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="9.99"
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Salads"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {processing ? 'Adding...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.data.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-gray-400">
                            No products yet. Add one above.
                        </div>
                    ) : (
                        products.data.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        ${Number(product.price).toFixed(2)}
                                    </span>
                                </div>
                                {product.category && (
                                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                                )}
                                {product.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{product.supplier.name}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                        {product.is_available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
