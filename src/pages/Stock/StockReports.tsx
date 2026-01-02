import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Button,
  Table,
  Spin,
} from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DownloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import stockMovementService from "../../services/stockMovementService";
import productService from "../../services/productService";
import productCategoryService from "../../services/productCategoryService";
import excelService from "../../services/excelService";
import type { StockMovement, Product, ProductCategory } from "../../types";
import { StockMovementTypeMap } from "../../types";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface StockChartData {
  date: string;
  giris: number;
  cikis: number;
}

interface ProductStockData {
  name: string;
  value: number;
}

const StockReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();

  // Stok hareketlerini çek
  const { data: movements = [], isLoading: movementsLoading } = useQuery<
    StockMovement[]
  >({
    queryKey: [
      "stockMovements",
      dateRange?.[0]?.format("YYYY-MM-DD"),
      dateRange?.[1]?.format("YYYY-MM-DD"),
    ],
    queryFn: () => {
      // ✅ Tarih kontrolü eklendi
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        return stockMovementService.getAll({});
      }
      return stockMovementService.getAll({
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      });
    },
  });

  // Ürünleri çek
  const { data: products = [], isLoading: productsLoading } = useQuery<
    Product[]
  >({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  // ✅ Kategorileri ayrıca çek
  const { data: allCategories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["productCategories"],
    queryFn: productCategoryService.getAll,
  });

  // Kategorileri çek - Sadece ürünlerde olanlar
  const categories = Array.from(
    new Set(
      products
        .map((p) => {
          // Önce product.category'den al
          if (p.category) return p.category;
          // Yoksa categoryId ile bul
          if (p.categoryId) {
            return allCategories.find((c) => c.id === p.categoryId);
          }
          return undefined;
        })
        .filter(
          (cat): cat is ProductCategory => cat !== null && cat !== undefined
        )
    )
  );

  // Filtrelenmiş ürünler
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category?.id === selectedCategory)
    : products;

  // Grafik verileri hazırlama
  const prepareChartData = (): StockChartData[] => {
    const dataMap = new Map<string, { giris: number; cikis: number }>();

    movements.forEach((movement) => {
      const date = dayjs(movement.movementDate).format("DD/MM");
      const existing = dataMap.get(date) || { giris: 0, cikis: 0 };

      if (
        movement.type === StockMovementTypeMap.STOCK_IN ||
        movement.type === StockMovementTypeMap.RETURN
      ) {
        existing.giris += movement.quantity;
      } else if (movement.type === StockMovementTypeMap.STOCK_OUT) {
        existing.cikis += movement.quantity;
      }

      dataMap.set(date, existing);
    });

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        giris: data.giris,
        cikis: data.cikis,
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split("/").map(Number);
        const [dayB, monthB] = b.date.split("/").map(Number);
        return monthA !== monthB ? monthA - monthB : dayA - dayB;
      });
  };

  // Ürün bazlı stok dağılımı
  const prepareProductStockData = (): ProductStockData[] => {
    return filteredProducts
      .filter((p) => (p.stockQuantity || 0) > 0)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        value: p.stockQuantity || 0,
      }));
  };

  // En çok hareket gören ürünler
  const prepareMostMovedProducts = () => {
    const productMovements = new Map<
      number,
      { product: Product; count: number }
    >();

    movements.forEach((movement) => {
      // ✅ Null/undefined kontrolü eklendi
      if (!movement.product) return;

      const productId = movement.product.id;
      const existing = productMovements.get(productId);

      if (existing) {
        existing.count += movement.quantity;
      } else {
        productMovements.set(productId, {
          product: movement.product,
          count: movement.quantity,
        });
      }
    });

    return Array.from(productMovements.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Kategori bazlı stok değeri
  const prepareCategoryStockValue = () => {
    const categoryValues = new Map<string, number>();

    filteredProducts.forEach((product) => {
      let categoryName = "Kategorisiz";

      // Önce product.category'den al
      if (product.category?.name) {
        categoryName = product.category.name;
      }
      // Yoksa categoryId ile allCategories'den bul
      else if (product.categoryId && allCategories.length > 0) {
        const category = allCategories.find((c) => c.id === product.categoryId);
        if (category) {
          categoryName = category.name;
        }
      }

      const value = (product.stockQuantity || 0) * (product.purchasePrice || 0);
      const existing = categoryValues.get(categoryName) || 0;
      categoryValues.set(categoryName, existing + value);
    });

    return Array.from(categoryValues.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  };

  const chartData = prepareChartData();
  const productStockData = prepareProductStockData();
  const mostMovedProducts = prepareMostMovedProducts();
  const categoryStockValue = prepareCategoryStockValue();

  const mostMovedColumns: ColumnsType<{
    product: Product;
    count: number;
  }> = [
    {
      title: "Sıra",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Ürün Adı",
      dataIndex: ["product", "name"],
      key: "name",
    },
    {
      title: "Ürün Kodu",
      dataIndex: ["product", "code"],
      key: "code",
      width: 120,
    },
    {
      title: "Toplam Hareket",
      dataIndex: "count",
      key: "count",
      width: 130,
      align: "right",
      render: (count: number) => (
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>{count}</span>
      ),
    },
  ];

  const handleExportReport = () => {
    excelService.exportStockMovementsToExcel(
      movements,
      `stok-raporu-${dateRange[0].format("YYYYMMDD")}-${dateRange[1].format(
        "YYYYMMDD"
      )}`
    );
  };

  if (movementsLoading || productsLoading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Filtreler */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
            format="DD/MM/YYYY"
            placeholder={["Başlangıç", "Bitiş"]}
          />

          <Select
            style={{ width: 200 }}
            placeholder="Kategori Seçiniz"
            allowClear
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {categories.map((cat) =>
              cat ? (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ) : null
            )}
          </Select>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
          >
            Rapor İndir
          </Button>
        </Space>
      </Card>

      {/* Grafikler */}
      <Row gutter={[16, 16]}>
        {/* Stok Giriş-Çıkış Grafiği */}
        <Col xs={24} lg={12}>
          <Card title="Stok Giriş-Çıkış Trendi" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="giris"
                  stroke="#52c41a"
                  name="Giriş"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cikis"
                  stroke="#ff4d4f"
                  name="Çıkış"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Ürün Stok Dağılımı */}
        <Col xs={24} lg={12}>
          <Card title="En Yüksek Stoktaki Ürünler (Top 10)" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1890ff" name="Stok Miktarı" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Kategori Bazlı Stok Değeri */}
        <Col xs={24} lg={12}>
          <Card title="Kategori Bazlı Stok Değeri" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStockValue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name}: ₺${entry.value.toLocaleString()}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryStockValue.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `₺${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* En Çok Hareket Gören Ürünler */}
        <Col xs={24} lg={12}>
          <Card title="En Çok Hareket Gören Ürünler" size="small">
            <Table
              columns={mostMovedColumns}
              dataSource={mostMovedProducts}
              rowKey={(record) => record.product.id}
              pagination={false}
              size="small"
              scroll={{ y: 260 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StockReports;
