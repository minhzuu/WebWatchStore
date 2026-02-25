import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { getPaymentMethodLabel } from "@/lib/payment";

const defaultFormState = {
  method: "",
  amount: "",
  orderId: "",
};

export const PaymentFormDialog = ({
  open,
  mode,
  initialData,
  methods = [],
  orders = [],
  loadingOrders,
  submitting,
  onOpenChange,
  onSubmit,
  onCancel,
}) => {
  const [formState, setFormState] = useState(defaultFormState);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (initialData) {
      setFormState({
        method: initialData.method || "",
        amount:
          initialData.amount !== undefined && initialData.amount !== null
            ? String(initialData.amount)
            : "",
        orderId:
          initialData.orderId !== undefined && initialData.orderId !== null
            ? String(initialData.orderId)
            : "",
      });
    } else {
      setFormState(defaultFormState);
    }
  }, [open, initialData]);

  const orderOptions = useMemo(() => orders, [orders]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      method: formState.method || null,
      amount:
        formState.amount.trim() === ""
          ? null
          : Number.parseFloat(formState.amount),
      orderId:
        formState.orderId.trim() === ""
          ? null
          : Number.parseInt(formState.orderId, 10),
    };
    onSubmit(payload);
  };

  const dialogTitle =
    mode === "edit" ? "Cập nhật thanh toán" : "Thêm thanh toán";
  const dialogDescription =
    mode === "edit"
      ? "Điều chỉnh phương thức, giá trị hoặc liên kết đơn hàng."
      : "Tạo bản ghi thanh toán mới cho một đơn hàng cụ thể.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Phương thức thanh toán</Label>
              <select
                id="payment-method"
                name="method"
                value={formState.method}
                onChange={handleChange}
                required
                className="h-10 w-full rounded-md border px-3 text-sm shadow-sm"
              >
                <option value="" disabled>
                  Chọn phương thức
                </option>
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {getPaymentMethodLabel(method)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-amount">Giá trị (VND)</Label>
              <Input
                id="payment-amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formState.amount}
                onChange={handleChange}
                placeholder="Ví dụ: 1500000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-order">Đơn hàng</Label>
              {loadingOrders ? (
                <p className="text-sm text-muted-foreground">
                  Đang tải danh sách đơn hàng...
                </p>
              ) : orderOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có đơn hàng nào để liên kết.
                </p>
              ) : (
                <select
                  id="payment-order"
                  name="orderId"
                  value={formState.orderId}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border px-3 text-sm shadow-sm"
                >
                  <option value="" disabled>
                    Chọn đơn hàng
                  </option>
                  {orderOptions.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id} - {order.customerName || "Khách vãng lai"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              className={"cursor-pointer"}
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={
                "bg-brand-primary hover:bg-brand-primary-soft cursor-pointer"
              }
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Lưu thay đổi" : "Tạo thanh toán"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
