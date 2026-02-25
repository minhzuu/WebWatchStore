import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PackageIcon, ImageIcon } from "lucide-react";

export const BrandDetailPanel = ({ brandDetail, onClose }) => {
  const isOpen = !!brandDetail;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết thương hiệu</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về thương hiệu
          </DialogDescription>
        </DialogHeader>

        {brandDetail && (
          <div className="space-y-6">
            {/* Logo */}
            {brandDetail.logoUrl && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Logo
                  </h3>
                </div>
                <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <img
                    src={brandDetail.logoUrl}
                    alt={brandDetail.name}
                    className="h-24 w-auto object-contain"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Logo%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {brandDetail.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    #{brandDetail.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Trạng thái:
                  </span>
                  <Badge
                    variant={
                      brandDetail.status === "ACTIVE" ? "default" : "secondary"
                    }
                    className={
                      brandDetail.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }
                  >
                    {brandDetail.status === "ACTIVE" ? "Hoạt động" : "Ẩn"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            {brandDetail.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Mô tả
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {brandDetail.description}
                </p>
              </div>
            )}

            {/* Products Count */}
            {brandDetail.products && brandDetail.products.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PackageIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sản phẩm
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {brandDetail.products.length} sản phẩm
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
