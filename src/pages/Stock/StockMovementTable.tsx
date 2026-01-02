import { Table, Tag, Tooltip } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type {
  StockMovement,
  StockMovementType,
  ProductCategory,
} from "../../types";
import { StockMovementTypeMap } from "../../types";
import { useQuery } from "@tanstack/react-query";
import productCategoryService from "../../services/productCategoryService";
import dayjs from "dayjs";

interface StockMovementTableProps {
  movements: StockMovement[];
  loading: boolean;
  onDelete: (id: number) => void;
}

const StockMovementTable: React.FC<StockMovementTableProps> = ({
  movements,
  loading,
}) => {
  // ✅ Kategorileri çek
  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["productCategories"],
    queryFn: productCategoryService.getAll,
  });

  // ✅ Kategori adını getir
  const getCategoryName = (movement: StockMovement): string => {
    if (movement.product?.category?.name) {
      return movement.product.category.name;
    }
    if (movement.product?.categoryId && categories.length > 0) {
      const category = categories.find(
        (c) => c.id === movement.product?.categoryId
      );
      if (category) return category.name;
    }
    return "-";
  };

  const getMovementTypeTag = (type: StockMovementType) => {
    switch (type) {
      case StockMovementTypeMap.STOCK_IN:
        return (
          <Tag color="green" icon={<ArrowUpOutlined />}>
            Giriş
          </Tag>
        );
      case StockMovementTypeMap.STOCK_OUT:
        return (
          <Tag color="red" icon={<ArrowDownOutlined />}>
            Çıkış
          </Tag>
        );
      case StockMovementTypeMap.ADJUSTMENT:
        return <Tag color="blue">Düzeltme</Tag>;
      case StockMovementTypeMap.RETURN:
        return <Tag color="orange">İade</Tag>;
      case StockMovementTypeMap.TRANSFER:
        return <Tag color="purple">Transfer</Tag>;
      default:
        return <Tag>Bilinmiyor</Tag>;
    }
  };

  const columns: ColumnsType<StockMovement> = [
    {
      title: "Tarih",
      dataIndex: "movementDate",
      key: "movementDate",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) =>
        new Date(a.movementDate).getTime() - new Date(b.movementDate).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Ürün",
      dataIndex: ["product", "name"],
      key: "productName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Ürün Kodu",
      dataIndex: ["product", "code"],
      key: "productCode",
      width: 120,
    },
    {
      title: "Kategori",
      key: "category",
      width: 120,
      render: (_, record: StockMovement) => {
        const categoryName = getCategoryName(record);
        return categoryName !== "-" ? (
          <Tag color="blue">{categoryName}</Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: "İşlem Tipi",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: StockMovementType) => getMovementTypeTag(type),
      filters: [
        { text: "Giriş", value: StockMovementTypeMap.STOCK_IN },
        { text: "Çıkış", value: StockMovementTypeMap.STOCK_OUT },
        { text: "Düzeltme", value: StockMovementTypeMap.ADJUSTMENT },
        { text: "İade", value: StockMovementTypeMap.RETURN },
        { text: "Transfer", value: StockMovementTypeMap.TRANSFER },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Miktar",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "right",
      render: (quantity: number, record: StockMovement) => {
        const color =
          record.type === StockMovementTypeMap.STOCK_IN ||
          record.type === StockMovementTypeMap.RETURN
            ? "#52c41a"
            : "#ff4d4f";
        return <span style={{ color, fontWeight: "bold" }}>{quantity}</span>;
      },
    },
    {
      title: "Önceki Stok",
      dataIndex: "previousStock",
      key: "previousStock",
      width: 100,
      align: "right",
    },
    {
      title: "Yeni Stok",
      dataIndex: "newStock",
      key: "newStock",
      width: 100,
      align: "right",
      render: (newStock: number, record: StockMovement) => {
        const isIncrease = newStock > record.previousStock;
        return (
          <span
            style={{
              fontWeight: "bold",
              color: isIncrease ? "#52c41a" : "#ff4d4f",
            }}
          >
            {newStock}
          </span>
        );
      },
    },
    {
      title: "Referans No",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      width: 120,
      render: (ref: string) => ref || "-",
    },
    {
      title: "Notlar",
      dataIndex: "notes",
      key: "notes",
      ellipsis: {
        showTitle: false,
      },
      render: (notes: string) =>
        notes ? (
          <Tooltip placement="topLeft" title={notes}>
            {notes}
          </Tooltip>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={movements}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total: number) => `Toplam ${total} hareket`,
      }}
      scroll={{ x: 1500 }}
    />
  );
};

export default StockMovementTable;
