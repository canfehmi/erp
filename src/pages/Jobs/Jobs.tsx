import { useState } from "react";
import {
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Input,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";
import jobService from "../../services/jobService";
import customerService from "../../services/customerService";
import type { Job, Customer, JobFilterParams } from "../../types";
import { JobStatusMap } from "../../types";
import JobsTable from "./JobsTable";
import JobModal from "./JobModal";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState<JobFilterParams>({});
  const [searchTerm, setSearchTerm] = useState("");

  // İşleri çek
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["jobs", filters],
    queryFn: () => jobService.getAll(filters),
  });

  // Müşterileri çek
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: customerService.getAll,
  });

  // İstatistikleri çek
  const { data: statistics } = useQuery({
    queryKey: ["jobStatistics"],
    queryFn: jobService.getStatistics,
  });

  // İş silme
  const deleteMutation = useMutation({
    mutationFn: jobService.remove,
    onSuccess: () => {
      message.success("İş kaydı silindi");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStatistics"] });
    },
    onError: () => {
      message.error("İş kaydı silinirken hata oluştu");
    },
  });

  const handleAdd = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleView = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleFilterChange = (key: keyof JobFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0]?.format("YYYY-MM-DD"),
        endDate: dates[1]?.format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const handleFilterReset = () => {
    setFilters({});
    setSearchTerm("");
  };

  // Durum bazlı filtreleme
  const activeJobs = jobs.filter(
    (j) =>
      j.status !== JobStatusMap.COMPLETED && j.status !== JobStatusMap.CANCELLED
  );

  const completedJobs = jobs.filter((j) => j.status === JobStatusMap.COMPLETED);
  const cancelledJobs = jobs.filter((j) => j.status === JobStatusMap.CANCELLED);

  return (
    <div>
      {/* Başlık */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>İş Takibi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Yeni İş Ekle
        </Button>
      </div>

      {/* İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam İş"
              value={statistics?.totalJobs || 0}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aktif İşler"
              value={statistics?.activeJobs || 0}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tamamlanan"
              value={statistics?.completedJobs || 0}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Gelir"
              value={statistics?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="₺"
              precision={2}
              styles={{ content: { color: "#722ed1" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Mali İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Toplam Gider"
              value={statistics?.totalExpenses || 0}
              prefix="₺"
              precision={2}
              styles={{ content: { color: "#ff4d4f" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Net Kar"
              value={statistics?.netProfit || 0}
              prefix="₺"
              precision={2}
              styles={{
                content: {
                  color:
                    (statistics?.netProfit || 0) > 0 ? "#52c41a" : "#ff4d4f",
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Ortalama İş Değeri"
              value={statistics?.averageJobValue || 0}
              prefix="₺"
              precision={2}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%" }}>
          <Search
            placeholder="İş numarası veya başlık ara..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />

          <Select
            style={{ width: 200 }}
            placeholder="Müşteri Seçiniz"
            allowClear
            showSearch
            optionFilterProp="children"
            value={filters.customerId}
            onChange={(value) => handleFilterChange("customerId", value)}
          >
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}{" "}
                {customer.companyName && `(${customer.companyName})`}
              </Option>
            ))}
          </Select>

          <Select
            style={{ width: 180 }}
            placeholder="Durum"
            allowClear
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
          >
            <Option value={JobStatusMap.QUOTE_SENT}>Teklif Gönderildi</Option>
            <Option value={JobStatusMap.QUOTE_APPROVED}>
              Teklif Onaylandı
            </Option>
            <Option value={JobStatusMap.PAYMENT_PENDING}>
              Ödeme Bekleniyor
            </Option>
            <Option value={JobStatusMap.PAYMENT_RECEIVED}>Ödeme Alındı</Option>
            <Option value={JobStatusMap.MATERIAL_PREPARING}>
              Malzeme Hazırlanıyor
            </Option>
            <Option value={JobStatusMap.INSTALLATION_SCHEDULED}>
              Montaj Planlandı
            </Option>
            <Option value={JobStatusMap.IN_PROGRESS}>İş Devam Ediyor</Option>
            <Option value={JobStatusMap.INSTALLATION_COMPLETED}>
              Montaj Tamamlandı
            </Option>
            <Option value={JobStatusMap.COMPLETED}>İş Tamamlandı</Option>
            <Option value={JobStatusMap.CANCELLED}>İptal Edildi</Option>
          </Select>

          <RangePicker
            format="DD/MM/YYYY"
            placeholder={["Başlangıç", "Bitiş"]}
            onChange={handleDateRangeChange}
          />

          <Button onClick={handleFilterReset}>Filtreleri Temizle</Button>
        </Space>
      </Card>

      {/* Tabs */}
      <Tabs
        items={[
          {
            key: "all",
            label: `Tüm İşler (${jobs.length})`,
            children: (
              <JobsTable
                jobs={jobs}
                loading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ),
          },
          {
            key: "active",
            label: (
              <span>
                <ClockCircleOutlined /> Aktif İşler ({activeJobs.length})
              </span>
            ),
            children: (
              <JobsTable
                jobs={activeJobs}
                loading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ),
          },
          {
            key: "completed",
            label: (
              <span>
                <CheckCircleOutlined /> Tamamlanan ({completedJobs.length})
              </span>
            ),
            children: (
              <JobsTable
                jobs={completedJobs}
                loading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ),
          },
          {
            key: "cancelled",
            label: (
              <span>
                <StopOutlined /> İptal Edilen ({cancelledJobs.length})
              </span>
            ),
            children: (
              <JobsTable
                jobs={cancelledJobs}
                loading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ),
          },
        ]}
      />

      {/* Modal */}
      {isModalOpen && (
        <JobModal
          open={isModalOpen}
          job={editingJob}
          customers={customers}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Jobs;
