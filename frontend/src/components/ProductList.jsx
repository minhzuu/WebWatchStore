import React, { useEffect, useState, useCallback, useRef } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "@/api/productAPI";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function ProductList({
  category = null,
  brand = null,
  sortBy = "id",
  order = "desc",
  pageSize = 12,
  title = "Sản Phẩm",
  description = "Khám phá bộ sưu tập đồng hồ cao cấp",
  onAddToCart,
  status = "",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const listRef = useRef(null);

  // Reset to page 0 when category, brand, sortBy, or order changes
  useEffect(() => {
    setCurrentPage(0);
  }, [category, brand, sortBy, order, status]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        order: order,
      };

      if (category?.name) {
        params.category = category.name;
      }

      if (brand?.name) {
        params.brand = brand.name;
      }

      if (status) {
        params.status = status;
      }

      const response = await getProducts(params);
      const data = response.data || response;

      if (data && data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, category, brand, sortBy, order, pageSize, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      if (listRef.current) {
        try {
          listRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } catch {
          window.scrollTo({ behavior: "smooth", top: 0 });
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg mx-4">
        <p className="text-gray-500 text-lg">
          Không tìm thấy sản phẩm nào phù hợp
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Vui lòng thử lại với bộ lọc khác
        </p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="px-4 md:px-0">
      {/* Section Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
          {brand ? `Đồng hồ ${brand.name}` : category ? category.name : title}
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
          {description}
        </p>
      </div>

      {/* Products Grid */}
      {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Pagination Info and Controls */}
      {totalPages > 0 && (
        <div className="mt-10 md:mt-12 space-y-6 border-t border-gray-100 pt-8">
          {/* Pagination Info */}
          <div className="text-center text-xs md:text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-semibold text-gray-900">
              {currentPage * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-gray-900">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold text-gray-900">{totalElements}</span>{" "}
            sản phẩm
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 w-full">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center justify-center h-10 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline ml-1 text-sm font-medium">
                    Trước
                  </span>
                </button>

                {/* Page Numbers - Mobile Friendly */}
                <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-1 scrollbar-hide">
                  {[...Array(totalPages)].map((_, index) => {
                    // Logic hiển thị số trang thông minh
                    const isFirst = index === 0;
                    const isLast = index === totalPages - 1;
                    const isCurrent = index === currentPage;
                    const isNear = Math.abs(index - currentPage) <= 1; // Chỉ hiện trang lân cận +-1
                    const showEllipsis = !isFirst && !isLast && !isNear;

                    // Trên mobile, chỉ hiện trang hiện tại và lân cận
                    const isMobileView =
                      typeof window !== "undefined" && window.innerWidth < 640;
                    if (
                      isMobileView &&
                      !isCurrent &&
                      !isNear &&
                      !isFirst &&
                      !isLast
                    )
                      return null;

                    if (showEllipsis && !isMobileView) {
                      // Logic dấu ... cho desktop
                      if (
                        index === currentPage - 2 ||
                        index === currentPage + 2
                      ) {
                        return (
                          <span
                            key={`el-${index}`}
                            className="px-1 py-2 text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`min-w-9 h-10 px-3 rounded-lg border text-sm font-medium transition-all ${
                          currentPage === index
                            ? "bg-brand-primary text-white border-brand-primary shadow-md transform scale-105"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center justify-center h-10 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline mr-1 text-sm font-medium">
                    Sau
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
