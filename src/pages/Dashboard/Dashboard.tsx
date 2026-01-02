import { Card, Row, Col, Statistic, Table, Spin, Button, Space } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  InboxOutlined,
  StockOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowRightOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import customerService from "../../services/customerService";
import supplierService from "../../services/supplierService";
import productService from "../../services/productService";
import productCategoryService from "../../services/productCategoryService";
import type { Product, Customer, Supplier, ProductCategory, CustomerReceivableSummary } from "../../types";
import type { ColumnsType } from "antd/es/table";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>(
    {
      queryKey: ["customers"],
      queryFn: customerService.getAll,
    }
  );

  const { data: suppliers, isLoading: suppliersLoading } = useQuery<Supplier[]>(
    {
      queryKey: ["suppliers"],
      queryFn: supplierService.getAll,
    }
  );

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  // ✅ Kategorileri ayrıca çek
  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ["productCategories"],
    queryFn: productCategoryService.getAll,
  });

  // Alacakları çek
  const { data: receivables } = useQuery<CustomerReceivableSummary[]>({
    queryKey: ["customerReceivables"],
    queryFn: () => customerService.getAllReceivableSummaries(true),
  });

  const isLoading = customersLoading || suppliersLoading || productsLoading;

  // İstatistikler
  const activeCustomers = customers?.filter((c) => c.isActive).length || 0;
  const activeSuppliers = suppliers?.filter((s) => s.isActive).length || 0;
  const activeProducts = products?.filter((p) => p.isActive).length || 0;

  // Toplam stok değeri (Alış fiyatı ile)
  const totalStockValue =
    products?.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0) ||
    0;

  // Potansiyel satış değeri (Satış fiyatı ile)
  const potentialSalesValue =
    products?.reduce((sum, p) => sum + p.stockQuantity * p.salePrice, 0) || 0;

  // Toplam kar potansiyeli
  const totalProfitPotential = potentialSalesValue - totalStockValue;

  // Alacak istatistikleri
  const totalReceivables = receivables?.reduce((sum, r) => sum + r.outstandingBalance, 0) || 0;
  const overdueReceivables = receivables?.reduce((sum, r) => sum + r.aging.over90Days, 0) || 0;

  // Düşük stoklu ürünler
  const lowStockProducts: Product[] =
    products?.filter(
      (p) => p.stockQuantity <= p.minimumStockLevel && p.isActive
    ) || [];

  // Stoksuz ürünler
  const outOfStockProducts: Product[] =
    products?.filter((p) => p.stockQuantity === 0 && p.isActive) || [];

  // Kategori bazlı ürün dağılımı
  const categoryDistribution = () => {
    const categoryMap = new Map<string, number>();

    products?.forEach((p) => {
      let categoryName = "Kategorisiz";

      // Önce product.category'den al
      if (p.category?.name) {
        categoryName = p.category.name;
      }
      // Yoksa categoryId ile categories'den bul
      else if (p.categoryId && categories) {
        const category = categories.find((c) => c.id === p.categoryId);
        if (category) {
          categoryName = category.name;
        }
      }

      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // En yüksek stok değerine sahip ürünler
  const topValueProducts =
    products
      ?.map((p) => ({
        ...p,
        totalValue: p.stockQuantity * p.purchasePrice,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5) || [];

  // Düşük stoklu ürünler tablosu
  const lowStockColumns: ColumnsType<Product> = [
    {
      title: "Ürün Kodu",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Ürün Adı",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Kategori",
      dataIndex: ["category", "name"],
      key: "category",
      width: 120,
      render: (name: string) => name || "-",
    },
    {
      title: "Mevcut / Min Stok",
      key: "stock",
      width: 150,
      render: (_, record: Product) => (
        <span
          style={{ color: record.stockQuantity === 0 ? "#ff4d4f" : "#faad14" }}
        >
          {record.stockQuantity} / {record.minimumStockLevel} {record.unit}
        </span>
      ),
    },
    {
      title: "Tedarikçi",
      dataIndex: ["supplier", "companyName"],
      key: "supplier",
      ellipsis: true,
      render: (name: string) => name || "-",
    },
  ];

  // En yüksek değerli ürünler tablosu
  const topValueColumns: ColumnsType<Product & { totalValue: number }> = [
    {
      title: "Sıra",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Ürün Adı",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Stok",
      dataIndex: "stockQuantity",
      key: "stock",
      width: 100,
      align: "right",
      render: (qty: number, record: Product) => `${qty} ${record.unit}`,
    },
    {
      title: "Birim Fiyat",
      dataIndex: "purchasePrice",
      key: "price",
      width: 120,
      align: "right",
      render: (price: number) =>
        `₺${price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Toplam Değer",
      dataIndex: "totalValue",
      key: "totalValue",
      width: 150,
      align: "right",
      render: (value: number) => (
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>
          ₺{value.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>Dashboard - ERP Yönetim Paneli</h1>
      </div>

      {/* Üst İstatistikler */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/customers")}>
            <Statistic
              title="Toplam Müşteri"
              value={customers?.length || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix={
                <span style={{ fontSize: 14, color: "#666" }}>
                  ({activeCustomers} aktif)
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/suppliers")}>
            <Statistic
              title="Toplam Tedarikçi"
              value={suppliers?.length || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#1890ff" }}
              suffix={
                <span style={{ fontSize: 14, color: "#666" }}>
                  ({activeSuppliers} aktif)
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/products")}>
            <Statistic
              title="Toplam Ürün"
              value={products?.length || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#cf1322" }}
              suffix={
                <span style={{ fontSize: 14, color: "#666" }}>
                  ({activeProducts} aktif)
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/stock")}>
            <Statistic
              title="Stok Değeri (Alış)"
              value={totalStockValue}
              prefix={<StockOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Mali Durum İstatistikleri */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Potansiyel Satış Değeri"
              value={potentialSalesValue}
              prefix={<RiseOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kar Potansiyeli"
              value={totalProfitPotential}
              prefix={<RiseOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{
                color: totalProfitPotential > 0 ? "#52c41a" : "#ff4d4f",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ortalama Kar Marjı"
              value={
                products && products.length > 0
                  ? products.reduce((sum, p) => sum + p.profitMargin, 0) /
                    products.length
                  : 0
              }
              suffix="%"
              precision={1}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate("/customers")}>
            <Statistic
              title="Toplam Alacaklar"
              value={totalReceivables}
              prefix={<DollarOutlined />}
              suffix="₺"
              precision={2}
              valueStyle={{ color: totalReceivables > 0 ? "#ff4d4f" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alacak Uyarıları */}
      {overdueReceivables > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              hoverable
              onClick={() => navigate("/customers")}
              style={{
                borderLeft: "4px solid #ff4d4f",
                backgroundColor: "#fff1f0",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Statistic
                  title="90+ Gün Vadesi Geçmiş Alacaklar"
                  value={overdueReceivables}
                  prefix={<WarningOutlined />}
                  suffix="₺"
                  precision={2}
                  valueStyle={{ color: "#ff4d4f", fontWeight: "bold" }}
                />
                <span style={{ color: "#666" }}>
                  Acil takip gerekiyor - Detaylar için tıklayın
                </span>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Stok Uyarıları */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={() => navigate("/stock?tab=lowStock")}
            style={{
              borderLeft:
                lowStockProducts.length > 0
                  ? "4px solid #faad14"
                  : "4px solid #52c41a",
            }}
          >
            <Statistic
              title="Düşük Stoklu Ürünler"
              value={lowStockProducts.length}
              prefix={<WarningOutlined />}
              valueStyle={{
                color: lowStockProducts.length > 0 ? "#faad14" : "#52c41a",
              }}
              suffix={
                <ArrowRightOutlined
                  style={{ fontSize: 16, marginLeft: 8, cursor: "pointer" }}
                />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{
              borderLeft:
                outOfStockProducts.length > 0
                  ? "4px solid #ff4d4f"
                  : "4px solid #52c41a",
            }}
          >
            <Statistic
              title="Tükenen Ürünler"
              value={outOfStockProducts.length}
              prefix={<FallOutlined />}
              valueStyle={{
                color: outOfStockProducts.length > 0 ? "#ff4d4f" : "#52c41a",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Bekleyen Siparişler"
              value={0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Grafikler ve Tablolar */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Kategori Dağılımı */}
        <Col xs={24} lg={12}>
          <Card title="Kategori Bazlı Ürün Dağılımı" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution().map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* En Yüksek Değerli Ürünler */}
        <Col xs={24} lg={12}>
          <Card
            title="En Yüksek Stok Değerine Sahip Ürünler"
            size="small"
            extra={
              <Button type="link" onClick={() => navigate("/products")}>
                Tümünü Gör
              </Button>
            }
          >
            <Table
              columns={topValueColumns}
              dataSource={topValueProducts}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 260 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Düşük Stoklu Ürünler Tablosu */}
      {lowStockProducts.length > 0 && (
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: "#faad14" }} />
              <span>Düşük Stoklu Ürünler - Acil Takip Gerekli</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              onClick={() => navigate("/stock?tab=lowStock")}
            >
              Detaylı Görüntüle
            </Button>
          }
          style={{ marginTop: 24 }}
        >
          <Table
            columns={lowStockColumns}
            dataSource={lowStockProducts.slice(0, 10)}
            rowKey="id"
            pagination={false}
            size="small"
          />
          {lowStockProducts.length > 10 && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button
                type="link"
                onClick={() => navigate("/stock?tab=lowStock")}
              >
                {lowStockProducts.length - 10} ürün daha var - Tümünü görüntüle
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Başarı Mesajı */}
      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
        <Card
          style={{
            marginTop: 24,
            background: "#f6ffed",
            borderColor: "#b7eb8f",
          }}
        >
          <div style={{ textAlign: "center", padding: 20 }}>
            <h2 style={{ color: "#52c41a", margin: 0 }}>🎉 Harika!</h2>
            <p style={{ margin: "8px 0 0", fontSize: 16 }}>
              Tüm ürünleriniz yeterli stok seviyesinde. Stok yönetimi mükemmel
              durumda!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
