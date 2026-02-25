import { useState, useEffect } from "react";
import { adminBannerAPI } from "@/api/cmsAPI";
import { uploadBannerImages, deleteBannerImage } from "@/api/uploadAPI";
import { getProducts } from "@/api/productAPI";
import { getCategories } from "@/api/categoryAPI";
import { getPromotions } from "@/api/promotionAPI";
import { getBrands } from "@/api/brandAPI";
import { toast } from "sonner";
import {
  Link as LinkIcon,
  PencilIcon,
  TrashIcon,
  X,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { AdminPagination } from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [linkTypeFilter, setLinkTypeFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploading, setUploading] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // {file: File, preview: string} or null

  // Data for link selection
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [brands, setBrands] = useState([]);

  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkType: "CUSTOM", // PRODUCT, CATEGORY, PROMOTION, BRAND, CUSTOM
    linkId: null, // ID của entity được chọn
    linkUrl: "", // Custom URL hoặc auto-generated
    description: "",
    displayOrder: 0,
    active: true,
    // Advanced fields
    startDate: "",
    endDate: "",
    position: "HOMEPAGE_SLIDER", // HOMEPAGE_SLIDER, HOMEPAGE_BANNER, PRODUCT_PAGE
  });

  useEffect(() => {
    loadBanners();
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const [productsRes, categoriesRes, promotionsRes, brandsRes] =
        await Promise.all([
          getProducts({ page: 0, size: 100 }),
          getCategories(),
          getPromotions(),
          getBrands(),
        ]);

      // Filter chỉ lấy entities có trạng thái active
      setProducts(
        (productsRes?.content || []).filter(
          (p) => p.status === "ACTIVE" || p.active !== false
        )
      );
      setCategories((categoriesRes || []).filter((c) => c.status === "ACTIVE"));
      setPromotions(promotionsRes || []);
      setBrands((brandsRes || []).filter((b) => b.status === "ACTIVE"));
    } catch (error) {
      console.error("Error loading entities:", error);
    }
  };

  const loadBanners = async () => {
    try {
      const response = await adminBannerAPI.getAll();
      const bannerList = Array.isArray(response) ? response : [];

      // Auto-deactivate expired banners
      const now = new Date();
      const bannersWithExpiry = bannerList.map((banner) => {
        if (banner.endDate && new Date(banner.endDate) < now && banner.active) {
          // Update backend to set inactive
          adminBannerAPI
            .update(banner.id, { ...banner, active: false })
            .catch((err) =>
              console.error(
                `Failed to deactivate expired banner ${banner.id}:`,
                err
              )
            );
          return { ...banner, active: false };
        }
        return banner;
      });

      setBanners(bannersWithExpiry);
    } catch (error) {
      console.error("Load banners error:", error);
      if (error.response?.status === 403) {
        toast.error(
          "Không có quyền truy cập! Vui lòng đăng nhập với tài khoản ADMIN.",
          {
            duration: 5000,
            description: "Thông tin đăng nhập: username=admin, password=123456",
          }
        );
      } else {
        toast.error("Lỗi tải banner");
      }
      setBanners([]);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      ...banner,
      linkType: banner.linkType || "CUSTOM",
      position: banner.position || "HOMEPAGE_SLIDER",
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
    });
    setSelectedImage(null); // Reset, existing image in imageUrl
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setSelectedImage(null);
    setForm({
      title: "",
      imageUrl: "",
      linkType: "CUSTOM",
      linkId: null,
      linkUrl: "",
      description: "",
      displayOrder: 0,
      active: true,
      startDate: "",
      endDate: "",
      position: "HOMEPAGE_SLIDER",
      clickCount: 0,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedImage && !form.imageUrl) {
      toast.error("Vui lòng chọn ảnh banner");
      return;
    }

    setUploading(true);
    try {
      let finalImageUrl = form.imageUrl;

      // Upload new image if selected
      if (selectedImage && selectedImage.file) {
        // Delete old image from Cloudinary if updating
        if (editingId && form.imageUrl) {
          try {
            await deleteBannerImage(form.imageUrl);
          } catch (err) {
            console.error("Error deleting old image:", err);
            // Continue even if delete fails
          }
        }

        const result = await uploadBannerImages([selectedImage.file]);
        if (result.success && result.fileNames.length > 0) {
          finalImageUrl = result.fileNames[0]; // Cloudinary URL
        }
      }

      const dataToSave = { ...form, imageUrl: finalImageUrl };

      if (editingId) {
        await adminBannerAPI.update(editingId, dataToSave);
        toast.success("Cập nhật banner thành công");
      } else {
        await adminBannerAPI.create(dataToSave);
        toast.success("Tạo banner thành công");
      }
      setShowForm(false);
      setSelectedImage(null);
      loadBanners();
    } catch (error) {
      toast.error("Lỗi lưu banner");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (banner) => {
    setDeletingBanner(banner);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;

    try {
      // Xóa ảnh trên Cloudinary (cả local path và Cloudinary URL)
      if (deletingBanner.imageUrl) {
        try {
          await deleteBannerImage(deletingBanner.imageUrl);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
          // Tiếp tục xóa banner ngay cả khi xóa ảnh thất bại
        }
      }

      await adminBannerAPI.delete(deletingBanner.id);
      toast.success("Xóa banner thành công");
      setIsDeleteOpen(false);
      setDeletingBanner(null);
      loadBanners();
    } catch (error) {
      toast.error("Lỗi xóa banner");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File vượt quá 5MB");
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setSelectedImage({ file, preview });

    // Reset input
    e.target.value = "";
  };

  // Filter banners based on search and filters
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "ACTIVE" && banner.active) ||
      (statusFilter === "INACTIVE" && !banner.active);
    const matchesLinkType =
      linkTypeFilter === "" || banner.linkType === linkTypeFilter;
    const matchesPosition =
      positionFilter === "" || banner.position === positionFilter;
    return matchesSearch && matchesStatus && matchesLinkType && matchesPosition;
  });

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, linkTypeFilter, positionFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanners = filteredBanners.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Banner / Slideshow</h1>
        <button
          onClick={handleNew}
          className="cursor-pointer bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          + Tạo banner
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm space-y-3">
        {/* Search - Full Width Row */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm banner theo tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row - 3 Filters + Clear Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[150px] h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Kích hoạt</option>
            <option value="INACTIVE">Tắt</option>
          </select>

          {/* Link Type Filter */}
          <select
            value={linkTypeFilter}
            onChange={(e) => setLinkTypeFilter(e.target.value)}
            className="flex-1 min-w-[150px] h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Tất cả loại liên kết</option>
            <option value="PRODUCT">Sản phẩm</option>
            <option value="CATEGORY">Danh mục</option>
            <option value="PROMOTION">Khuyến mãi</option>
            <option value="BRAND">Thương hiệu</option>
            <option value="CUSTOM">Tùy chỉnh</option>
          </select>

          {/* Position Filter */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="flex-1 min-w-[150px] h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Tất cả vị trí</option>
            <option value="HOMEPAGE_SLIDER">Trang chủ - Slider</option>
            <option value="HOMEPAGE_BANNER">Trang chủ - Banner</option>
            <option value="PRODUCT_PAGE">Trang sản phẩm</option>
            <option value="FOOTER">Footer</option>
          </select>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter || linkTypeFilter || positionFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ACTIVE");
                setLinkTypeFilter("");
                setPositionFilter("");
              }}
              className="px-4 h-10 text-sm font-medium text-black border border-brand-primary hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 bg-brand-accent-soft hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingId ? "Sửa banner" : "Tạo banner mới"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Cập nhật thông tin banner/slideshow"
                : "Thêm banner mới vào trang chủ"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Tiêu đề</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Để trống nếu không cần tiêu đề"
              />
            </div>

            {/* Link Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Loại liên kết <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.linkType}
                  onChange={(e) => {
                    const newLinkType = e.target.value;
                    setForm({
                      ...form,
                      linkType: newLinkType,
                      linkId: null,
                      linkUrl: newLinkType === "CUSTOM" ? form.linkUrl : "",
                    });
                  }}
                >
                  <option value="CUSTOM">Tùy chỉnh (Custom URL)</option>
                  <option value="PRODUCT">Sản phẩm</option>
                  <option value="CATEGORY">Danh mục</option>
                  <option value="PROMOTION">Khuyến mãi</option>
                  <option value="BRAND">Thương hiệu</option>
                </select>
              </div>

              {/* Dynamic Selection based on linkType */}
              {form.linkType === "PRODUCT" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Chọn sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.linkId || ""}
                    onChange={(e) => {
                      const productId = e.target.value;
                      setForm({
                        ...form,
                        linkId: productId,
                        linkUrl: `/product/${productId}`,
                      });
                    }}
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.linkType === "CATEGORY" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Chọn danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.linkId || ""}
                    onChange={(e) => {
                      const categoryId = e.target.value;
                      const category = categories.find(
                        (c) => c.id == categoryId
                      );
                      setForm({
                        ...form,
                        linkId: categoryId,
                        linkUrl: `/products?category=${
                          category?.name || categoryId
                        }`,
                      });
                    }}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.linkType === "PROMOTION" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Chọn khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.linkId || ""}
                    onChange={(e) => {
                      const promoId = e.target.value;
                      setForm({
                        ...form,
                        linkId: promoId,
                        linkUrl: `/promotional-products`, // Trỏ đến trang danh sách khuyến mãi
                      });
                    }}
                    required
                  >
                    <option value="">-- Chọn khuyến mãi --</option>
                    {promotions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.linkType === "BRAND" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Chọn thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.linkId || ""}
                    onChange={(e) => {
                      const brandId = e.target.value;
                      const brand = brands.find((b) => b.id == brandId);
                      setForm({
                        ...form,
                        linkId: brandId,
                        linkUrl: `/products?brand=${brand?.name || brandId}`,
                      });
                    }}
                    required
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.linkType === "CUSTOM" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    URL tùy chỉnh{" "}
                    <span className="text-gray-400 text-xs">
                      (ví dụ: /products)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.linkUrl}
                    onChange={(e) =>
                      setForm({ ...form, linkUrl: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            {/* Preview Generated URL */}
            {form.linkUrl && form.linkType !== "CUSTOM" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="size-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    URL tự động:
                  </span>
                  <code className="text-blue-700 dark:text-blue-300 font-mono">
                    {form.linkUrl}
                  </code>
                </div>
              </div>
            )}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Hình ảnh Banner <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {/* Preview image */}
                {(selectedImage || form.imageUrl) && (
                  <div className="relative">
                    <img
                      src={
                        selectedImage
                          ? selectedImage.preview
                          : form.imageUrl.startsWith("http")
                          ? form.imageUrl
                          : `/images/banners/${form.imageUrl}`
                      }
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedImage) {
                          URL.revokeObjectURL(selectedImage.preview);
                          setSelectedImage(null);
                        }
                        setForm({ ...form, imageUrl: "" });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-gray-600">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        {selectedImage || form.imageUrl
                          ? "Thay đổi ảnh"
                          : "Click để chọn ảnh"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG tối đa 5MB. Ảnh sẽ upload lên Cloudinary
                        khi Save.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Mô tả</label>
              <textarea
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Advanced Settings */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Cài đặt nâng cao
              </h3>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Vị trí hiển thị
                </label>
                <select
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                >
                  <option value="HOMEPAGE_SLIDER">
                    Trang chủ - Slider (Tự động chuyển)
                  </option>
                  <option value="HOMEPAGE_BANNER">
                    Trang chủ - Banner tĩnh
                  </option>
                  <option value="PRODUCT_PAGE">Trang sản phẩm</option>
                  <option value="FOOTER">Footer</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  • Slider: Banner tự động chuyển đổi (dùng cho quảng cáo chính)
                  <br />
                  • Banner tĩnh: Hiển thị cố định không chuyển động
                  <br />• Tự động responsive trên mọi thiết bị
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Ngày bắt đầu
                    <span className="text-gray-400 text-xs ml-1">
                      (Tùy chọn)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Ngày kết thúc
                    <span className="text-gray-400 text-xs ml-1">
                      (Tùy chọn)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        displayOrder: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm({ ...form, active: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Kích hoạt</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Đang upload..."
                  : editingId
                  ? "Cập nhật"
                  : "Tạo mới"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                  Hình ảnh
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Loại link
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Vị trí
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Lịch trình
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-28">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-36">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedBanners.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Không có banner nào
                  </td>
                </tr>
              ) : (
                paginatedBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={
                          banner.imageUrl.startsWith("http")
                            ? banner.imageUrl
                            : `/images/banners/${banner.imageUrl}`
                        }
                        alt={banner.title}
                        className="h-20 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {banner.title}
                      </div>
                      {banner.linkUrl && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                          <LinkIcon className="size-3" />
                          {banner.linkUrl}
                        </div>
                      )}
                      {banner.description && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                          {banner.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {{
                          PRODUCT: "Sản phẩm",
                          CATEGORY: "Danh mục",
                          PROMOTION: "Khuyến mãi",
                          BRAND: "Thương hiệu",
                          CUSTOM: "Tùy chỉnh",
                        }[banner.linkType] || "Custom"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {{
                          HOMEPAGE_SLIDER: "Slider",
                          HOMEPAGE_BANNER: "Banner",
                          FOOTER: "Footer",
                          PRODUCT_PAGE: "Sản phẩm",
                        }[banner.position] || "Slider"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {banner.startDate || banner.endDate ? (
                          <>
                            {banner.startDate && (
                              <div className="truncate">
                                {new Date(banner.startDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                            )}
                            {banner.endDate && (
                              <div className="truncate text-gray-500">
                                →{" "}
                                {new Date(banner.endDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">Không giới hạn</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                          banner.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {banner.active ? "Kích hoạt" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(banner);
                          }}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <PencilIcon className="size-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(banner);
                          }}
                          className="hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="size-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <AdminPagination
          page={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage}
          handlePrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          handleNext={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={deletingBanner?.title}
        onConfirm={confirmDelete}
        title="Xác nhận xóa banner"
      />
    </div>
  );
};
