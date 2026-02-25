import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";

export const PromotionTable = ({
    promotions,
    loading,
    selectedPromotionId,
    onSelect,
    onEdit,
    onDelete,
    formatDateTime,
}) => (
    <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/60">
                <tr>
                    <th className="px-4 py-3 text-left font-medium">
                        Tên khuyến mãi
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Giảm giá
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Thời gian áp dụng
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                        Thao tác
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {loading ? (
                    <tr>
                        <td
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                        >
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                            <p className="mt-2 text-sm">
                                Đang tải danh sách khuyến mãi...
                            </p>
                        </td>
                    </tr>
                ) : promotions.length === 0 ? (
                    <tr>
                        <td
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                        >
                            Không có khuyến mãi nào phù hợp
                        </td>
                    </tr>
                ) : (
                    promotions.map((promotion) => {
                        const isActive = promotion.id === selectedPromotionId;
                        return (
                            <tr
                                key={promotion.id}
                                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                    isActive ? "bg-muted/40" : ""
                                }`}
                                onClick={() => onSelect(promotion.id)}
                            >
                                <td className="px-4 py-3 font-medium text-foreground">
                                    {promotion.name ||
                                        `Khuyến mãi #${promotion.id}`}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {promotion.discount != null
                                        ? `${promotion.discount}%`
                                        : "--"}
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                    <div>
                                        Bắt đầu:{" "}
                                        {formatDateTime(promotion.startDate)}
                                    </div>
                                    <div>
                                        Kết thúc:{" "}
                                        {formatDateTime(promotion.endDate)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                    {promotion.productIds
                                        ? promotion.productIds.length
                                        : 0}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEdit(promotion.id);
                                            }}
                                        >
                                            <Pencil className="mr-1 h-4 w-4" />{" "}
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDelete(promotion);
                                            }}
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />{" "}
                                            Xóa
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
);
