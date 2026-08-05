import React, { useState } from 'react'
import { Layout, Card, Button, Input, Select, Table, Modal } from '@components/index'
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
  quotes: number
}

export const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const clients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      company: 'Tech Solutions Inc',
      status: 'active',
      quotes: 5,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 345 678 9012',
      company: 'Digital Marketing Pro',
      status: 'active',
      quotes: 3,
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@example.com',
      phone: '+1 456 789 0123',
      company: 'Consulting Group',
      status: 'inactive',
      quotes: 1,
    },
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Layout>
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <Button variant="primary" size="md">
            <Plus size={18} />
            Add Client
          </Button>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-md items-end">
            <Input
              label="Search clients"
              placeholder="Name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
              className="flex-1"
            />
            <Select
              label="Status"
              options={[
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Button variant="secondary" size="md">
              <Filter size={18} />
            </Button>
          </div>
        </Card>

        <Card>
          <Table<Client>
            columns={[
              {
                key: 'name',
                label: 'Name',
                width: '25%',
                render: (value, client) => (
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{client.company}</p>
                  </div>
                ),
              },
              {
                key: 'email',
                label: 'Email',
                width: '25%',
              },
              {
                key: 'phone',
                label: 'Phone',
                width: '20%',
              },
              {
                key: 'quotes',
                label: 'Quotes',
                width: '10%',
                render: (value) => <span className="font-medium">{value}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                width: '10%',
                render: (value) => (
                  <span className={`px-xs py-2xs rounded-xs text-xs font-medium ${
                    value === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                ),
              },
              {
                key: 'id',
                label: 'Actions',
                width: '10%',
                render: (value, client) => (
                  <div className="flex gap-xs">
                    <button className="text-blue-600 hover:text-blue-700" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-700" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-700" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredClients}
            keyExtractor={(client) => client.id}
            onRowClick={(client) => {
              setSelectedClient(client)
              setIsModalOpen(true)
            }}
          />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? `${selectedClient.name}` : 'Client Details'}
      >
        {selectedClient && (
          <div className="space-y-md">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
              <p className="font-medium text-slate-900 dark:text-white">{selectedClient.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
              <p className="font-medium text-slate-900 dark:text-white">{selectedClient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Company</p>
              <p className="font-medium text-slate-900 dark:text-white">{selectedClient.company}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Quotes</p>
              <p className="font-medium text-slate-900 dark:text-white">{selectedClient.quotes}</p>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
