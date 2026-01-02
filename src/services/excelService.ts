import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import type { StockMovement, Product } from '../types';

// Excel'den veri okuma
export const importFromExcel = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<T>(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Stok hareketlerini Excel'e aktarma
export const exportStockMovementsToExcel = (
  movements: StockMovement[],
  filename = 'stok-hareketleri'
) => {
  const data = movements.map(movement => ({
    'Tarih': dayjs(movement.movementDate).format('DD/MM/YYYY HH:mm'),
    'Ürün Adı': movement.product?.name || '',
    'Ürün Kodu': movement.product?.code || '',
    'İşlem Tipi': getMovementTypeName(movement.type),
    'Miktar': movement.quantity,
    'Önceki Stok': movement.previousStock,
    'Yeni Stok': movement.newStock,
    'Birim': movement.product?.unit || 'Adet',
    'Referans No': movement.referenceNumber || '',
    'Notlar': movement.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Hareketleri');
  
  // Kolon genişliklerini ayarla
  const columnWidths = [
    { wch: 18 }, // Tarih
    { wch: 25 }, // Ürün Adı
    { wch: 15 }, // Ürün Kodu
    { wch: 12 }, // İşlem Tipi
    { wch: 10 }, // Miktar
    { wch: 12 }, // Önceki Stok
    { wch: 12 }, // Yeni Stok
    { wch: 10 }, // Birim
    { wch: 15 }, // Referans No
    { wch: 30 }  // Notlar
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.writeFile(workbook, `${filename}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
};

// Ürünleri Excel'e aktarma
export const exportProductsToExcel = (
  products: Product[],
  filename = 'urunler'
) => {
  const data = products.map(product => ({
    'Ürün Kodu': product.code,
    'Ürün Adı': product.name,
    'Barkod': product.barcode || '',
    'Kategori': product.category?.name || '',
    'Mevcut Stok': product.stockQuantity || 0,
    'Minimum Stok': product.minimumStockLevel || 0,
    'Birim': product.unit || 'Adet',
    'Alış Fiyatı': product.purchasePrice || 0,
    'Satış Fiyatı': product.salePrice || 0,
    'Kar Marjı': product.profitMargin || 0,
    'Tedarikçi': product.supplier?.companyName || '',
    'Durum': product.isActive ? 'Aktif' : 'Pasif'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler');
  
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 20 },
    { wch: 10 }
  ];

  XLSX.writeFile(workbook, `${filename}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
};

// Toplu stok hareketi için Excel şablonu oluşturma
export const downloadBulkStockTemplate = (products: Product[]) => {
  const data = products.map(product => ({
    'Ürün ID': product.id,
    'Ürün Kodu': product.code,
    'Ürün Adı': product.name,
    'Mevcut Stok': product.stockQuantity || 0,
    'İşlem Tipi (1:Giriş, 2:Çıkış, 3:Düzeltme)': '',
    'Miktar': '',
    'Referans No': '',
    'Notlar': ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Toplu Stok Hareketi');
  
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 25 },
    { wch: 12 },
    { wch: 35 },
    { wch: 10 },
    { wch: 15 },
    { wch: 30 }
  ];

  XLSX.writeFile(workbook, `toplu_stok_sablonu_${dayjs().format('YYYYMMDD')}.xlsx`);
};

// Toplu stok hareketi verilerini Excel'den okuma
export interface BulkStockMovementRow {
  'Ürün ID': number;
  'Ürün Kodu': string;
  'Ürün Adı': string;
  'Mevcut Stok': number;
  'İşlem Tipi (1:Giriş, 2:Çıkış, 3:Düzeltme)': number;
  'Miktar': number;
  'Referans No'?: string;
  'Notlar'?: string;
}

export const importBulkStockMovements = async (file: File): Promise<BulkStockMovementRow[]> => {
  return importFromExcel<BulkStockMovementRow>(file);
};

// Yardımcı fonksiyon
const getMovementTypeName = (type: number): string => {
  const types: { [key: number]: string } = {
    1: 'Stok Girişi',
    2: 'Stok Çıkışı',
    3: 'Düzeltme',
    4: 'İade',
    5: 'Transfer'
  };
  return types[type] || 'Bilinmiyor';
};

const excelService = {
  importFromExcel,
  exportStockMovementsToExcel,
  exportProductsToExcel,
  downloadBulkStockTemplate,
  importBulkStockMovements
};

export default excelService;