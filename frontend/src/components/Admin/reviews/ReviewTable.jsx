import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export const ReviewTable = ({
    reviews,
    loading,
    selectedReviewId,
    onSelect,
    onDelete,
    formatDateTime,
}) => (
    <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/60">
                <tr>
                    <th className="px-4 py-3 text-left font-medium">
                        Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Người dùng
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Đánh giá
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Bình luận
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                        Thời gian
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
                            colSpan={6}
                            className="py-10 text-center text-muted-foreground"
                        >
                            <Loader2 className="mx-auto size-6 animate-spin" />
                            <p className="mt-2 text-sm">Đang tải đánh giá...</p>
                        </td>
                    </tr>
                ) : reviews.length === 0 ? (
                    <tr>
                        <td
                            colSpan={6}
                            className="py-10 text-center text-muted-foreground"
                        >
                            Không có đánh giá nào phù hợp
                        </td>
                    </tr>
                ) : (
                    reviews.map((review) => {
                        const isActive = review.id === selectedReviewId;
                        return (
                            <tr
                                key={review.id}
                                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                    isActive ? "bg-muted/40" : ""
                                }`}
                                onClick={() => onSelect(review.id)}
                            >
                                <td className="px-4 py-3">
                                    <div className="font-medium text-foreground">
                                        {review.productName ||
                                            `Sản phẩm #${review.productId}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        ID: {review.productId ?? "--"}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium">
                                        {review.userFullName ||
                                            review.username ||
                                            "Người dùng"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {review.userEmail || "--"}
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Badge
                                        variant="outline"
                                        className="font-semibold"
                                    >
                                        {review.rating}/5
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 max-w-lg">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {review.comment ||
                                            "(Không có bình luận)"}
                                    </p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                                    <div>
                                        {formatDateTime(review.createdAt)}
                                    </div>
                                    {review.updatedAt &&
                                    review.updatedAt !== review.createdAt ? (
                                        <div>
                                            Cập nhật:{" "}
                                            {formatDateTime(review.updatedAt)}
                                        </div>
                                    ) : null}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onDelete(review);
                                        }}
                                    >
                                        <Trash2 className="mr-1 size-4" /> Xóa
                                    </Button>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
);
