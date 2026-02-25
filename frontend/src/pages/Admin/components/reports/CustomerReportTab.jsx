import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getCustomerDailyReport,
    getCustomerMonthlyReport,
    getCustomerSummary,
    getCustomerYearlyReport,
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
    BarChart2Icon,
    CalendarIcon,
    LineChartIcon,
    RefreshCwIcon,
    TrendingUpIcon,
    UserCheckIcon,
    UserPlusIcon,
    UsersIcon,
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

const monthLabel = (monthNumber) => `Tháng ${monthNumber}`;

export const CustomerReportTab = () => {
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

    const monthlyMax = useMemo(
        () =>
            monthlyData.reduce(
                (max, item) => Math.max(max, Number(item.newCustomers) || 0),
                0
            ),
        [monthlyData]
    );

    const yearlyMax = useMemo(
        () =>
            yearlyData.reduce(
                (max, item) => Math.max(max, Number(item.newCustomers) || 0),
                0
            ),
        [yearlyData]
    );

    const refreshSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const data = await getCustomerSummary();
            setSummary(data);
        } catch (error) {
            console.error("Failed to load customer summary:", error);
            const message =
                error.response?.data?.message ||
                error.message ||
                "Không thể tải báo cáo khách hàng";
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
                const data = await getCustomerDailyReport(dailyFilters);
                setDailyData(data);
            } catch (error) {
                console.error("Failed to load daily customer report:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo theo ngày";
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
                const data = await getCustomerMonthlyReport({
                    year: monthlyYear,
                });
                setMonthlyData(data);
            } catch (error) {
                console.error("Failed to load monthly customer report:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo theo tháng";
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
                const data = await getCustomerYearlyReport(yearRange);
                setYearlyData(data);
            } catch (error) {
                console.error("Failed to load yearly customer report:", error);
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tải báo cáo theo năm";
                toast.error(message);
            } finally {
                setYearlyLoading(false);
            }
        };

        loadYearly();
    }, [yearRange]);

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

    const summaryCards = [
        {
            title: "Tổng khách hàng",
            value: summaryLoading
                ? "..."
                : formatNumber(summary?.totalCustomers ?? 0),
            icon: UsersIcon,
            description: "Tổng số tài khoản hiện có",
        },
        {
            title: "Đang hoạt động",
            value: summaryLoading
                ? "..."
                : formatNumber(summary?.activeCustomers ?? 0),
            icon: UserCheckIcon,
            description: "Tài khoản đang mở",
        },
        {
            title: "Khóa / Tạm ngưng",
            value: summaryLoading
                ? "..."
                : formatNumber(summary?.inactiveCustomers ?? 0),
            icon: BarChart2Icon,
            description: "Tài khoản bị vô hiệu",
        },
        {
            title: "Khách mới (tháng này)",
            value: summaryLoading
                ? "..."
                : formatNumber(summary?.newCustomersThisMonth ?? 0),
            icon: UserPlusIcon,
            description: `Hôm nay: ${formatNumber(
                summary?.newCustomersToday ?? 0
            )}`,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Báo cáo khách hàng
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Theo dõi lượng khách hàng mới theo ngày, tháng và năm
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
                                    {card.value}
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
                            Thống kê khách hàng theo ngày
                        </CardTitle>
                        <CardDescription>
                            Số lượng tài khoản tạo mới trong khoảng ngày được
                            chọn
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
                            Không có dữ liệu cho khoảng thời gian này.
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
                                            Khách hàng mới
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
                                                {formatNumber(
                                                    item.newCustomers
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
                                    <TrendingUpIcon className="size-5" />
                                    Khách hàng mới theo tháng
                                </CardTitle>
                                <CardDescription>
                                    Số lượng tài khoản mới trong từng tháng của
                                    năm
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
                                const newCustomers =
                                    Number(item.newCustomers) || 0;
                                const percent =
                                    monthlyMax > 0
                                        ? Math.round(
                                              (newCustomers / monthlyMax) * 100
                                          )
                                        : 0;
                                return (
                                    <div key={item.month} className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>
                                                {monthLabel(item.month)}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(newCustomers)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
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
                                    Khách hàng mới theo năm
                                </CardTitle>
                                <CardDescription>
                                    Xu hướng khách hàng mới theo giai đoạn
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
                                const newCustomers =
                                    Number(item.newCustomers) || 0;
                                const percent =
                                    yearlyMax > 0
                                        ? Math.round(
                                              (newCustomers / yearlyMax) * 100
                                          )
                                        : 0;
                                return (
                                    <div key={item.year} className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                            <span>Năm {item.year}</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatNumber(newCustomers)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-full rounded-full bg-green-500 dark:bg-green-400"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
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
