import { Table, Tag, Space, Button } from "antd";
import { WarningOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Product } from "../../types";
import { useState } from "react";
import StockMovementModal from "./StockMovementModal";

interface LowStockAlertProps {
  products: Product[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >();

  const handleStockAdd = (productId: number): void => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setSelectedProductId(undefined);
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Ürün Kodu",
      dataIndex: "code",
      key: "code",
      width: 120,
      fixed: "left",
    },
    {
      title: "Ürün Adı",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Kategori",
      dataIndex: ["category", "name"],
      key: "category",
      width: 150,
      render: (categoryName: string) => (
        <Tag color="blue">{categoryName || "Belirtilmemiş"}</Tag>
      ),
    },
    {
      title: "Mevcut Stok",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 120,
      align: "right",
      render: (qty: number, record: Product) => (
        <Space>
          <WarningOutlined style={{ color: "#faad14" }} />
          <span style={{ color: "#faad14", fontWeight: "bold" }}>
            {qty} {record.unit}
          </span>
        </Space>
      ),
    },
    {
      title: "Minimum Stok",
      dataIndex: "minimumStockLevel",
      key: "minimumStockLevel",
      width: 120,
      align: "right",
      render: (level: number, record: Product) => `${level} ${record.unit}`,
    },
    {
      title: "Eksik Miktar",
      key: "shortage",
      width: 120,
      align: "right",
      render: (_: unknown, record: Product) => {
        // ✅ Null/undefined kontrolü eklendi
        const minStock = record.minimumStockLevel || 0;
        const currentStock = record.stockQuantity || 0;
        const shortage = minStock - currentStock;

        return (
          <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            {shortage} {record.unit || "Adet"}
          </span>
        );
      },
      sorter: (a, b) => {
        const shortageA = (a.minimumStockLevel || 0) - (a.stockQuantity || 0);
        const shortageB = (b.minimumStockLevel || 0) - (b.stockQuantity || 0);
        return shortageB - shortageA;
      },
    },
    {
      title: "Tedarikçi",
      dataIndex: ["supplier", "companyName"],
      key: "supplier",
      ellipsis: true,
      render: (name: string, record: Product) =>
        name || record.supplier?.name || "-",
    },
    {
      title: "İşlem",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_: unknown, record: Product) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleStockAdd(record.id)} // ✅ Fonksiyon düzeltildi
        >
          Stok Ekle
        </Button>
      ),
    },
  ];

  return (
    <div>
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <WarningOutlined style={{ fontSize: 48, color: "#52c41a" }} />
          <h3 style={{ marginTop: 16, color: "#52c41a" }}>
            Harika! Düşük stoklu ürün yok.
          </h3>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total: number) => `Toplam ${total} düşük stoklu ürün`,
            }}
            scroll={{ x: 1200 }}
            rowClassName={() => "low-stock-row"}
          />

          {/* Stok Ekleme Modal'ı */}
          {isModalOpen && (
            <StockMovementModal
              open={isModalOpen}
              products={products}
              onClose={handleModalClose}
              preSelectedProductId={selectedProductId} // ✅ Seçili ürünü modal'a gönder
            />
          )}
        </>
      )}
    </div>
  );
};

export default LowStockAlert;
