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

export const PaymentDeleteDialog = ({
    open,
    onOpenChange,
    payment,
    onCancel,
    onConfirm,
    deleting,
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Xóa bản ghi thanh toán</DialogTitle>
                <DialogDescription>
                    Hành động này sẽ loại bỏ bản ghi thanh toán khỏi hệ thống.
                    Đơn hàng liên quan vẫn được giữ nguyên.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-md bg-muted/40 p-3">
                    <ShieldAlert className="mt-1 h-5 w-5 text-destructive" />
                    <div className="text-sm text-muted-foreground">
                        <p>
                            Bạn có chắc muốn xóa thanh toán
                            <span className="font-medium text-foreground">
                                {" "}
                                #{payment?.id}
                            </span>
                            ?
                        </p>
                        <p>Thao tác này không thể hoàn tác.</p>
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
                    Xóa thanh toán
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
