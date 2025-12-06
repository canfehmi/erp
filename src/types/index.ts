// Müşteri tipi
export interface Customer {
  id: number
  name: string
  companyName?: string
  phoneNumber: string
  email: string
  adress: string
  taxNumber?: string
  taxOffice?: string
  notes?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>

// Tedarikçi tipi
export interface Supplier {
  id: number
  name: string
  companyName: string
  phoneNumber: string
  contactEmail: string
  address: string
  taxNumber?: string
  taxOffice?: string
  productCategoryId: number
  productCategory?: ProductCategory
  paymentTerm: number
  bankAccountInfo?: string
  notes?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type SupplierFormData = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>

// Ürün kategorileri
export interface ProductCategory {
  toLowerCase(): unknown
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ProductCategoryFormData = Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>


// Ürün tipi
export interface Product {
  id: number
  name: string
  code: string
  barcode?: string
  categoryId: number 
  category?: ProductCategory 
  description?: string
  supplierId: number
  supplier?: Supplier
  purchasePrice: number
  salePrice: number
  profitMargin: number
  stockQuantity: number
  minStockLevel: number
  unit: string
  imageUrl?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ProductFormData = Omit<Product, 'id' | 'profitMargin' | 'createdAt' | 'updatedAt' | 'supplier'>

// API yanıt tipleri
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

// Pagination
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Dashboard istatistikleri
export interface DashboardStats {
  totalCustomers: number
  totalSuppliers: number
  totalProducts: number
  totalStockValue: number
  lowStockProducts: number
  activeOrders: number
}