import { Table, Button, Space, Popconfirm, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Supplier } from "../../types";

interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  loading,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<Supplier> = [
    {
      title: "Tedarikçi Adı",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 180,
      fixed: "left",
    },
    {
      title: "Firma Adı",
      dataIndex: "companyName",
      key: "companyName",
      width: 180,
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
      width: 140,
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
      width: 200,
    },
    {
      title: "Ürün Kategorisi",
      dataIndex: "productCategory",
      key: "productCategory",
      render: (category: string) => <Tag color="blue">{category}</Tag>,
      width: 150,
    },
    {
      title: "Teslimat Süresi",
      dataIndex: "deliveryTime",
      key: "deliveryTime",
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined />
          {time} gün
        </Space>
      ),
      width: 130,
      sorter: (a, b) => a.deliveryTime - b.deliveryTime,
    },
    {
      title: "Ödeme Koşulu",
      dataIndex: "paymentTerm",
      key: "paymentTerm",
      render: (term: number) => (
        <Tooltip title="Ödeme vadesi">
          <Tag color="orange">{term} gün</Tag>
        </Tooltip>
      ),
      width: 120,
      sorter: (a, b) => a.paymentTerm - b.paymentTerm,
    },
    {
      title: "Durum",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Aktif" : "Pasif"}
        </Tag>
      ),
      width: 100,
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
      render: (_: unknown, record: Supplier) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Tedarikçiyi Sil"
            description="Bu tedarikçiyi silmek istediğinizden emin misiniz?"
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
      dataSource={suppliers}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number) => `Toplam ${total} tedarikçi`,
      }}
      scroll={{ x: 1400 }}
    />
  );
};

export default SupplierTable;
