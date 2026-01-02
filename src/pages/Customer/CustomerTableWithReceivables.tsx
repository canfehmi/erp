import { Table, Button, Space, Popconfirm, Tag, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import type { Customer, CustomerReceivableSummary } from "../../types";
import { useQuery } from "@tanstack/react-query";
import customerService from "../../services/customerService";

interface CustomerTableWithReceivablesProps {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

const CustomerTableWithReceivables: React.FC<
  CustomerTableWithReceivablesProps
> = ({ customers, loading, onEdit, onDelete }) => {
  const navigate = useNavigate();

  // Fetch receivables summaries
  const { data: receivables, isLoading: receivablesLoading } = useQuery<
    CustomerReceivableSummary[]
  >({
    queryKey: ["customerReceivables"],
    queryFn: () => customerService.getAllReceivableSummaries(false),
  });

  // Create a map for quick lookup
  const receivablesMap = new Map<number, CustomerReceivableSummary>();
  receivables?.forEach((r) => receivablesMap.set(r.customerId, r));

  const columns: ColumnsType<Customer> = [
    {
      title: "Müşteri Adı",
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
      dataIndex: "phoneNumber",
      key: "phoneNumber",
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
          {email || "-"}
        </Space>
      ),
      width: 200,
    },
    {
      title: "Toplam Faturalanan",
      key: "totalBilled",
      width: 140,
      align: "right",
      render: (_: unknown, record: Customer) => {
        const summary = receivablesMap.get(record.id);
        if (receivablesLoading) return <Spin size="small" />;
        return summary
          ? `₺${summary.totalBilled.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}`
          : "₺0.00";
      },
      sorter: (a, b) => {
        const aTotal = receivablesMap.get(a.id)?.totalBilled || 0;
        const bTotal = receivablesMap.get(b.id)?.totalBilled || 0;
        return aTotal - bTotal;
      },
    },
    {
      title: "Ödenen",
      key: "totalPaid",
      width: 130,
      align: "right",
      render: (_: unknown, record: Customer) => {
        const summary = receivablesMap.get(record.id);
        if (receivablesLoading) return <Spin size="small" />;
        return summary
          ? `₺${summary.totalPaid.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}`
          : "₺0.00";
      },
    },
    {
      title: "Bakiye (Alacak)",
      key: "outstandingBalance",
      width: 150,
      align: "right",
      render: (_: unknown, record: Customer) => {
        const summary = receivablesMap.get(record.id);
        if (receivablesLoading) return <Spin size="small" />;
        
        const balance = summary?.outstandingBalance || 0;
        return (
          <Space>
            <DollarOutlined style={{ color: balance > 0 ? "#ff4d4f" : "#52c41a" }} />
            <span
              style={{
                fontWeight: "bold",
                color: balance > 0 ? "#ff4d4f" : "#52c41a",
              }}
            >
              ₺{balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
          </Space>
        );
      },
      sorter: (a, b) => {
        const aBalance = receivablesMap.get(a.id)?.outstandingBalance || 0;
        const bBalance = receivablesMap.get(b.id)?.outstandingBalance || 0;
        return aBalance - bBalance;
      },
      defaultSortOrder: "descend",
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
      width: 90,
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
      width: 200,
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/customers/${record.id}/financial`)}
          >
            Detay
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Müşteriyi Sil"
            description="Bu müşteriyi silmek istediğinizden emin misiniz?"
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
      dataSource={customers}
      loading={loading || receivablesLoading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number) => `Toplam ${total} müşteri`,
      }}
      scroll={{ x: 1500 }}
    />
  );
};

export default CustomerTableWithReceivables;

