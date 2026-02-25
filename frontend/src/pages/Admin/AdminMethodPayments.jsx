import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getPayments, getPaymentById } from "@/api/paymentAPI";
import { PaymentHeader } from "@/components/Admin/payments/PaymentHeader";
import { PaymentToolbar } from "@/components/Admin/payments/PaymentToolbar";
import { PaymentTable } from "@/components/Admin/payments/PaymentTable";
import { PaymentDetailCard } from "@/components/Admin/payments/PaymentDetailCard";
import { getPaymentMethodLabel } from "@/lib/payment";
import { AdminPagination } from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

/**
 * Admin Payment Transaction History - View Only
 * Displays payment transaction history from orders
 * Shows completed payments with order details
 */
export const AdminMethodPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPayments = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await getPayments({
          search: searchKeyword || undefined,
        });
        const list = Array.isArray(data) ? data : [];
        setPayments(list);
        setCurrentPage(1); // Reset to first page on new data
      } catch (error) {
        console.error("Failed to load payments", error);
        const message =
          error.response?.data?.message ||
          error.response?.data?.data ||
          "Không thể tải danh sách thanh toán";
        toast.error(message);
        setPayments([]);
        setSelectedPaymentId(null);
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [searchKeyword]
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalAmountLabel = useMemo(() => {
    const total = payments.reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0
    );
    return formatCurrency(total);
  }, [payments]);

  // Pagination logic
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = payments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectedPayment = useMemo(
    () => payments.find((item) => item.id === selectedPaymentId) || null,
    [payments, selectedPaymentId]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
  };

  const handleRefresh = () => {
    fetchPayments({ silent: true });
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPaymentId(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      <PaymentHeader
        totalPayments={payments.length}
        totalAmountLabel={totalAmountLabel}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        viewOnly={true}
      />

      <Card className="p-6">
        <PaymentToolbar
          searchValue={searchInput}
          onSearchChange={(event) => setSearchInput(event.target.value)}
          onSubmit={handleSearchSubmit}
        />

        <PaymentTable
          payments={paginatedPayments}
          loading={loading}
          selectedPaymentId={selectedPaymentId}
          onSelect={handleSelectPayment}
          formatDateTime={formatDateTime}
          formatCurrency={formatCurrency}
          getMethodLabel={getPaymentMethodLabel}
          viewOnly={true}
        />

        {!loading && payments.length > 0 && (
          <AdminPagination
            page={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            handlePrev={handlePrev}
            handleNext={handleNext}
          />
        )}
      </Card>

      {/* Payment Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết về giao dịch thanh toán
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mã thanh toán
                    </p>
                    <p className="text-lg font-semibold">
                      #{selectedPayment.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Số tiền</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span className="font-medium">
                    {getPaymentMethodLabel(selectedPayment.method)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-medium">
                    #{selectedPayment.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="font-medium">
                    {selectedPayment.orderCustomerName || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Thời gian thanh toán:
                  </span>
                  <span className="font-medium">
                    {formatDateTime(selectedPayment.createdAt)}
                  </span>
                </div>
                {selectedPayment.orderCreatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Thời gian đặt hàng:
                    </span>
                    <span className="font-medium">
                      {formatDateTime(selectedPayment.orderCreatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
