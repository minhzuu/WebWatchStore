import { useState } from "react";
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
import { uploadBrandLogos, deleteBrandLogo } from "@/api/uploadAPI";

export const BrandFormDialog = ({
  isOpen,
  onClose,
  mode = "add",
  formData,
  onChange,
  onSubmit,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const title =
    mode === "add" ? "Thêm thương hiệu mới" : "Chỉnh sửa thương hiệu";
  const description =
    mode === "add"
      ? "Điền thông tin thương hiệu mới"
      : "Cập nhật thông tin thương hiệu";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWithUpload = async (e) => {
    e.preventDefault();

    if (selectedFile) {
      try {
        setUploading(true);

        // Delete old logo if exists (only in edit mode)
        if (mode === "edit" && formData.logoUrl) {
          try {
            console.log("Deleting old logo:", formData.logoUrl);
            await deleteBrandLogo(formData.logoUrl);
            console.log("Old logo deleted successfully");
          } catch (deleteError) {
            console.error("Error deleting old logo:", deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload new logo
        const result = await uploadBrandLogos([selectedFile]);
        console.log("Upload result:", result);

        if (result.success && result.fileNames?.length > 0) {
          const uploadedUrl = result.fileNames[0];
          console.log("Uploaded URL:", uploadedUrl);

          // Call onSubmit with uploaded URL as second parameter
          await onSubmit(e, uploadedUrl);

          setSelectedFile(null);
          setPreviewUrl(null);
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        alert("Lỗi khi upload logo. Vui lòng thử lại.");
      } finally {
        setUploading(false);
      }
    } else {
      onSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitWithUpload}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên thương hiệu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={onChange}
                placeholder="Nhập tên thương hiệu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={onChange}
                placeholder="Nhập mô tả thương hiệu"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoFile">Logo</Label>
              <div className="flex items-start gap-4">
                <label
                  htmlFor="logoFile"
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 dark:bg-gray-800"
                >
                  {previewUrl || formData.logoUrl ? (
                    <img
                      src={previewUrl || formData.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500 text-center px-2">
                        Click để chọn logo
                      </span>
                    </div>
                  )}
                  <input
                    id="logoFile"
                    name="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload logo thương hiệu
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG - tối đa 5MB
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Đã chọn: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
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
              disabled={uploading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary text-white hover:bg-brand-primary-soft"
              disabled={uploading}
            >
              {uploading
                ? "Đang upload..."
                : mode === "add"
                ? "Thêm"
                : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
