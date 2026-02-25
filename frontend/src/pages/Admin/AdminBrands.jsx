import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/api/brandAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandTable } from "@/components/Admin/brands/BrandTable";
import { BrandDetailPanel } from "@/components/Admin/brands/BrandDetailPanel";
import { BrandFormDialog } from "@/components/Admin/brands/BrandFormDialog";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon } from "lucide-react";
import { AdminPagination } from "@/components/Pagination";

export const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [brandDetail, setBrandDetail] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    status: "ACTIVE",
  });

  const fetchBrands = useCallback(async () => {
    try {
      const res = await getBrands();
      console.log("Raw API response:", res);
      // Sort by ID descending (mới nhất lên đầu)
      const sortedBrands = (res || []).sort((a, b) => b.id - a.id);
      console.log(
        "Brands with status:",
        sortedBrands.map((b) => ({ id: b.id, name: b.name, status: b.status }))
      );
      setBrands(sortedBrands);
    } catch (err) {
      console.error("Lỗi khi lấy thương hiệu:", err);
      toast.error("Không thể tải danh sách thương hiệu");
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Filter brands based on search and status
  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!statusFilter) {
      // Show all when no filter
      return matchesSearch;
    }

    const brandStatus = brand.status || "ACTIVE";
    const matchesStatus = brandStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchBrandDetail = useCallback(async (brandId) => {
    try {
      const res = await getBrandById(brandId);
      setBrandDetail(res);
      setSelectedBrand(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết thương hiệu:", err);
      toast.error("Không thể tải chi tiết thương hiệu");
    }
  }, []);

  const handleRowClick = (brand) => {
    fetchBrandDetail(brand.id);
  };

  const handleCloseDetail = () => {
    setBrandDetail(null);
    setSelectedBrand(null);
  };

  const handleEdit = async (brand) => {
    try {
      const fullBrand = await getBrandById(brand.id);
      setSelectedBrand(fullBrand);
      setFormData({
        name: fullBrand.name,
        description: fullBrand.description || "",
        logoUrl: fullBrand.logoUrl || "",
        status: fullBrand.status || "ACTIVE",
      });
      setIsEditOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin thương hiệu:", err);
      toast.error("Không thể tải thông tin thương hiệu");
    }
  };

  const handleDelete = (brand) => {
    setSelectedBrand(brand);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
      logoUrl: "",
    });
    setIsAddOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e, uploadedLogoUrl = null) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    try {
      const dataToSubmit = uploadedLogoUrl
        ? { ...formData, logoUrl: uploadedLogoUrl }
        : formData;
      console.log("Form data before create:", dataToSubmit);
      const result = await createBrand(dataToSubmit);
      console.log("Create brand result:", result);
      toast.success("Thêm thương hiệu thành công");
      setIsAddOpen(false);
      fetchBrands();
    } catch (err) {
      console.error("Lỗi khi thêm thương hiệu:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm thương hiệu";

      if (err.response?.status === 403) {
        toast.error(
          "Bạn không có quyền thêm thương hiệu. Vui lòng đăng nhập với tài khoản ADMIN."
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmitEdit = async (e, uploadedLogoUrl = null) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    try {
      const dataToSubmit = uploadedLogoUrl
        ? { ...formData, logoUrl: uploadedLogoUrl }
        : formData;
      console.log("Form data before update:", dataToSubmit);
      const result = await updateBrand(selectedBrand.id, dataToSubmit);
      console.log("Update brand result:", result);
      toast.success("Cập nhật thương hiệu thành công");
      setIsEditOpen(false);
      fetchBrands();

      // Update detail panel if open
      if (brandDetail?.id === selectedBrand.id) {
        fetchBrandDetail(selectedBrand.id);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thương hiệu:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật thương hiệu";
      toast.error(errorMsg);
    }
  };

  const confirmDelete = async () => {
    try {
      await updateBrand(selectedBrand.id, { status: "INACTIVE" });
      toast.success("Đã ẩn thương hiệu thành công");
      setIsDeleteOpen(false);

      // Close detail panel if showing deleted brand
      if (brandDetail?.id === selectedBrand.id) {
        handleCloseDetail();
      }

      fetchBrands();
    } catch (err) {
      console.error("Lỗi khi ẩn thương hiệu:", err);
      toast.error("Không thể ẩn thương hiệu.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Thương hiệu
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý thương hiệu sản phẩm trong cửa hàng
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="cursor-pointer bg-brand-primary text-brand-primary-foreground px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          <PlusIcon className="size-4" />
          Thêm thương hiệu
        </Button>
      </div>

      {/* Search Bar and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <label className="block text-xs text-gray-500 mb-1">Tìm kiếm</label>
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ẩn</option>
          </select>
        </div>
      </div>

      {/* Brand Table */}
      <div>
        <BrandTable
          brands={paginatedBrands}
          selectedBrand={selectedBrand}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
      </div>

      {/* Brand Detail Modal */}
      <BrandDetailPanel brandDetail={brandDetail} onClose={handleCloseDetail} />

      {/* Add Dialog */}
      <BrandFormDialog
        isOpen={isAddOpen}
        onClose={setIsAddOpen}
        mode="add"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitAdd}
      />

      {/* Edit Dialog */}
      <BrandFormDialog
        isOpen={isEditOpen}
        onClose={setIsEditOpen}
        mode="edit"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={selectedBrand?.name}
        onConfirm={confirmDelete}
        title="Xác nhận xóa thương hiệu"
        description={
          selectedBrand?.name
            ? `Bạn có chắc chắn muốn xóa thương hiệu "${selectedBrand.name}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm thuộc thương hiệu này.`
            : undefined
        }
      />
    </div>
  );
};
