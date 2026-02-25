import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SupplierFormDialog = ({
  isOpen,
  onClose,
  mode = "add",
  formData,
  onChange,
  onSubmit,
}) => {
  const title =
    mode === "add" ? "Thêm nhà cung cấp mới" : "Chỉnh sửa nhà cung cấp";
  const description =
    mode === "add"
      ? "Điền thông tin nhà cung cấp mới"
      : "Cập nhật thông tin nhà cung cấp";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={onChange}
                placeholder="Nhập tên nhà cung cấp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Thông tin liên hệ</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact || ""}
                onChange={onChange}
                placeholder="Số điện thoại, email..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={onChange}
                placeholder="Nhập địa chỉ nhà cung cấp"
                rows={3}
              />
            </div>
            {mode === "edit" && (
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || "ACTIVE"}
                  onChange={onChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ẩn</option>
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary text-white hover:bg-brand-primary-soft"
            >
              {mode === "add" ? "Thêm" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
