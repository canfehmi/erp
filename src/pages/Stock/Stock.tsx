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
  Dropdown,
  type MenuProps,
} from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  WarningOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import stockMovementService from "../../services/stockMovementService";
import productService from "../../services/productService";
import excelService from "../../services/excelService";
import StockMovementTable from "./StockMovementTable";
import StockMovementModal from "./StockMovementModal";
import LowStockAlert from "./LowStockAlert";
import BulkStockMovementModal from "./BulkStockMovementModal";
import StockReports from "./StockReports";
import type { StockMovement, Product } from "../../types";
import { StockMovementTypeMap } from "../../types";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Stock: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
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
    queryFn: () => {
      const params: any = {};

      if (selectedProduct) {
        params.productId = selectedProduct;
      }

      if (selectedType) {
        params.type = selectedType;
      }

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      return stockMovementService.getAll(params);
    },
  });

  // İstatistikleri çek
  const { data: statistics } = useQuery({
    queryKey: [
      "stockStatistics",
      dateRange?.[0]?.format("YYYY-MM-DD"),
      dateRange?.[1]?.format("YYYY-MM-DD"),
    ],
    queryFn: () => {
      const params: any = {};

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      return stockMovementService.getStatistics(params);
    },
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

  const handleBulkAdd = (): void => {
    setIsBulkModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
  };

  const handleBulkModalClose = (): void => {
    setIsBulkModalOpen(false);
  };

  const handleFilterReset = (): void => {
    setSelectedProduct(undefined);
    setSelectedType(undefined);
    setDateRange(null);
  };

  const handleExportExcel = (): void => {
    if (movements && movements.length > 0) {
      excelService.exportStockMovementsToExcel(movements);
      message.success("Excel dosyası indirildi");
    } else {
      message.warning("Dışa aktarılacak veri bulunamadı");
    }
  };

  const handleExportProducts = (): void => {
    if (products && products.length > 0) {
      excelService.exportProductsToExcel(products);
      message.success("Ürünler Excel dosyası indirildi");
    } else {
      message.warning("Dışa aktarılacak ürün bulunamadı");
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "single",
      label: "Tekli Hareket Ekle",
      icon: <PlusOutlined />,
      onClick: handleAdd,
    },
    {
      key: "bulk",
      label: "Toplu Hareket Ekle",
      icon: <UploadOutlined />,
      onClick: handleBulkAdd,
    },
    {
      type: "divider",
    },
    {
      key: "export-movements",
      label: "Hareketleri Dışa Aktar",
      icon: <DownloadOutlined />,
      onClick: handleExportExcel,
    },
    {
      key: "export-products",
      label: "Ürünleri Dışa Aktar",
      icon: <FileExcelOutlined />,
      onClick: handleExportProducts,
    },
  ];

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
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button type="primary" size="large">
            İşlemler <PlusOutlined />
          </Button>
        </Dropdown>
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
            label: (
              <span>
                <SwapOutlined /> Stok Hareketleri
              </span>
            ),
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
          {
            key: "reports",
            label: (
              <span>
                <BarChartOutlined /> Raporlar & Grafikler
              </span>
            ),
            children: <StockReports />,
          },
        ]}
      />

      {/* Modals */}
      {isModalOpen && (
        <StockMovementModal
          open={isModalOpen}
          products={products || []}
          onClose={handleModalClose}
        />
      )}

      {isBulkModalOpen && (
        <BulkStockMovementModal
          open={isBulkModalOpen}
          products={products || []}
          onClose={handleBulkModalClose}
        />
      )}
    </div>
  );
};

export default Stock;
