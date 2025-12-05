import type { ProductCategory, ProductCategoryFormData } from '../types'
import api from './api'

const endpoint = '/productcategory' // Backend route'unuz ne?

export const getAll = async (): Promise<ProductCategory[]> => {
  try {
    console.log('🔵 Category API isteği:', `${api.defaults.baseURL}${endpoint}`)
    const response = await api.get<ProductCategory[]>(endpoint)
    console.log('✅ Category API yanıtı:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Category API hatası:', error)
    throw error
  }
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

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

export const getActive = async (): Promise<ProductCategory[]> => {
  const response = await api.get<ProductCategory[]>(`${endpoint}/active`)
  return response.data
}

const productCategoryService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCategory,
  getActive
}

export default productCategoryService