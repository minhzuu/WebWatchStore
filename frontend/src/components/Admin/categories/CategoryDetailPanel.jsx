import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

export const CategoryDetailPanel = ({ categoryDetail, onClose }) => {
  const isOpen = !!categoryDetail;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết danh mục</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về danh mục sản phẩm
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        {categoryDetail && (
          <div className="space-y-4">
            {/* ID */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                ID
              </p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                #{categoryDetail.id}
              </p>
            </div>

            {/* Tên danh mục */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Tên danh mục
              </p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {categoryDetail.name}
              </p>
            </div>

            {/* Mô tả */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Mô tả
              </p>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {categoryDetail.description || "Không có mô tả"}
              </p>
            </div>

            {/* Trạng thái */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Trạng thái
              </p>
              <Badge
                variant={
                  categoryDetail.status === "ACTIVE" ? "default" : "secondary"
                }
                className={
                  categoryDetail.status === "ACTIVE"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                }
              >
                {categoryDetail.status === "ACTIVE" ? "Hoạt động" : "Ẩn"}
              </Badge>
            </div>

            {/* Số sản phẩm */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Số sản phẩm
              </p>
              <Badge variant="secondary" className="text-base">
                {categoryDetail.productCount || 0} sản phẩm
              </Badge>
            </div>

            {/* Danh sách sản phẩm */}
            {categoryDetail.products && categoryDetail.products.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Danh sách sản phẩm
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categoryDetail.products.map((product, index) => (
                    <div
                      key={product.id || index}
                      className="text-sm text-gray-700 dark:text-gray-300 py-1 px-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      {product.name || `Sản phẩm #${product.id}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
