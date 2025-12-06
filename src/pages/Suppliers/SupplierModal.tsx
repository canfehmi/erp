import { useEffect } from "react";
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
  Button,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supplierService from "../../services/supplierService";
import type { ProductCategory, Supplier, SupplierFormData } from "../../types";

const { Option } = Select;

interface SupplierModalProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  categories: ProductCategory[];
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  supplier,
  onClose,
  categories,
}) => {
  const [form] = Form.useForm<SupplierFormData>();
  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  useEffect(() => {
    if (open) {
      if (supplier) {
        console.log("🔍 Düzenlenen tedarikçi:", supplier); // DEBUG

        // ✅ Tüm alanları manuel olarak doldur
        form.setFieldsValue({
          name: supplier.name || "",
          companyName: supplier.companyName || "",
          phoneNumber: supplier.phoneNumber || "",
          contactEmail: supplier.contactEmail || "",
          address: supplier.address || "",
          taxNumber: supplier.taxNumber || "", // ✅ Eklendi
          taxOffice: supplier.taxOffice || "", // ✅ Eklendi
          productCategoryId: supplier.productCategoryId,
          paymentTerm: supplier.paymentTerm || 30, // ✅ Eklendi
          bankAccountInfo: supplier.bankAccountInfo || "", // ✅ Eklendi
          notes: supplier.notes || "", // ✅ Eklendi
          isActive: supplier.isActive,
        });

        console.log("📝 Form'a yüklenen değerler:", form.getFieldsValue()); // DEBUG
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          paymentTerm: 30,
        });
      }
    }
  }, [open, supplier, form]);

  const saveMutation = useMutation({
    mutationFn: (data: SupplierFormData) => {
      console.log("📤 Gönderilen veri:", data); // DEBUG
      if (isEditing) {
        return supplierService.update(supplier.id, data);
      }
      return supplierService.create(data);
    },
    onSuccess: () => {
      message.success(
        isEditing ? "Tedarikçi güncellendi" : "Tedarikçi eklendi"
      );
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      console.error("❌ Hata detayı:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
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
      console.log("📝 Form değerleri:", values); // DEBUG
      saveMutation.mutate(values);
    });
  };

  const activeCategories = categories.filter((cat) => cat.isActive);

  return (
    <Modal
      title={isEditing ? "Tedarikçi Düzenle" : "Yeni Tedarikçi Ekle"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      width={800}
      okText={isEditing ? "Güncelle" : "Ekle"}
      cancelText="İptal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          paymentTerm: 30,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tedarikçi/Yetkili Adı"
              rules={[
                { required: true, message: "Tedarikçi adı zorunludur" },
                { min: 2, message: "En az 2 karakter olmalıdır" },
              ]}
            >
              <Input placeholder="Mehmet Demir" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="companyName"
              label="Firma Adı"
              rules={[{ required: true, message: "Firma adı zorunludur" }]}
            >
              <Input placeholder="XYZ Elektronik Ltd." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Telefon"
              rules={[
                { required: true, message: "Telefon numarası zorunludur" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Geçerli bir telefon numarası girin (10 haneli)",
                },
              ]}
            >
              <Input placeholder="5551234567" maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactEmail"
              label="E-posta"
              rules={[
                { required: true, message: "E-posta adresi zorunludur" },
                { type: "email", message: "Geçerli bir e-posta adresi girin" },
              ]}
            >
              <Input placeholder="ornek@firma.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Adres"
          rules={[{ required: true, message: "Adres zorunludur" }]}
        >
          <Input.TextArea rows={2} placeholder="Tam adres bilgisi..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="taxNumber" label="Vergi Numarası">
              <Input placeholder="1234567890" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="taxOffice" label="Vergi Dairesi">
              <Input placeholder="Beşiktaş" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="productCategoryId"
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
              name="paymentTerm"
              label="Ödeme Vadesi (Gün)"
              rules={[{ required: true, message: "Ödeme vadesi zorunludur" }]}
            >
              <InputNumber
                min={0}
                max={365}
                style={{ width: "100%" }}
                placeholder="30"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="bankAccountInfo" label="Banka Hesap Bilgileri">
          <Input.TextArea
            rows={2}
            placeholder="IBAN: TR00 0000 0000 0000 0000 0000 00"
          />
        </Form.Item>

        <Form.Item name="notes" label="Notlar">
          <Input.TextArea
            rows={2}
            placeholder="Ekstra bilgiler, özel indirimler, iletişim notları..."
          />
        </Form.Item>

        <Form.Item name="isActive" label="Durum" valuePropName="checked">
          <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SupplierModal;
