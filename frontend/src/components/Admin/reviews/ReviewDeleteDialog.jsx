import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export const ReviewDeleteDialog = ({
    open,
    onOpenChange,
    onClose,
    onConfirm,
    review,
    reason,
    onReasonChange,
    deleting,
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
                <DialogDescription>
                    Vui lòng nhập lý do xóa. Người dùng sẽ không còn thấy đánh
                    giá này.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
                <div className="rounded-md bg-muted/40 p-3 text-sm">
                    <p className="font-medium">
                        {review?.userFullName ||
                            review?.username ||
                            "Người dùng"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Sản phẩm:{" "}
                        {review?.productName ||
                            `Sản phẩm #${review?.productId}`}
                    </p>
                </div>
                <Textarea
                    rows={4}
                    value={reason}
                    onChange={onReasonChange}
                    placeholder="Nhập lý do xóa (bắt buộc)"
                    disabled={deleting}
                />
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose} disabled={deleting}>
                    Hủy
                </Button>
                <Button
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={deleting}
                >
                    {deleting && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Xóa đánh giá
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
