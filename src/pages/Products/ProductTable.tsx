import { Table, Button, Space, Popconfirm, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Product, Supplier, ProductCategory } from "../../types";

interface ProductTableProps {
  products: Product[];
  suppliers: Supplier[];
  categories: ProductCategory[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  suppliers,
  categories,
  loading,
  onEdit,
  onDelete,
}) => {
  // Tedarikçi ismini bul
  const getSupplierName = (supplierId: number): string => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.companyName || supplier?.name || "Bilinmiyor";
  };

  // Kategori ismini bul
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Bilinmiyor";
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Ürün Kodu",
      dataIndex: "code",
      key: "code",
      width: 120,
      fixed: "left",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Ürün Adı",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Kategori",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 150,
      render: (categoryId: number) => (
        <Tag color="blue">{getCategoryName(categoryId)}</Tag>
      ),
      filters: categories
        .filter((cat) => cat.isActive)
        .map((cat) => ({
          text: cat.name,
          value: cat.id,
        })),
      onFilter: (value, record) => record.categoryId === value,
    },
    {
      title: "Tedarikçi",
      dataIndex: "supplierId",
      key: "supplierId",
      width: 150,
      render: (supplierId: number) => getSupplierName(supplierId),
    },
    {
      title: "Alış Fiyatı",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      width: 120,
      render: (price: number) => `₺${price.toFixed(2)}`,
      sorter: (a, b) => a.purchasePrice - b.purchasePrice,
    },
    {
      title: "Satış Fiyatı",
      dataIndex: "salePrice",
      key: "salePrice",
      width: 120,
      render: (price: number) => `₺${price.toFixed(2)}`,
      sorter: (a, b) => a.salePrice - b.salePrice,
    },
    {
      title: "Kar Marjı",
      dataIndex: "profitMargin",
      key: "profitMargin",
      width: 100,
      render: (margin: number) => (
        <Tag color={margin >= 20 ? "green" : margin >= 10 ? "orange" : "red"}>
          %{margin.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.profitMargin - b.profitMargin,
    },
    {
      title: "Stok",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 100,
      render: (quantity: number, record: Product) => {
        const isLowStock = quantity <= record.minStockLevel;
        return (
          <Space>
            {isLowStock && (
              <Tooltip title="Düşük stok">
                <WarningOutlined style={{ color: "#faad14" }} />
              </Tooltip>
            )}
            <span style={{ color: isLowStock ? "#faad14" : "inherit" }}>
              {quantity} {record.unit}
            </span>
          </Space>
        );
      },
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: "Min. Stok",
      dataIndex: "minimumStockLevel",
      key: "minimumStockLevel",
      width: 100,
      render: (level: number, record: Product) => `${level} ${record.unit}`,
    },
    {
      title: "Durum",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : undefined}
          color={isActive ? "green" : "red"}
        >
          {isActive ? "Aktif" : "Pasif"}
        </Tag>
      ),
      filters: [
        { text: "Aktif", value: true },
        { text: "Pasif", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "İşlemler",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Ürünü Sil"
            description="Bu ürünü silmek istediğinizden emin misiniz?"
            onConfirm={() => onDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number) => `Toplam ${total} ürün`,
      }}
      scroll={{ x: 1600 }}
      rowClassName={(record) =>
        record.stockQuantity <= record.minStockLevel ? "low-stock-row" : ""
      }
    />
  );
};

export default ProductTable;
