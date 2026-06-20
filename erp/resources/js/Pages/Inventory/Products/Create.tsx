import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ProductForm } from '@/Components/Inventory/ProductForm';
import type { PageProps } from '@/types';
import type { ProductCategory, UnitOfMeasure } from '@/types/inventory';

interface Props extends PageProps {
    categories: Pick<ProductCategory, 'id' | 'name'>[];
    uoms: UnitOfMeasure[];
}

export default function ProductCreate({ categories, uoms }: Props) {
    return (
        <AppLayout>
            <Head title="Create Product" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/inventory/products" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Products
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">New Product</h1>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <ProductForm
                        categories={categories}
                        uoms={uoms}
                        action="/inventory/products"
                        method="post"
                        submitLabel="Create Product"
                        cancelHref="/inventory/products"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
