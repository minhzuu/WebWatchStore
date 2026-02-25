import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    EyeIcon,
    PencilIcon,
    ShieldOffIcon,
    ShieldCheckIcon,
} from "lucide-react";

const roleLabelMap = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    STAFF: "Nhân viên",
    USER: "Khách hàng",
};

export const UserTable = ({
    users = [],
    selectedUserId,
    onRowClick,
    onEdit,
    onToggleStatus,
    loading = false,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Tài khoản
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Họ và tên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Vai trò
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Đang tải danh sách người dùng...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Không có người dùng nào phù hợp
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const isSelected = selectedUserId === user.id;
                                return (
                                    <tr
                                        key={user.id}
                                        onClick={() => onRowClick?.(user)}
                                        className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                            isSelected
                                                ? "bg-blue-50 dark:bg-blue-900/20"
                                                : ""
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <EyeIcon className="size-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {user.username}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {user.fullName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="secondary">
                                                {roleLabelMap[user.role] ??
                                                    user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={
                                                    user.active
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                        : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                                                }
                                            >
                                                {user.active
                                                    ? "Đang hoạt động"
                                                    : "Đã khóa"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onEdit?.(user);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={
                                                        user.active
                                                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onToggleStatus?.(user);
                                                    }}
                                                >
                                                    {user.active ? (
                                                        <ShieldOffIcon className="size-4" />
                                                    ) : (
                                                        <ShieldCheckIcon className="size-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
