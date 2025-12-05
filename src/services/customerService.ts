import type { Customer, CustomerFormData, PaginatedResponse } from '../types'
import api from './api'

const endpoint = '/customer'

export const getAll = async (): Promise<Customer[]> => {
  try {
    const response = await api.get<Customer[]>(endpoint)
    return response.data
  } catch (error) {
    console.error('❌ getAll hatası:', error)
    throw error
  }
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

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

export const search = async (searchTerm: string): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(`${endpoint}/search`, {
    params: { term: searchTerm }
  })
  return response.data
}

export const getPaginated = async (page: number, pageSize: number): Promise<PaginatedResponse<Customer>> => {
  const response = await api.get<PaginatedResponse<Customer>>(endpoint, {
    params: { page, pageSize }
  })
  return response.data
}

const customerService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCustomer,
  search,
  getPaginated
}

export default customerService