import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, CreditCard, Pencil, Trash2, User } from "lucide-react";

export const PaymentDetailCard = ({
  payment,
  getMethodLabel,
  formatCurrency,
  formatDateTime,
  onEdit,
  onDelete,
  viewOnly = false,
}) => (
  <Card className="h-fit p-6">
    <h2 className="text-lg font-semibold">Chi tiết thanh toán</h2>
    {!payment ? (
      <div className="mt-6 text-sm text-muted-foreground">
        Chọn một bản ghi thanh toán trong danh sách để xem chi tiết.
      </div>
    ) : (
      <div className="mt-6 space-y-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mã thanh toán</p>
              <p className="text-lg font-semibold text-foreground">
                #{payment.id}
              </p>
            </div>
            <Badge variant="outline" className="text-base font-semibold">
              {formatCurrency(payment.amount)}
            </Badge>
          </div>

          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Phương thức: {getMethodLabel(payment.method)}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Tạo lúc: {formatDateTime(payment.createdAt)}
            </div>
            {payment.orderCreatedAt && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Đơn hàng: {formatDateTime(payment.orderCreatedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Thông tin đơn hàng
          </p>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Khách hàng: {payment.orderCustomerName || "--"}
            </div>
            <div>Mã đơn: #{payment.orderId}</div>
          </div>
        </div>

        {!viewOnly && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onEdit(payment.id)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(payment)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa thanh toán
            </Button>
          </div>
        )}
      </div>
    )}
  </Card>
);
