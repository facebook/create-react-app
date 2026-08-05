/* Type definitions for QuotePro ERP */

export interface User {
  id: string
  email: string
  name: string
  company: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
}

export interface Quote {
  id: string
  number: string
  clientId: string
  client: string
  amount: number
  status: 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected'
  createdDate: string
  dueDate: string
  items: QuoteItem[]
}

export interface QuoteItem {
  id: string
  productId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
  quotes: number
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
}

export interface Tender {
  id: string
  title: string
  description: string
  amount: number
  deadline: string
  status: 'open' | 'closed' | 'awarded' | 'cancelled'
}
