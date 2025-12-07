import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  message,
  Row,
  Col,
  InputNumber,
  Select,
  Card,
  Space,
  Typography,
  Button,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import productService from "../../services/productService";
import type {
  Product,
  ProductFormData,
  Supplier,
  ProductCategory,
} from "../../types";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface ProductModalProps {
  open: boolean;
  product: Product | null;
  suppliers: Supplier[];
  categories: ProductCategory[];
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  product,
  suppliers,
  categories,
  onClose,
}) => {
  const [form] = Form.useForm<ProductFormData>();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(0);
  const [profitAmount, setProfitAmount] = useState<number>(0);

  // Kar marjını hesapla
  const calculateProfit = (purchase: number, sale: number) => {
    if (purchase > 0) {
      const profit = sale - purchase;
      const marginPercent = (profit / purchase) * 100;
      setProfitAmount(profit);
      setProfitMargin(marginPercent);
    } else {
      setProfitAmount(0);
      setProfitMargin(0);
    }
  };

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue(product);
        setPurchasePrice(product.purchasePrice);
        setSalePrice(product.salePrice);
        calculateProfit(product.purchasePrice, product.salePrice);
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          stockQuantity: 0,
          minimumStockLevel: 10,
          unit: "Adet",
        });
        setPurchasePrice(0);
        setSalePrice(0);
        setProfitMargin(0);
        setProfitAmount(0);
      }
    }
  }, [open, product, form]);

  const saveMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      if (isEditing) {
        return productService.update(product.id, data);
      }
      return productService.create(data);
    },
    onSuccess: () => {
      message.success(isEditing ? "Ürün güncellendi" : "Ürün eklendi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Bir hata oluştu";

      if (typeof errorMessage === "string") {
        message.error(errorMessage, 5);
      } else {
        message.error("Bir hata oluştu");
      }
    },
  });

  const handleSubmit = (): void => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

  const handlePurchasePriceChange = (value: number | null) => {
    const purchase = value || 0;
    setPurchasePrice(purchase);
    calculateProfit(purchase, salePrice);
  };

  const handleSalePriceChange = (value: number | null) => {
    const sale = value || 0;
    setSalePrice(sale);
    calculateProfit(purchasePrice, sale);
  };

  // Aktif kategorileri filtrele
  const activeCategories = categories.filter((cat) => cat.isActive);

  return (
    <Modal
      title={isEditing ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      width={900}
      okText={isEditing ? "Güncelle" : "Ekle"}
      cancelText="İptal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          stockQuantity: 0,
          minStockLevel: 10,
          unit: "Adet",
        }}
      >
        {/* Temel Bilgiler */}
        <Card title="Temel Bilgiler" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="code"
                label="Ürün Kodu"
                rules={[
                  { required: true, message: "Ürün kodu zorunludur" },
                  { min: 2, message: "En az 2 karakter olmalıdır" },
                  { max: 50, message: "En fazla 50 karakter olabilir" },
                ]}
                tooltip="Ürün kodu benzersiz olmalıdır"
              >
                <Input placeholder="CAM-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Ürün Adı"
                rules={[
                  { required: true, message: "Ürün adı zorunludur" },
                  { min: 2, message: "En az 2 karakter olmalıdır" },
                  { max: 200, message: "En fazla 200 karakter olabilir" },
                ]}
                tooltip="Ürün adı benzersiz olmalıdır"
              >
                <Input placeholder="Güvenlik Kamerası 5MP" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="barcode" label="Barkod">
                <Input placeholder="1234567890123" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Kategori"
                rules={[{ required: true, message: "Kategori seçiniz" }]}
              >
                <Select
                  placeholder="Kategori seçiniz"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    <div style={{ textAlign: "center", padding: 10 }}>
                      <div style={{ marginBottom: 8 }}>Kategori bulunamadı</div>
                      <Button
                        type="link"
                        onClick={() =>
                          window.open("/product-categories", "_blank")
                        }
                      >
                        Yeni Kategori Ekle
                      </Button>
                    </div>
                  }
                >
                  {activeCategories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="Tedarikçi"
                rules={[{ required: true, message: "Tedarikçi seçiniz" }]}
              >
                <Select
                  placeholder="Tedarikçi seçiniz"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {suppliers
                    .filter((s) => s.isActive)
                    .map((supplier) => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.companyName || supplier.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Açıklama">
            <TextArea rows={3} placeholder="Ürün detayları..." />
          </Form.Item>
        </Card>

        {/* Fiyatlandırma */}
        <Card title="Fiyatlandırma" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchasePrice"
                label="Alış Fiyatı (₺)"
                rules={[
                  { required: true, message: "Alış fiyatı zorunludur" },
                  {
                    type: "number",
                    min: 0,
                    message: "Geçerli bir fiyat giriniz",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  formatter={(value) =>
                    `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  onChange={handlePurchasePriceChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salePrice"
                label="Satış Fiyatı (₺)"
                rules={[
                  { required: true, message: "Satış fiyatı zorunludur" },
                  {
                    type: "number",
                    min: 0,
                    message: "Geçerli bir fiyat giriniz",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  formatter={(value) =>
                    `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  onChange={handleSalePriceChange}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Kar Marjı Göstergesi */}
          <Card
            size="small"
            style={{
              backgroundColor:
                profitMargin >= 20
                  ? "#f6ffed"
                  : profitMargin >= 10
                  ? "#fff7e6"
                  : "#fff1f0",
              borderColor:
                profitMargin >= 20
                  ? "#52c41a"
                  : profitMargin >= 10
                  ? "#faad14"
                  : "#ff4d4f",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row justify="space-between">
                <Col>
                  <Text strong>Kar Tutarı:</Text>
                </Col>
                <Col>
                  <Text
                    strong
                    style={{
                      fontSize: 18,
                      color:
                        profitAmount >= 0
                          ? profitMargin >= 20
                            ? "#52c41a"
                            : profitMargin >= 10
                            ? "#faad14"
                            : "#ff4d4f"
                          : "#ff4d4f",
                    }}
                  >
                    ₺{profitAmount.toFixed(2)}
                  </Text>
                </Col>
              </Row>
              <Row justify="space-between">
                <Col>
                  <Text strong>Kar Marjı:</Text>
                </Col>
                <Col>
                  <Text
                    strong
                    style={{
                      fontSize: 18,
                      color:
                        profitMargin >= 20
                          ? "#52c41a"
                          : profitMargin >= 10
                          ? "#faad14"
                          : "#ff4d4f",
                    }}
                  >
                    %{profitMargin.toFixed(2)}
                  </Text>
                </Col>
              </Row>
            </Space>
          </Card>
        </Card>
        {/* Stok Bilgileri */}
        <Card title="Stok Bilgileri" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stockQuantity"
                label="Mevcut Stok"
                rules={[
                  { required: true, message: "Stok miktarı zorunludur" },
                  {
                    type: "number",
                    min: 0,
                    message: "Geçerli bir miktar giriniz",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minimumStockLevel"
                label="Minimum Stok Seviyesi"
                rules={[
                  {
                    required: true,
                    message: "Minimum stok seviyesi zorunludur",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Geçerli bir miktar giriniz",
                  },
                ]}
                tooltip="Bu seviyenin altına düştüğünde uyarı verilir"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="10"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Birim"
                rules={[{ required: true, message: "Birim seçiniz" }]}
              >
                <Select placeholder="Birim seçiniz">
                  <Option value="Adet">Adet</Option>
                  <Option value="Kutu">Kutu</Option>
                  <Option value="Paket">Paket</Option>
                  <Option value="Metre">Metre</Option>
                  <Option value="Kg">Kilogram</Option>
                  <Option value="Litre">Litre</Option>
                  <Option value="Set">Set</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Diğer Bilgiler */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="imageUrl" label="Görsel URL">
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isActive" label="Durum" valuePropName="checked">
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default ProductModal;
