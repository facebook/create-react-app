import React from 'react'
import { ChevronDown, X } from 'lucide-react'

export interface TabItem {
  label: string
  id: string
  badge?: number
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const Tabs: React.FC<TabsProps & { children: React.ReactNode }> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <div>
      <div className="flex gap-md border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-md py-sm text-sm font-medium whitespace-nowrap
              border-b-2 transition-all duration-base relative
              ${activeTab === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }
            `}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-xs inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-brand-primary text-white rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-md">
        {children}
      </div>
    </div>
  )
}
