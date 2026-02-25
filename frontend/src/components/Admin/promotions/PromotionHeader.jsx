import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export const PromotionHeader = ({
  totalPromotions,
  loading,
  refreshing,
  onRefresh,
  onAdd,
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-2xl font-semibold">Quản lý khuyến mãi</h1>
      <p className="text-sm text-muted-foreground">
        Tạo, điều chỉnh và theo dõi các chương trình khuyến mãi đang áp dụng.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Tổng: {totalPromotions}</Badge>
      <Button
        className={"cursor-pointer"}
        variant="outline"
        onClick={onRefresh}
        disabled={loading || refreshing}
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
      </Button>
      <Button
        onClick={onAdd}
        className={
          "bg-brand-primary hover:bg-brand-primary-soft cursor-pointer"
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Thêm khuyến mãi
      </Button>
    </div>
  </div>
);
