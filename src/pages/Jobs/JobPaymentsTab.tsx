import { Table, Tag, Typography, Form, InputNumber, DatePicker, Select, Button, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { Job, JobPayment } from "../../types";
import { PaymentTypeLabels, PaymentTypeMap } from "../../types";
import jobService from "../../services/jobService";

interface Props {
  jobId: number;
  payments: JobPayment[];
  job: Job;
}

const JobPaymentsTab: React.FC<Props> = ({ payments, job, jobId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (values: any) =>
      jobService.addPayment(jobId, {
        amount: values.amount,
        paymentType: values.paymentType,
        paymentDate: values.paymentDate?.toISOString(),
        installmentCount: values.installmentCount,
        dueDate: values.dueDate?.toISOString(),
        isPaid: values.isPaid ?? false,
        notes: values.notes,
        receiptNumber: values.receiptNumber,
      }),
    onSuccess: () => {
      message.success("Ödeme eklendi");
      queryClient.invalidateQueries({ queryKey: ["jobPayments", `${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["job", `${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["jobStatistics"] });
      form.resetFields();
    },
    onError: () => message.error("Ödeme eklenirken hata oluştu"),
  });

  const handleAdd = () => {
    form.validateFields().then((values) => addMutation.mutate(values));
  };

  const columns: ColumnsType<JobPayment> = [
    {
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      render: (v: number) => `₺${v.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Tür",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (v: number) => PaymentTypeLabels[v] || "-",
    },
    {
      title: "Ödeme Tarihi",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Vade",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Durum",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (v: boolean) =>
        v ? <Tag color="green">Ödendi</Tag> : <Tag color="orange">Bekliyor</Tag>,
    },
    {
      title: "Not",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Kayıt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
  ];

  const totalPaid = payments.reduce((sum, p) => sum + (p.isPaid ? p.amount : 0), 0);
  const totalPlanned = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(job.finalAmount - totalPaid, 0);

  return (
    <div>
      <Typography.Paragraph>
        <strong>Planlanan Ödeme:</strong>{" "}
        ₺{totalPlanned.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} |{" "}
        <strong>Ödenen:</strong>{" "}
        ₺{totalPaid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} |{" "}
        <strong>Kalan:</strong>{" "}
        ₺{remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
      </Typography.Paragraph>

      <Form layout="inline" form={form} style={{ marginBottom: 12 }} onFinish={handleAdd}>
        <Form.Item
          name="amount"
          label="Tutar"
          rules={[{ required: true, message: "Tutar girin" }]}
        >
          <InputNumber
            min={0}
            precision={2}
            formatter={(v) => (v ? `₺ ${v}` : "")}
            parser={(v) => (v ? v.replace(/[₺\s]/g, "") : "")}
          />
        </Form.Item>

        <Form.Item
          name="paymentType"
          label="Tür"
          rules={[{ required: true, message: "Tür seçin" }]}
        >
          <Select style={{ width: 160 }} placeholder="Tür seçin">
            {Object.entries(PaymentTypeLabels).map(([k, v]) => (
              <Select.Option key={k} value={Number(k)}>
                {v}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentDate"
          label="Ödeme Tarihi"
          rules={[{ required: true, message: "Tarih seçin" }]}
        >
          <DatePicker format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="isPaid" label="Durum">
          <Select style={{ width: 120 }}>
            <Select.Option value={true}>Ödendi</Select.Option>
            <Select.Option value={false}>Bekliyor</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Not">
          <input
            style={{
              width: 180,
              padding: "4px 8px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
            }}
            onChange={(e) => form.setFieldValue("notes", e.target.value)}
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

      <Table
        rowKey="id"
        dataSource={payments}
        columns={columns}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default JobPaymentsTab;

