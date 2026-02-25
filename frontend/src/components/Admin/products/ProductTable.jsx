import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "lucide-react";
import productImg from "@/assets/images/product.png";

export const ProductTable = ({
  products = [],
  selectedProduct,
  onRowClick,
  onEdit,
  onDelete,
  formatCurrency,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tên sản phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Thương hiệu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nhà cung cấp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => onRowClick(product)}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedProduct?.id === product.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <img
                      src={
                        product.imageUrl
                          ? product.imageUrl.startsWith("http")
                            ? product.imageUrl
                            : `/images/products/${product.imageUrl}`
                          : product.primaryImageUrl
                          ? product.primaryImageUrl.startsWith("http")
                            ? product.primaryImageUrl
                            : `/images/products/${product.primaryImageUrl}`
                          : productImg
                      }
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {product.category?.name || product.categoryName}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.brand?.name || product.brand || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.supplier?.name ||
                        product.supplierName ||
                        product.supplier ||
                        "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(product.price ?? product.currentPrice)} ₫
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {/* ProductResponse uses stockQuantity, Product entity uses currentStock */}
                      {product.stockQuantity !== undefined &&
                      product.stockQuantity !== null
                        ? product.stockQuantity
                        : product.currentStock !== undefined &&
                          product.currentStock !== null
                        ? product.currentStock
                        : product.inventories && product.inventories.length > 0
                        ? product.inventories.sort(
                            (a, b) =>
                              new Date(b.updatedAt) - new Date(a.updatedAt)
                          )[0].stock
                        : "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant={
                        product.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : product.status === "INACTIVE"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          : product.status === "DISCONTINUED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : product.status === "OUT_OF_STOCK"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : ""
                      }
                    >
                      {product.status === "ACTIVE"
                        ? "Hoạt động"
                        : product.status === "INACTIVE"
                        ? "Tạm ngưng"
                        : product.status === "DISCONTINUED"
                        ? "Ngừng bán"
                        : product.status === "OUT_OF_STOCK"
                        ? "Hết hàng"
                        : "Không xác định"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(product);
                        }}
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="size-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(product);
                        }}
                        title="Xóa"
                      >
                        <TrashIcon className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Không có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
