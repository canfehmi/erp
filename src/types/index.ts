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
  minimumStockLevel: number
  unit: string
  imageUrl?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ProductFormData = Omit<Product, 'id' | 'profitMargin' | 'createdAt' | 'updatedAt' | 'supplier'>

// Stok Hareket Tipi
export type StockMovementType =
  | 1   // STOCK_IN
  | 2   // STOCK_OUT
  | 3   // ADJUSTMENT
  | 4   // RETURN
  | 5;  // TRANSFER

  export const StockMovementTypeMap = {
  STOCK_IN: 1,
  STOCK_OUT: 2,
  ADJUSTMENT: 3,
  RETURN: 4,
  TRANSFER: 5
} as const;

export interface StockMovement {
  id: number
  productId: number
  product?: Product
  type: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  referenceNumber?: string
  notes?: string
  movementDate: string
  createdBy?: string
}

export type StockMovementFormData = Omit<StockMovement, 'id' | 'product' | 'previousStock' | 'newStock' | 'createdBy'>

// Stok İstatistikleri
export interface StockStatistics {
  totalMovements: number
  totalStockIn: number
  totalStockOut: number
  totalAdjustments: number
  totalReturns: number
}

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