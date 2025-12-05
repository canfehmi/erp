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
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supplierService from "../../services/supplierService";
import type { Supplier, SupplierFormData } from "../../types";

const { Option } = Select;

interface SupplierModalProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  supplier,
  onClose,
}) => {
  const [form] = Form.useForm<SupplierFormData>();
  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  useEffect(() => {
    if (open) {
      if (supplier) {
        form.setFieldsValue(supplier);
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          deliveryTime: 7,
          paymentTerm: 30,
        });
      }
    }
  }, [open, supplier, form]);

  const saveMutation = useMutation({
    mutationFn: (data: SupplierFormData) => {
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
    onError: () => {
      message.error("Bir hata oluştu");
    },
  });

  const handleSubmit = (): void => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

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
          deliveryTime: 7,
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
              name="phone"
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
              name="email"
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
              name="productCategory"
              label="Ürün Kategorisi"
              rules={[{ required: true, message: "Ürün kategorisi seçiniz" }]}
            >
              <Select placeholder="Kategori seçiniz">
                <Option value="Kameralar">Kameralar</Option>
                <Option value="Kayıt Cihazları">
                  Kayıt Cihazları (DVR/NVR)
                </Option>
                <Option value="Kablolar ve Aksesuarlar">
                  Kablolar ve Aksesuarlar
                </Option>
                <Option value="Güç Kaynakları">Güç Kaynakları</Option>
                <Option value="Monitörler">Monitörler</Option>
                <Option value="Harddiskler">Harddiskler</Option>
                <Option value="Network Switchler">Network Switchler</Option>
                <Option value="Diğer">Diğer</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="deliveryTime"
              label="Teslimat Süresi (Gün)"
              rules={[
                { required: true, message: "Teslimat süresi zorunludur" },
              ]}
            >
              <InputNumber
                min={0}
                max={365}
                style={{ width: "100%" }}
                placeholder="7"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
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
          <Col span={12}>
            <Form.Item
              name="minimumOrderAmount"
              label="Minimum Sipariş Tutarı (₺)"
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="0"
                formatter={(value) =>
                  `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
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
