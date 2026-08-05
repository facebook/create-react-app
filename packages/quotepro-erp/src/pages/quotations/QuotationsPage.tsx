import React, { useState } from 'react'
import { Layout, Card, Button, Input, Select, Table, Badge } from '@components/index'
import { Plus, Search, Download, Eye, Edit, Copy, Trash2 } from 'lucide-react'

interface Quotation {
  id: string
  number: string
  client: string
  amount: number
  status: 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected'
  createdDate: string
  dueDate: string
}

export const QuotationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const quotations: Quotation[] = [
    {
      id: '1',
      number: 'QT-001',
      client: 'Tech Solutions Inc',
      amount: 5250.00,
      status: 'pending',
      createdDate: '2024-01-15',
      dueDate: '2024-01-25',
    },
    {
      id: '2',
      number: 'QT-002',
      client: 'Digital Marketing Pro',
      amount: 3890.50,
      status: 'sent',
      createdDate: '2024-01-14',
      dueDate: '2024-01-24',
    },
    {
      id: '3',
      number: 'QT-003',
      client: 'Consulting Group',
      amount: 7200.00,
      status: 'accepted',
      createdDate: '2024-01-13',
      dueDate: '2024-01-23',
    },
    {
      id: '4',
      number: 'QT-004',
      client: 'Tech Solutions Inc',
      amount: 2150.00,
      status: 'draft',
      createdDate: '2024-01-12',
      dueDate: '2024-01-22',
    },
  ]

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors = {
    draft: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }

  return (
    <Layout>
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quotations</h1>
          <div className="flex gap-sm">
            <Button variant="secondary" size="md">
              <Download size={18} />
              Export
            </Button>
            <Button variant="primary" size="md">
              <Plus size={18} />
              New Quotation
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-md items-end">
            <Input
              label="Search"
              placeholder="Quote number or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
              className="flex-1"
            />
            <Select
              label="Status"
              options={[
                { label: 'All', value: 'all' },
                { label: 'Draft', value: 'draft' },
                { label: 'Sent', value: 'sent' },
                { label: 'Pending', value: 'pending' },
                { label: 'Accepted', value: 'accepted' },
                { label: 'Rejected', value: 'rejected' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <Table<Quotation>
            columns={[
              {
                key: 'number',
                label: 'Quote #',
                width: '12%',
                render: (value) => <span className="font-medium text-brand-primary">{value}</span>,
              },
              {
                key: 'client',
                label: 'Client',
                width: '28%',
              },
              {
                key: 'amount',
                label: 'Amount',
                width: '15%',
                render: (value) => <span className="font-semibold">${value.toFixed(2)}</span>,
              },
              {
                key: 'createdDate',
                label: 'Created',
                width: '15%',
              },
              {
                key: 'dueDate',
                label: 'Due Date',
                width: '15%',
              },
              {
                key: 'status',
                label: 'Status',
                width: '10%',
                render: (value) => (
                  <span className={`px-xs py-2xs rounded-xs text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                ),
              },
              {
                key: 'id',
                label: 'Actions',
                width: '5%',
                render: () => (
                  <div className="flex gap-xs">
                    <button className="text-blue-600 hover:text-blue-700" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-700" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="text-slate-600 hover:text-slate-700" title="Duplicate">
                      <Copy size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-700" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredQuotations}
            keyExtractor={(q) => q.id}
          />
        </Card>
      </div>
    </Layout>
  )
}
