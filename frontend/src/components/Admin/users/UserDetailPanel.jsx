import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    HashIcon,
    MailIcon,
    PencilIcon,
    ShieldCheckIcon,
    ShieldOffIcon,
    ShieldQuestionIcon,
    UserIcon,
    XIcon,
} from "lucide-react";

const roleOptions = ["ADMIN", "MANAGER", "STAFF", "USER"];

const formatDateTime = (value) => {
    if (!value) {
        return "Không xác định";
    }
    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch {
        return value;
    }
};

export const UserDetailPanel = ({
    user,
    onClose,
    onEdit,
    onRoleChange,
    onStatusChange,
}) => {
    const [role, setRole] = useState(user?.role ?? "USER");

    useEffect(() => {
        setRole(user?.role ?? "USER");
    }, [user]);

    const roleLabel = useMemo(() => {
        switch (user?.role) {
            case "ADMIN":
                return "Quản trị viên";
            case "MANAGER":
                return "Quản lý";
            case "STAFF":
                return "Nhân viên";
            case "USER":
            default:
                return "Khách hàng";
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const statusBadgeClass = user.active
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300";

    const statusLabel = user.active ? "Đang hoạt động" : "Đã khóa";

    const disableRoleSubmit = !role || role === user.role;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Thông tin người dùng
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quản lý trạng thái và vai trò của tài khoản
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onClose?.()}>
                    <XIcon className="size-5" />
                </Button>
            </div>

            <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3">
                    <UserIcon className="size-5 text-gray-400" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tài khoản
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {user.username}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <HashIcon className="size-5 text-gray-400" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Họ và tên
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {user.fullName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <MailIcon className="size-5 text-gray-400" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Email
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ShieldQuestionIcon className="size-5 text-gray-400" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Vai trò hiện tại
                        </p>
                        <Badge>{roleLabel}</Badge>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Thay đổi vai trò
                        </p>
                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        >
                            {roleOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        onClick={() => onRoleChange?.(user.id, role)}
                        disabled={disableRoleSubmit}
                    >
                        Cập nhật
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Trạng thái
                        </p>
                        <Badge className={statusBadgeClass}>
                            {statusLabel}
                        </Badge>
                    </div>
                    <Button
                        variant={user.active ? "destructive" : "outline"}
                        onClick={() => onStatusChange?.(user.id, !user.active)}
                    >
                        {user.active ? (
                            <>
                                <ShieldOffIcon className="mr-2 size-4" />
                                Khóa tài khoản
                            </>
                        ) : (
                            <>
                                <ShieldCheckIcon className="mr-2 size-4" />
                                Kích hoạt lại
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                            Ngày tạo:
                        </span>{" "}
                        {formatDateTime(user.createdAt)}
                    </p>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button variant="outline" onClick={() => onEdit?.(user)}>
                    <PencilIcon className="mr-2 size-4" />
                    Chỉnh sửa thông tin
                </Button>
            </div>
        </div>
    );
};
