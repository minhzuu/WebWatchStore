import { useEffect, useMemo, useState } from "react";
import {
    searchOrders,
    getOrderDetail,
    updateOrderStatus,
} from "@/api/orderAPI";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Loader2,
    RefreshCw,
    Search,
    Truck,
    CheckCircle2,
    XCircle,
    CreditCard,
    Clock3,
} from "lucide-react";

const STATUS_METADATA = {
    PENDING: {
        label: "Chờ xử lý",
        icon: Clock3,
        variant: "outline",
    },
    PAID: {
        label: "Đã thanh toán",
        icon: CreditCard,
        variant: "default",
    },
    SHIPPED: {
        label: "Đang giao",
        icon: Truck,
        variant: "secondary",
    },
    COMPLETED: {
        label: "Hoàn tất",
        icon: CheckCircle2,
        variant: "default",
    },
    CANCELLED: {
        label: "Đã hủy",
        icon: XCircle,
        variant: "destructive",
    },
};

const STATUS_OPTIONS = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: STATUS_METADATA.PENDING.label },
    { value: "PAID", label: STATUS_METADATA.PAID.label },
    { value: "SHIPPED", label: STATUS_METADATA.SHIPPED.label },
    { value: "COMPLETED", label: STATUS_METADATA.COMPLETED.label },
    { value: "CANCELLED", label: STATUS_METADATA.CANCELLED.label },
];

const PAGE_SIZE = 8;

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "";

export const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [filters, setFilters] = useState({
        status: "ALL",
        search: "",
        username: "",
        userId: "",
    });
    const [searchInput, setSearchInput] = useState("");
    const [usernameInput, setUsernameInput] = useState("");
    const [userIdInput, setUserIdInput] = useState("");
    const [listLoading, setListLoading] = useState(false);

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [statusDraft, setStatusDraft] = useState(null);
    const [statusSaving, setStatusSaving] = useState(false);

    const activeStatusMeta = selectedOrder?.status
        ? STATUS_METADATA[selectedOrder.status]
        : null;
    const DetailStatusIcon = activeStatusMeta?.icon;

    const fetchOrders = async (targetPage = page, currentFilters = filters) => {
        setListLoading(true);
        try {
            const response = await searchOrders({
                page: targetPage,
                size: PAGE_SIZE,
                status:
                    currentFilters.status !== "ALL"
                        ? currentFilters.status
                        : undefined,
                search: currentFilters.search || undefined,
                user: currentFilters.username || undefined,
                userId: currentFilters.userId || undefined,
            });

            const content = response?.content || [];
            setOrders(content);
            setTotalPages(response?.totalPages ?? 0);
            setTotalElements(response?.totalElements ?? content.length);

            if (content.length === 0) {
                setSelectedOrderId(null);
                setSelectedOrder(null);
                return;
            }

            const fallbackId = content.find(
                (order) => order.id === selectedOrderId
            )
                ? selectedOrderId
                : content[0].id;
            if (fallbackId) {
                handleSelectOrder(fallbackId, true);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setListLoading(false);
        }
    };

    const handleSelectOrder = async (orderId, skipListRefresh = false) => {
        if (!skipListRefresh) {
            setSelectedOrder(null);
        }
        setSelectedOrderId(orderId);
        setDetailLoading(true);
        try {
            const detail = await getOrderDetail(orderId);
            setSelectedOrder(detail);
            setStatusDraft(detail?.status ?? null);
        } catch (error) {
            console.error("Failed to fetch order detail", error);
            toast.error("Không thể tải chi tiết đơn hàng");
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.status,
        filters.search,
        filters.username,
        filters.userId,
        page,
    ]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setPage(0);
        setFilters((prev) => ({
            ...prev,
            search: searchInput.trim(),
            username: usernameInput.trim(),
            userId: userIdInput.trim(),
        }));
    };

    const handleResetFilters = () => {
        setSearchInput("");
        setUsernameInput("");
        setUserIdInput("");
        setPage(0);
        setFilters({ status: "ALL", search: "", username: "", userId: "" });
    };

    const handleRefresh = () => {
        fetchOrders(0, filters);
    };

    const handleStatusFilterChange = (event) => {
        setPage(0);
        setFilters((prev) => ({ ...prev, status: event.target.value }));
    };

    const handleStatusSave = async () => {
        if (
            !selectedOrder ||
            !statusDraft ||
            statusDraft === selectedOrder.status
        ) {
            return;
        }
        setStatusSaving(true);
        try {
            const updated = await updateOrderStatus(
                selectedOrder.id,
                statusDraft
            );
            setSelectedOrder(updated);
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === updated.id
                        ? {
                              ...order,
                              status: updated.status,
                              updatedAt: updated.updatedAt,
                              totalAmount: updated.totalAmount,
                              totalQuantity: updated.totalQuantity,
                          }
                        : order
                )
            );
            toast.success("Cập nhật trạng thái đơn hàng thành công");
        } catch (error) {
            console.error("Failed to update order status", error);
            toast.error("Không thể cập nhật trạng thái đơn hàng");
        } finally {
            setStatusSaving(false);
        }
    };

    const paginationSummary = useMemo(() => {
        if (!totalElements) return "Không có đơn hàng";
        const start = page * PAGE_SIZE + 1;
        const end = Math.min((page + 1) * PAGE_SIZE, totalElements);
        return `Hiển thị ${start}-${end} trên ${totalElements} đơn hàng`;
    }, [page, totalElements]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Quản lý đơn hàng</h1>
                    <p className="text-sm text-muted-foreground">
                        Theo dõi đơn hàng, xem chi tiết và cập nhật trạng thái
                        xử lý.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={listLoading}
                    >
                        <RefreshCw className="mr-2 size-4" /> Làm mới
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                <Card className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <form
                            className="grid w-full gap-3 md:max-w-3xl md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                            onSubmit={handleSearchSubmit}
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="Tìm theo tên hoặc email khách hàng"
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Input
                                    value={usernameInput}
                                    onChange={(event) =>
                                        setUsernameInput(event.target.value)
                                    }
                                    placeholder="Username"
                                    className="flex-1"
                                />
                                <Input
                                    value={userIdInput}
                                    onChange={(event) =>
                                        setUserIdInput(event.target.value)
                                    }
                                    placeholder="User ID"
                                    className="w-32"
                                />
                            </div>
                            <div className="flex gap-2 md:col-span-2">
                                <Button type="submit" className="flex-1">
                                    Tìm kiếm
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResetFilters}
                                >
                                    Đặt lại
                                </Button>
                            </div>
                        </form>

                        <div className="flex items-center gap-2 md:self-end">
                            <label className="text-sm text-muted-foreground">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={handleStatusFilterChange}
                                className="h-9 rounded-md border px-3 text-sm shadow-sm"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Mã
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Khách hàng
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Tổng tiền
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {listLoading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            <Loader2 className="mx-auto size-6 animate-spin" />
                                            <p className="mt-2 text-sm">
                                                Đang tải đơn hàng...
                                            </p>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Không có đơn hàng nào
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const meta =
                                            STATUS_METADATA[order.status];
                                        const Icon = meta?.icon;
                                        const isActive =
                                            order.id === selectedOrderId;
                                        return (
                                            <tr
                                                key={order.id}
                                                className={`cursor-pointer transition-colors hover:bg-muted/60 ${
                                                    isActive
                                                        ? "bg-muted/70"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleSelectOrder(order.id)
                                                }
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    #{order.id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {order.customerName ??
                                                                "N/A"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {order.customerEmail ??
                                                                "--"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {meta ? (
                                                        <Badge
                                                            variant={
                                                                meta.variant
                                                            }
                                                        >
                                                            {Icon && (
                                                                <Icon className="size-3.5" />
                                                            )}
                                                            {meta.label}
                                                        </Badge>
                                                    ) : (
                                                        order.status
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {formatCurrency(
                                                        order.totalAmount
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    <div>
                                                        {formatDateTime(
                                                            order.createdAt
                                                        )}
                                                    </div>
                                                    {order.updatedAt && (
                                                        <div>
                                                            Cập nhật:{" "}
                                                            {formatDateTime(
                                                                order.updatedAt
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        Xem
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <span>{paginationSummary}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((prev) => Math.max(prev - 1, 0))
                                }
                                disabled={page === 0 || listLoading}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((prev) =>
                                        prev + 1 < totalPages ? prev + 1 : prev
                                    )
                                }
                                disabled={page + 1 >= totalPages || listLoading}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
                    {detailLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !selectedOrder ? (
                        <p className="mt-6 text-sm text-muted-foreground">
                            Chọn một đơn hàng ở danh sách để xem chi tiết.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-5">
                            <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Mã đơn hàng
                                        </p>
                                        <p className="text-lg font-semibold">
                                            #{selectedOrder.id}
                                        </p>
                                    </div>
                                    {activeStatusMeta && (
                                        <Badge
                                            variant={activeStatusMeta.variant}
                                            className="text-sm"
                                        >
                                            {DetailStatusIcon && (
                                                <DetailStatusIcon className="mr-1 size-3.5" />
                                            )}
                                            {activeStatusMeta.label}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>
                                        Khách hàng:{" "}
                                        {selectedOrder.customerName ?? "N/A"}
                                    </p>
                                    <p>
                                        Email:{" "}
                                        {selectedOrder.customerEmail ?? "--"}
                                    </p>
                                    <p>
                                        Ngày tạo:{" "}
                                        {formatDateTime(
                                            selectedOrder.createdAt
                                        )}
                                    </p>
                                    {selectedOrder.updatedAt && (
                                        <p>
                                            Ngày cập nhật:{" "}
                                            {formatDateTime(
                                                selectedOrder.updatedAt
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Sản phẩm</h3>
                                    <span className="text-sm text-muted-foreground">
                                        Tổng số lượng:{" "}
                                        {selectedOrder.totalQuantity ?? 0}
                                    </span>
                                </div>
                                <div className="rounded-lg border">
                                    <table className="min-w-full divide-y divide-border text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">
                                                    Sản phẩm
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium">
                                                    Giá
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium">
                                                    Số lượng
                                                </th>
                                                <th className="px-4 py-2 text-right font-medium">
                                                    Thành tiền
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {selectedOrder.items &&
                                            selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map(
                                                    (item) => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {item.productName ??
                                                                            `Sản phẩm #${item.productId}`}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Mã sản
                                                                        phẩm:{" "}
                                                                        {item.productId ??
                                                                            "--"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {formatCurrency(
                                                                    item.price
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {formatCurrency(
                                                                    Number(
                                                                        item.price ??
                                                                            0
                                                                    ) *
                                                                        Number(
                                                                            item.quantity ??
                                                                                0
                                                                        )
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="py-6 text-center text-sm text-muted-foreground"
                                                    >
                                                        Không có sản phẩm
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                                <span className="text-sm text-muted-foreground">
                                    Tổng giá trị
                                </span>
                                <span className="text-lg font-semibold">
                                    {formatCurrency(selectedOrder.totalAmount)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    Cập nhật trạng thái
                                </label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <select
                                        value={statusDraft ?? ""}
                                        onChange={(event) =>
                                            setStatusDraft(event.target.value)
                                        }
                                        className="h-10 flex-1 rounded-md border px-3 text-sm shadow-sm"
                                    >
                                        {!statusDraft && (
                                            <option value="">
                                                -- Chọn trạng thái --
                                            </option>
                                        )}
                                        {STATUS_OPTIONS.filter(
                                            (option) => option.value !== "ALL"
                                        ).map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        onClick={handleStatusSave}
                                        disabled={
                                            statusSaving ||
                                            !statusDraft ||
                                            statusDraft === selectedOrder.status
                                        }
                                    >
                                        {statusSaving && (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        )}
                                        Lưu trạng thái
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
