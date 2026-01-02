import { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  InboxOutlined,
  StockOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

type MenuItem = Required<MenuProps>["items"][number];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Ana Sayfa",
    },
    {
      key: "/customers",
      icon: <UserOutlined />,
      label: "Müşteriler",
    },
    {
      key: "/suppliers",
      icon: <ShopOutlined />,
      label: "Tedarikçiler",
    },
    {
      key: "/products",
      icon: <InboxOutlined />,
      label: "Ürünler",
    },
    {
      key: "/product-categories", // YENİ
      icon: <AppstoreOutlined />,
      label: "Kategoriler",
    },
    {
      key: "/stock",
      icon: <StockOutlined />,
      label: "Stok Takibi",
    },
    {
      key: "/jobs",
      icon: <StockOutlined />,
      label: "İş Takibi",
    },
    {
      key: "/costs",
      icon: <CalculatorOutlined />,
      label: "Maliyet Hesaplama",
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: collapsed ? 12 : 14,
          }}
        >
          {!collapsed ? "CamSec ERP" : "ERP"}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: 0,
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "0 24px", fontSize: 18, fontWeight: "bold" }}>
            CamSec ERP Sistemi
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
