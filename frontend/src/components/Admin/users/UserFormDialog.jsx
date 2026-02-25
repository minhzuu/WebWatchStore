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
import { Button } from "@/components/ui/button";

const roleOptions = [
  { label: "Quản trị viên", value: "ADMIN" },
  { label: "Quản lý", value: "MANAGER" },
  { label: "Nhân viên", value: "STAFF" },
  { label: "Khách hàng", value: "USER" },
];

export const UserFormDialog = ({
  isOpen,
  onClose,
  mode = "create",
  formData,
  onChange,
  onSubmit,
}) => {
  const isCreate = mode === "create";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Nhập thông tin để tạo tài khoản mới cho hệ thống"
              : "Cập nhật thông tin tài khoản hiện tại"}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${mode}-username`}>Tên đăng nhập *</Label>
              <Input
                id={`${mode}-username`}
                name="username"
                value={formData.username ?? ""}
                onChange={onChange}
                placeholder="vd: nguyen.van.a"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${mode}-fullName`}>Họ và tên *</Label>
              <Input
                id={`${mode}-fullName`}
                name="fullName"
                value={formData.fullName ?? ""}
                onChange={onChange}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>Email *</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              name="email"
              value={formData.email ?? ""}
              onChange={onChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>
              {isCreate ? "Mật khẩu *" : "Mật khẩu mới"}
            </Label>
            <Input
              id={`${mode}-password`}
              type="password"
              name="password"
              value={formData.password ?? ""}
              onChange={onChange}
              placeholder={
                isCreate ? "Nhập mật khẩu tạm thời" : "Để trống nếu không đổi"
              }
              required={isCreate}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-role`}>Vai trò</Label>
            <select
              id={`${mode}-role`}
              name="role"
              value={formData.role ?? "USER"}
              onChange={onChange}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              className={"cursor-pointer"}
              type="button"
              variant="outline"
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
              {isCreate ? "Tạo tài khoản" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
