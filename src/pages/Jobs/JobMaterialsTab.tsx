import { Table, Typography, Form, Select, InputNumber, Button, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { JobMaterial, Product, Job } from "../../types";
import { JobStatusMap } from "../../types";
import productService from "../../services/productService";
import jobService from "../../services/jobService";

interface Props {
  jobId: number;
  materials: JobMaterial[];
  job: Job | undefined;
}

const JobMaterialsTab: React.FC<Props> = ({ jobId, materials, job }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  const isInstallationCompleted = job?.status === JobStatusMap.INSTALLATION_COMPLETED;

  const addMutation = useMutation({
    mutationFn: (values: any) => {
      const selectedProduct = products.find((p) => p.id === values.productId);
      if (!selectedProduct) {
        throw new Error("Ürün bulunamadı");
      }

      return jobService.addMaterial(jobId, {
        productId: values.productId,
        plannedQuantity: values.plannedQuantity,
        usedQuantity: isInstallationCompleted ? (values.usedQuantity ?? 0) : 0,
        unitPrice: selectedProduct.purchasePrice, // Ürünün alış fiyatını kullan
        isExtra: false,
        notes: "",
      });
    },
    onSuccess: () => {
      message.success("Malzeme eklendi");
      queryClient.invalidateQueries({ queryKey: ["jobMaterials", `${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["job", `${jobId}`] });
      form.resetFields();
    },
    onError: () => message.error("Malzeme eklenirken hata oluştu"),
  });

  const handleAdd = () => {
    form.validateFields().then((values) => addMutation.mutate(values));
  };

  const handleProductChange = (productId: number) => {
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      form.setFieldsValue({ purchasePrice: selectedProduct.purchasePrice });
    }
  };

  const columns: ColumnsType<JobMaterial> = [
    {
      title: "Ürün",
      dataIndex: ["product", "name"],
      key: "product",
      render: (_, record) => record.product?.name || "-",
    },
    {
      title: "Planlanan Miktar",
      dataIndex: "plannedQuantity",
      key: "plannedQuantity",
      align: "center",
    },
    {
      title: "Kullanılan Miktar",
      dataIndex: "usedQuantity",
      key: "usedQuantity",
      align: "center",
    },
    {
      title: "Alış Fiyatı",
      key: "purchasePrice",
      render: (_, record) => {
        const purchasePrice = record.product?.purchasePrice || record.unitPrice;
        return `₺${purchasePrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
      },
    },
    {
      title: "Toplam Maliyet",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v: number) => `₺${v.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
      align: "right",
    },
    {
      title: "Oluşturulma",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  // Planlanan maliyet: planlanan miktar * alış fiyatı
  const plannedCost = materials.reduce((sum, m) => {
    const purchasePrice = m.product?.purchasePrice || m.unitPrice;
    return sum + m.plannedQuantity * purchasePrice;
  }, 0);

  // Kullanılan maliyet: kullanılan miktar * alış fiyatı
  const usedCost = materials.reduce((sum, m) => {
    const purchasePrice = m.product?.purchasePrice || m.unitPrice;
    return sum + m.usedQuantity * purchasePrice;
  }, 0);

  return (
    <div>
      <Typography.Paragraph>
        <strong>Planlanan Maliyet:</strong>{" "}
        ₺{plannedCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} |{" "}
        <strong>Kullanılan Maliyet:</strong>{" "}
        ₺{usedCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
      </Typography.Paragraph>

      <Form layout="inline" form={form} style={{ marginBottom: 12 }} onFinish={handleAdd}>
        <Form.Item
          name="productId"
          label="Ürün"
          rules={[{ required: true, message: "Ürün seçin" }]}
        >
          <Select
            style={{ width: 250 }}
            showSearch
            optionFilterProp="children"
            placeholder="Ürün seçin"
            onChange={handleProductChange}
          >
            {products
              .filter((p) => p.isActive)
              .map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} (Alış: ₺{p.purchasePrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })})
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="plannedQuantity"
          label="Planlanan Miktar"
          rules={[{ required: true, message: "Planlanan miktar girin" }]}
        >
          <InputNumber min={1} style={{ width: 120 }} />
        </Form.Item>

        <Form.Item
          name="usedQuantity"
          label="Kullanılan Miktar"
          rules={
            isInstallationCompleted
              ? [{ required: true, message: "Kullanılan miktar girin" }]
              : []
          }
        >
          <InputNumber
            min={0}
            style={{ width: 120 }}
            disabled={!isInstallationCompleted}
            placeholder={isInstallationCompleted ? "Kullanılan miktar" : "Montaj tamamlandıktan sonra"}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={addMutation.isPending}>
              Ekle
            </Button>
            <Button onClick={() => form.resetFields()}>Temizle</Button>
          </Space>
        </Form.Item>
      </Form>

      {!isInstallationCompleted && (
        <Typography.Text type="warning" style={{ display: "block", marginBottom: 12 }}>
          ⚠️ Kullanılan miktar sadece iş durumu "Montaj Tamamlandı" olduğunda girilebilir.
        </Typography.Text>
      )}

      <Table
        rowKey="id"
        dataSource={materials}
        columns={columns}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default JobMaterialsTab;
