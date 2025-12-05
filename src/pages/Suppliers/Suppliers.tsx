import { useState } from "react";
import { Button, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supplierService from "../../services/supplierService";
import type { Supplier } from "../../types";
import SupplierTable from "./SupplierTable";
import SupplierModal from "./SupplierModal";

const Suppliers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierService.delete(id),
    onSuccess: () => {
      message.success("Tedarikçi başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => {
      message.error("Tedarikçi silinirken hata oluştu");
    },
  });

  const handleAdd = (): void => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier): void => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const filteredSuppliers =
    suppliers?.filter(
      (supplier) =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.companyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.productCategory
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

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
        <h1 style={{ margin: 0 }}>Tedarikçi Yönetimi</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Input
            placeholder="Tedarikçi ara..."
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
            Yeni Tedarikçi Ekle
          </Button>
        </div>
      </div>

      <SupplierTable
        suppliers={filteredSuppliers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SupplierModal
        open={isModalOpen}
        supplier={editingSupplier}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Suppliers;
