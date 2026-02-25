import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const ReviewHeader = ({
    totalReviews,
    loading,
    refreshing,
    onRefresh,
}) => (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <h1 className="text-2xl font-semibold">Quản lý đánh giá</h1>
            <p className="text-sm text-muted-foreground">
                Giám sát phản hồi của khách hàng và xử lý các đánh giá không phù
                hợp.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="secondary">Tổng: {totalReviews}</Badge>
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading || refreshing}
            >
                <RefreshCw className="mr-2 size-4" />
                Làm mới
            </Button>
        </div>
    </div>
);
