import React, { useEffect, useState } from "react";
import { getPromotions } from "@/api/promotionAPI";
import { getProducts } from "@/api/productAPI";
import { Loader2, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function SaleBanner({ onAddToCart }) {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  const fetchDiscountedProducts = async () => {
    setLoading(true);
    try {
      console.log("SaleBanner: Fetching promotions from summaries endpoint...");

      // Lấy tất cả promotions từ endpoint summaries (public endpoint)
      let allPromotions = [];
      try {
        allPromotions = await getPromotions();
      } catch (promoError) {
        // Nếu gặp lỗi 403, có thể là do SecurityConfig chặn
        if (promoError.response?.status === 403) {
          console.warn(
            "SaleBanner: Access denied to promotions API (403). Banner will be hidden."
          );
          setDiscountedProducts([]);
          setLoading(false);
          return;
        }
        throw promoError; // Re-throw nếu là lỗi khác
      }

      console.log("SaleBanner: All promotions:", allPromotions);

      if (!allPromotions || allPromotions.length === 0) {
        console.log("SaleBanner: No promotions found");
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Lọc các promotion đang active
      const now = new Date();
      const activePromotions = allPromotions.filter((promo) => {
        if (!promo.startDate || !promo.endDate) return false;
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        return now >= startDate && now <= endDate;
      });

      console.log("SaleBanner: Active promotions:", activePromotions);

      if (activePromotions.length === 0) {
        console.log("SaleBanner: No active promotions found");
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Thu thập tất cả product IDs từ các promotion active
      const allProductIds = new Set();
      const productPromotionMap = new Map(); // Map productId -> promotion

      activePromotions.forEach((promo) => {
        if (promo.productIds && Array.isArray(promo.productIds)) {
          promo.productIds.forEach((productId) => {
            allProductIds.add(productId);
            // Nếu sản phẩm chưa có promotion hoặc promotion hiện tại có discount cao hơn
            if (
              !productPromotionMap.has(productId) ||
              parseFloat(promo.discount) >
                parseFloat(productPromotionMap.get(productId).discount)
            ) {
              productPromotionMap.set(productId, promo);
            }
          });
        }
      });

      console.log(
        "SaleBanner: Product IDs with active promotions:",
        Array.from(allProductIds)
      );
      console.log("SaleBanner: Product-Promotion map:", productPromotionMap);

      if (allProductIds.size === 0) {
        console.log("SaleBanner: No products found in active promotions");
        setDiscountedProducts([]);
        setLoading(false);
        return;
      }

      // Lấy tất cả sản phẩm
      const productsResponse = await getProducts({ page: 0, size: 100 });
      const allProducts =
        productsResponse.content ||
        (Array.isArray(productsResponse) ? productsResponse : []);

      console.log("SaleBanner: All products fetched:", allProducts.length);

      const productsWithDiscount = [];

      // Match products với promotions
      allProducts.forEach((product) => {
        const productId = product.id;
        if (allProductIds.has(productId)) {
          const promotion = productPromotionMap.get(productId);

          if (!promotion) return;

          // Tính giá sau giảm
          const originalPrice = parseFloat(
            product.currentPrice || product.price || 0
          );

          if (originalPrice <= 0) return; // Skip products without price

          const discountPercent = parseFloat(promotion.discount || 0);
          const discountedPrice = Math.round(
            originalPrice * (1 - discountPercent / 100)
          );

          const discountPercentage = Math.round(discountPercent);

          productsWithDiscount.push({
            ...product,
            originalPrice,
            discountedPrice,
            discountPercent: discountPercentage,
            promotion: promotion,
            promotionId: promotion.id,
          });
        }
      });

      console.log(
        `SaleBanner: Found ${productsWithDiscount.length} products with discounts`
      );

      // Sắp xếp theo phần trăm giảm giảm dần và lấy tối đa 8 sản phẩm
      const sortedProducts = productsWithDiscount
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 8);

      console.log("SaleBanner: Final products to display:", sortedProducts);
      setDiscountedProducts(sortedProducts);
    } catch (error) {
      console.error("SaleBanner: Error fetching discounted products:", error);
      console.error(
        "SaleBanner: Error details:",
        error.response?.data || error.message
      );
      setDiscountedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        </div>
      </section>
    );
  }

  // Không hiển thị banner nếu không có sản phẩm giảm giá
  // (tránh hiển thị empty state khi không có quyền truy cập API)
  if (!discountedProducts || discountedProducts.length === 0) {
    return null;
  }

  // Helper to get proper image URL
  const getImageUrl = (url) => {
    if (!url)
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
    // If already full URL (http/https) or data URI, use as is
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    // If relative path, prepend with /images/products/ (from public folder)
    return `/images/products/${url}`;
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-primary text-brand-primary-foreground px-4 py-2 rounded-full mb-4">
            <Tag className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Ưu đãi đặc biệt
            </span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            Sản Phẩm Giảm Giá
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá những ưu đãi hấp dẫn - Giảm giá lên đến{" "}
            <span className="font-bold text-brand-primary">
              {Math.max(...discountedProducts.map((p) => p.discountPercent))}%
            </span>
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map((product) => (
            <div key={product.id} className="relative">
              {/* Discount Badge */}
              <div className="absolute top-2 left-2 z-20 bg-brand-primary text-brand-primary-foreground px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                -{product.discountPercent}%
              </div>

              {/* Modified Product Card */}
              <div
                className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image Container */}
                <div className="relative w-full h-56 lg:h-64 overflow-hidden bg-gray-100 cursor-pointer">
                  <img
                    src={getImageUrl(
                      product.imageUrl || product.primaryImageUrl
                    )}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 lg:p-5">
                  {/* Brand Name */}
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {typeof product.brand === "string"
                      ? product.brand
                      : product.brand?.name || "CHRONOS"}
                  </p>

                  {/* Product Name */}
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 mb-3 min-h-12">
                    {product.name}
                  </h3>

                  {/* Price */}
                  {product.originalPrice > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-gray-900 font-bold text-lg lg:text-xl">
                          {product.discountedPrice.toLocaleString("vi-VN")}₫
                        </p>
                        <p className="text-gray-400 line-through text-sm">
                          {product.originalPrice.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <p className="text-xs text-brand-primary font-medium mt-1">
                        Tiết kiệm{" "}
                        {(
                          product.originalPrice - product.discountedPrice
                        ).toLocaleString("vi-VN")}
                        ₫
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-medium text-gray-700">
                        {product.rating.toFixed(1)}
                      </span>
                      {product.numOfRating && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.numOfRating})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) {
                        onAddToCart(product);
                      }
                    }}
                    className="mt-auto w-full bg-linear-to-r from-brand-primary to-orange-600 text-brand-primary-foreground rounded-lg py-2.5 hover:from-red-700 hover:to-orange-700 transition-all duration-300 font-medium text-sm lg:text-base shadow-md hover:shadow-lg"
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            to={"/promotional-products"}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-8 py-3 bg-brand-primary-foreground text-brand-primary border-2 border-brand-primary rounded-lg font-semibold hover:bg-brand-primary hover:text-brand-primary-foreground transition-all duration-300 shadow-md"
          >
            Xem tất cả sản phẩm khuyến mãi
          </Link>
        </div>
      </div>
    </section>
  );
}
