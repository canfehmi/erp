import { Table, Tag, Space, Button, Popconfirm, Tooltip, Progress } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Job } from "../../types";
import { JobStatusLabels, JobStatusColors } from "../../types";
import dayjs from "dayjs";

interface JobsTableProps {
  jobs: Job[];
  loading: boolean;
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
  onView: (job: Job) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  const columns: ColumnsType<Job> = [
    {
      title: "İş No",
      dataIndex: "jobNumber",
      key: "jobNumber",
      width: 120,
      fixed: "left",
      render: (jobNumber: string) => (
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>
          {jobNumber}
        </span>
      ),
    },
    {
      title: "Müşteri",
      key: "customer",
      width: 200,
      render: (_, record: Job) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.customer?.name}</div>
          {record.customer?.companyName && (
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.customer.companyName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "İş Başlığı",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (title: string) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
    },
    {
      title: "Planlanan Tarih",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 150,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD/MM/YYYY")}
        </Space>
      ),
      sorter: (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status: number) => (
        <Tag color={JobStatusColors[status]}>{JobStatusLabels[status]}</Tag>
      ),
      filters: Object.entries(JobStatusLabels).map(([value, text]) => ({
        text,
        value: Number(value),
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Tutar",
      key: "amount",
      width: 180,
      align: "right",
      render: (_, record: Job) => (
        <div>
          {record.discountAmount && record.discountAmount > 0 ? (
            <>
              <div
                style={{
                  textDecoration: "line-through",
                  color: "#999",
                  fontSize: 12,
                }}
              >
                ₺
                {record.totalAmount.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div style={{ fontWeight: "bold", color: "#52c41a" }}>
                ₺
                {record.finalAmount.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </>
          ) : (
            <div style={{ fontWeight: "bold" }}>
              ₺
              {record.totalAmount.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.finalAmount - b.finalAmount,
    },
    {
      title: "Ödeme Durumu",
      key: "paymentStatus",
      width: 150,
      align: "center",
      render: (_, record: Job) => {
        const totalPayments =
          record.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const paymentPercentage =
          record.finalAmount > 0
            ? Math.round((totalPayments / record.finalAmount) * 100)
            : 0;

        return (
          <Tooltip
            title={`₺${totalPayments.toLocaleString(
              "tr-TR"
            )} / ₺${record.finalAmount.toLocaleString("tr-TR")}`}
          >
            <Progress
              percent={paymentPercentage}
              size="small"
              status={paymentPercentage >= 100 ? "success" : "active"}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Adres",
      dataIndex: "address",
      key: "address",
      ellipsis: {
        showTitle: false,
      },
      render: (address: string) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record: Job) => (
        <Space>
          <Tooltip title="Görüntüle">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu işi silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz!"
            onConfirm={() => onDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={jobs}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number) => `Toplam ${total} iş`,
      }}
      scroll={{ x: 1600 }}
    />
  );
};

export default JobsTable;
