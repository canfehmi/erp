import { Table, Typography, Form, Select, InputNumber, DatePicker, Button, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { JobExpense } from "../../types";
import { ExpenseTypeLabels } from "../../types";
import jobService from "../../services/jobService";

interface Props {
  jobId: number;
  expenses: JobExpense[];
}

const JobExpensesTab: React.FC<Props> = ({ expenses, jobId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (values: any) =>
      jobService.addExpense(jobId, {
        expenseType: values.expenseType,
        description: values.description,
        amount: values.amount,
        expenseDate: values.expenseDate?.toISOString(),
        notes: values.notes,
        receiptNumber: values.receiptNumber,
      }),
    onSuccess: () => {
      message.success("Gider eklendi");
      queryClient.invalidateQueries({ queryKey: ["jobExpenses", `${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["job", `${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["jobStatistics"] });
      form.resetFields();
    },
    onError: () => message.error("Gider eklenirken hata oluştu"),
  });

  const handleAdd = () => {
    form.validateFields().then((values) => addMutation.mutate(values));
  };

  const columns: ColumnsType<JobExpense> = [
    {
      title: "Tür",
      dataIndex: "expenseType",
      key: "expenseType",
      render: (v: number) => ExpenseTypeLabels[v] || "-",
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Tutar",
      dataIndex: "amount",
      key: "amount",
      render: (v: number) => `₺${v.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Tarih",
      dataIndex: "expenseDate",
      key: "expenseDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <Typography.Paragraph>
        <strong>Toplam Gider:</strong>{" "}
        ₺{totalExpenses.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
      </Typography.Paragraph>

      <Form layout="inline" form={form} style={{ marginBottom: 12 }} onFinish={handleAdd}>
        <Form.Item
          name="expenseType"
          label="Tür"
          rules={[{ required: true, message: "Tür seçin" }]}
        >
          <Select style={{ width: 160 }} placeholder="Tür seçin">
            {Object.entries(ExpenseTypeLabels).map(([k, v]) => (
              <Select.Option key={k} value={Number(k)}>
                {v}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama"
          rules={[{ required: true, message: "Açıklama girin" }]}
        >
          <input
            style={{
              width: 200,
              padding: "4px 8px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
            }}
            onChange={(e) => form.setFieldValue("description", e.target.value)}
          />
        </Form.Item>

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
          name="expenseDate"
          label="Tarih"
          rules={[{ required: true, message: "Tarih seçin" }]}
        >
          <DatePicker format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="notes" label="Not">
          <input
            style={{
              width: 160,
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
        dataSource={expenses}
        columns={columns}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default JobExpensesTab;

