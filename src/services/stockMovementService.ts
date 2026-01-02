import type { StockMovement, StockMovementFormData, StockStatistics } from '../types'
import api from './api'

const endpoint = '/stockmovement'

// ✅ Yardımcı fonksiyon: undefined parametreleri temizle
const cleanParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

export const getAll = async (params?: {
  productId?: number
  startDate?: string
  endDate?: string
  type?: number
}): Promise<StockMovement[]> => {
  try {
    // ✅ Undefined parametreleri temizle
    const cleanedParams = params ? cleanParams(params) : {};
    
    console.log('📤 Stock Movement API Request:', {
      endpoint,
      params: cleanedParams
    });
    
    const response = await api.get<StockMovement[]>(endpoint, { 
      params: cleanedParams 
    });
    
    console.log('📥 Stock Movement API Response:', {
      count: response.data.length,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ getAll hatası:', error);
    throw error;
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
  // ✅ Undefined parametreleri temizle
  const cleanedParams = params ? cleanParams(params) : {};
  
  console.log('📤 Statistics API Request:', {
    endpoint: `${endpoint}/statistics`,
    params: cleanedParams
  });
  
  const response = await api.get<StockStatistics>(`${endpoint}/statistics`, { 
    params: cleanedParams 
  });
  
  console.log('📥 Statistics API Response:', response.data);
  
  return response.data;
}

const stockMovementService = {
  getAll,
  getByProductId,
  create,
  deleteMovement,
  getStatistics
}

export default stockMovementService