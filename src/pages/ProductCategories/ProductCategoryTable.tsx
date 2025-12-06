import { Table, Button, Space, Popconfirm, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ProductCategory } from "../../types";

interface ProductCategoryTableProps {
  categories: ProductCategory[];
  loading: boolean;
  onEdit: (category: ProductCategory) => void;
  onDelete: (id: number) => void;
}

const ProductCategoryTable: React.FC<ProductCategoryTableProps> = ({
  categories,
  loading,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<ProductCategory> = [
    {
      title: "Kategori Adı",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 250,
      fixed: "left",
      render: (name: string) => (
        <Space>
          <Tag color="blue" icon={<AppstoreOutlined />}>
            {name}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) =>
        description ? (
          <Tooltip placement="topLeft" title={description}>
            {description}
          </Tooltip>
        ) : (
          <span style={{ color: "#999" }}>-</span>
        ),
    },
    {
      title: "Durum",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "error"}
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
      title: "Oluşturma Tarihi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("tr-TR") : "-",
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
    },
    {
      title: "Son Güncelleme",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("tr-TR") : "-",
    },
    {
      title: "İşlemler",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_: unknown, record: ProductCategory) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Kategoriyi Sil"
            description="Bu kategoriyi silmek istediğinizden emin misiniz?"
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
      dataSource={categories}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number) => `Toplam ${total} kategori`,
      }}
      scroll={{ x: 1000 }}
    />
  );
};

export default ProductCategoryTable;
