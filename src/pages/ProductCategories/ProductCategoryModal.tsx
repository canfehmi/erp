import { useEffect } from "react";
import { Modal, Form, Input, Switch, message, Alert } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import productCategoryService from "../../services/productCategoryService";
import type { ProductCategory, ProductCategoryFormData } from "../../types";

const { TextArea } = Input;

interface ProductCategoryModalProps {
  open: boolean;
  category: ProductCategory | null;
  onClose: () => void;
}

const ProductCategoryModal: React.FC<ProductCategoryModalProps> = ({
  open,
  category,
  onClose,
}) => {
  const [form] = Form.useForm<ProductCategoryFormData>();
  const queryClient = useQueryClient();
  const isEditing = !!category;

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue(category);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, category, form]);

  const saveMutation = useMutation({
    mutationFn: (data: ProductCategoryFormData) => {
      if (isEditing) {
        return productCategoryService.update(category.id, data);
      }
      return productCategoryService.create(data);
    },
    onSuccess: () => {
      message.success(isEditing ? "Kategori güncellendi" : "Kategori eklendi");
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
      onClose();
      form.resetFields();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Bir hata oluştu";
      message.error(errorMessage);
    },
  });

  const handleSubmit = (): void => {
    form.validateFields().then((values) => {
      saveMutation.mutate(values);
    });
  };

  return (
    <Modal
      title={isEditing ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      width={600}
      okText={isEditing ? "Güncelle" : "Ekle"}
      cancelText="İptal"
    >
      {!isEditing && (
        <Alert
          message="Kategori Ekleme"
          description="Yeni bir ürün kategorisi oluşturun. Kategori adı benzersiz olmalıdır."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
        <Form.Item
          name="name"
          label="Kategori Adı"
          rules={[
            { required: true, message: "Kategori adı zorunludur" },
            { min: 2, message: "En az 2 karakter olmalıdır" },
            { max: 100, message: "En fazla 100 karakter olabilir" },
          ]}
        >
          <Input
            placeholder="Örn: Kameralar, DVR/NVR, Kablolar..."
            showCount
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
          rules={[{ max: 500, message: "En fazla 500 karakter olabilir" }]}
        >
          <TextArea
            rows={4}
            placeholder="Kategori hakkında detaylı açıklama..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Durum"
          valuePropName="checked"
          tooltip="Pasif kategoriler ürün eklerken gösterilmez"
        >
          <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductCategoryModal;
