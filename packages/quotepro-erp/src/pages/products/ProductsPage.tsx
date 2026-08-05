import React, { useState } from 'react'
import { Layout, Card, Button, Input, Select, Tabs, Modal } from '@components/index'
import { Plus, Search, Grid, List, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
}

export const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all')

  const products: Product[] = [
    { id: '1', name: 'Premium License', sku: 'LIC-001', category: 'licenses', price: 299.99, stock: 150 },
    { id: '2', name: 'Support Package', sku: 'SUP-001', category: 'services', price: 199.99, stock: 100 },
    { id: '3', name: 'Training Course', sku: 'TRN-001', category: 'training', price: 499.99, stock: 50 },
    { id: '4', name: 'Consulting Hours', sku: 'CON-001', category: 'services', price: 150.00, stock: 200 },
  ]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <Layout>
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Products</h1>
          <Button variant="primary" size="md">
            <Plus size={18} />
            Add Product
          </Button>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-md items-end justify-between">
            <div className="flex-1 flex gap-md items-end">
              <Input
                label="Search"
                placeholder="Product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
              <Select
                label="Category"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Licenses', value: 'licenses' },
                  { label: 'Services', value: 'services' },
                  { label: 'Training', value: 'training' },
                ]}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-sm">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </Button>
            </div>
          </div>
        </Card>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredProducts.map((product) => (
              <Card key={product.id} hover>
                <div className="flex items-start justify-between mb-md">
                  <div className="p-sm rounded-lg bg-blue-100 dark:bg-blue-900/30 text-brand-primary">
                    <Package size={24} />
                  </div>
                  <span className="text-xs px-xs py-2xs rounded-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                    {product.stock} in stock
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-xs">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-md">
                  SKU: {product.sku}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button variant="primary" size="sm">
                    Select
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="space-y-sm">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {product.stock} available
                    </p>
                  </div>
                  <Button variant="primary" size="sm" className="ml-md">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
