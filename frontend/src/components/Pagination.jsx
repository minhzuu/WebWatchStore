import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { cn } from "@/lib/utils";

export const AdminPagination = ({
  handleNext,
  handlePrev,
  handlePageChange,
  page,
  totalPages,
}) => {
  // Nếu không có trang nào, không hiển thị pagination
  if (totalPages === 0) {
    return null;
  }

  const generatePages = () => {
    const pages = [];

    // Nếu tổng số trang <= 5, hiển thị tất cả
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      // Nếu trang hiện tại > 3, thêm dấu ...
      if (page > 3) {
        pages.push("...");
      }

      // Hiển thị các trang xung quanh trang hiện tại
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }

      // Nếu trang hiện tại < totalPages - 2, thêm dấu ...
      if (page < totalPages - 2) {
        pages.push("...");
      }

      // Luôn hiển thị trang cuối (nếu totalPages > 1)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pagesToShow = generatePages();
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  return (
    <div className="flex justify-center mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={isPrevDisabled ? undefined : handlePrev}
              className={cn(
                "cursor-pointer",
                isPrevDisabled && "pointer-events-none opacity-50"
              )}
            />
          </PaginationItem>

          {pagesToShow.map((p, index) => (
            <PaginationItem key={index}>
              {p === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={p === page}
                  onClick={() => {
                    if (p !== page) handlePageChange(p);
                  }}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={isNextDisabled ? undefined : handleNext}
              className={cn(
                "cursor-pointer",
                isNextDisabled && "pointer-events-none opacity-50"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
