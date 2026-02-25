import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  XIcon,
  PackageIcon,
  TagIcon,
  TruckIcon,
  ImageIcon,
  ListIcon,
  DollarSignIcon,
  BoxIcon,
  StarIcon,
} from "lucide-react";

export const ProductDetailPanel = ({ productDetail, onClose }) => {
  const isOpen = !!productDetail;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về sản phẩm
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        {productDetail && (
          <div className="space-y-6">
            {/* Images */}
            {productDetail.productImages &&
              productDetail.productImages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="size-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Hình ảnh
                    </h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[...productDetail.productImages]
                      .sort((a, b) => {
                        if (a.isPrimary) return -1;
                        if (b.isPrimary) return 1;
                        return 0;
                      })
                      .map((img) => {
                        // Helper to get image src
                        const getImageSrc = (url) => {
                          if (!url) return "";
                          if (url.startsWith("http") || url.startsWith("data:"))
                            return url;
                          return `/images/products/${url}`;
                        };

                        return (
                          <div
                            key={img.id}
                            className="relative flex-shrink-0 w-24 h-24"
                          >
                            <img
                              src={getImageSrc(img.imageUrl)}
                              alt={productDetail.name}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            {img.isPrimary && (
                              <Badge
                                className="absolute top-1 right-1 text-[10px] px-1 py-0 bg-brand-primary text-white"
                                variant="default"
                              >
                                Chính
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            {/* Basic Info */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {productDetail.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    #{productDetail.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Trạng thái:
                  </span>
                  <Badge
                    variant={
                      productDetail.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      productDetail.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : productDetail.status === "INACTIVE"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        : productDetail.status === "DISCONTINUED"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : productDetail.status === "OUT_OF_STOCK"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : ""
                    }
                  >
                    {productDetail.status === "ACTIVE"
                      ? "Hoạt động"
                      : productDetail.status === "INACTIVE"
                      ? "Tạm ngưng"
                      : productDetail.status === "DISCONTINUED"
                      ? "Ngừng bán"
                      : productDetail.status === "OUT_OF_STOCK"
                      ? "Hết hàng"
                      : "Không xác định"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Ngày tạo:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(productDetail.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {productDetail.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Mô tả
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {productDetail.description}
                </p>
              </div>
            )}

            {/* Brand */}
            {productDetail.brand && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PackageIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Thương hiệu
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {productDetail.brand}
                  </p>
                  {productDetail.brand.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {productDetail.brand.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Category */}
            {(productDetail.category || productDetail.categoryName) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Danh mục
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof productDetail.category === "string"
                      ? productDetail.category
                      : productDetail.category?.name ||
                        productDetail.categoryName}
                  </p>
                  {typeof productDetail.category === "object" &&
                    productDetail.category?.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {productDetail.category.description}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Supplier */}
            {(productDetail.supplier || productDetail.supplierName) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TruckIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Nhà cung cấp
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof productDetail.supplier === "string"
                      ? productDetail.supplier
                      : productDetail.supplier?.name ||
                        productDetail.supplierName}
                  </p>
                  {typeof productDetail.supplier === "object" &&
                    productDetail.supplier.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {productDetail.supplier.description}
                      </p>
                    )}
                  {typeof productDetail.supplier === "object" &&
                    productDetail.supplier.contactInfo && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Liên hệ: {productDetail.supplier.contactInfo}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Price History */}
            {productDetail.productPrices &&
              productDetail.productPrices.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSignIcon className="size-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Lịch sử giá
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {productDetail.productPrices.map((price) => (
                      <div
                        key={price.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {price.price.toLocaleString("vi-VN")} ₫
                          </span>
                          {price.isCurrent && (
                            <Badge
                              variant="default"
                              className="text-xs bg-brand-primary text-white"
                            >
                              Hiện tại
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Loại: {price.priceType}
                        </div>
                        {price.startDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Từ:{" "}
                            {new Date(price.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Inventory */}
            {productDetail.inventories &&
              productDetail.inventories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BoxIcon className="size-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Lịch sử tồn kho
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {productDetail.inventories
                      .sort(
                        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                      )
                      .slice(0, 5)
                      .map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm"
                        >
                          <span className="text-gray-900 dark:text-white font-medium">
                            {inv.stock} sản phẩm
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(inv.updatedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Product Specs */}
            {productDetail.productSpecs &&
              productDetail.productSpecs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ListIcon className="size-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Thông số kỹ thuật
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {productDetail.productSpecs.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm"
                      >
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {spec.keyName}:
                        </span>
                        <span className="text-gray-900 dark:text-white text-right ml-2">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Reviews Summary */}
            {productDetail.reviews && productDetail.reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Đánh giá
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(
                        productDetail.reviews.reduce(
                          (sum, r) => sum + r.rating,
                          0
                        ) / productDetail.reviews.length
                      ).toFixed(1)}
                    </span>
                    <div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`size-4 ${
                              i <
                              Math.round(
                                productDetail.reviews.reduce(
                                  (sum, r) => sum + r.rating,
                                  0
                                ) / productDetail.reviews.length
                              )
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {productDetail.reviews.length} đánh giá
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Promotions */}
            {productDetail.promotions &&
              productDetail.promotions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Khuyến mãi
                  </h3>
                  <div className="space-y-2">
                    {productDetail.promotions.map((promo) => (
                      <div
                        key={promo.id}
                        className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
                      >
                        <p className="text-sm font-medium text-green-900 dark:text-green-300">
                          {promo.name}
                        </p>
                        {promo.description && (
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            {promo.description}
                          </p>
                        )}
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
