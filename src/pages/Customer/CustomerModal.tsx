import { useEffect } from "react";
import { Modal, Form, Input, Switch, message, Row, Col } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customerService from "../../services/customerService";
import type { Customer, CustomerFormData } from "../../types";

interface CustomerModalProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  open,
  customer,
  onClose,
}) => {
  const [form] = Form.useForm<CustomerFormData>();
  const queryClient = useQueryClient();
  const isEditing = !!customer;

  useEffect(() => {
    if (open) {
      if (customer) {
        form.setFieldsValue(customer);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, customer, form]);

  const saveMutation = useMutation({
    mutationFn: (data: CustomerFormData) => {
      if (isEditing) {
        return customerService.update(customer.id, data);
      }
      return customerService.create(data);
    },
    onSuccess: () => {
      message.success(isEditing ? "Müşteri güncellendi" : "Müşteri eklendi");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Bir hata oluştu");
    },
  });

  const handleSubmit = (): void => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

  return (
    <Modal
      title={isEditing ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      width={700}
      okText={isEditing ? "Güncelle" : "Ekle"}
      cancelText="İptal"
    >
      <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Müşteri Adı"
              rules={[
                { required: true, message: "Müşteri adı zorunludur" },
                { min: 2, message: "En az 2 karakter olmalıdır" },
              ]}
            >
              <Input placeholder="Ahmet Yılmaz" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="companyName" label="Firma Adı">
              <Input placeholder="ABC Güvenlik Ltd." />
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
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: "E-posta adresi zorunludur" },
                { type: "email", message: "Geçerli bir e-posta adresi girin" },
              ]}
            >
              <Input placeholder="ornek@email.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Adres"
          rules={[{ required: true, message: "Adres zorunludur" }]}
        >
          <Input.TextArea rows={3} placeholder="Tam adres bilgisi..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="taxNumber" label="Vergi Numarası">
              <Input placeholder="1234567890" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="taxOffice" label="Vergi Dairesi">
              <Input placeholder="Kadıköy" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notlar">
          <Input.TextArea rows={2} placeholder="Ekstra bilgiler..." />
        </Form.Item>

        <Form.Item name="isActive" label="Durum" valuePropName="checked">
          <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerModal;
