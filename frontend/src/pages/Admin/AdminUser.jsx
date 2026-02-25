import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createUser,
  getUserById,
  searchUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "@/api/userAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserTable } from "@/components/Admin/users/UserTable";
import { UserDetailPanel } from "@/components/Admin/users/UserDetailPanel";
import { UserFormDialog } from "@/components/Admin/users/UserFormDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_FORM = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  role: "USER",
};

const DEFAULT_FILTERS = {
  keyword: "",
  role: "ALL",
  includeInactive: false,
};

const ROLE_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả vai trò" },
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "STAFF", label: "Nhân viên" },
  { value: "USER", label: "Khách hàng" },
];

export const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const selectedUserIdRef = useRef(null);

  const fetchUserDetail = useCallback(async (userId) => {
    if (!userId) {
      return;
    }
    try {
      const detail = await getUserById(userId);
      setSelectedUser(detail);
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin người dùng";
      toast.error(message);
    }
  }, []);

  const fetchUsers = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      try {
        const response = await searchUsers({
          page: targetPage,
          size: pageSize,
          keyword: filters.keyword ? filters.keyword.trim() : undefined,
          role: filters.role !== "ALL" ? filters.role : undefined,
          includeInactive: filters.includeInactive,
        });

        const content = Array.isArray(response?.content)
          ? response.content
          : [];

        setUsers(content);
        setTotalPages(response?.totalPages ?? 0);
        setTotalElements(response?.totalElements ?? content.length);

        if (typeof response?.number === "number" && response.number !== page) {
          setPage(response.number);
        }

        const currentSelectedId = selectedUserIdRef.current;
        if (currentSelectedId) {
          const stillVisible = content.some(
            (user) => user.id === currentSelectedId
          );
          if (!stillVisible) {
            setSelectedUserId(null);
            setSelectedUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        const message =
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách người dùng";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [filters.includeInactive, filters.keyword, filters.role, page, pageSize]
  );

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const paginationSummary = useMemo(() => {
    if (!totalElements) {
      return "Không có người dùng";
    }
    const start = page * pageSize + 1;
    const end = Math.min(totalElements, (page + 1) * pageSize);
    return `Hiển thị ${start}-${end} trong ${totalElements} người dùng`;
  }, [page, pageSize, totalElements]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      keyword: searchTerm.trim(),
    }));
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      role: value,
    }));
    setPage(0);
  };

  const handleIncludeInactiveChange = (event) => {
    const checked = event.target.checked;
    setFilters((prev) => ({
      ...prev,
      includeInactive: checked,
    }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handlePageSelect = (index) => {
    if (index === page) {
      return;
    }
    setPage(index);
  };

  const handlePrevPage = () => {
    if (page <= 0) {
      return;
    }
    const nextPage = page - 1;
    setPage(nextPage);
  };

  const handleNextPage = () => {
    if (page >= totalPages - 1) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
  };

  const handleRowClick = async (user) => {
    setSelectedUserId(user.id);
    await fetchUserDetail(user.id);
  };

  const handleCloseDetail = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
  };

  const handleToggleStatus = useCallback(
    async (user, nextActive) => {
      const userId = typeof user === "object" ? user.id : user;
      const activeState =
        typeof nextActive === "boolean" ? nextActive : !user.active;
      try {
        await updateUserStatus(userId, activeState);
        toast.success(
          activeState ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản"
        );
        await fetchUsers();
        await fetchUserDetail(userId);
      } catch (error) {
        console.error("Failed to update status:", error);
        const message =
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái";
        toast.error(message);
      }
    },
    [fetchUserDetail, fetchUsers]
  );

  const handleRoleUpdate = useCallback(
    async (userId, role) => {
      try {
        await updateUserRole(userId, role);
        toast.success("Cập nhật vai trò thành công");
        await fetchUsers();
        await fetchUserDetail(userId);
      } catch (error) {
        console.error("Failed to update role:", error);
        const message =
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật vai trò";
        toast.error(message);
      }
    },
    [fetchUserDetail, fetchUsers]
  );

  const handleFormInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    setFormMode("create");
    setFormData(DEFAULT_FORM);
    setIsFormOpen(true);
  };

  const handleEditUser = async (user) => {
    setFormMode("edit");
    setSelectedUserId(user.id);
    setFormData({
      username: user.username ?? "",
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      password: "",
      role: user.role ?? "USER",
    });
    setIsFormOpen(true);
    if (!selectedUser || selectedUser.id !== user.id) {
      await fetchUserDetail(user.id);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      username: formData.username?.trim(),
      fullName: formData.fullName?.trim(),
      email: formData.email?.trim(),
      role: formData.role,
    };

    const trimmedPassword = formData.password?.trim();
    if (formMode === "create" || (trimmedPassword && trimmedPassword.length)) {
      payload.password = trimmedPassword;
    }

    try {
      if (formMode === "create") {
        await createUser(payload);
        toast.success("Tạo tài khoản thành công");
        setIsFormOpen(false);
        setFormData(DEFAULT_FORM);
        setPage(0);
        await fetchUsers(0);
      } else if (selectedUserId) {
        await updateUser(selectedUserId, payload);
        toast.success("Cập nhật người dùng thành công");
        setIsFormOpen(false);
        await fetchUsers();
        await fetchUserDetail(selectedUserId);
      }
    } catch (error) {
      console.error("Failed to submit user form:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể lưu thông tin người dùng";
      toast.error(message);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                handlePrevPage();
              }}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                isActive={index === page}
                onClick={(event) => {
                  event.preventDefault();
                  handlePageSelect(index);
                }}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                handleNextPage();
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi trạng thái, phân quyền và chỉnh sửa thông tin tài khoản
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className={"cursor-pointer"}
          >
            <RefreshCwIcon className="mr-2 size-4" />
            Tải lại
          </Button>
          <Button
            onClick={handleAddUser}
            className={
              "bg-brand-primary hover:bg-brand-primary-soft cursor-pointer"
            }
          >
            <PlusIcon className="mr-2 size-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end"
      >
        <div className="lg:col-span-2">
          <label htmlFor="admin-user-search" className="sr-only">
            Tìm kiếm
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              id="admin-user-search"
              type="text"
              placeholder="Tìm kiếm theo tài khoản, email hoặc tên"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-user-role-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Lọc theo vai trò
          </label>
          <select
            id="admin-user-role-filter"
            value={filters.role}
            onChange={handleRoleFilterChange}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          >
            {ROLE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="admin-user-include-inactive"
            type="checkbox"
            checked={filters.includeInactive}
            onChange={handleIncludeInactiveChange}
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="admin-user-include-inactive"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Hiển thị tài khoản đã khóa
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
          <Button type="submit">Tìm kiếm</Button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {paginationSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={selectedUser ? "xl:col-span-2" : "xl:col-span-3"}>
          <UserTable
            users={users}
            loading={loading}
            selectedUserId={selectedUserId}
            onRowClick={handleRowClick}
            onEdit={handleEditUser}
            onToggleStatus={(user) => handleToggleStatus(user)}
          />
          {renderPagination()}
        </div>

        <UserDetailPanel
          user={selectedUser}
          onClose={handleCloseDetail}
          onEdit={handleEditUser}
          onRoleChange={handleRoleUpdate}
          onStatusChange={(userId, nextActive) =>
            handleToggleStatus(userId, nextActive)
          }
        />
      </div>

      <UserFormDialog
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        mode={formMode}
        formData={formData}
        onChange={handleFormInputChange}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
