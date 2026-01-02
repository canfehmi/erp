import type { Customer, CustomerFormData, CustomerReceivableSummary } from '../types'
import api from './api'

const endpoint = '/customer'

export const getAll = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(endpoint)
  return response.data
}

export const getById = async (id: number): Promise<Customer> => {
  const response = await api.get<Customer>(`${endpoint}/${id}`)
  return response.data
}

export const create = async (data: CustomerFormData): Promise<Customer> => {
  const response = await api.post<Customer>(endpoint, data)
  return response.data
}

export const update = async (id: number, data: CustomerFormData): Promise<Customer> => {
  const response = await api.put<Customer>(`${endpoint}/${id}`, data)
  return response.data
}

export const remove = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

// Aktif müşterileri getir
export const getActive = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(`${endpoint}/active`)
  return response.data
}

// Müşteri ara
export const search = async (query: string): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(`${endpoint}/search`, {
    params: { q: query }
  })
  return response.data
}

// Müşteri alacak özeti getir
export const getReceivableSummary = async (id: number): Promise<CustomerReceivableSummary> => {
  const response = await api.get<CustomerReceivableSummary>(`${endpoint}/${id}/receivable-summary`)
  return response.data
}

// Tüm müşterilerin alacak özetlerini getir
export const getAllReceivableSummaries = async (activeOnly: boolean = false): Promise<CustomerReceivableSummary[]> => {
  const response = await api.get<CustomerReceivableSummary[]>(`${endpoint}/receivable-summaries`, {
    params: { activeOnly }
  })
  return response.data
}

// ✅ Yardımcı fonksiyon: undefined parametreleri temizle
export const cleanParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

const customerService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getActive,
  search,
  getReceivableSummary,
  getAllReceivableSummaries,
  cleanParams
}

export default customerService