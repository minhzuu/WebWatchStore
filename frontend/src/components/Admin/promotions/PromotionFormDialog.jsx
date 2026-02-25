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

const normalizeToInputDateTime = (value) => {
  if (!value) {
    return "";
  }
  return value.length >= 16 ? value.slice(0, 16) : value;
};

const defaultFormState = {
  name: "",
  discount: "",
  startDate: "",
  endDate: "",
  productIds: [],
};

export const PromotionFormDialog = ({
  open,
  mode,
  initialData,
  onOpenChange,
  onSubmit,
  onCancel,
  products,
  loadingProducts,
  submitting,
}) => {
  const [formState, setFormState] = useState(defaultFormState);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      setFormState({
        name: initialData.name || "",
        discount:
          initialData.discount !== undefined && initialData.discount !== null
            ? String(initialData.discount)
            : "",
        startDate: normalizeToInputDateTime(initialData.startDate || ""),
        endDate: normalizeToInputDateTime(initialData.endDate || ""),
        productIds: Array.isArray(initialData.productIds)
          ? initialData.productIds.map((id) => Number(id))
          : [],
      });
    } else {
      setFormState(defaultFormState);
    }
  }, [open, initialData]);

  const productOptions = useMemo(() => products || [], [products]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productId) => {
    setFormState((prev) => {
      const exists = prev.productIds.includes(productId);
      const nextProductIds = exists
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId];
      return {
        ...prev,
        productIds: nextProductIds,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const discountValue = formState.discount.trim();
    const parsedDiscount = Number(discountValue);

    const payload = {
      name: formState.name.trim(),
      discount:
        discountValue === "" || Number.isNaN(parsedDiscount)
          ? null
          : parsedDiscount,
      startDate: formState.startDate || null,
      endDate: formState.endDate || null,
      productIds: formState.productIds.map((id) => Number(id)),
    };

    onSubmit(payload);
  };

  const dialogTitle =
    mode === "edit" ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi";
  const dialogDescription =
    mode === "edit"
      ? "Điều chỉnh thông tin và danh sách sản phẩm áp dụng."
      : "Tạo chương trình khuyến mãi mới và áp dụng cho sản phẩm phù hợp.";

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
              <Label htmlFor="promotion-name">Tên khuyến mãi</Label>
              <Input
                id="promotion-name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Ưu đãi mùa lễ hội"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="promotion-discount">Mức giảm (%)</Label>
                <Input
                  id="promotion-discount"
                  name="discount"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formState.discount}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 15"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotion-start">Ngày bắt đầu</Label>
                <Input
                  id="promotion-start"
                  name="startDate"
                  type="datetime-local"
                  value={formState.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotion-end">Ngày kết thúc</Label>
                <Input
                  id="promotion-end"
                  name="endDate"
                  type="datetime-local"
                  value={formState.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sản phẩm áp dụng</Label>
              {loadingProducts ? (
                <p className="text-sm text-muted-foreground">
                  Đang tải danh sách sản phẩm...
                </p>
              ) : productOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có sản phẩm nào để lựa chọn.
                </p>
              ) : (
                <div className="grid max-h-60 gap-2 overflow-y-auto rounded-md border p-3 text-sm">
                  {productOptions.map((product) => {
                    const checked = formState.productIds.includes(product.id);
                    return (
                      <label
                        key={product.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleProductToggle(product.id)}
                          className="h-4 w-4"
                        />
                        <span className="text-foreground">{product.name}</span>
                      </label>
                    );
                  })}
                </div>
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
              {mode === "edit" ? "Lưu thay đổi" : "Tạo khuyến mãi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
