import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getInventoryDailyReport,
    getInventoryMonthlyReport,
    getInventorySummary,
    getInventoryYearlyReport,
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
    BarChart2 as BarChart2Icon,
    Boxes as BoxesIcon,
    Calendar as CalendarIcon,
    LineChart as LineChartIcon,
    PackageSearch as PackageSearchIcon,
    PackageX as PackageXIcon,
    RefreshCw as RefreshCwIcon,
    TrendingUp as TrendingUpIcon,
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

export const InventoryReportTab = () => {
    const today = new Date();
    const initialEndDate = toIsoDate(today);
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const initialStartDate = toIsoDate(start);
    const currentYear = today.getFullYear();

    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [dailyControl, setDailyControl] = useState({
        startDate: initialStartDate,
        endDate: initialEndDate,
    });
    const [dailyFilters, setDailyFilters] = useState({
        startDate: initialStartDate,
        endDate: initialEndDate,
    });
    const [dailyData, setDailyData] = useState([]);
    const [dailyLoading, setDailyLoading] = useState(false);

    const [monthlyControl, setMonthlyControl] = useState({
        year: currentYear,
    });
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
            const data = await getInventorySummary();
            setSummary(data);
        } catch (error) {
            console.error("Failed to load inventory summary:", error);
            const message =
                error.response?.data?.message ||
                error.message ||
                "Không thể tải báo cáo tồn kho";
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
                const data = await getInventoryDailyReport(dailyFilters);
                setDailyData(data);
            } catch (error) {
                console.error(
                    "Failed to load daily inventory movement:",
                    error
                );
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo tồn kho theo ngày";
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
                const data = await getInventoryMonthlyReport({
                    year: monthlyYear,
                });
                setMonthlyData(data);
            } catch (error) {
                console.error(
                    "Failed to load monthly inventory movement:",
                    error
                );
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo tồn kho theo tháng";
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
                const data = await getInventoryYearlyReport(yearRange);
                setYearlyData(data);
            } catch (error) {
                console.error(
                    "Failed to load yearly inventory movement:",
                    error
                );
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo tồn kho theo năm";
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
                (max, item) => Math.max(max, Number(item.unitsSold) || 0),
                0
            ),
        [monthlyData]
    );

    const yearlyMax = useMemo(
        () =>
            yearlyData.reduce(
                (max, item) => Math.max(max, Number(item.unitsSold) || 0),
                0
            ),
        [yearlyData]
    );

    const summaryCards = useMemo(() => {
        return [
            {
                title: "Mã hàng theo dõi",
                value: formatNumber(summary?.totalTrackedSkus ?? 0),
                icon: BoxesIcon,
                description: `Sản phẩm riêng biệt: ${formatNumber(
                    summary?.distinctProducts ?? 0
                )}`,
            },
            {
                title: "Tồn kho hiện có",
                value: formatNumber(summary?.totalUnitsOnHand ?? 0),
                icon: TrendingUpIcon,
                description: `Trung bình mỗi mã: ${formatNumber(
                    summary?.averageUnitsPerSku ?? 0
                )}`,
            },
            {
                title: "Tồn kho thấp",
                value: formatNumber(summary?.lowStockSkus ?? 0),
                icon: PackageSearchIcon,
                description: "Số mã có tồn kho dưới ngưỡng an toàn",
            },
            {
                title: "Hết hàng",
                value: formatNumber(summary?.outOfStockSkus ?? 0),
                icon: PackageXIcon,
                description: "Số mã cần nhập bổ sung ngay",
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
        setDailyControl({
            startDate: initialStartDate,
            endDate: initialEndDate,
        });
        setDailyFilters({
            startDate: initialStartDate,
            endDate: initialEndDate,
        });
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
                        Báo cáo tồn kho
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Theo dõi tình trạng tồn kho và sản lượng xuất kho theo
                        ngày, tháng, năm.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Cập nhật gần nhất:{" "}
                        {formatDateTimeLabel(summary?.lastUpdatedAt)}
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
                                <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
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
                            <CalendarIcon className="size-5" />
                            Xuất kho theo ngày
                        </CardTitle>
                        <CardDescription>
                            Số lượng sản phẩm đã xuất kho (đơn hoàn tất) trong
                            khoảng thời gian đã chọn
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
                                            Số lượng
                                        </th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                            Sản phẩm
                                        </th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">
                                            Đơn hàng
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
                                                {formatNumber(item.unitsSold)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">
                                                {formatNumber(
                                                    item.distinctProductsSold
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">
                                                {formatNumber(item.ordersCount)}
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
                                    Xuất kho theo tháng
                                </CardTitle>
                                <CardDescription>
                                    Tổng sản lượng đã xuất kho trong từng tháng
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
                                const units = Number(item.unitsSold) || 0;
                                const percent =
                                    monthlyMax > 0
                                        ? Math.round((units / monthlyMax) * 100)
                                        : 0;
                                return (
                                    <div key={item.month} className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>
                                                {monthLabel(item.month)}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(units)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                                            Sản phẩm khác nhau:{" "}
                                            {formatNumber(
                                                item.distinctProductsSold
                                            )}
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
                                    Xuất kho theo năm
                                </CardTitle>
                                <CardDescription>
                                    Sản lượng xuất kho qua các năm trong giai
                                    đoạn lựa chọn
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
                                const units = Number(item.unitsSold) || 0;
                                const percent =
                                    yearlyMax > 0
                                        ? Math.round((units / yearlyMax) * 100)
                                        : 0;
                                return (
                                    <div key={item.year} className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>Năm {item.year}</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(units)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-green-500 dark:bg-green-400"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                                            Sản phẩm khác nhau:{" "}
                                            {formatNumber(
                                                item.distinctProductsSold
                                            )}
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
