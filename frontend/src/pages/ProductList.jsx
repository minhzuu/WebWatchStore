import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { parseStoredUser } from "@/utils/storage";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import BannerDisplay from "@/components/BannerDisplay";
import { getProducts } from "@/api/productAPI";
import { getCategories } from "@/api/categoryAPI";
import { getBrands } from "@/api/brandAPI";
import { addToCart } from "@/api/cartAPI";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category");
  const brandName = searchParams.get("brand");
  const searchQuery = searchParams.get("name");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12);

  // Filter states
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const sortOptions = [
    {
      id: "popular",
      label: "Phổ biến",
      icon: Star,
      sortBy: "id",
      order: "desc",
    },
    {
      id: "newest",
      label: "Mới nhất",
      icon: Clock,
      sortBy: "createdAt",
      order: "desc",
    },
    {
      id: "priceAsc",
      label: "Giá tăng",
      icon: TrendingUp,
      sortBy: "price",
      order: "asc",
    },
    {
      id: "priceDesc",
      label: "Giá giảm",
      icon: TrendingDown,
      sortBy: "price",
      order: "desc",
    },
  ];

  const [activeSortId, setActiveSortId] = useState("popular");

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (categoryId) {
      const category = categories.find((c) => c.id === parseInt(categoryId));
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, categories]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, categoryId, brandName, searchQuery, sortBy, order]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const categoriesArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      // Chỉ lấy categories có status ACTIVE
      const activeCategories = categoriesArray.filter(
        (cat) => cat.status === "ACTIVE"
      );
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const brandsData = await getBrands();
      const brandsArray = Array.isArray(brandsData)
        ? brandsData
        : Array.isArray(brandsData.data)
        ? brandsData.data
        : [];
      const activeBrands = brandsArray.filter((b) => b.status === "ACTIVE");
      setBrands(activeBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        order: order,
      };

      if (categoryId) {
        const category = categories.find((c) => c.id === parseInt(categoryId));
        if (category?.name) params.category = category.name;
      }

      if (brandName) params.brand = brandName;
      if (searchQuery) params.name = searchQuery;

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
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
      return;
    }
    const user = parseStoredUser();
    const maxStock = Number.isFinite(product?.stockQuantity)
      ? product.stockQuantity
      : Number.isFinite(product?.stock)
      ? product.stock
      : Infinity;

    if (maxStock <= 0) {
      toast.error("Sản phẩm tạm hết hàng");
      return;
    }
    try {
      const cart = await getCart(user.id);
      const existing = (cart.items || []).find(
        (i) => i.productId === product.id || i.id === product.id
      );
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + 1 > maxStock) {
        toast.error("Không thể thêm vượt quá tồn kho");
        return;
      }
    } catch (e) {
      // ignore
    }

    try {
      await addToCart(user.id, product.id, 1);
      toast.success("Đã thêm vào giỏ hàng");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      const msg =
        error.response?.data?.message || "Không thể thêm vào giỏ hàng";
      toast.error(msg);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortChange = (option) => {
    setSortBy(option.sortBy);
    setOrder(option.order);
    setActiveSortId(option.id);
    setCurrentPage(0);
    setShowMobileFilters(false);
  };

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    navigate(`/products?${params.toString()}`);
    setCurrentPage(0);
    setShowMobileFilters(false);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    navigate(`/products?${params.toString()}`);
    setCurrentPage(0);
    setSortBy("id");
    setOrder("desc");
    setActiveSortId("popular");
  };

  // --- Mobile Filter Sidebar Content ---
  const MobileFilterContent = () => (
    <div className="space-y-8">
      {/* Mobile Sort */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Sắp xếp
        </h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSortId === option.id
                  ? "bg-brand-primary/10 text-brand-primary font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <option.icon size={16} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Category */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Danh mục
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters("category", null)}
            className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
              !categoryId
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFilters("category", category.id)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                categoryId === category.id.toString()
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-primary"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Brand */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Thương hiệu
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters("brand", null)}
            className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
              !brandName
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Tất cả
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => updateFilters("brand", brand.name)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                brandName === brand.name
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-primary"
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumb
        items={(() => {
          const items = [{ label: "Sản phẩm", href: "/products" }];
          if (selectedCategory) {
            items.push({
              label: selectedCategory.name,
              href: `/products?category=${selectedCategory.id}`,
            });
          }
          if (brandName) items.push({ label: brandName, isCurrent: true });
          else if (searchQuery)
            items.push({ label: `Tìm kiếm: ${searchQuery}`, isCurrent: true });
          else if (!selectedCategory) items[0].isCurrent = true;
          else if (!brandName && selectedCategory)
            items[items.length - 1].isCurrent = true;
          return items;
        })()}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Product Page Banners */}
        <div className="mb-6">
          <BannerDisplay position="PRODUCT_PAGE" />
        </div>

        {/* Page Title & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {brandName
                ? `Thương hiệu ${brandName}`
                : selectedCategory
                ? selectedCategory.name
                : searchQuery
                ? `Tìm kiếm: "${searchQuery}"`
                : "Tất cả sản phẩm"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Hiển thị {totalElements} kết quả
            </p>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <SlidersHorizontal size={18} />
            Bộ lọc & Sắp xếp
          </button>
        </div>

        {/* --- DESKTOP FILTER BAR (TOP) --- */}
        <div className="hidden lg:block bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-8">
          {/* Row 1: Sort Options & Clear Filter */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Sắp xếp:
              </span>
              <div className="flex gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortChange(option)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      activeSortId === option.id
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 font-medium"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option.icon size={14} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {(categoryId || brandName || activeSortId !== "popular") && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                <RotateCcw size={14} />
                Làm mới bộ lọc
              </button>
            )}
          </div>

          {/* Row 2: Categories */}
          <div className="flex items-start gap-4 mb-4">
            <span className="text-sm font-semibold text-gray-700 min-w-20 pt-1.5">
              Danh mục:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters("category", null)}
                className={`px-3 py-1 rounded-md text-sm border transition-all ${
                  !categoryId
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFilters("category", category.id)}
                  className={`px-3 py-1 rounded-md text-sm border transition-all ${
                    categoryId === category.id.toString()
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-primary bg-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Brands */}
          <div className="flex items-start gap-4">
            <span className="text-sm font-semibold text-gray-700 min-w-20 pt-1.5">
              Thương hiệu:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters("brand", null)}
                className={`px-3 py-1 rounded-md text-sm border transition-all ${
                  !brandName
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                Tất cả
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => updateFilters("brand", brand.name)}
                  className={`px-3 py-1 rounded-md text-sm border transition-all ${
                    brandName === brand.name
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-brand-primary bg-white"
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- MOBILE FILTER DRAWER --- */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold">Bộ lọc sản phẩm</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <MobileFilterContent />
              </div>
              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={handleClearAllFilters}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
                >
                  Thiết lập lại
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-2 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-dark"
                >
                  Xem kết quả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN PRODUCT GRID --- */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-80 animate-pulse border border-gray-100"
                >
                  <div className="h-48 bg-gray-200 rounded-t-xl w-full mb-4"></div>
                  <div className="px-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Filter size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-500 mb-6">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-1 sm:gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="hidden sm:flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    if (
                      totalPages > 7 &&
                      index !== 0 &&
                      index !== totalPages - 1 &&
                      Math.abs(currentPage - index) > 1
                    ) {
                      if (Math.abs(currentPage - index) === 2)
                        return (
                          <span key={index} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      return null;
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          currentPage === index
                            ? "bg-brand-primary text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Pagination (Simplified) */}
                <span className="sm:hidden px-4 text-sm font-medium text-gray-700">
                  Trang {currentPage + 1} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
