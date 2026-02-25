import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const CategoryFormDialog = ({
  isOpen,
  onClose,
  mode = "add",
  formData,
  onChange,
  onSubmit,
}) => {
  const isEditMode = mode === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin danh mục"
              : "Nhập thông tin để tạo danh mục sản phẩm mới"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tên danh mục */}
          <div className="space-y-2">
            <Label htmlFor={`${mode}-name`}>
              Tên danh mục<span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${mode}-name`}
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Nhập tên danh mục"
              required
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor={`${mode}-description`}>Mô tả</Label>
            <Textarea
              id={`${mode}-description`}
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Nhập mô tả danh mục..."
              rows={4}
            />
          </div>

          {/* Trạng thái (chỉ hiện khi edit) */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor={`${mode}-status`}>Trạng thái *</Label>
              <select
                id={`${mode}-status`}
                name="status"
                value={formData.status || "ACTIVE"}
                onChange={onChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ẩn</option>
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className={"cursor-pointer"}
              onClick={() => onClose(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className={
                "bg-brand-primary hover:bg-brand-primary-soft cursor-pointer"
              }
            >
              {isEditMode ? "Cập nhật" : "Thêm danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
