import { Card, Row, Col, Statistic, Table, Spin } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  InboxOutlined,
  StockOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import * as customerService from "../../services/customerService";
import * as supplierService from "../../services/supplierService";
import * as productService from "../../services/productService";
import type { Product, Customer, Supplier } from "../../types";
import type { ColumnsType } from "antd/es/table";

const Dashboard: React.FC = () => {
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

  const isLoading = customersLoading || suppliersLoading || productsLoading;

  // İstatistikler - Tip güvenli
  const activeCustomers = customers?.filter((c) => c.isActive).length || 0;
  const activeSuppliers = suppliers?.filter((s) => s.isActive).length || 0;
  const activeProducts = products?.filter((p) => p.isActive).length || 0;

  // Toplam stok değeri
  const totalStockValue =
    products?.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0) ||
    0;

  // Düşük stoklu ürünler
  const lowStockProducts: Product[] =
    products?.filter((p) => p.stockQuantity <= p.minStockLevel && p.isActive) ||
    [];

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
    },
    {
      title: "Mevcut Stok",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (qty: number, record: Product) => (
        <span style={{ color: "#faad14" }}>
          {qty} / {record.minStockLevel} {record.unit}
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
      <h1 style={{ marginBottom: 24 }}>Hoş Geldiniz - Güvenlik Kamera ERP</h1>

      {/* Üst İstatistikler */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Müşteri"
              value={customers?.length || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix={`(${activeCustomers} aktif)`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Tedarikçi"
              value={suppliers?.length || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#1890ff" }}
              suffix={`(${activeSuppliers} aktif)`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Ürün"
              value={products?.length || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#cf1322" }}
              suffix={`(${activeProducts} aktif)`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Stok Değeri"
              value={totalStockValue}
              prefix={<StockOutlined />}
              suffix="₺"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Alt İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Düşük Stoklu Ürünler"
              value={lowStockProducts.length}
              prefix={<WarningOutlined />}
              valueStyle={{
                color: lowStockProducts.length > 0 ? "#faad14" : "#52c41a",
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

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Aylık Ciro"
              value={0}
              prefix="₺"
              suffix="TL"
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Düşük Stoklu Ürünler Tablosu */}
      {lowStockProducts.length > 0 && (
        <Card
          title={
            <span>
              <WarningOutlined style={{ color: "#faad14", marginRight: 8 }} />
              Düşük Stoklu Ürünler
            </span>
          }
          style={{ marginTop: 24 }}
        >
          <Table
            columns={lowStockColumns}
            dataSource={lowStockProducts}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
