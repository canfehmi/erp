import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  message,
  Select,
  Input,
  Alert,
  Space,
  Typography,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import stockMovementService from "../../services/stockMovementService";
import type { Product, StockMovementFormData } from "../../types";
import { StockMovementTypeMap } from "../../types";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface StockMovementModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  preSelectedProductId?: number; // ✅ YENİ: Önceden seçili ürün
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({
  open,
  products,
  onClose,
  preSelectedProductId, // ✅ YENİ
}) => {
  const [form] = Form.useForm<StockMovementFormData>();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedType(null);

      // ✅ Eğer preSelectedProductId varsa, otomatik seç
      if (preSelectedProductId) {
        const product = products.find((p) => p.id === preSelectedProductId);
        setSelectedProduct(product || null);
        form.setFieldsValue({
          productId: preSelectedProductId,
          type: StockMovementTypeMap.STOCK_IN, // ✅ Varsayılan olarak Stok Girişi
        });
        setSelectedType(StockMovementTypeMap.STOCK_IN);
      } else {
        setSelectedProduct(null);
      }
    }
  }, [open, form, products, preSelectedProductId]);

  const saveMutation = useMutation({
    mutationFn: (data: StockMovementFormData) => {
      return stockMovementService.create(data);
    },
    onSuccess: () => {
      message.success("Stok hareketi başarıyla eklendi");
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stockStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Bir hata oluştu";
      message.error(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage)
      );
    },
  });

  const handleSubmit = (): void => {
    form.validateFields().then((values) => {
      const formData: StockMovementFormData = {
        ...values,
        movementDate: new Date().toISOString(),
      };
      saveMutation.mutate(formData);
    });
  };

  const handleProductChange = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleTypeChange = (type: number) => {
    setSelectedType(type);
  };

  return (
    <Modal
      title="Stok Hareketi Ekle"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      width={700}
      okText="Kaydet"
      cancelText="İptal"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Alert
          message="Stok Hareketi"
          description="Yeni bir stok giriş, çıkış veya düzeltme işlemi ekleyin."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item
          name="productId"
          label="Ürün"
          rules={[{ required: true, message: "Ürün seçiniz" }]}
        >
          <Select
            placeholder="Ürün seçiniz"
            showSearch
            optionFilterProp="children"
            onChange={handleProductChange}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {products
              .filter((p) => p.isActive)
              .map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.code})
                </Option>
              ))}
          </Select>
        </Form.Item>

        {selectedProduct && (
          <Alert
            message={
              <Space direction="vertical" size="small">
                <Text>
                  <strong>Mevcut Stok:</strong>{" "}
                  {selectedProduct.stockQuantity || 0}{" "}
                  {selectedProduct.unit || "Adet"}
                </Text>
                <Text>
                  <strong>Minimum Stok:</strong>{" "}
                  {selectedProduct.minimumStockLevel || 0}{" "}
                  {selectedProduct.unit || "Adet"}
                </Text>
                {(selectedProduct.stockQuantity || 0) <=
                  (selectedProduct.minimumStockLevel || 0) && (
                  <Text type="danger">
                    <strong>Eksik Miktar:</strong>{" "}
                    {Math.max(
                      0,
                      (selectedProduct.minimumStockLevel || 0) -
                        (selectedProduct.stockQuantity || 0)
                    )}{" "}
                    {selectedProduct.unit || "Adet"}
                  </Text>
                )}
              </Space>
            }
            type={
              (selectedProduct.stockQuantity || 0) <=
              (selectedProduct.minimumStockLevel || 0)
                ? "warning"
                : "success"
            }
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="type"
          label="İşlem Tipi"
          rules={[{ required: true, message: "İşlem tipi seçiniz" }]}
        >
          <Select placeholder="İşlem tipi seçiniz" onChange={handleTypeChange}>
            <Option value={StockMovementTypeMap.STOCK_IN}>Stok Girişi</Option>
            <Option value={StockMovementTypeMap.STOCK_OUT}>Stok Çıkışı</Option>
            <Option value={StockMovementTypeMap.ADJUSTMENT}>
              Stok Düzeltme
            </Option>
            <Option value={StockMovementTypeMap.RETURN}>İade</Option>
            <Option value={StockMovementTypeMap.TRANSFER}>Transfer</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label={
            selectedType === StockMovementTypeMap.ADJUSTMENT
              ? "Yeni Stok Miktarı"
              : "Miktar"
          }
          rules={[
            { required: true, message: "Miktar giriniz" },
            {
              type: "number",
              min: selectedType === StockMovementTypeMap.ADJUSTMENT ? 0 : 1,
              message: "Geçerli bir miktar giriniz",
            },
          ]}
          tooltip={
            selectedType === StockMovementTypeMap.ADJUSTMENT
              ? "Düzeltme işleminde yeni stok miktarını girin"
              : "Giriş veya çıkış yapılacak miktarı girin"
          }
        >
          <InputNumber
            style={{ width: "100%" }}
            min={selectedType === StockMovementTypeMap.ADJUSTMENT ? 0 : 1}
            placeholder="0"
          />
        </Form.Item>

        <Form.Item name="referenceNumber" label="Referans No (Fiş/Fatura)">
          <Input placeholder="Örn: FT2024001" />
        </Form.Item>

        <Form.Item name="notes" label="Notlar">
          <TextArea rows={3} placeholder="Ek açıklama..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockMovementModal;
