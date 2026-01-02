import type { ProductCategory, ProductCategoryFormData } from '../types'
import api from './api'

const endpoint = '/productcategory'

export const getAll = async (): Promise<ProductCategory[]> => {
  const response = await api.get<ProductCategory[]>(endpoint)
  return response.data
}

export const getById = async (id: number): Promise<ProductCategory> => {
  const response = await api.get<ProductCategory>(`${endpoint}/${id}`)
  return response.data
}

export const create = async (data: ProductCategoryFormData): Promise<ProductCategory> => {
  const response = await api.post<ProductCategory>(endpoint, data)
  return response.data
}

export const update = async (id: number, data: ProductCategoryFormData): Promise<ProductCategory> => {
  const response = await api.put<ProductCategory>(`${endpoint}/${id}`, data)
  return response.data
}

export const remove = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

// Aktif kategorileri getir
export const getActive = async (): Promise<ProductCategory[]> => {
  const response = await api.get<ProductCategory[]>(`${endpoint}/active`)
  return response.data
}

const productCategoryService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getActive
}

export default productCategoryService