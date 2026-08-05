import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = []
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center gap-sm">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2xs hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 rounded-md transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex gap-2xs">
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={idx} className="px-xs py-2xs text-slate-500">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(page as number)}
              className={`
                px-xs py-2xs rounded-md text-sm transition-all
                ${page === currentPage
                  ? 'bg-brand-primary text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                }
              `}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2xs hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 rounded-md transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
