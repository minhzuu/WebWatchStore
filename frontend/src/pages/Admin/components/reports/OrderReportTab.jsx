import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getOrderDailyReport,
    getOrderMonthlyReport,
    getOrderSummary,
    getOrderYearlyReport,
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
import {
    CalendarDays as CalendarDaysIcon,
    ClipboardList as ClipboardListIcon,
    Clock as ClockIcon,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon,
    BarChart2 as BarChart2Icon,
    LineChart as LineChartIcon,
    RefreshCw as RefreshCwIcon,
} from "lucide-react";
import { toast } from "sonner";

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const formatNumber = (value) => {
    const safe = typeof value === "number" ? value : Number(value ?? 0);
    return Number.isFinite(safe) ? safe.toLocaleString("vi-VN") : "0";
};

const formatDateLabel = (dateString) => {
    if (!dateString) {
        return "";
    }
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("vi-VN");
};

const formatDateTimeLabel = (dateTimeString) => {
    if (!dateTimeString) {
        return "—";
    }
    return new Date(dateTimeString).toLocaleString("vi-VN");
};

const monthLabel = (monthNumber) => `Tháng ${monthNumber}`;

export const OrderReportTab = () => {
    const today = new Date();
    const end = toIsoDate(today);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    const start = toIsoDate(startDate);
    const currentYear = today.getFullYear();

    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [dailyControl, setDailyControl] = useState({
        startDate: start,
        endDate: end,
    });
    const [dailyFilters, setDailyFilters] = useState({
        startDate: start,
        endDate: end,
    });
    const [dailyData, setDailyData] = useState([]);
    const [dailyLoading, setDailyLoading] = useState(false);

    const [monthlyControl, setMonthlyControl] = useState({ year: currentYear });
    const [monthlyYear, setMonthlyYear] = useState(currentYear);
    const [monthlyData, setMonthlyData] = useState([]);
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const [yearlyControl, setYearlyControl] = useState({
        startYear: currentYear - 4,
        endYear: currentYear,
    });
    const [yearRange, setYearRange] = useState({
        startYear: currentYear - 4,
        endYear: currentYear,
    });
    const [yearlyData, setYearlyData] = useState([]);
    const [yearlyLoading, setYearlyLoading] = useState(false);

    const refreshSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const data = await getOrderSummary();
            setSummary(data);
        } catch (error) {
            console.error("Failed to load order summary:", error);
            const message =
                error.response?.data?.message ||
                error.message ||
                "Không thể tải thống kê đơn hàng";
            toast.error(message);
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSummary();
    }, [refreshSummary]);

    useEffect(() => {
        const loadDaily = async () => {
            setDailyLoading(true);
            try {
                const data = await getOrderDailyReport(dailyFilters);
                setDailyData(data);
            } catch (error) {
                console.error("Failed to load daily order report:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo đơn hàng theo ngày";
                toast.error(message);
            } finally {
                setDailyLoading(false);
            }
        };

        loadDaily();
    }, [dailyFilters]);

    useEffect(() => {
        const loadMonthly = async () => {
            setMonthlyLoading(true);
            try {
                const data = await getOrderMonthlyReport({ year: monthlyYear });
                setMonthlyData(data);
            } catch (error) {
                console.error("Failed to load monthly order report:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo đơn hàng theo tháng";
                toast.error(message);
            } finally {
                setMonthlyLoading(false);
            }
        };

        loadMonthly();
    }, [monthlyYear]);

    useEffect(() => {
        const loadYearly = async () => {
            setYearlyLoading(true);
            try {
                const data = await getOrderYearlyReport(yearRange);
                setYearlyData(data);
            } catch (error) {
                console.error("Failed to load yearly order report:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo đơn hàng theo năm";
                toast.error(message);
            } finally {
                setYearlyLoading(false);
            }
        };

        loadYearly();
    }, [yearRange]);

    const monthlyMax = useMemo(
        () =>
            monthlyData.reduce(
                (max, item) => Math.max(max, Number(item.totalOrders) || 0),
                0
            ),
        [monthlyData]
    );

    const yearlyMax = useMemo(
        () =>
            yearlyData.reduce(
                (max, item) => Math.max(max, Number(item.totalOrders) || 0),
                0
            ),
        [yearlyData]
    );

    const summaryCards = useMemo(() => {
        return [
            {
                title: "Tổng đơn hàng",
                value: formatNumber(summary?.totalOrders ?? 0),
                icon: ClipboardListIcon,
                description: `Hoàn tất: ${formatNumber(
                    summary?.fulfilledOrders ?? 0
                )}`,
            },
            {
                title: "Đơn hàng tháng này",
                value: formatNumber(summary?.ordersThisMonth ?? 0),
                icon: CalendarDaysIcon,
                description: `Hôm nay: ${formatNumber(
                    summary?.ordersToday ?? 0
                )}`,
            },
            {
                title: "Đang xử lý",
                value: formatNumber(summary?.pendingOrders ?? 0),
                icon: ClockIcon,
                description: "Đơn hàng ở trạng thái chờ xử lý",
            },
            {
                title: "Đã hủy",
                value: formatNumber(summary?.cancelledOrders ?? 0),
                icon: XCircleIcon,
                description: "Đơn hàng bị hủy hoặc từ chối",
            },
        ];
    }, [summary]);

    const handleDailyFilterSubmit = (event) => {
        event.preventDefault();
        if (!dailyControl.startDate || !dailyControl.endDate) {
            toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc");
            return;
        }
        if (new Date(dailyControl.startDate) > new Date(dailyControl.endDate)) {
            toast.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
            return;
        }
        setDailyFilters({ ...dailyControl });
    };

    const handleDailyReset = () => {
        setDailyControl({ startDate: start, endDate: end });
        setDailyFilters({ startDate: start, endDate: end });
    };

    const handleMonthlySubmit = (event) => {
        event.preventDefault();
        const parsedYear = Number(monthlyControl.year);
        if (!Number.isFinite(parsedYear) || parsedYear < 1900) {
            toast.error("Năm không hợp lệ");
            return;
        }
        setMonthlyYear(parsedYear);
    };

    const handleYearlySubmit = (event) => {
        event.preventDefault();
        const startYear = Number(yearlyControl.startYear);
        const endYear = Number(yearlyControl.endYear);
        if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
            toast.error("Vui lòng nhập năm hợp lệ");
            return;
        }
        if (startYear > endYear) {
            toast.error("Năm bắt đầu phải nhỏ hơn hoặc bằng năm kết thúc");
            return;
        }
        setYearRange({ startYear, endYear });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Báo cáo đơn hàng
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Giám sát khối lượng đơn hàng và trạng thái xử lý theo
                        thời gian.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Đơn hàng gần nhất:{" "}
                        {formatDateTimeLabel(summary?.lastOrderAt)}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={refreshSummary}
                    disabled={summaryLoading}
                >
                    <RefreshCwIcon className="mr-2 size-4" />
                    Làm mới tổng quan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={card.title}
                            className="border-gray-200 dark:border-gray-700"
                        >
                            <CardHeader className="flex flex-row items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base text-gray-700 dark:text-gray-300">
                                        {card.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {card.description}
                                    </CardDescription>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                                    <Icon className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {summaryLoading ? "..." : card.value}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDaysIcon className="size-5" />
                            Đơn hàng theo ngày
                        </CardTitle>
                        <CardDescription>
                            Phân bổ số đơn hàng theo trạng thái trong khoảng
                            thời gian lựa chọn
                        </CardDescription>
                    </div>
                    <form
                        onSubmit={handleDailyFilterSubmit}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full sm:w-auto"
                    >
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Từ ngày
                            </label>
                            <Input
                                type="date"
                                value={dailyControl.startDate}
                                onChange={(event) =>
                                    setDailyControl((prev) => ({
                                        ...prev,
                                        startDate: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Đến ngày
                            </label>
                            <Input
                                type="date"
                                value={dailyControl.endDate}
                                onChange={(event) =>
                                    setDailyControl((prev) => ({
                                        ...prev,
                                        endDate: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end gap-2 sm:col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDailyReset}
                            >
                                Đặt lại
                            </Button>
                            <Button type="submit" disabled={dailyLoading}>
                                Áp dụng
                            </Button>
                        </div>
                    </form>
                </CardHeader>
                <CardContent className="space-y-4">
                    {dailyLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Đang tải dữ liệu...
                        </p>
                    ) : dailyData.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Không có dữ liệu trong khoảng thời gian đã chọn.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                            Ngày
                                        </th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                            Tổng đơn
                                        </th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                            Hoàn tất
                                        </th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                            Đang xử lý
                                        </th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                            Đã hủy
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {dailyData.map((item) => (
                                        <tr
                                            key={item.date}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                        >
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                                {formatDateLabel(item.date)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(item.totalOrders)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                                                {formatNumber(
                                                    item.fulfilledOrders
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right text-blue-600 dark:text-blue-300">
                                                {formatNumber(
                                                    item.pendingOrders
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right text-rose-600 dark:text-rose-300">
                                                {formatNumber(
                                                    item.cancelledOrders
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart2Icon className="size-5" />
                                    Đơn hàng theo tháng
                                </CardTitle>
                                <CardDescription>
                                    Tổng số đơn và trạng thái trong từng tháng
                                    của năm
                                </CardDescription>
                            </div>
                            <form
                                className="flex items-end gap-2"
                                onSubmit={handleMonthlySubmit}
                            >
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Năm
                                    </label>
                                    <Input
                                        type="number"
                                        value={monthlyControl.year}
                                        onChange={(event) =>
                                            setMonthlyControl({
                                                year: event.target.value,
                                            })
                                        }
                                        className="w-28"
                                    />
                                </div>
                                <Button type="submit" disabled={monthlyLoading}>
                                    Áp dụng
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {monthlyLoading ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Đang tải dữ liệu...
                            </p>
                        ) : (
                            monthlyData.map((item) => {
                                const total = Number(item.totalOrders) || 0;
                                const percent =
                                    monthlyMax > 0
                                        ? Math.round((total / monthlyMax) * 100)
                                        : 0;
                                return (
                                    <div key={item.month} className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>
                                                {monthLabel(item.month)}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(total)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 flex justify-between">
                                            <span className="text-emerald-500 dark:text-emerald-300 flex items-center gap-1">
                                                <CheckCircleIcon className="size-3" />
                                                {formatNumber(
                                                    item.fulfilledOrders
                                                )}
                                            </span>
                                            <span className="text-blue-500 dark:text-blue-300 flex items-center gap-1">
                                                <ClockIcon className="size-3" />
                                                {formatNumber(
                                                    item.pendingOrders
                                                )}
                                            </span>
                                            <span className="text-rose-500 dark:text-rose-300 flex items-center gap-1">
                                                <XCircleIcon className="size-3" />
                                                {formatNumber(
                                                    item.cancelledOrders
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <LineChartIcon className="size-5" />
                                    Đơn hàng theo năm
                                </CardTitle>
                                <CardDescription>
                                    Xu hướng tổng số đơn hàng trong giai đoạn
                                    lựa chọn
                                </CardDescription>
                            </div>
                            <form
                                className="grid grid-cols-2 gap-2"
                                onSubmit={handleYearlySubmit}
                            >
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Từ năm
                                    </label>
                                    <Input
                                        type="number"
                                        value={yearlyControl.startYear}
                                        onChange={(event) =>
                                            setYearlyControl((prev) => ({
                                                ...prev,
                                                startYear: event.target.value,
                                            }))
                                        }
                                        className="w-24"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Đến năm
                                    </label>
                                    <Input
                                        type="number"
                                        value={yearlyControl.endYear}
                                        onChange={(event) =>
                                            setYearlyControl((prev) => ({
                                                ...prev,
                                                endYear: event.target.value,
                                            }))
                                        }
                                        className="w-24"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={yearlyLoading}
                                    >
                                        Áp dụng
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {yearlyLoading ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Đang tải dữ liệu...
                            </p>
                        ) : (
                            yearlyData.map((item) => {
                                const total = Number(item.totalOrders) || 0;
                                const percent =
                                    yearlyMax > 0
                                        ? Math.round((total / yearlyMax) * 100)
                                        : 0;
                                return (
                                    <div key={item.year} className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>Năm {item.year}</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(total)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-purple-500 dark:bg-purple-400"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 flex justify-between">
                                            <span className="text-emerald-500 dark:text-emerald-300 flex items-center gap-1">
                                                <CheckCircleIcon className="size-3" />
                                                {formatNumber(
                                                    item.fulfilledOrders
                                                )}
                                            </span>
                                            <span className="text-blue-500 dark:text-blue-300 flex items-center gap-1">
                                                <ClockIcon className="size-3" />
                                                {formatNumber(
                                                    item.pendingOrders
                                                )}
                                            </span>
                                            <span className="text-rose-500 dark:text-rose-300 flex items-center gap-1">
                                                <XCircleIcon className="size-3" />
                                                {formatNumber(
                                                    item.cancelledOrders
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
