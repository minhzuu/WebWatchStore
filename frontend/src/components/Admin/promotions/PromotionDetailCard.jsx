import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarRange, Clock, Edit, Trash2 } from "lucide-react";

export const PromotionDetailCard = ({
    promotion,
    productNameMap,
    onEdit,
    onDelete,
    formatDateTime,
}) => (
    <Card className="h-fit p-6">
        <h2 className="text-lg font-semibold">Chi tiết khuyến mãi</h2>
        {!promotion ? (
            <div className="mt-6 text-sm text-muted-foreground">
                Chọn một khuyến mãi trong danh sách để xem chi tiết.
            </div>
        ) : (
            <div className="mt-6 space-y-5">
                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Tên chương trình
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                                {promotion.name ||
                                    `Khuyến mãi #${promotion.id}`}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="text-base font-semibold"
                        >
                            {promotion.discount != null
                                ? `${promotion.discount}%`
                                : "--"}
                        </Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4" />
                            Bắt đầu: {formatDateTime(promotion.startDate)}
                        </span>
                        <span className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4" />
                            Kết thúc: {formatDateTime(promotion.endDate)}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Tạo lúc: {formatDateTime(promotion.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        Áp dụng cho sản phẩm
                    </span>
                    {promotion.productIds && promotion.productIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {promotion.productIds.map((productId) => (
                                <Badge key={productId} variant="secondary">
                                    {productNameMap[productId] ||
                                        `Sản phẩm #${productId}`}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                            Chưa áp dụng cho sản phẩm nào.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => onEdit(promotion.id)}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => onDelete(promotion)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa khuyến mãi
                    </Button>
                </div>
            </div>
        )}
    </Card>
);
