import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { addToCart } from "@/api/cartAPI";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { parseStoredUser } from "@/utils/storage";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/api/wishlistAPI";
import { addToGuestCart } from "@/api/guestCart.js";
import { getCart } from "@/api/cartAPI";
import { getPromotions, getProductsWithPromotions } from "@/api/promotionAPI";

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [productsWithPromotions, setProductsWithPromotions] = useState([]);

  // Kiểm tra sản phẩm có trong wishlist không
  useEffect(() => {
    setFavorite(isInWishlist(product.id));
  }, [product.id]);

  // Load promotions data
  useEffect(() => {
    const loadPromotionsData = async () => {
      try {
        const [promosData, productsWithPromosData] = await Promise.all([
          getPromotions(),
          getProductsWithPromotions(),
        ]);
        setPromotions(promosData || []);
        setProductsWithPromotions(productsWithPromosData || []);
      } catch (err) {
        console.error("Lỗi load promotions:", err);
      }
    };
    loadPromotionsData();
  }, []);

  // Kiểm tra khuyến mãi hợp lệ
  const isValidPromotion = (promotion) => {
    if (!promotion.startDate || !promotion.endDate) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  };

  // Lấy khuyến mãi cho sản phẩm
  const getProductPromotions = () => {
    const allPromotions = [];
    const productId = product.id;

    // Từ promotions summaries
    if (promotions && promotions.length > 0) {
      const promoFromSummaries = promotions.filter((promo) => {
        if (!isValidPromotion(promo)) return false;
        if (promo.productIds && Array.isArray(promo.productIds)) {
          return promo.productIds.includes(productId);
        }
        return false;
      });
      allPromotions.push(...promoFromSummaries);
    }

    // Từ productsWithPromotions
    if (productsWithPromotions && productsWithPromotions.length > 0) {
      const productWithPromo = productsWithPromotions.find((p) => {
        const promoProductId = p.productId || p.id;
        return promoProductId === productId;
      });

      if (productWithPromo && Array.isArray(productWithPromo.promotions)) {
        const validPromos = productWithPromo.promotions.filter((p) =>
          isValidPromotion(p)
        );
        allPromotions.push(...validPromos);
      }
    }

    // Loại bỏ trùng lặp
    const uniquePromotions = Array.from(
      new Map(allPromotions.map((p) => [p.id, p])).values()
    );

    return uniquePromotions;
  };

  const productPromotions = getProductPromotions();
  const hasPromotion = productPromotions.length > 0;
  const maxDiscount = hasPromotion
    ? Math.max(...productPromotions.map((p) => parseFloat(p.discount || 0)))
    : 0;

  const originalPrice = product.currentPrice || product.price || 0;
  const discountedPrice = hasPromotion
    ? Math.round(originalPrice * (1 - maxDiscount / 100))
    : originalPrice;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();

    if (favorite) {
      // Xóa khỏi wishlist
      const success = removeFromWishlist(product.id);
      if (success) {
        setFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
        // Dispatch event để cập nhật count ở Header
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } else {
      // Thêm vào wishlist
      const success = addToWishlist(product);
      if (success) {
        setFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích ❤️");
        // Dispatch event để cập nhật count ở Header
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.info("Sản phẩm đã có trong danh sách yêu thích");
      }
    }
  };

  const handleCardClick = () => {
    // Điều hướng đến trang chi tiết sản phẩm
    navigate(`/product/${product.id}`);
  };

  // ❌ CHƯA LOGIN → lưu “guest cart”
  const handleAddToCart = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();

    // 🚨 FIX: Nếu chưa login → lưu vào guest cart
    if (!token || !user?.id) {
      // guest cart flow
      addToGuestCart(product, 1);
      toast.success("Đã thêm vào giỏ hàng (khách) 🛒");
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    // Nếu đăng nhập → xử lý như cũ
    const maxStock = Number.isFinite(product?.stockQuantity)
      ? product.stockQuantity
      : Number.isFinite(product?.stock)
      ? product.stock
      : Infinity;

    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }

    setIsAdding(true);
    try {
      const cart = await getCart(user.id);
      const existingItem = (cart.items || []).find(
        (i) => i.productId === product.id || i.id === product.id
      );
      const currentQty = existingItem ? existingItem.quantity : 0;

      if (currentQty + 1 > maxStock) {
        toast.error("Không thể thêm vượt quá tồn kho");
        return;
      }

      await addToCart(user.id, product.id, 1);
      toast.success("Đã thêm vào giỏ hàng");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    } finally {
      setIsAdding(false);
    }
  };

  // const handleAddToCart = async (e) => {
  //     e.stopPropagation();
  //
  //     // Kiểm tra đăng nhập
  //     const token = localStorage.getItem("accessToken");
  //     const user = parseStoredUser();
  //
  //     if (!token || !user?.id) {
  //         toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
  //         // Chuyển đến trang login
  //         setTimeout(() => {
  //             navigate("/login");
  //         }, 1000);
  //         return;
  //     }
  //
  //     setIsAdding(true);
  //     try {
  //         await addToCart(user.id, product.id, 1);
  //         toast.success("Đã thêm vào giỏ hàng ✅");
  //         // Gọi callback nếu có
  //         if (onAddToCart) {
  //             onAddToCart(product.id);
  //         }
  //     } catch (err) {
  //         console.error(err);
  //         toast.error("Thêm vào giỏ hàng thất bại 😢");
  //     } finally {
  //         setIsAdding(false);
  //     }
  // };

  // Determine badge based on product data
  const getBadge = () => {
    // Logic để xác định badge dựa trên product properties
    // Có thể dựa vào createdAt (new), rating (popular), sales (best seller), stock (limited)
    if (!product.createdAt) return null;

    const daysSinceCreation = Math.floor(
      (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation < 30) {
      return { text: "New", color: "bg-orange-500" };
    }
    if (product.rating && product.rating >= 4.7) {
      return { text: "Popular", color: "bg-orange-400" };
    }
    if (product.numOfRating && product.numOfRating > 100) {
      return { text: "Best Seller", color: "bg-orange-500" };
    }
    // You can add more logic here for "Limited" based on stock
    return null;
  };

  const badge = getBadge();
  // Get brand name - handle both string and object cases
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || product.brandName || "CHRONOS";

  // SVG placeholder
  const svgPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Helper to get proper image URL
  const getImageUrl = (url) => {
    if (!url) return svgPlaceholder;
    // If already full URL (http/https) or data URI, use as is
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    // If relative path, prepend with /images/products/ (from public folder)
    return `/images/products/${url}`;
  };

  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() =>
    getImageUrl(product.imageUrl || product.primaryImageUrl)
  );

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.target.src = svgPlaceholder;
      setImageSrc(svgPlaceholder);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-56 lg:h-64 overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />

        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-3 left-3 ${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {badge.text}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 lg:p-5">
        {/* Brand Name */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {brandName}
        </p>

        {/* Product Name */}
        <h3 className="text-base lg:text-lg font-semibold text-brand-ink line-clamp-2 mb-2 min-h-12">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-2">
          {hasPromotion ? (
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-red-600 font-bold text-lg lg:text-xl">
                {discountedPrice.toLocaleString("vi-VN")}₫
              </p>
              <p className="text-gray-500 line-through text-sm">
                {originalPrice.toLocaleString("vi-VN")}₫
              </p>
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                -{Math.round(maxDiscount)}%
              </span>
            </div>
          ) : (
            <p className="text-gray-900 font-bold text-lg lg:text-xl">
              {originalPrice > 0
                ? `${originalPrice.toLocaleString("vi-VN")}₫`
                : "Liên hệ"}
            </p>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-4">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-medium text-gray-700">
              {product.rating.toFixed(1)}
            </span>
            {product.numOfRating > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                ({product.numOfRating})
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button and Favorite */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={
              isAdding ||
              (Number.isFinite(product?.stockQuantity)
                ? product.stockQuantity <= 0
                : Number.isFinite(product?.stock)
                ? product.stock <= 0
                : false)
            }
            className="flex-1 flex items-center justify-center gap-2 bg-brand-primary/90 text-brand-primary-foreground rounded-lg py-2.5 hover:bg-brand-primary-soft transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium text-sm lg:text-base"
          >
            {isAdding ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Đang thêm...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors"
            aria-label="Yêu thích"
          >
            <Heart
              size={18}
              className={
                favorite ? "text-red-500 fill-red-500" : "text-gray-600"
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}
