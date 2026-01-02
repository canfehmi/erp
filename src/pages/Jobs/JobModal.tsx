import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Row,
  Col,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import jobService from "../../services/jobService";
import type { Job, Customer, JobFormData } from "../../types";
import { JobStatusMap } from "../../types";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface JobModalProps {
  open: boolean;
  job: Job | null;
  customers: Customer[];
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({
  open,
  job,
  customers,
  onClose,
}) => {
  const [form] = Form.useForm<JobFormData>();
  const queryClient = useQueryClient();
  const isEditing = !!job;

  useEffect(() => {
    if (open) {
      if (job) {
        form.setFieldsValue({
          ...job,
          scheduledDate: job.scheduledDate ? dayjs(job.scheduledDate) : undefined,
          startDate: job.startDate ? dayjs(job.startDate) : undefined,
        } as any);
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: JobStatusMap.QUOTE_SENT,
          discountAmount: 0,
        });
      }
    }
  }, [open, job, form]);

  const saveMutation = useMutation({
    mutationFn: (data: JobFormData) => {
      if (isEditing && job) {
        return jobService.update(job.id, data);
      }
      return jobService.create(data);
    },
    onSuccess: () => {
      message.success(isEditing ? "İş güncellendi" : "İş oluşturuldu");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobStatistics"] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Bir hata oluştu");
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData: JobFormData = {
        ...values,
        scheduledDate: values.scheduledDate
          ? (values.scheduledDate as any).toISOString()
          : undefined,
        startDate: values.startDate
          ? (values.startDate as any).toISOString()
          : undefined,
        totalAmount: values.totalAmount || 0,
        discountAmount: values.discountAmount || 0,
        isActive: true,
      };
      saveMutation.mutate(formData);
    });
  };

  // Toplam tutar hesaplama
  const handleAmountChange = () => {
    const totalAmount = Number(form.getFieldValue("totalAmount")) || 0;

    const discountAmount = Number(form.getFieldValue("discountAmount")) || 0;

    const finalAmount = Math.max(totalAmount - discountAmount, 0);

    // Sadece form üzerinde gösterim amaçlı
    form.setFieldValue("finalAmount" as any, finalAmount);
  };

  return (
    <Modal
      title={isEditing ? "İşi Düzenle" : "Yeni İş Ekle"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      width={900}
      okText={isEditing ? "Güncelle" : "Oluştur"}
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerId"
              label="Müşteri"
              rules={[{ required: true, message: "Müşteri seçiniz" }]}
            >
              <Select
                showSearch
                placeholder="Müşteri seçiniz"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {customers
                  .filter((c) => c.isActive)
                  .map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name}{" "}
                      {customer.companyName && `(${customer.companyName})`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label="Durum"
              rules={[{ required: true, message: "Durum seçiniz" }]}
            >
              <Select placeholder="Durum seçiniz">
                <Option value={JobStatusMap.QUOTE_SENT}>
                  Teklif Gönderildi
                </Option>
                <Option value={JobStatusMap.QUOTE_APPROVED}>
                  Teklif Onaylandı
                </Option>
                <Option value={JobStatusMap.PAYMENT_PENDING}>
                  Ödeme Bekleniyor
                </Option>
                <Option value={JobStatusMap.PAYMENT_RECEIVED}>
                  Ödeme Alındı
                </Option>
                <Option value={JobStatusMap.MATERIAL_PREPARING}>
                  Malzeme Hazırlanıyor
                </Option>
                <Option value={JobStatusMap.INSTALLATION_SCHEDULED}>
                  Montaj Planlandı
                </Option>
                <Option value={JobStatusMap.IN_PROGRESS}>
                  İş Devam Ediyor
                </Option>
                <Option value={JobStatusMap.INSTALLATION_COMPLETED}>
                  Montaj Tamamlandı
                </Option>
                <Option value={JobStatusMap.COMPLETED}>İş Tamamlandı</Option>
                <Option value={JobStatusMap.CANCELLED}>İptal Edildi</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="İş Başlığı"
          rules={[
            { required: true, message: "İş başlığı giriniz" },
            { max: 200, message: "Maksimum 200 karakter" },
          ]}
        >
          <Input placeholder="Örn: Güvenlik Kamera Sistemi Kurulumu" />
        </Form.Item>

        <Form.Item name="description" label="Açıklama">
          <TextArea rows={3} placeholder="İş hakkında detaylı açıklama..." />
        </Form.Item>

        <Form.Item
          name="address"
          label="İş Adresi"
          rules={[{ required: true, message: "Adres giriniz" }]}
        >
          <TextArea rows={2} placeholder="İşin yapılacağı adres" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="scheduledDate"
              label="Planlanan Tarih"
              rules={[{ required: true, message: "Tarih seçiniz" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="startDate" label="Başlangıç Tarihi">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="İş başladığında güncellenecek"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="totalAmount"
              label="Toplam Tutar"
              rules={[
                { required: true, message: "Tutar giriniz" },
                {
                  type: "number",
                  min: 0,
                  message: "Geçerli bir tutar giriniz",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="₺"
                onChange={handleAmountChange}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="discountAmount"
              label="İndirim Tutarı"
              tooltip="Varsa uygulanan indirim tutarı"
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="₺"
                onChange={handleAmountChange}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Nihai Tutar">
              <InputNumber
                style={{ width: "100%" }}
                value={
                  (form.getFieldValue("totalAmount") || 0) -
                  (form.getFieldValue("discountAmount") || 0)
                }
                disabled
                precision={2}
                prefix="₺"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notlar">
          <TextArea rows={2} placeholder="Ek notlar..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JobModal;
