import React from 'react'
import { create } from 'zustand'
import type { Quote, Client, Product, Tender } from '@types/index'

interface QuotationState {
  quotations: Quote[]
  selectedQuotation: Quote | null
  addQuotation: (quote: Quote) => void
  updateQuotation: (id: string, quote: Partial<Quote>) => void
  deleteQuotation: (id: string) => void
  selectQuotation: (id: string | null) => void
}

export const useQuotationStore = create<QuotationState>((set) => ({
  quotations: [],
  selectedQuotation: null,
  addQuotation: (quote) => set((state) => ({
    quotations: [...state.quotations, quote],
  })),
  updateQuotation: (id, updates) => set((state) => ({
    quotations: state.quotations.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    ),
  })),
  deleteQuotation: (id) => set((state) => ({
    quotations: state.quotations.filter((q) => q.id !== id),
  })),
  selectQuotation: (id) => set((state) => ({
    selectedQuotation: id ? state.quotations.find((q) => q.id === id) || null : null,
  })),
}))

interface ClientState {
  clients: Client[]
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  addClient: (client) => set((state) => ({
    clients: [...state.clients, client],
  })),
  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter((c) => c.id !== id),
  })),
}))

interface ProductState {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  addProduct: (product) => set((state) => ({
    products: [...state.products, product],
  })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),
}))

interface TenderState {
  tenders: Tender[]
  addTender: (tender: Tender) => void
  updateTender: (id: string, tender: Partial<Tender>) => void
  deleteTender: (id: string) => void
}

export const useTenderStore = create<TenderState>((set) => ({
  tenders: [],
  addTender: (tender) => set((state) => ({
    tenders: [...state.tenders, tender],
  })),
  updateTender: (id, updates) => set((state) => ({
    tenders: state.tenders.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),
  deleteTender: (id) => set((state) => ({
    tenders: state.tenders.filter((t) => t.id !== id),
  })),
}))
