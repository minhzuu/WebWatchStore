import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const PaymentHeader = ({
  totalPayments,
  totalAmountLabel,
  loading,
  refreshing,
  onRefresh,
  viewOnly = false,
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-2xl font-semibold">
        {viewOnly ? "Lịch sử thanh toán" : "Quản lý phương thức thanh toán"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {viewOnly
          ? "Xem chi tiết lịch sử giao dịch và theo dõi các khoản thanh toán của khách hàng."
          : "Theo dõi giao dịch, thêm phương thức thanh toán cho đơn hàng và xem chi tiết từng khoản."}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Tổng: {totalPayments}</Badge>
      <Badge variant="outline">Tổng giá trị: {totalAmountLabel}</Badge>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading || refreshing}
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
      </Button>
    </div>
  </div>
);
