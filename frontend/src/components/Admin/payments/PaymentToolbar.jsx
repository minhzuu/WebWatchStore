import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const PaymentToolbar = ({ searchValue, onSearchChange, onSubmit }) => (
  <form
    onSubmit={onSubmit}
    className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between"
  >
    <div className="relative w-full md:max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Tìm theo mã hoặc khách hàng"
        className="pl-9"
      />
    </div>
    <Button type="submit" className="md:w-auto">
      Tìm kiếm
    </Button>
  </form>
);
