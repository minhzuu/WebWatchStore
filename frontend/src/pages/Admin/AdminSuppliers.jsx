import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/api/supplierAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupplierTable } from "@/components/Admin/suppliers/SupplierTable";
import { SupplierDetailPanel } from "@/components/Admin/suppliers/SupplierDetailPanel";
import { SupplierFormDialog } from "@/components/Admin/suppliers/SupplierFormDialog";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon } from "lucide-react";
import { AdminPagination } from "@/components/Pagination";

export const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [supplierDetail, setSupplierDetail] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    status: "ACTIVE",
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await getSuppliers();
      // Sort by ID descending (mới nhất lên đầu)
      const sortedSuppliers = (res || []).sort((a, b) => b.id - a.id);
      setSuppliers(sortedSuppliers);
    } catch (err) {
      console.error("Lỗi khi lấy nhà cung cấp:", err);
      toast.error("Không thể tải danh sách nhà cung cấp");
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Filter suppliers based on search and status
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!statusFilter) {
      // Show all when no filter
      return matchesSearch;
    }

    // When filtering by ACTIVE: show ACTIVE or null (backward compatibility)
    // When filtering by INACTIVE: only show INACTIVE
    const supplierStatus = supplier.status || "ACTIVE"; // Treat null as ACTIVE for backward compatibility
    const matchesStatus = supplierStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchSupplierDetail = useCallback(async (supplierId) => {
    try {
      const res = await getSupplierById(supplierId);
      setSupplierDetail(res);
      setSelectedSupplier(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết nhà cung cấp:", err);
      toast.error("Không thể tải chi tiết nhà cung cấp");
    }
  }, []);

  const handleRowClick = (supplier) => {
    fetchSupplierDetail(supplier.id);
  };

  const handleCloseDetail = () => {
    setSupplierDetail(null);
    setSelectedSupplier(null);
  };

  const handleEdit = async (supplier) => {
    try {
      const fullSupplier = await getSupplierById(supplier.id);
      setSelectedSupplier(fullSupplier);
      setFormData({
        name: fullSupplier.name,
        contact: fullSupplier.contact || "",
        address: fullSupplier.address || "",
        status: fullSupplier.status || "ACTIVE",
      });
      setIsEditOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin nhà cung cấp:", err);
      toast.error("Không thể tải thông tin nhà cung cấp");
    }
  };

  const handleDelete = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      contact: "",
      address: "",
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
      await createSupplier(formData);
      toast.success("Thêm nhà cung cấp thành công");
      setIsAddOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error("Lỗi khi thêm nhà cung cấp:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm nhà cung cấp";

      if (err.response?.status === 403) {
        toast.error(
          "Bạn không có quyền thêm nhà cung cấp. Vui lòng đăng nhập với tài khoản ADMIN."
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateSupplier(selectedSupplier.id, formData);
      toast.success("Cập nhật nhà cung cấp thành công");
      setIsEditOpen(false);
      fetchSuppliers();

      // Update detail panel if open
      if (supplierDetail?.id === selectedSupplier.id) {
        fetchSupplierDetail(selectedSupplier.id);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật nhà cung cấp:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật nhà cung cấp";
      toast.error(errorMsg);
    }
  };

  const confirmDelete = async () => {
    try {
      await updateSupplier(selectedSupplier.id, { status: "INACTIVE" });
      toast.success("Đã ẩn nhà cung cấp thành công");
      setIsDeleteOpen(false);

      // Close detail panel if showing deleted supplier
      if (supplierDetail?.id === selectedSupplier.id) {
        handleCloseDetail();
      }

      fetchSuppliers();
    } catch (err) {
      console.error("Lỗi khi ẩn nhà cung cấp:", err);
      toast.error("Không thể ẩn nhà cung cấp.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Nhà cung cấp
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý nhà cung cấp sản phẩm trong cửa hàng
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="cursor-pointer bg-brand-primary text-brand-primary-foreground px-4 py-2 rounded hover:bg-brand-primary-soft"
        >
          <PlusIcon className="size-4" />
          Thêm nhà cung cấp
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
              placeholder="Tìm kiếm nhà cung cấp..."
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

      {/* Supplier Table */}
      <div>
        <SupplierTable
          suppliers={paginatedSuppliers}
          selectedSupplier={selectedSupplier}
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

      {/* Supplier Detail Modal */}
      <SupplierDetailPanel
        supplierDetail={supplierDetail}
        onClose={handleCloseDetail}
      />

      {/* Add Dialog */}
      <SupplierFormDialog
        isOpen={isAddOpen}
        onClose={setIsAddOpen}
        mode="add"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitAdd}
      />

      {/* Edit Dialog */}
      <SupplierFormDialog
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
        itemName={selectedSupplier?.name}
        onConfirm={confirmDelete}
        title="Xác nhận xóa nhà cung cấp"
        description={
          selectedSupplier?.name
            ? `Bạn có chắc chắn muốn xóa nhà cung cấp "${selectedSupplier.name}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm từ nhà cung cấp này.`
            : undefined
        }
      />
    </div>
  );
};
