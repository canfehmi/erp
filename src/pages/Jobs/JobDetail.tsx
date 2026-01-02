import { useState } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Tabs,
  Row,
  Col,
  Statistic,
  message,
  Select,
  Modal,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import jobService from "../../services/jobService";
import type { Job } from "../../types";
import { JobStatusLabels, JobStatusColors } from "../../types";
import JobMaterialsTab from "./JobMaterialsTab";
import JobPaymentsTab from "./JobPaymentsTab";
import JobExpensesTab from "./JobExpensesTab";

const { Option } = Select;

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<number | null>(null);
  const [statusNotes, setStatusNotes] = useState("");

  // İş detayını çek
  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ["job", id],
    queryFn: () => jobService.getById(Number(id)),
    enabled: !!id,
  });

  // Malzemeleri çek
  const { data: materials = [] } = useQuery({
    queryKey: ["jobMaterials", id],
    queryFn: () => jobService.getMaterials(Number(id)),
    enabled: !!id,
  });

  // Ödemeleri çek
  const { data: payments = [] } = useQuery({
    queryKey: ["jobPayments", id],
    queryFn: () => jobService.getPayments(Number(id)),
    enabled: !!id,
  });

  // Giderleri çek
  const { data: expenses = [] } = useQuery({
    queryKey: ["jobExpenses", id],
    queryFn: () => jobService.getExpenses(Number(id)),
    enabled: !!id,
  });

  // Durum güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: number; notes?: string }) =>
      jobService.updateStatus(Number(id), status, notes),
    onSuccess: () => {
      message.success("İş durumu güncellendi");
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsStatusModalOpen(false);
      setNewStatus(null);
      setStatusNotes("");
    },
    onError: () => {
      message.error("Durum güncellenirken hata oluştu");
    },
  });

  if (isLoading || !job) {
    return <div>Yükleniyor...</div>;
  }

  const handleStatusChange = () => {
    if (newStatus === null) {
      message.warning("Yeni durum seçiniz");
      return;
    }
    updateStatusMutation.mutate({ status: newStatus, notes: statusNotes });
  };

  // Hesaplamalar
  // Malzeme maliyeti: kullanılan miktar * alış fiyatı
  const totalMaterialCost = materials.reduce((sum, m) => {
    const purchasePrice = m.product?.purchasePrice || m.unitPrice;
    return sum + m.usedQuantity * purchasePrice;
  }, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingPayment = job.finalAmount - totalPayments;
  const netProfit = job.finalAmount - totalMaterialCost - totalExpenses;

  return (
    <div>
      {/* Başlık */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/jobs")}
          style={{ marginBottom: 16 }}
        >
          Geri Dön
        </Button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>
              {job.jobNumber} - {job.title}
            </h1>
            <Tag
              color={JobStatusColors[job.status]}
              style={{ marginTop: 8, fontSize: 14, padding: "4px 12px" }}
            >
              {JobStatusLabels[job.status]}
            </Tag>
          </div>

          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsStatusModalOpen(true)}
            >
              Durum Güncelle
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/jobs/${id}/edit`)}
            >
              İşi Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Tutar"
              value={job.finalAmount}
              prefix="₺"
              precision={2}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ödenen Tutar"
              value={totalPayments}
              prefix="₺"
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kalan Ödeme"
              value={remainingPayment}
              prefix="₺"
              precision={2}
              valueStyle={{
                color: remainingPayment > 0 ? "#ff4d4f" : "#52c41a",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Net Kar"
              value={netProfit}
              prefix="₺"
              precision={2}
              valueStyle={{ color: netProfit > 0 ? "#52c41a" : "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Maliyet Detayları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small">
            <Statistic
              title="Malzeme Maliyeti"
              value={totalMaterialCost}
              prefix="₺"
              precision={2}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small">
            <Statistic
              title="Toplam Giderler"
              value={totalExpenses}
              prefix="₺"
              precision={2}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small">
            <Statistic
              title="Toplam Maliyet"
              value={totalMaterialCost + totalExpenses}
              prefix="₺"
              precision={2}
              valueStyle={{ fontSize: 20, color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* İş Bilgileri */}
      <Card title="İş Bilgileri" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
          <Descriptions.Item label="Müşteri">
            <strong>{job.customer?.name}</strong>
            {job.customer?.companyName && (
              <div style={{ color: "#666", fontSize: 12 }}>
                {job.customer.companyName}
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Telefon">
            {job.customer?.phoneNumber || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="E-posta">
            {job.customer?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Planlanan Tarih">
            {dayjs(job.scheduledDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Başlangıç Tarihi">
            {job.startDate ? dayjs(job.startDate).format("DD/MM/YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Tamamlanma Tarihi">
            {job.completionDate
              ? dayjs(job.completionDate).format("DD/MM/YYYY")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Adres" span={3}>
            {job.address}
          </Descriptions.Item>
          {job.description && (
            <Descriptions.Item label="Açıklama" span={3}>
              {job.description}
            </Descriptions.Item>
          )}
          {job.notes && (
            <Descriptions.Item label="Notlar" span={3}>
              {job.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Tabs - Malzemeler, Ödemeler, Giderler */}
      <Tabs
        items={[
          {
            key: "materials",
            label: (
              <span>
                <ShoppingCartOutlined /> Malzemeler ({materials.length})
              </span>
            ),
            children: (
              <JobMaterialsTab jobId={Number(id)} materials={materials} job={job} />
            ),
          },
          {
            key: "payments",
            label: (
              <span>
                <DollarOutlined /> Ödemeler ({payments.length})
              </span>
            ),
            children: (
              <JobPaymentsTab
                jobId={Number(id)}
                payments={payments}
                job={job}
              />
            ),
          },
          {
            key: "expenses",
            label: (
              <span>
                <FileTextOutlined /> Giderler ({expenses.length})
              </span>
            ),
            children: (
              <JobExpensesTab jobId={Number(id)} expenses={expenses} />
            ),
          },
        ]}
      />

      {/* Durum Güncelleme Modal */}
      <Modal
        title="İş Durumunu Güncelle"
        open={isStatusModalOpen}
        onOk={handleStatusChange}
        onCancel={() => {
          setIsStatusModalOpen(false);
          setNewStatus(null);
          setStatusNotes("");
        }}
        confirmLoading={updateStatusMutation.isPending}
        okText="Güncelle"
        cancelText="İptal"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <label>Mevcut Durum:</label>
            <div>
              <Tag color={JobStatusColors[job.status]} style={{ marginTop: 4 }}>
                {JobStatusLabels[job.status]}
              </Tag>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Yeni Durum:</label>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Yeni durum seçiniz"
              value={newStatus}
              onChange={setNewStatus}
            >
              {Object.entries(JobStatusLabels).map(([value, label]) => (
                <Option key={value} value={Number(value)}>
                  {label}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Not (Opsiyonel):</label>
            <Input.TextArea
              rows={3}
              placeholder="Durum değişikliği hakkında not..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default JobDetail;
