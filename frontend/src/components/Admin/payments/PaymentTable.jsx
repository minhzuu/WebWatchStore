import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";

export const PaymentTable = ({
  payments,
  loading,
  selectedPaymentId,
  onSelect,
  onEdit,
  onDelete,
  formatDateTime,
  formatCurrency,
  getMethodLabel,
  viewOnly = false,
}) => (
  <div className="mt-6 overflow-hidden rounded-lg border">
    <table className="min-w-full divide-y divide-border text-sm">
      <thead className="bg-muted/60">
        <tr>
          <th className="px-4 py-3 text-left font-medium">Mã</th>
          <th className="px-4 py-3 text-left font-medium">Phương thức</th>
          <th className="px-4 py-3 text-left font-medium">Giá trị</th>
          <th className="px-4 py-3 text-left font-medium">Đơn hàng</th>
          <th className="px-4 py-3 text-left font-medium">Ngày tạo</th>
          {!viewOnly && (
            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {loading ? (
          <tr>
            <td
              colSpan={viewOnly ? 5 : 6}
              className="py-10 text-center text-muted-foreground"
            >
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-2 text-sm">Đang tải danh sách thanh toán...</p>
            </td>
          </tr>
        ) : payments.length === 0 ? (
          <tr>
            <td
              colSpan={viewOnly ? 5 : 6}
              className="py-10 text-center text-muted-foreground"
            >
              Không có thanh toán nào phù hợp
            </td>
          </tr>
        ) : (
          payments.map((payment) => {
            const isActive = payment.id === selectedPaymentId;
            return (
              <tr
                key={payment.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  isActive ? "bg-muted/40" : ""
                }`}
                onClick={() => onSelect(payment.id)}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  #{payment.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getMethodLabel(payment.method)}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium">#{payment.orderId}</span>
                    <span className="text-xs text-muted-foreground">
                      {payment.orderCustomerName || "--"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div>{formatDateTime(payment.createdAt)}</div>
                  {payment.orderCreatedAt && (
                    <div>
                      Đơn hàng: {formatDateTime(payment.orderCreatedAt)}
                    </div>
                  )}
                </td>
                {!viewOnly && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(payment.id);
                        }}
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(payment);
                        }}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Xóa
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);
