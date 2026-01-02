import type { QueryFunctionContext } from '@tanstack/react-query';
import type { 
  Job, 
  JobFormData, 
  JobFilterParams,
  JobMaterial,
  JobMaterialFormData,
  JobPayment,
  JobPaymentFormData,
  JobExpense,
  JobExpenseFormData
} from '../types';
import api from './api';

const endpoint = '/jobs';

// Yardımcı fonksiyon
const cleanParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

// İşler
export const getAll = async (filters?: JobFilterParams): Promise<Job[]> => {
  const cleanedParams = filters ? cleanParams(filters) : {};
  const response = await api.get<Job[]>(endpoint, { params: cleanedParams });
  return response.data;
};

export const getById = async (id: number): Promise<Job> => {
  const response = await api.get<Job>(`${endpoint}/${id}`);
  return response.data;
};

export const create = async (data: JobFormData): Promise<Job> => {
  const response = await api.post<Job>(endpoint, data);
  return response.data;
};

export const update = async (id: number, data: Partial<JobFormData>): Promise<Job> => {
  const response = await api.put<Job>(`${endpoint}/${id}`, data);
  return response.data;
};

export const remove = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`);
};

export const updateStatus = async (id: number, status: number, notes?: string): Promise<Job> => {
  const response = await api.patch<Job>(`${endpoint}/${id}/status`, { status, notes });
  return response.data;
};

// İstatistikler
// export const getStatistics = async (params?: {
//   startDate?: string;
//   endDate?: string;
// }): Promise<JobStatistics> => {
//   const cleanedParams = params ? cleanParams(params) : {};
//   const response = await api.get<JobStatistics>(`${endpoint}/statistics`, { params: cleanedParams });
//   return response.data;
// };

const getStatistics = async ({ queryKey, signal }: QueryFunctionContext) => {
  const [, startDate, endDate] = queryKey as [string, string?, string?];

  const { data } = await api.get('/jobs/statistics', {
    params: { startDate, endDate },
    signal,
  });

  return data;
};

// Müşteriye göre işler
export const getByCustomer = async (customerId: number): Promise<Job[]> => {
  const response = await api.get<Job[]>(`${endpoint}/customer/${customerId}`);
  return response.data;
};

// Aktif işler
export const getActive = async (): Promise<Job[]> => {
  const response = await api.get<Job[]>(`${endpoint}/active`);
  return response.data;
};

// === MALZEMELER ===
export const getMaterials = async (jobId: number): Promise<JobMaterial[]> => {
  const response = await api.get<JobMaterial[]>(`${endpoint}/${jobId}/materials`);
  return response.data;
};

export const addMaterial = async (jobId: number, data: JobMaterialFormData): Promise<JobMaterial> => {
  const response = await api.post<JobMaterial>(`${endpoint}/${jobId}/materials`, data);
  return response.data;
};

export const updateMaterial = async (jobId: number, materialId: number, data: Partial<JobMaterialFormData>): Promise<JobMaterial> => {
  const response = await api.put<JobMaterial>(`${endpoint}/${jobId}/materials/${materialId}`, data);
  return response.data;
};

export const removeMaterial = async (jobId: number, materialId: number): Promise<void> => {
  await api.delete(`${endpoint}/${jobId}/materials/${materialId}`);
};

// === ÖDEMELER ===
export const getPayments = async (jobId: number): Promise<JobPayment[]> => {
  const response = await api.get<JobPayment[]>(`${endpoint}/${jobId}/payments`);
  return response.data;
};

export const addPayment = async (jobId: number, data: JobPaymentFormData): Promise<JobPayment> => {
  const response = await api.post<JobPayment>(`${endpoint}/${jobId}/payments`, data);
  return response.data;
};

export const updatePayment = async (jobId: number, paymentId: number, data: Partial<JobPaymentFormData>): Promise<JobPayment> => {
  const response = await api.put<JobPayment>(`${endpoint}/${jobId}/payments/${paymentId}`, data);
  return response.data;
};

export const removePayment = async (jobId: number, paymentId: number): Promise<void> => {
  await api.delete(`${endpoint}/${jobId}/payments/${paymentId}`);
};

export const markPaymentAsPaid = async (jobId: number, paymentId: number): Promise<JobPayment> => {
  const response = await api.patch<JobPayment>(`${endpoint}/${jobId}/payments/${paymentId}/paid`);
  return response.data;
};

// === GİDERLER ===
export const getExpenses = async (jobId: number): Promise<JobExpense[]> => {
  const response = await api.get<JobExpense[]>(`${endpoint}/${jobId}/expenses`);
  return response.data;
};

export const addExpense = async (jobId: number, data: JobExpenseFormData): Promise<JobExpense> => {
  const response = await api.post<JobExpense>(`${endpoint}/${jobId}/expenses`, data);
  return response.data;
};

export const updateExpense = async (jobId: number, expenseId: number, data: Partial<JobExpenseFormData>): Promise<JobExpense> => {
  const response = await api.put<JobExpense>(`${endpoint}/${jobId}/expenses/${expenseId}`, data);
  return response.data;
};

export const removeExpense = async (jobId: number, expenseId: number): Promise<void> => {
  await api.delete(`${endpoint}/${jobId}/expenses/${expenseId}`);
};

const jobService = {
  getAll,
  getById,
  create,
  update,
  remove,
  updateStatus,
  getStatistics,
  getByCustomer,
  getActive,
  getMaterials,
  addMaterial,
  updateMaterial,
  removeMaterial,
  getPayments,
  addPayment,
  updatePayment,
  removePayment,
  markPaymentAsPaid,
  getExpenses,
  addExpense,
  updateExpense,
  removeExpense
};

export default jobService;