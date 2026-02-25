import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categoryAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryTable } from "@/components/Admin/categories/CategoryTable";
import { CategoryDetailPanel } from "@/components/Admin/categories/CategoryDetailPanel";
import { CategoryFormDialog } from "@/components/Admin/categories/CategoryFormDialog";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon } from "lucide-react";
import { AdminPagination } from "@/components/Pagination";

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [categoryDetail, setCategoryDetail] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      // Sort by ID descending (mới nhất lên đầu)
      const sortedCategories = (res || []).sort((a, b) => b.id - a.id);
      setCategories(sortedCategories);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      toast.error("Không thể tải danh sách danh mục");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search and status
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchCategoryDetail = useCallback(async (categoryId) => {
    try {
      const res = await getCategoryById(categoryId);
      setCategoryDetail(res);
      setSelectedCategory(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết danh mục:", err);
      toast.error("Không thể tải chi tiết danh mục");
    }
  }, []);

  const handleRowClick = (category) => {
    fetchCategoryDetail(category.id);
  };

  const handleCloseDetail = () => {
    setCategoryDetail(null);
    setSelectedCategory(null);
  };

  const handleEdit = async (category) => {
    try {
      const fullCategory = await getCategoryById(category.id);
      setSelectedCategory(fullCategory);
      setFormData({
        name: fullCategory.name,
        description: fullCategory.description || "",
        status: fullCategory.status || "ACTIVE",
      });
      setIsEditOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin danh mục:", err);
      toast.error("Không thể tải thông tin danh mục");
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
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

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await createCategory(formData);
      toast.success("Thêm danh mục thành công");
      setIsAddOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi thêm danh mục:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Không thể thêm danh mục";

      if (err.response?.status === 403) {
        toast.error(
          "Bạn không có quyền thêm danh mục. Vui lòng đăng nhập với tài khoản ADMIN."
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(selectedCategory.id, formData);
      toast.success("Cập nhật danh mục thành công");
      setIsEditOpen(false);
      fetchCategories();

      // Update detail panel if open
      if (categoryDetail?.id === selectedCategory.id) {
        fetchCategoryDetail(selectedCategory.id);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật danh mục";
      toast.error(errorMsg);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      toast.success("Đã ẩn danh mục thành công");
      setIsDeleteOpen(false);

      // Close detail panel if showing deleted category
      if (categoryDetail?.id === selectedCategory.id) {
        handleCloseDetail();
      }

      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi ẩn danh mục:", err);
      toast.error("Không thể ẩn danh mục.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Danh mục
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý danh mục sản phẩm trong cửa hàng
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="cursor-pointer bg-brand-primary text-brand-primary-foreground px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          <PlusIcon className="size-4" />
          Thêm danh mục
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
              placeholder="Tìm kiếm danh mục..."
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

      {/* Category Table */}
      <div>
        <CategoryTable
          categories={paginatedCategories}
          selectedCategory={selectedCategory}
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

      {/* Category Detail Modal */}
      <CategoryDetailPanel
        categoryDetail={categoryDetail}
        onClose={handleCloseDetail}
      />

      {/* Add Dialog */}
      <CategoryFormDialog
        isOpen={isAddOpen}
        onClose={setIsAddOpen}
        mode="add"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitAdd}
      />

      {/* Edit Dialog */}
      <CategoryFormDialog
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
        itemName={selectedCategory?.name}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
        description={
          selectedCategory?.name
            ? `Bạn có chắc chắn muốn xóa danh mục "${selectedCategory.name}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm trong danh mục.`
            : undefined
        }
      />
    </div>
  );
};
