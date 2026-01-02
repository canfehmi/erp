import { useParams } from "react-router-dom";
import { Card, Row, Col, Statistic, Descriptions, Spin, Alert, Table } from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import customerService from "../../services/customerService";
import type { CustomerReceivableSummary } from "../../types";
import type { ColumnsType } from "antd/es/table";

interface AgingData {
  key: string;
  period: string;
  amount: number;
  color: string;
}

const CustomerFinancialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || "0");

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => customerService.getById(customerId),
  });

  const { data: receivableSummary, isLoading: receivableLoading } =
    useQuery<CustomerReceivableSummary>({
      queryKey: ["customerReceivable", customerId],
      queryFn: () => customerService.getReceivableSummary(customerId),
    });

  const isLoading = customerLoading || receivableLoading;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!customer || !receivableSummary) {
    return (
      <Alert
        message="Müşteri Bulunamadı"
        description="İstediğiniz müşteri kaydı bulunamadı."
        type="error"
        showIcon
      />
    );
  }

  const agingData: AgingData[] = [
    {
      key: "current",
      period: "Güncel (0-30 gün)",
      amount: receivableSummary.aging.current,
      color: "#52c41a",
    },
    {
      key: "30-60",
      period: "30-60 Gün",
      amount: receivableSummary.aging.days30To60,
      color: "#faad14",
    },
    {
      key: "60-90",
      period: "60-90 Gün",
      amount: receivableSummary.aging.days60To90,
      color: "#ff7a45",
    },
    {
      key: "90+",
      period: "90+ Gün (Vadesi Geçmiş)",
      amount: receivableSummary.aging.over90Days,
      color: "#ff4d4f",
    },
  ];

  const agingColumns: ColumnsType<AgingData> = [
    {
      title: "Dönem",
      dataIndex: "period",
      key: "period",
      render: (text: string, record: AgingData) => (
        <span style={{ color: record.color, fontWeight: "500" }}>{text}</span>
      ),
    },
    {
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount: number, record: AgingData) => (
        <span style={{ color: record.color, fontWeight: "bold" }}>
          ₺{amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Yüzde",
      key: "percentage",
      align: "right",
      render: (_: unknown, record: AgingData) => {
        const percentage =
          receivableSummary.outstandingBalance > 0
            ? (record.amount / receivableSummary.outstandingBalance) * 100
            : 0;
        return (
          <span style={{ color: record.color }}>
            {percentage.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>
        {customer.name} {customer.companyName && `- ${customer.companyName}`}
      </h1>

      {/* Customer Info */}
      <Card title="Müşteri Bilgileri" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Müşteri Adı">
            {customer.name}
          </Descriptions.Item>
          <Descriptions.Item label="Firma Adı">
            {customer.companyName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Telefon">
            {customer.phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="E-posta">
            {customer.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Vergi No">
            {customer.taxNumber || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Vergi Dairesi">
            {customer.taxOffice || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Financial Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Faturalanan"
              value={receivableSummary.totalBilled}
              prefix={<DollarOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Ödenen"
              value={receivableSummary.totalPaid}
              prefix={<CheckCircleOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderLeft:
                receivableSummary.outstandingBalance > 0
                  ? "4px solid #ff4d4f"
                  : "4px solid #52c41a",
            }}
          >
            <Statistic
              title="Bakiye (Alacak)"
              value={receivableSummary.outstandingBalance}
              prefix={<WarningOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{
                color:
                  receivableSummary.outstandingBalance > 0
                    ? "#ff4d4f"
                    : "#52c41a",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam İş / Aktif İş"
              value={receivableSummary.totalJobs}
              prefix={<ClockCircleOutlined />}
              suffix={`/ ${receivableSummary.activeJobs}`}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Aging Analysis */}
      {receivableSummary.outstandingBalance > 0 && (
        <Card
          title="Alacak Yaşlandırma Analizi"
          extra={
            <span style={{ color: "#666", fontSize: 14 }}>
              İş oluşturma tarihine göre
            </span>
          }
        >
          <Table
            columns={agingColumns}
            dataSource={agingData}
            pagination={false}
            size="middle"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                  <Table.Summary.Cell index={0}>
                    <strong>TOPLAM</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ fontSize: 16, color: "#1890ff" }}>
                      ₺
                      {receivableSummary.outstandingBalance.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>100%</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          {receivableSummary.aging.over90Days > 0 && (
            <Alert
              message="Dikkat!"
              description={`Bu müşterinin ₺${receivableSummary.aging.over90Days.toLocaleString(
                "tr-TR",
                { minimumFractionDigits: 2 }
              )} tutarında 90 günden eski alacağı bulunmaktadır.`}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      )}

      {receivableSummary.outstandingBalance === 0 && (
        <Card>
          <Alert
            message="Harika!"
            description="Bu müşterinin ödenmemiş borcu bulunmamaktadır."
            type="success"
            showIcon
          />
        </Card>
      )}
    </div>
  );
};

export default CustomerFinancialDetail;

