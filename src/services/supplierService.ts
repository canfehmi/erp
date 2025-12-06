import type { Supplier, SupplierFormData, PaginatedResponse } from '../types'
import api from './api'

const endpoint = '/supplier'

export const getAll = async (): Promise<Supplier[]> => {
  try {
    const response = await api.get<Supplier[]>(endpoint)
    return response.data
  } catch (error) {
    console.error('❌ getAll hatası:', error)
    throw error
  }
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

export const deleteSupplier = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

export const search = async (searchTerm: string): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>(`${endpoint}/search`, {
    params: { term: searchTerm }
  })
  return response.data
}

export const getPaginated = async (page: number, pageSize: number): Promise<PaginatedResponse<Supplier>> => {
  const response = await api.get<PaginatedResponse<Supplier>>(endpoint, {
    params: { page, pageSize }
  })
  return response.data
}

const supplierService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteSupplier,
  search,
  getPaginated
}

export default supplierService