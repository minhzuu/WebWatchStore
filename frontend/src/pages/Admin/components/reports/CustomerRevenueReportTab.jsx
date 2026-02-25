import { useEffect, useMemo, useState } from "react";
import {
    getRevenueByCustomerMonthly,
    getRevenueByCustomerYearly,
} from "@/api/reportAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AwardIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
});

const formatCurrency = (value) => {
    const safe = typeof value === "number" ? value : Number(value ?? 0);
    return currencyFormatter.format(safe);
};

const formatNumber = (value) => {
    const safe = typeof value === "number" ? value : Number(value ?? 0);
    return Number.isFinite(safe) ? safe.toLocaleString("vi-VN") : "0";
};

const buildMonthlyDefaults = () => {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        limit: 10,
    };
};

const buildYearlyDefaults = () => {
    const now = new Date();
    return {
        year: now.getFullYear(),
        limit: 10,
    };
};

export const CustomerRevenueReportTab = () => {
    const [monthlyControl, setMonthlyControl] = useState(() =>
        buildMonthlyDefaults()
    );
    const [monthlyFilters, setMonthlyFilters] = useState(() =>
        buildMonthlyDefaults()
    );
    const [monthlyData, setMonthlyData] = useState([]);
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const [yearlyControl, setYearlyControl] = useState(() =>
        buildYearlyDefaults()
    );
    const [yearlyFilters, setYearlyFilters] = useState(() =>
        buildYearlyDefaults()
    );
    const [yearlyData, setYearlyData] = useState([]);
    const [yearlyLoading, setYearlyLoading] = useState(false);

    const totalMonthlyRevenue = useMemo(
        () =>
            monthlyData.reduce(
                (total, item) => total + (Number(item.totalRevenue) || 0),
                0
            ),
        [monthlyData]
    );

    const totalYearlyRevenue = useMemo(
        () =>
            yearlyData.reduce(
                (total, item) => total + (Number(item.totalRevenue) || 0),
                0
            ),
        [yearlyData]
    );

    useEffect(() => {
        const loadMonthly = async () => {
            setMonthlyLoading(true);
            try {
                const data = await getRevenueByCustomerMonthly(monthlyFilters);
                setMonthlyData(data);
            } catch (error) {
                console.error(
                    "Failed to load customer monthly revenue:",
                    error
                );
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải dữ liệu khách hàng theo tháng";
                toast.error(message);
            } finally {
                setMonthlyLoading(false);
            }
        };

        loadMonthly();
    }, [monthlyFilters]);

    useEffect(() => {
        const loadYearly = async () => {
            setYearlyLoading(true);
            try {
                const data = await getRevenueByCustomerYearly(yearlyFilters);
                setYearlyData(data);
            } catch (error) {
                console.error("Failed to load customer yearly revenue:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải dữ liệu khách hàng theo năm";
                toast.error(message);
            } finally {
                setYearlyLoading(false);
            }
        };

        loadYearly();
    }, [yearlyFilters]);

    const handleMonthlySubmit = (event) => {
        event.preventDefault();
        const parsedMonth = Number(monthlyControl.month);
        const parsedYear = Number(monthlyControl.year);
        const parsedLimit = Number(monthlyControl.limit);

        if (
            !Number.isInteger(parsedMonth) ||
            parsedMonth < 1 ||
            parsedMonth > 12
        ) {
            toast.error("Tháng phải nằm trong khoảng 1 - 12");
            return;
        }
        if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
            toast.error("Năm không hợp lệ");
            return;
        }
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
            toast.error("Số lượng khách hàng phải lớn hơn 0");
            return;
        }

        setMonthlyFilters({
            month: parsedMonth,
            year: parsedYear,
            limit: parsedLimit,
        });
    };

    const handleMonthlyReset = () => {
        const defaults = buildMonthlyDefaults();
        setMonthlyControl(defaults);
        setMonthlyFilters(defaults);
    };

    const handleYearlySubmit = (event) => {
        event.preventDefault();
        const parsedYear = Number(yearlyControl.year);
        const parsedLimit = Number(yearlyControl.limit);

        if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
            toast.error("Năm không hợp lệ");
            return;
        }
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
            toast.error("Số lượng khách hàng phải lớn hơn 0");
            return;
        }

        setYearlyFilters({
            year: parsedYear,
            limit: parsedLimit,
        });
    };

    const handleYearlyReset = () => {
        const defaults = buildYearlyDefaults();
        setYearlyControl(defaults);
        setYearlyFilters(defaults);
    };

    const renderCustomerRows = (data) =>
        data.map((item, index) => (
            <tr
                key={`${item.customerId}-${index}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
            >
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    {index + 1}
                </td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">
                    {item.customerName || "Khách hàng"}
                </td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                    {item.email || "-"}
                </td>
                <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
                    {formatNumber(item.orderCount)}
                </td>
                <td className="px-4 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-300">
                    {formatCurrency(item.totalRevenue)}
                </td>
            </tr>
        ));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Doanh thu theo khách hàng
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Xác định khách hàng mang lại doanh thu cao nhất theo từng
                    tháng và cả năm
                </p>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="size-5" />
                            Top khách hàng theo tháng
                        </CardTitle>
                        <CardDescription>
                            Tổng doanh thu theo khách hàng cho tháng{" "}
                            {monthlyFilters.month}/{monthlyFilters.year}
                        </CardDescription>
                    </div>
                    <form
                        onSubmit={handleMonthlySubmit}
                        className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full sm:w-auto"
                    >
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Tháng
                            </label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={monthlyControl.month}
                                onChange={(event) =>
                                    setMonthlyControl((prev) => ({
                                        ...prev,
                                        month: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Năm
                            </label>
                            <Input
                                type="number"
                                value={monthlyControl.year}
                                onChange={(event) =>
                                    setMonthlyControl((prev) => ({
                                        ...prev,
                                        year: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Số khách
                            </label>
                            <Input
                                type="number"
                                min={1}
                                value={monthlyControl.limit}
                                onChange={(event) =>
                                    setMonthlyControl((prev) => ({
                                        ...prev,
                                        limit: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleMonthlyReset}
                            >
                                Đặt lại
                            </Button>
                            <Button type="submit" disabled={monthlyLoading}>
                                Áp dụng
                            </Button>
                        </div>
                    </form>
                </CardHeader>
                <CardContent className="space-y-4">
                    {monthlyLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Đang tải dữ liệu...
                        </p>
                    ) : monthlyData.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Không có dữ liệu cho tháng này.
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                #
                                            </th>
                                            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                Khách hàng
                                            </th>
                                            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                Email
                                            </th>
                                            <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-300 font-medium">
                                                Đơn hàng
                                            </th>
                                            <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {renderCustomerRows(monthlyData)}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                Tổng doanh thu tháng:{" "}
                                {formatCurrency(totalMonthlyRevenue)}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <UsersIcon className="size-5" />
                            Top khách hàng theo năm
                        </CardTitle>
                        <CardDescription>
                            Tổng doanh thu theo khách hàng trong năm{" "}
                            {yearlyFilters.year}
                        </CardDescription>
                    </div>
                    <form
                        onSubmit={handleYearlySubmit}
                        className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full sm:w-auto"
                    >
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Năm
                            </label>
                            <Input
                                type="number"
                                value={yearlyControl.year}
                                onChange={(event) =>
                                    setYearlyControl((prev) => ({
                                        ...prev,
                                        year: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Số khách
                            </label>
                            <Input
                                type="number"
                                min={1}
                                value={yearlyControl.limit}
                                onChange={(event) =>
                                    setYearlyControl((prev) => ({
                                        ...prev,
                                        limit: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleYearlyReset}
                            >
                                Đặt lại
                            </Button>
                            <Button type="submit" disabled={yearlyLoading}>
                                Áp dụng
                            </Button>
                        </div>
                    </form>
                </CardHeader>
                <CardContent className="space-y-4">
                    {yearlyLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Đang tải dữ liệu...
                        </p>
                    ) : yearlyData.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Không có dữ liệu cho năm này.
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                #
                                            </th>
                                            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                Khách hàng
                                            </th>
                                            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                Email
                                            </th>
                                            <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-300 font-medium">
                                                Đơn hàng
                                            </th>
                                            <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                                Doanh thu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {renderCustomerRows(yearlyData)}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                Tổng doanh thu năm:{" "}
                                {formatCurrency(totalYearlyRevenue)}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 flex items-start gap-3 bg-gray-50/60 dark:bg-gray-800/30">
                <AwardIcon className="size-6 text-amber-500" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Gợi ý khai thác khách hàng thân thiết
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        Sử dụng danh sách khách hàng doanh thu cao để triển khai
                        chương trình chăm sóc, voucher và upsell phù hợp. Các bộ
                        lọc tháng/năm cho phép so sánh xu hướng chi tiêu theo
                        thời gian.
                    </p>
                </div>
            </div>
        </div>
    );
};
