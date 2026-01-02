import type { Product, ProductFormData } from '../types'
import api from './api'

const endpoint = '/product'

export const getAll = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>(endpoint)
  return response.data
}

export const getById = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`${endpoint}/${id}`)
  return response.data
}

export const create = async (data: ProductFormData): Promise<Product> => {
  const response = await api.post<Product>(endpoint, data)
  return response.data
}

export const update = async (id: number, data: ProductFormData): Promise<Product> => {
  const response = await api.put<Product>(`${endpoint}/${id}`, data)
  return response.data
}

export const remove = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

// Düşük stoklu ürünleri getir
export const getLowStock = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>(`${endpoint}/low-stock`)
  return response.data
}

// Kategoriye göre ürünleri getir
export const getByCategory = async (categoryId: number): Promise<Product[]> => {
  const response = await api.get<Product[]>(`${endpoint}/category/${categoryId}`)
  return response.data
}

// Tedarikçiye göre ürünleri getir
export const getBySupplier = async (supplierId: number): Promise<Product[]> => {
  const response = await api.get<Product[]>(`${endpoint}/supplier/${supplierId}`)
  return response.data
}

const productService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getLowStock,
  getByCategory,
  getBySupplier
}

export default productService