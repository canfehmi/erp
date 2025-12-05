import { useState, useEffect } from "react";
import { Button, message, Input, Select, Space } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import productService from "../../services/productService";
import supplierService from "../../services/supplierService";
import productCategoryService from "../../services/productCategoryService";
import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";
import type { Product } from "../../types";

const { Option } = Select;

const Products: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Ürünleri çek
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  // Tedarikçileri çek
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.getAll,
  });

  // Kategorileri çek
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["productCategories"],
    queryFn: productCategoryService.getAll,
  });

  // DEBUG: Verileri konsola yazdır
  useEffect(() => {
    console.log("🔍 DEBUG - Suppliers:", suppliers);
    console.log("🔍 DEBUG - Categories:", categories);
    console.log("🔍 DEBUG - Suppliers Loading:", suppliersLoading);
    console.log("🔍 DEBUG - Categories Loading:", categoriesLoading);
  }, [suppliers, categories, suppliersLoading, categoriesLoading]);

  // Ürün silme
  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      message.success("Ürün başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      message.error("Ürün silinirken hata oluştu");
    },
  });

  const handleAdd = (): void => {
    console.log("🔵 Modal açılıyor - Suppliers:", suppliers);
    console.log("🔵 Modal açılıyor - Categories:", categories);
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product): void => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Arama ve kategori filtresi
  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId.toString() === categoryFilter;

      return matchesSearch && matchesCategory;
    }) || [];

  // Düşük stoklu ürün sayısı
  const lowStockCount =
    products?.filter((p) => p.stockQuantity <= p.minStockLevel && p.isActive)
      .length || 0;

  if (isError) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Ürün Yönetimi</h1>
        <div style={{ color: "red", marginTop: 20 }}>
          Hata:{" "}
          {(error as Error)?.message || "Ürünler yüklenirken bir hata oluştu"}
        </div>
      </div>
    );
  }

  return (
    <div>
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
        <div>
          <h1 style={{ margin: 0 }}>Ürün Yönetimi</h1>
          {lowStockCount > 0 && (
            <div style={{ color: "#faad14", marginTop: 8 }}>
              <WarningOutlined /> {lowStockCount} ürün düşük stokta
            </div>
          )}
        </div>
        <Space>
          <Input
            placeholder="Ürün ara..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Kategori seçiniz"
            loading={categoriesLoading}
          >
            <Option value="all">Tüm Kategoriler</Option>
            {categories
              ?.filter((cat) => cat.isActive)
              .map((category) => (
                <Option key={category.id} value={category.id.toString()}>
                  {category.name}
                </Option>
              ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            loading={suppliersLoading || categoriesLoading}
          >
            Yeni Ürün Ekle
          </Button>
        </Space>
      </div>

      <ProductTable
        products={filteredProducts}
        suppliers={suppliers || []}
        categories={categories || []}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductModal
        open={isModalOpen}
        product={editingProduct}
        suppliers={suppliers || []}
        categories={categories || []}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Products;
