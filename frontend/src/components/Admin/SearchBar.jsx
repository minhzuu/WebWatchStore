import React from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { LucideSearch } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 flex items-center">
        <LucideSearch className="h-4 w-4 text-gray-400" />
      </span>
      <Input
        type="text"
        placeholder="Search"
        className={cn("w-[388px] h-[38px] rounded-[19px] pl-10")}
      />
    </div>
  );
};
