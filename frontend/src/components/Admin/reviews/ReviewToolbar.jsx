import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const ReviewToolbar = ({
    searchValue,
    onSearchChange,
    onSubmit,
    ratingValue,
    onRatingChange,
    ratingOptions,
}) => (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={onSubmit} className="flex w-full gap-2 md:max-w-md">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Tìm theo sản phẩm, người dùng hoặc bình luận"
                    className="pl-9"
                />
            </div>
            <Button type="submit">Tìm kiếm</Button>
        </form>

        <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Đánh giá</label>
            <select
                value={ratingValue}
                onChange={onRatingChange}
                className="h-9 rounded-md border px-3 text-sm shadow-sm"
            >
                {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    </div>
);
