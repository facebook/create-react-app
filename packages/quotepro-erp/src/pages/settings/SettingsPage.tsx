import React, { useState } from 'react'
import { Layout, Card, Button, Input, Select, Tabs } from '@components/index'
import { Save, RotateCcw, Bell, Shield, Palette, User } from 'lucide-react'
import { useTheme } from '@hooks/useTheme'
import { useAuthStore } from '@store/auth'

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: user?.company || '',
    language: 'en',
    timezone: 'UTC',
  })

  const handleSave = () => {
    // Save logic here
    console.log('Settings saved:', formData)
  }

  return (
    <Layout>
      <div className="space-y-lg max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-xs">
            Manage your account and application preferences
          </p>
        </div>

        <Tabs
          tabs={[
            { label: 'Profile', id: 'profile' },
            { label: 'Notifications', id: 'notifications' },
            { label: 'Security', id: 'security' },
            { label: 'Appearance', id: 'appearance' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === 'profile' && (
            <Card>
              <div className="space-y-md">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-md">
                  <User size={24} />
                  Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Input
                    label="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                  <Select
                    label="Language"
                    options={[
                      { label: 'English', value: 'en' },
                      { label: 'Spanish', value: 'es' },
                      { label: 'French', value: 'fr' },
                      { label: 'German', value: 'de' },
                    ]}
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  />
                  <Select
                    label="Timezone"
                    options={[
                      { label: 'UTC', value: 'UTC' },
                      { label: 'EST', value: 'EST' },
                      { label: 'CST', value: 'CST' },
                      { label: 'PST', value: 'PST' },
                    ]}
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                </div>

                <div className="flex gap-sm pt-md">
                  <Button variant="primary" onClick={handleSave}>
                    <Save size={18} />
                    Save Changes
                  </Button>
                  <Button variant="secondary">
                    <RotateCcw size={18} />
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-md mb-md">
                <Bell size={24} />
                Notification Preferences
              </h2>

              <div className="space-y-md">
                {[
                  { label: 'New Quote Requests', desc: 'Notify when someone creates a quote' },
                  { label: 'Quote Responses', desc: 'Notify when a quote receives a response' },
                  { label: 'Tender Updates', desc: 'Notify on tender status changes' },
                  { label: 'Client Messages', desc: 'Notify on new client messages' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-md mb-md">
                <Shield size={24} />
                Security Settings
              </h2>

              <div className="space-y-md">
                <Button variant="secondary" fullWidth className="justify-center">
                  Change Password
                </Button>
                <Button variant="secondary" fullWidth className="justify-center">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="secondary" fullWidth className="justify-center">
                  Active Sessions (2)
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-md mb-md">
                <Palette size={24} />
                Appearance
              </h2>

              <div className="space-y-md">
                <div className="flex items-center justify-between p-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Theme</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Current theme: {theme === 'light' ? 'Light' : 'Dark'}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={toggleTheme}>
                    Toggle Theme
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </Tabs>
      </div>
    </Layout>
  )
}
