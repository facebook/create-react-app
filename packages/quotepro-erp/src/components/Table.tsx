import React from 'react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
  width?: string
  sortable?: boolean
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyMessage?: string
}

export const Table = React.forwardRef<HTMLTableElement, TableProps<any>>(({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = 'No data found',
}, ref) => {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
      <table ref={ref} className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-md py-sm text-left text-sm font-semibold text-slate-900 dark:text-white"
                style={{ width: col.width }}
              >
                {col.label}
                {col.sortable && <span className="ml-xs text-slate-400">⇅</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-md py-lg text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-md py-lg text-center text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={keyExtractor(item, idx)}
                onClick={() => onRowClick?.(item)}
                className={`
                  border-b border-slate-200 dark:border-slate-700
                  ${onRowClick ? 'hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer' : ''}
                `}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className="px-md py-sm text-sm text-slate-700 dark:text-slate-300"
                  >
                    {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
})

Table.displayName = 'Table'
