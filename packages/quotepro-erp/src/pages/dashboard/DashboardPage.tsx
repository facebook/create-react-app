import React, { useState } from 'react'
import { Layout, Card, Button, Alert } from '@components/index'
import {
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const chartData = [
  { month: 'Jan', quotes: 4000, tenders: 2400 },
  { month: 'Feb', quotes: 3000, tenders: 1398 },
  { month: 'Mar', quotes: 2000, tenders: 9800 },
  { month: 'Apr', quotes: 2780, tenders: 3908 },
  { month: 'May', quotes: 1890, tenders: 4800 },
  { month: 'Jun', quotes: 2390, tenders: 3800 },
]

export const DashboardPage: React.FC = () => {
  const [showAlert, setShowAlert] = useState(true)

  const stats = [
    { label: 'Total Quotes', value: '248', icon: FileText, change: '+12.5%', positive: true },
    { label: 'Active Clients', value: '52', icon: Users, change: '+5.2%', positive: true },
    { label: 'Revenue', value: '$124.5K', icon: DollarSign, change: '+23.1%', positive: true },
    { label: 'Conversion Rate', value: '32.4%', icon: TrendingUp, change: '-2.1%', positive: false },
  ]

  return (
    <Layout>
      <div className="space-y-lg">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-xs">
            Welcome back! Here's your quotation & tender overview.
          </p>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="animate-slide-in">
            <Alert
              type="info"
              title="Quick Tip"
              message="You have 3 pending quotations awaiting approval. Click to review them now."
              onClose={() => setShowAlert(false)}
            />
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-sm">
                    {stat.value}
                  </p>
                  <div className={`flex items-center gap-xs mt-sm text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </div>
                </div>
                <div className="p-sm rounded-lg bg-slate-100 dark:bg-slate-700 text-brand-primary">
                  <stat.icon size={24} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-md">
              Quote Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quotes" stroke="#0F4C81" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-md">
              Tender Comparison
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tenders" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-md">
              Recent Quotations
            </h2>
            <div className="space-y-sm">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      Quote #{1001 + i}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Client Name • Due in 5 days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900 dark:text-white">$5,250</p>
                    <span className="text-xs px-xs py-2xs rounded-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-md">
              Quick Actions
            </h2>
            <div className="space-y-sm">
              <Button variant="primary" fullWidth size="sm">
                + New Quote
              </Button>
              <Button variant="secondary" fullWidth size="sm">
                + New Tender
              </Button>
              <Button variant="ghost" fullWidth size="sm">
                View All Quotes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
