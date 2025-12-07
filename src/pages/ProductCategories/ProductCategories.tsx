import { useState } from "react";
import { Button, message, Input, Space, Card, Statistic } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import productCategoryService from "../../services/productCategoryService";
import type { ProductCategory } from "../../types";
import ProductCategoryTable from "./ProductCategoryTable";
import ProductCategoryModal from "./ProductCategoryModal";

const ProductCategories: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();

  // Kategorileri çek
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery<ProductCategory[]>({
    queryKey: ["productCategories"],
    queryFn: productCategoryService.getAll,
  });

  // Kategori silme
  const deleteMutation = useMutation({
    mutationFn: productCategoryService.deleteCategory,
    onSuccess: () => {
      message.success("Kategori başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Kategori silinirken hata oluştu";
      message.error(errorMessage);
    },
  });

  const handleAdd = (): void => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: ProductCategory): void => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Arama filtresi
  const filteredCategories =
    categories?.filter(
      (category) =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // İstatistikler
  const totalCategories = categories?.length || 0;
  const activeCategories = categories?.filter((c) => c.isActive).length || 0;
  const inactiveCategories = totalCategories - activeCategories;

  if (isError) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Kategori Yönetimi</h1>
        <div style={{ color: "red", marginTop: 20 }}>
          Hata:{" "}
          {(error as Error)?.message ||
            "Kategoriler yüklenirken bir hata oluştu"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık ve Butonlar */}
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
        <h1 style={{ margin: 0 }}>Ürün Kategori Yönetimi</h1>
        <Space>
          <Input
            placeholder="Kategori ara..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Yeni Kategori Ekle
          </Button>
        </Space>
      </div>

      {/* İstatistik Kartları */}
      <div style={{ marginBottom: 16 }}>
        <Space size="middle" style={{ width: "100%", flexWrap: "wrap" }}>
          <Card loading={isLoading}>
            <Statistic
              title="Toplam Kategori"
              value={totalCategories}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
          <Card loading={isLoading}>
            <Statistic
              title="Aktif Kategori"
              value={activeCategories}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card loading={isLoading}>
            <Statistic
              title="Pasif Kategori"
              value={inactiveCategories}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Space>
      </div>

      {/* Tablo */}
      <ProductCategoryTable
        categories={filteredCategories}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <ProductCategoryModal
        open={isModalOpen}
        category={editingCategory}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default ProductCategories;
