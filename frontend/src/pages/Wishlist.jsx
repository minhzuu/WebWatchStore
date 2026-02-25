import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getWishlist, removeFromWishlist } from "@/api/wishlistAPI";
import { getProductById } from "@/api/productAPI";
import { addToCart, getCart } from "@/api/cartAPI";
import axiosInstance from "@/api/axiosConfig";
import { addToGuestCart } from "@/api/guestCart";
import { parseStoredUser } from "@/utils/storage";
import Breadcrumb from "@/components/Breadcrumb";

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist từ localStorage
  useEffect(() => {
    (async () => {
      await loadWishlist();
    })();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const ids = getWishlist();
      if (!ids || ids.length === 0) {
        setWishlist([]);
        return;
      }

      const promises = ids.map((id) => getProductById(id).catch(() => null));
      const results = await Promise.all(promises);
      const products = results.filter((p) => p != null);

      try {
        const promoRes = await axiosInstance.get(`/promotions`);
        const promos = promoRes?.data?.data || [];
        const now = new Date();
        const productsWithDiscount = products.map((p) => {
          try {
            const prodPromo = promos.find((pr) => pr.productId === p.id);
            if (
              prodPromo &&
              Array.isArray(prodPromo.promotions) &&
              prodPromo.promotions.length > 0
            ) {
              const active = prodPromo.promotions
                .map((x) => ({ ...x }))
                .filter((x) => {
                  try {
                    const start = x.startDate ? new Date(x.startDate) : null;
                    const end = x.endDate ? new Date(x.endDate) : null;
                    if (start && end) return now >= start && now <= end;
                    return false;
                  } catch (e) {
                    return false;
                  }
                });
              if (active.length > 0) {
                const maxDiscount = Math.max(
                  ...active.map((a) => Number(a.discount || 0))
                );
                if (maxDiscount > 0) {
                  const original = Number(p.price ?? p.currentPrice ?? 0);
                  const discounted = Math.round(
                    (original * (100 - maxDiscount)) / 100
                  );
                  return {
                    ...p,
                    discountedPrice: discounted,
                    originalPrice: original,
                  };
                }
              }
            }
          } catch (e) {
            /* ignore */
          }
          return p;
        });
        setWishlist(productsWithDiscount);
      } catch (e) {
        setWishlist(products);
      }
    } catch (err) {
      console.error("Error loading wishlist products:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId) => {
    const success = removeFromWishlist(productId);
    if (success) {
      toast.success("Đã xóa khỏi danh sách yêu thích");
      loadWishlist();
      window.dispatchEvent(new Event("wishlistUpdated"));
    } else {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();

    if (!token || !user?.id) {
      addToGuestCart(product, 1);
      toast.success("Đã thêm vào giỏ hàng (Khách) 🛒");
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    const maxStock = Number.isFinite(product?.stockQuantity)
      ? product.stockQuantity
      : Infinity;
    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
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
      await addToCart(user.id, product.id, 1);
      toast.success("Đã thêm vào giỏ hàng ✅");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/300x300?text=No+Image";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `/images/products/${url}`;
  };

  const getBrandName = (product) => {
    return typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || product.brandName || "CHRONOS";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Breadcrumb items={[{ label: "Danh sách yêu thích", isCurrent: true }]} />

      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Heart className="text-red-500 fill-red-500 w-6 h-6 md:w-8 md:h-8" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                Danh sách yêu thích
              </h1>
              <p className="text-sm text-gray-500">
                {wishlist.length} sản phẩm
              </p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-red-300 w-8 h-8" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Chưa có sản phẩm yêu thích
              </h2>
              <p className="text-gray-500 text-sm mt-2 mb-6 max-w-xs mx-auto">
                Lưu lại những sản phẩm bạn quan tâm để xem lại sau nhé.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors font-medium text-sm"
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full"
                >
                  <div
                    onClick={() => handleProductClick(product.id)}
                    className="relative w-full aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(product.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 rounded-full shadow-sm transition-colors text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">
                      {getBrandName(product)}
                    </p>
                    <h3
                      onClick={() => handleProductClick(product.id)}
                      className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-brand-primary transition-colors min-h-10"
                    >
                      {product.name}
                    </h3>

                    <div className="mt-auto pt-2">
                      {(() => {
                        const displayPrice =
                          product.discountedPrice ??
                          product.currentPrice ??
                          product.price;
                        const originalPrice =
                          product.originalPrice ??
                          product.price ??
                          product.currentPrice;
                        const hasDiscount =
                          product.discountedPrice &&
                          Number(product.discountedPrice) <
                            Number(originalPrice);
                        const discountPercent = hasDiscount
                          ? Math.round(
                              ((Number(originalPrice) - Number(displayPrice)) /
                                Number(originalPrice)) *
                                100
                            )
                          : 0;

                        return (
                          <div className="mb-3 min-h-12 flex flex-col justify-end">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-red-600 font-bold text-base md:text-lg">
                                {displayPrice
                                  ? `${Number(displayPrice).toLocaleString(
                                      "vi-VN"
                                    )}₫`
                                  : "Liên hệ"}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] md:text-xs font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through">
                                {Number(originalPrice).toLocaleString("vi-VN")}₫
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white rounded-lg py-2 md:py-2.5 hover:bg-brand-primary-dark active:scale-95 transition-all text-xs md:text-sm font-medium"
                      >
                        <ShoppingCart size={16} />
                        <span>Thêm vào giỏ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
