import { useState } from "react";
import {
  Button,
  message,
  Card,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import stockMovementService from "../../services/stockMovementService";
import productService from "../../services/productService";
import StockMovementTable from "./StockMovementTable";
import StockMovementModal from "./StockMovementModal";
import LowStockAlert from "./LowStockAlert";
import type { StockMovement, Product } from "../../types";
import { StockMovementTypeMap } from "../../types";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Stock: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [selectedType, setSelectedType] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [activeTab, setActiveTab] = useState<string>("movements");
  const queryClient = useQueryClient();

  // Ürünleri çek
  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  // Stok hareketlerini çek
  const { data: movements, isLoading } = useQuery<StockMovement[]>({
    queryKey: [
      "stockMovements",
      selectedProduct,
      selectedType,
      dateRange?.[0]?.format("YYYY-MM-DD"),
      dateRange?.[1]?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      stockMovementService.getAll({
        productId: selectedProduct,
        type: selectedType,
        startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
      }),
  });

  // İstatistikleri çek
  const { data: statistics } = useQuery({
    queryKey: [
      "stockStatistics",
      dateRange?.[0]?.format("YYYY-MM-DD"),
      dateRange?.[1]?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      stockMovementService.getStatistics({
        startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
      }),
  });

  // Düşük stoklu ürünleri çek
  const { data: lowStockProducts } = useQuery<Product[]>({
    queryKey: ["lowStockProducts"],
    queryFn: productService.getLowStock,
  });

  // Stok hareketi silme
  const deleteMutation = useMutation({
    mutationFn: stockMovementService.deleteMovement,
    onSuccess: () => {
      message.success("Stok hareketi silindi");
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stockStatistics"] });
    },
    onError: () => {
      message.error("Stok hareketi silinirken hata oluştu");
    },
  });

  const handleAdd = (): void => {
    setIsModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
  };

  const handleFilterReset = (): void => {
    setSelectedProduct(undefined);
    setSelectedType(undefined);
    setDateRange(null);
  };

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
        <h1 style={{ margin: 0 }}>Stok Takibi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Stok Hareketi Ekle
        </Button>
      </div>

      {/* İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Hareket"
              value={statistics?.totalMovements || 0}
              prefix={<SwapOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Giriş"
              value={statistics?.totalStockIn || 0}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix="Adet"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Çıkış"
              value={statistics?.totalStockOut || 0}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
              suffix="Adet"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Düşük Stok"
              value={lowStockProducts?.length || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
              suffix="Ürün"
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "movements",
            label: "Stok Hareketleri",
            children: (
              <>
                {/* Filtreler */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Select
                      style={{ width: 200 }}
                      placeholder="Ürün Seçiniz"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                    >
                      {products?.map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      style={{ width: 150 }}
                      placeholder="Hareket Tipi"
                      allowClear
                      value={selectedType}
                      onChange={setSelectedType}
                    >
                      <Option value={StockMovementTypeMap.STOCK_IN}>
                        Stok Girişi
                      </Option>
                      <Option value={StockMovementTypeMap.STOCK_OUT}>
                        Stok Çıkışı
                      </Option>
                      <Option value={StockMovementTypeMap.ADJUSTMENT}>
                        Düzeltme
                      </Option>
                      <Option value={StockMovementTypeMap.RETURN}>İade</Option>
                      <Option value={StockMovementTypeMap.TRANSFER}>
                        Transfer
                      </Option>
                    </Select>

                    <RangePicker
                      value={dateRange}
                      onChange={(dates) =>
                        setDateRange(dates as [Dayjs, Dayjs] | null)
                      }
                      format="DD/MM/YYYY"
                      placeholder={["Başlangıç", "Bitiş"]}
                    />

                    <Button onClick={handleFilterReset}>
                      Filtreleri Temizle
                    </Button>
                  </Space>
                </Card>

                {/* Tablo */}
                <StockMovementTable
                  movements={movements || []}
                  loading={isLoading}
                  onDelete={handleDelete}
                />
              </>
            ),
          },
          {
            key: "lowStock",
            label: (
              <span>
                <WarningOutlined /> Düşük Stok ({lowStockProducts?.length || 0})
              </span>
            ),
            children: <LowStockAlert products={lowStockProducts || []} />,
          },
        ]}
      />

      {/* Modal */}
      {isModalOpen && (
        <StockMovementModal
          open={isModalOpen}
          products={products || []}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Stock;
