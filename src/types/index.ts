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

// Customer Receivables
export interface AgingBreakdown {
  current: number
  days30To60: number
  days60To90: number
  over90Days: number
}

export interface CustomerReceivableSummary {
  customerId: number
  customerName: string
  companyName?: string
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
  totalJobs: number
  activeJobs: number
  aging: AgingBreakdown
}

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


// İş Durumu - Type olarak kullanılacak
export type JobStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const JobStatusMap = {
  QUOTE_SENT: 1,
  QUOTE_APPROVED: 2,
  PAYMENT_PENDING: 3,
  PAYMENT_RECEIVED: 4,
  MATERIAL_PREPARING: 5,
  INSTALLATION_SCHEDULED: 6,
  IN_PROGRESS: 7,
  INSTALLATION_COMPLETED: 8,
  COMPLETED: 9,
  CANCELLED: 10
} as const;

export const JobStatusLabels: Record<number, string> = {
  1: "Teklif Gönderildi",
  2: "Teklif Onaylandı",
  3: "Ödeme Bekleniyor",
  4: "Ödeme Alındı",
  5: "Malzeme Hazırlanıyor",
  6: "Montaj Planlandı",
  7: "İş Devam Ediyor",
  8: "Montaj Tamamlandı",
  9: "İş Tamamlandı",
  10: "İptal Edildi"
};

export const JobStatusColors: Record<number, string> = {
  1: "default",
  2: "blue",
  3: "orange",
  4: "cyan",
  5: "purple",
  6: "geekblue",
  7: "processing",
  8: "lime",
  9: "success",
  10: "error"
};

// Ödeme Türü - Type olarak kullanılacak
export type PaymentType = 1 | 2 | 3 | 4 | 5;

export const PaymentTypeMap = {
  CASH: 1,
  INSTALLMENT: 2,
  BANK_TRANSFER: 3,
  CREDIT_CARD: 4,
  DEFERRED: 5
} as const;

export const PaymentTypeLabels: Record<number, string> = {
  1: "Peşin",
  2: "Taksit",
  3: "Havale/EFT",
  4: "Kredi Kartı",
  5: "Vadeli"
};

// Gider Türü - Type olarak kullanılacak
export type ExpenseType = 1 | 2 | 3 | 4 | 5 | 6;

export const ExpenseTypeMap = {
  FUEL: 1,
  MEAL: 2,
  ACCOMMODATION: 3,
  TRANSPORTATION: 4,
  PERSONNEL: 5,
  OTHER: 6
} as const;

export const ExpenseTypeLabels: Record<number, string> = {
  1: "Mazot",
  2: "Yemek",
  3: "Konaklama",
  4: "Ulaşım",
  5: "Personel",
  6: "Diğer"
};

// İş kaydı
export interface Job {
  id: number;
  customerId: number;
  customer?: Customer;
  jobNumber: string; // Otomatik oluşturulan iş numarası (örn: IS-2024-001)
  title: string;
  description?: string;
  address: string;
  scheduledDate: string;
  startDate?: string;
  completionDate?: string;
  status: JobStatus;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // İlişkili veriler
  materials?: JobMaterial[];
  payments?: JobPayment[];
  expenses?: JobExpense[];
  statusHistory?: JobStatusHistory[];
}

export type JobFormData = Omit<Job, 'id' | 'jobNumber' | 'finalAmount' | 'createdAt' | 'updatedAt' | 'materials' | 'payments' | 'expenses' | 'statusHistory'>;

// İş malzemeleri
export interface JobMaterial {
  id: number;
  jobId: number;
  job?: Job;
  productId: number;
  product?: Product;
  plannedQuantity: number;  // Planlanan miktar
  usedQuantity: number;     // Kullanılan miktar
  unitPrice: number;
  totalPrice: number;
  isExtra: boolean;         // İş tamamlandıktan sonra eklenen ekstra malzeme mi?
  notes?: string;
  createdAt: string;
}

export type JobMaterialFormData = Omit<JobMaterial, 'id' | 'job' | 'product' | 'totalPrice' | 'createdAt'>;

// İş ödemeleri
export interface JobPayment {
  id: number;
  jobId: number;
  job?: Job;
  amount: number;
  paymentType: PaymentType;
  paymentDate: string;
  installmentCount?: number;  // Taksit sayısı
  dueDate?: string;           // Vade tarihi
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  receiptNumber?: string;     // Fiş/Fatura numarası
  createdAt: string;
}

export type JobPaymentFormData = Omit<JobPayment, 'id' | 'job' | 'createdAt'>;

// İş giderleri
export interface JobExpense {
  id: number;
  jobId: number;
  job?: Job;
  expenseType: ExpenseType;
  description: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
}

export type JobExpenseFormData = Omit<JobExpense, 'id' | 'job' | 'createdAt'>;

// İş durum geçmişi
export interface JobStatusHistory {
  id: number;
  jobId: number;
  job?: Job;
  oldStatus: JobStatus;
  newStatus: JobStatus;
  changedBy?: string;
  notes?: string;
  createdAt: string;
}

// İş özet istatistikleri
export interface JobStatistics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  pendingPaymentJobs: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageJobValue: number;
}

// İş filtreleme parametreleri
export interface JobFilterParams {
  customerId?: number;
  status?: JobStatus;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  isPaid?: boolean;
}