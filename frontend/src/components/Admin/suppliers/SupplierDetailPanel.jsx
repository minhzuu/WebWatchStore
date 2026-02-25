import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PackageIcon, PhoneIcon, MapPinIcon } from "lucide-react";

export const SupplierDetailPanel = ({ supplierDetail, onClose }) => {
  const isOpen = !!supplierDetail;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết nhà cung cấp</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về nhà cung cấp
          </DialogDescription>
        </DialogHeader>

        {supplierDetail && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {supplierDetail.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    #{supplierDetail.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Trạng thái:
                  </span>
                  <Badge
                    variant={
                      supplierDetail.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      supplierDetail.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }
                  >
                    {supplierDetail.status === "ACTIVE" ? "Hoạt động" : "Ẩn"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact */}
            {supplierDetail.contact && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PhoneIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Liên hệ
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {supplierDetail.contact}
                  </p>
                </div>
              </div>
            )}

            {/* Address */}
            {supplierDetail.address && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Địa chỉ
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {supplierDetail.address}
                  </p>
                </div>
              </div>
            )}

            {/* Products Count */}
            {supplierDetail.products && supplierDetail.products.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PackageIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sản phẩm cung cấp
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplierDetail.products.length} sản phẩm
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
