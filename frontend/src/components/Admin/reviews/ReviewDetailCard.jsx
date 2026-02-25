import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Star, Trash2 } from "lucide-react";

export const ReviewDetailCard = ({ review, onDelete, formatDateTime }) => (
    <Card className="h-fit p-6">
        <h2 className="text-lg font-semibold">Chi tiết đánh giá</h2>
        {!review ? (
            <div className="mt-6 text-sm text-muted-foreground">
                Chọn một đánh giá trong danh sách để xem chi tiết.
            </div>
        ) : (
            <div className="mt-6 space-y-5">
                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Sản phẩm
                            </p>
                            <p className="text-lg font-semibold">
                                {review.productName ||
                                    `Sản phẩm #${review.productId}`}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-base"
                        >
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            {review.rating}/5
                        </Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                        <p>
                            Người dùng:{" "}
                            <span className="font-medium text-foreground">
                                {review.userFullName || review.username || "--"}
                            </span>
                        </p>
                        <p>Email: {review.userEmail || "--"}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <MessageSquareText className="size-4" /> Bình luận
                    </span>
                    <p className="rounded-lg border bg-background p-4 text-sm leading-relaxed shadow-sm">
                        {review.comment || "(Không có bình luận)"}
                    </p>
                </div>

                <div className="grid gap-2 text-xs text-muted-foreground">
                    <span>Ngày tạo: {formatDateTime(review.createdAt)}</span>
                    <span>
                        Cập nhật lần cuối:{" "}
                        {formatDateTime(review.updatedAt || review.createdAt)}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => onDelete(review)}
                    >
                        <Trash2 className="mr-2 size-4" /> Xóa đánh giá này
                    </Button>
                </div>
            </div>
        )}
    </Card>
);
