import type { StockMovement, StockMovementFormData, StockStatistics } from '../types'
import api from './api'

const endpoint = '/stockmovement'

export const getAll = async (params?: {
  productId?: number
  startDate?: string
  endDate?: string
  type?: number
}): Promise<StockMovement[]> => {
  try {
    const response = await api.get<StockMovement[]>(endpoint, { params })
    return response.data
  } catch (error) {
    console.error('❌ getAll hatası:', error)
    throw error
  }
}

export const getByProductId = async (productId: number): Promise<StockMovement[]> => {
  const response = await api.get<StockMovement[]>(`${endpoint}/product/${productId}`)
  return response.data
}

export const create = async (data: StockMovementFormData): Promise<StockMovement> => {
  console.log('📤 Stok hareketi oluşturuluyor:', data)
  const response = await api.post<StockMovement>(endpoint, data)
  return response.data
}

export const deleteMovement = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`)
}

export const getStatistics = async (params?: {
  startDate?: string
  endDate?: string
}): Promise<StockStatistics> => {
  const response = await api.get<StockStatistics>(`${endpoint}/statistics`, { params })
  return response.data
}

const stockMovementService = {
  getAll,
  getByProductId,
  create,
  deleteMovement,
  getStatistics
}

export default stockMovementService