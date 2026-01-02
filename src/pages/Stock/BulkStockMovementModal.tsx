import { useState } from "react";
import {
  Modal,
  Upload,
  Button,
  message,
  Steps,
  Table,
  Alert,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import stockMovementService from "../../services/stockMovementService";
import type {
  Product,
  StockMovementFormData,
  StockMovementType,
} from "../../types";
import { StockMovementTypeMap } from "../../types";
import type { ColumnsType } from "antd/es/table";
import excelService, {
  type BulkStockMovementRow,
} from "../../services/excelService";

const { Text } = Typography;

interface BulkStockMovementModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
}

interface ValidatedRow extends BulkStockMovementRow {
  isValid: boolean;
  errorMessage?: string;
}

const BulkStockMovementModal: React.FC<BulkStockMovementModalProps> = ({
  open,
  products,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importedData, setImportedData] = useState<ValidatedRow[]>([]);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data: StockMovementFormData[]) => {
      const promises = data.map((item) => stockMovementService.create(item));
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      message.success(
        `${results.length} adet stok hareketi başarıyla kaydedildi`
      );
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stockStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      handleReset();
      onClose();
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Kayıt sırasında hata oluştu"
      );
    },
  });

  const handleDownloadTemplate = () => {
    excelService.downloadBulkStockTemplate(products);
    message.success("Şablon dosyası indirildi");
  };

  const validateRow = (row: BulkStockMovementRow): ValidatedRow => {
    const errors: string[] = [];

    if (!row["Ürün ID"] || row["Ürün ID"] <= 0) {
      errors.push("Ürün ID geçersiz");
    }

    const type = row["İşlem Tipi (1:Giriş, 2:Çıkış, 3:Düzeltme)"];
    if (!type || ![1, 2, 3].includes(type)) {
      errors.push("İşlem tipi 1, 2 veya 3 olmalı");
    }

    const quantity = row["Miktar"];
    if (!quantity || quantity <= 0) {
      errors.push("Miktar 0'dan büyük olmalı");
    }

    // Stok çıkışı kontrolü
    if (type === 2) {
      const product = products.find((p) => p.id === row["Ürün ID"]);
      if (product && (product.stockQuantity || 0) < quantity) {
        errors.push(`Yetersiz stok (Mevcut: ${product.stockQuantity})`);
      }
    }

    return {
      ...row,
      isValid: errors.length === 0,
      errorMessage: errors.join(", "),
    };
  };

  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls",
    maxCount: 1,
    fileList,
    beforeUpload: async (file) => {
      try {
        const data = await excelService.importBulkStockMovements(file);
        const validatedData = data.map(validateRow);
        setImportedData(validatedData);
        setFileList([file]);
        setCurrentStep(1);
        message.success(`${data.length} kayıt yüklendi`);
      } catch (error) {
        message.error("Dosya okunamadı. Lütfen şablon formatını kullanın.");
      }
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setImportedData([]);
      setCurrentStep(0);
    },
  };

  const handleSubmit = () => {
    const validRows = importedData.filter((row) => row.isValid);

    if (validRows.length === 0) {
      message.warning("Geçerli kayıt bulunamadı");
      return;
    }

    const movements: StockMovementFormData[] = validRows.map((row) => ({
      productId: row["Ürün ID"],
      type: row[
        "İşlem Tipi (1:Giriş, 2:Çıkış, 3:Düzeltme)"
      ] as StockMovementType,
      quantity: row["Miktar"],
      referenceNumber: row["Referans No"] || undefined,
      notes: row["Notlar"] || undefined,
      movementDate: new Date().toISOString(),
    }));

    saveMutation.mutate(movements);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFileList([]);
    setImportedData([]);
  };

  const columns: ColumnsType<ValidatedRow> = [
    {
      title: "Durum",
      key: "status",
      width: 80,
      fixed: "left",
      render: (_, record) =>
        record.isValid ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
        ) : (
          <ExclamationCircleOutlined
            style={{ color: "#ff4d4f", fontSize: 20 }}
          />
        ),
    },
    {
      title: "Ürün Kodu",
      dataIndex: "Ürün Kodu",
      key: "code",
      width: 120,
    },
    {
      title: "Ürün Adı",
      dataIndex: "Ürün Adı",
      key: "name",
      width: 200,
    },
    {
      title: "Mevcut Stok",
      dataIndex: "Mevcut Stok",
      key: "currentStock",
      width: 100,
      align: "right",
    },
    {
      title: "İşlem Tipi",
      dataIndex: "İşlem Tipi (1:Giriş, 2:Çıkış, 3:Düzeltme)",
      key: "type",
      width: 120,
      render: (type: number) => {
        if (type === StockMovementTypeMap.STOCK_IN)
          return <Tag color="green">Giriş</Tag>;
        if (type === StockMovementTypeMap.STOCK_OUT)
          return <Tag color="red">Çıkış</Tag>;
        if (type === StockMovementTypeMap.ADJUSTMENT)
          return <Tag color="blue">Düzeltme</Tag>;
        return <Tag>-</Tag>;
      },
    },
    {
      title: "Miktar",
      dataIndex: "Miktar",
      key: "quantity",
      width: 100,
      align: "right",
      render: (qty: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {qty}
        </Text>
      ),
    },
    {
      title: "Referans No",
      dataIndex: "Referans No",
      key: "reference",
      width: 120,
      render: (ref: string) => ref || "-",
    },
    {
      title: "Hata",
      key: "error",
      render: (_, record) =>
        record.errorMessage ? (
          <Text type="danger" style={{ fontSize: 12 }}>
            {record.errorMessage}
          </Text>
        ) : (
          <Text type="success">✓ Geçerli</Text>
        ),
    },
  ];

  const validCount = importedData.filter((row) => row.isValid).length;
  const invalidCount = importedData.length - validCount;

  return (
    <Modal
      title="Toplu Stok Hareketi"
      open={open}
      onCancel={onClose}
      width={1200}
      footer={
        <Space>
          <Button onClick={onClose}>İptal</Button>
          {currentStep === 0 && (
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              Şablon İndir
            </Button>
          )}
          {currentStep === 1 && validCount > 0 && (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={saveMutation.isPending}
            >
              {validCount} Kaydı Kaydet
            </Button>
          )}
        </Space>
      }
    >
      <Steps
        current={currentStep}
        style={{ marginBottom: 24 }}
        items={[
          {
            title: "Dosya Yükle",
            icon: <UploadOutlined />,
          },
          {
            title: "Kontrol Et",
            icon: <CheckCircleOutlined />,
          },
        ]}
      />

      {currentStep === 0 && (
        <div>
          <Alert
            message="Toplu Stok Hareketi Nasıl Yapılır?"
            description={
              <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>
                  Önce "Şablon İndir" butonuna tıklayarak Excel şablonunu
                  indirin
                </li>
                <li>
                  Şablonu doldurun (İşlem Tipi: 1=Giriş, 2=Çıkış, 3=Düzeltme)
                </li>
                <li>Doldurduğunuz dosyayı yükleyin</li>
                <li>Kontrol ekranında hataları düzeltin</li>
                <li>Kaydet butonuna basın</li>
              </ol>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Upload.Dragger {...uploadProps} style={{ padding: 40 }}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">
              Excel dosyasını buraya sürükleyin veya tıklayın
            </p>
            <p className="ant-upload-hint">
              Sadece .xlsx ve .xls formatları desteklenmektedir
            </p>
          </Upload.Dragger>
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <Space
            direction="vertical"
            style={{ width: "100%", marginBottom: 16 }}
          >
            <Alert
              message={
                <Space>
                  <Text>
                    Toplam: <strong>{importedData.length}</strong>
                  </Text>
                  <Text type="success">
                    Geçerli: <strong>{validCount}</strong>
                  </Text>
                  {invalidCount > 0 && (
                    <Text type="danger">
                      Hatalı: <strong>{invalidCount}</strong>
                    </Text>
                  )}
                </Space>
              }
              type={invalidCount > 0 ? "warning" : "success"}
              showIcon
            />

            {invalidCount > 0 && (
              <Alert
                message="Hatalı Kayıtlar"
                description="Hatalı kayıtlar kırmızı işaretlidir. Bu kayıtlar kaydedilmeyecektir."
                type="error"
                showIcon
              />
            )}
          </Space>

          <Table
            columns={columns}
            dataSource={importedData}
            rowKey={(record) => `${record["Ürün ID"]}-${Math.random()}`}
            pagination={{ pageSize: 50 }}
            scroll={{ x: 1000, y: 400 }}
            rowClassName={(record) => (record.isValid ? "" : "error-row")}
          />
        </div>
      )}

      <style>{`
        .error-row {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </Modal>
  );
};

export default BulkStockMovementModal;
