import type { Supplier, SupplierFormData } from '../types'
import api from './api'

const endpoint = '/supplier'

export const getAll = async (): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>(endpoint)
  return response.data
}

export const getById = async (id: number): Promise<Supplier> => {
  const response = await api.get<Supplier>(`${endpoint}/${id}`)
  return response.data
}

export const create = async (data: SupplierFormData): Promise<Supplier> => {
  const response = await api.post<Supplier>(endpoint, data)
  return response.data
}

export const update = async (id: number, data: SupplierFormData): Promise<Supplier> => {
  const response = await api.put<Supplier>(`${endpoint}/${id}`, data)
  return response.data
}

export const remove = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

// Aktif tedarikçileri getir
export const getActive = async (): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>(`${endpoint}/active`)
  return response.data
}

// Kategoriye göre tedarikçileri getir
export const getByCategory = async (categoryId: number): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>(`${endpoint}/category/${categoryId}`)
  return response.data
}

// Tedarikçi ara
export const search = async (query: string): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>(`${endpoint}/search`, {
    params: { q: query }
  })
  return response.data
}

const supplierService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getActive,
  getByCategory,
  search
}

export default supplierService