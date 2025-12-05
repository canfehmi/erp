import { useState } from "react";
import { Button, message, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import customerService from "../../services/customerService";
import CustomerTable from "./CustomerTable";
import CustomerModal from "./CustomerModal";
import type { Customer } from "../../types";

const Customers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();

  // Müşterileri çek
  const {
    data: customers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.getAll,
  });

  // Müşteri silme
  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.delete(id),
    onSuccess: () => {
      message.success("Müşteri başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      message.error("Müşteri silinirken hata oluştu");
    },
  });

  const handleAdd = (): void => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer): void => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  // Arama filtresi
  const filteredCustomers =
    customers?.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.companyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber?.includes(searchTerm)
    ) || [];

  // Hata durumu
  if (isError) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Müşteri Yönetimi</h1>
        <div style={{ color: "red", marginTop: 20 }}>
          Hata: {error?.message || "Müşteriler yüklenirken bir hata oluştu"}
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
        <h1 style={{ margin: 0 }}>Müşteri Yönetimi</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Input
            placeholder="Müşteri ara..."
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
            Yeni Müşteri Ekle
          </Button>
        </div>
      </div>

      <CustomerTable
        customers={filteredCustomers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CustomerModal
        open={isModalOpen}
        customer={editingCustomer}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Customers;
