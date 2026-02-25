import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerReportTab } from "./components/reports/CustomerReportTab";
import { RevenueReportTab } from "./components/reports/RevenueReportTab";
import { CustomerRevenueReportTab } from "./components/reports/CustomerRevenueReportTab";
import { InventoryReportTab } from "./components/reports/InventoryReportTab";
import { OrderReportTab } from "./components/reports/OrderReportTab";

const tabs = [
    {
        id: "customers",
        label: "Khách hàng",
        description: "Theo dõi tăng trưởng tài khoản và tỷ lệ kích hoạt",
    },
    {
        id: "revenue",
        label: "Doanh thu",
        description: "Phân tích doanh thu theo thời gian",
    },
    {
        id: "customer-revenue",
        label: "Khách hàng trọng điểm",
        description: "Xếp hạng khách hàng mang lại doanh thu cao",
    },
    {
        id: "orders",
        label: "Đơn hàng",
        description: "Theo dõi số lượng đơn hàng và trạng thái xử lý",
    },
    {
        id: "inventory",
        label: "Tồn kho",
        description: "Giám sát tồn kho và sản lượng xuất kho",
    },
];

export const AdminViewReport = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const activeTabDescription = useMemo(() => {
        const current = tabs.find((tab) => tab.id === activeTab);
        return current?.description ?? "";
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Báo cáo & Thống kê
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                    Tổng hợp chỉ số khách hàng, đơn hàng, doanh thu và tồn kho
                    để hỗ trợ quyết định kinh doanh nhanh chóng.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "outline"}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeTabDescription}
            </p>

            <div>
                {activeTab === "customers" && <CustomerReportTab />}
                {activeTab === "revenue" && <RevenueReportTab />}
                {activeTab === "customer-revenue" && (
                    <CustomerRevenueReportTab />
                )}
                {activeTab === "orders" && <OrderReportTab />}
                {activeTab === "inventory" && <InventoryReportTab />}
            </div>
        </div>
    );
};
