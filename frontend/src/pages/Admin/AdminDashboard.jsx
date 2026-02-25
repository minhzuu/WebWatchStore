import React, { useEffect, useState } from "react";
import {
    getRevenueSummary,
    getOrderSummary,
    getCustomerSummary,
    getInventorySummary,
    getRevenueDailyReport,
    getOrderDailyReport,
    getRevenueMonthlyReport,
} from "@/api/reportAPI";
import {
    ShoppingCart,
    DollarSign,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingBag,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: null,
        orders: null,
        customers: null,
        inventory: null,
    });
    const [revenueChart, setRevenueChart] = useState([]);
    const [orderChart, setOrderChart] = useState([]);
    const [monthlyChart, setMonthlyChart] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Lấy các thống kê tổng quan
            const [revenueSummary, orderSummary, customerSummary, inventorySummary] = 
                await Promise.all([
                    getRevenueSummary(),
                    getOrderSummary(),
                    getCustomerSummary(),
                    getInventorySummary(),
                ]);

            // Lấy dữ liệu 30 ngày gần nhất
            const endDate = new Date().toISOString().split("T")[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

            const [revenueDaily, orderDaily, revenueMonthly] = await Promise.all([
                getRevenueDailyReport({ startDate, endDate }),
                getOrderDailyReport({ startDate, endDate }),
                getRevenueMonthlyReport({ year: new Date().getFullYear() }),
            ]);

            setStats({
                revenue: revenueSummary,
                orders: orderSummary,
                customers: customerSummary,
                inventory: inventorySummary,
            });

            setRevenueChart(revenueDaily);
            setOrderChart(orderDaily);
            setMonthlyChart(revenueMonthly);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value || 0);
    };

    const getPercentageChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(2);
    };

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgColor }) => (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                {trend && (
                    <div className="flex items-center mt-2">
                        <div className={`flex items-center text-sm font-medium ${
                            trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                            {trend === "up" ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            {trendValue}%
                        </div>
                        <span className="text-sm text-gray-500 ml-2">so với tháng trước</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes("Doanh thu") ? formatCurrency(entry.value) : formatNumber(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Tổng quan về hoạt động kinh doanh
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Cập nhật: {new Date().toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng Doanh Thu"
                    value={formatCurrency(stats.revenue?.totalRevenue)}
                    icon={DollarSign}
                    trend={
                        getPercentageChange(
                            stats.revenue?.currentMonthRevenue,
                            stats.revenue?.lastMonthRevenue
                        ) >= 0
                            ? "up"
                            : "down"
                    }
                    trendValue={Math.abs(
                        getPercentageChange(
                            stats.revenue?.currentMonthRevenue,
                            stats.revenue?.lastMonthRevenue
                        )
                    )}
                    color="text-green-600"
                    bgColor="bg-green-100"
                />
                <StatCard
                    title="Tổng Đơn Hàng"
                    value={formatNumber(stats.orders?.totalOrders)}
                    icon={ShoppingCart}
                    trend={
                        getPercentageChange(
                            stats.orders?.currentMonthOrders,
                            stats.orders?.lastMonthOrders
                        ) >= 0
                            ? "up"
                            : "down"
                    }
                    trendValue={Math.abs(
                        getPercentageChange(
                            stats.orders?.currentMonthOrders,
                            stats.orders?.lastMonthOrders
                        )
                    )}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                />
                <StatCard
                    title="Khách Hàng"
                    value={formatNumber(stats.customers?.totalCustomers)}
                    icon={Users}
                    trend={
                        getPercentageChange(
                            stats.customers?.currentMonthCustomers,
                            stats.customers?.lastMonthCustomers
                        ) >= 0
                            ? "up"
                            : "down"
                    }
                    trendValue={Math.abs(
                        getPercentageChange(
                            stats.customers?.currentMonthCustomers,
                            stats.customers?.lastMonthCustomers
                        )
                    )}
                    color="text-purple-600"
                    bgColor="bg-purple-100"
                />
                <StatCard
                    title="Tồn Kho"
                    value={formatNumber(stats.inventory?.totalQuantity)}
                    icon={Package}
                    color="text-orange-600"
                    bgColor="bg-orange-100"
                />
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Doanh Thu 30 Ngày Gần Nhất
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueChart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)"
                                    name="Doanh thu"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Orders Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                            Đơn Hàng 30 Ngày Gần Nhất
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={orderChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="totalOrders" 
                                    fill="#3b82f6" 
                                    radius={[8, 8, 0, 0]}
                                    name="Đơn hàng"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Doanh Thu Theo Tháng ({new Date().getFullYear()})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={monthlyChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="month" 
                                tickFormatter={(value) => `T${value}`}
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Doanh thu"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bottom Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Order Status */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                            Trạng Thái Đơn Hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-yellow-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Chờ Xác Nhận</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(stats.orders?.pendingOrders)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Đang Xử Lý</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(stats.orders?.processingOrders)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Đã Giao</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatNumber(stats.orders?.deliveredOrders)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-center gap-3">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Đã Hủy</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatNumber(stats.orders?.cancelledOrders)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Status with Pie Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-orange-600" />
                            Tình Trạng Kho Hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Còn hàng', value: stats.inventory?.inStockProducts || 0 },
                                            { name: 'Hết hàng', value: stats.inventory?.outOfStockProducts || 0 }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-gray-600 mb-1">Tổng SP</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatNumber(stats.inventory?.totalProducts)}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-xs text-gray-600 mb-1">Còn Hàng</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatNumber(stats.inventory?.inStockProducts)}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                    <p className="text-xs text-gray-600 mb-1">Hết Hàng</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {formatNumber(stats.inventory?.outOfStockProducts)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Tổng Số Lượng Tồn Kho</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatNumber(stats.inventory?.totalQuantity)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-sm bg-linear-to-br from-green-50 to-white border-green-100">
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-gray-700">
                            Doanh Thu Tháng Này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {formatCurrency(stats.revenue?.currentMonthRevenue)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tháng trước:</span>
                            <span className="font-semibold text-gray-700">
                                {formatCurrency(stats.revenue?.lastMonthRevenue)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-linear-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-gray-700">
                            Đơn Hàng Tháng Này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatNumber(stats.orders?.currentMonthOrders)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tháng trước:</span>
                            <span className="font-semibold text-gray-700">
                                {formatNumber(stats.orders?.lastMonthOrders)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-linear-to-br from-purple-50 to-white border-purple-100">
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-gray-700">
                            Giá Trị Đơn Trung Bình
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {formatCurrency(stats.orders?.averageOrderValue)}
                        </div>
                        <div className="text-sm text-gray-600">
                            Trung bình mỗi đơn hàng
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
