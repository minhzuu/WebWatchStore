import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";

export const PromotionDeleteDialog = ({
    open,
    onOpenChange,
    promotion,
    onCancel,
    onConfirm,
    deleting,
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Xóa khuyến mãi</DialogTitle>
                <DialogDescription>
                    Hành động này sẽ gỡ khuyến mãi khỏi toàn bộ sản phẩm liên
                    quan.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-md bg-muted/40 p-3">
                    <ShieldAlert className="mt-1 h-5 w-5 text-destructive" />
                    <div className="text-sm text-muted-foreground">
                        <p>
                            Bạn có chắc muốn xóa chương trình khuyến mãi
                            <span className="font-medium text-foreground">
                                {" "}
                                {promotion?.name}
                            </span>
                            ?
                        </p>
                        <p>
                            Khuyến mãi sẽ không còn áp dụng cho các sản phẩm
                            đang liên kết.
                        </p>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={deleting}
                >
                    Hủy
                </Button>
                <Button
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={deleting}
                >
                    {deleting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Xóa khuyến mãi
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
