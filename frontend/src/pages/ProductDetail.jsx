import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getProductById, getProducts } from "@/api/productAPI";
import axiosInstance from "@/api/axiosConfig";
import { addToCart, getCart } from "@/api/cartAPI";
import {
  getReviewsByProduct,
  getReviewByUserAndProduct,
  updateReview,
  createReview,
} from "@/api/reviewAPI";
import { getOrdersByUserId } from "@/api/orderAPI";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/api/wishlistAPI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { parseStoredUser } from "@/utils/storage";
import Header from "@/components/Header";
import { addToGuestCart } from "@/api/guestCart.js";
import Footer from "@/components/Footer";
import {
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  Plus,
  Minus,
  Heart,
  RotateCcw,
  Info,
  Check,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const user = parseStoredUser();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetail();
    fetchReviews();
    checkIfCanReview();
    setIsFavorite(isInWishlist(id));
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await getProductById(id);
      setProduct(res);

      // Logic tính toán khuyến mãi
      try {
        const promoRes = await axiosInstance.get(`/promotions`);
        const promos = promoRes?.data?.data || [];
        const prodPromo = promos.find((p) => p.productId === res.id);
        if (
          prodPromo &&
          Array.isArray(prodPromo.promotions) &&
          prodPromo.promotions.length > 0
        ) {
          const now = new Date();
          const active = prodPromo.promotions
            .map((p) => ({ ...p }))
            .filter((p) => {
              try {
                const start = p.startDate ? new Date(p.startDate) : null;
                const end = p.endDate ? new Date(p.endDate) : null;
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
            if (maxDiscount > 0 && res?.price) {
              const original = Number(res.price || 0);
              const discounted = Math.round(
                (original * (100 - maxDiscount)) / 100
              );
              setProduct((prev) => ({
                ...prev,
                discountedPrice: discounted,
                originalPrice: original,
              }));
            }
          }
        }
      } catch (err) {
        console.debug("Promotions fetch failed", err);
      }

      if (res?.productImages?.length > 0) {
        const primary = res.productImages.find((img) => img.isPrimary);
        setSelectedImage(primary || res.productImages[0]);
      } else if (res?.primaryImageUrl) {
        setSelectedImage({ imageUrl: res.primaryImageUrl, isPrimary: true });
      } else if (res?.imageUrl) {
        setSelectedImage({ imageUrl: res.imageUrl, isPrimary: true });
      }

      // Fetch related products
      try {
        fetchRelatedProducts(res);
      } catch (e) {
        /* ignore */
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const fetchRelatedProducts = async (prod) => {
    if (!prod) return;
    setRelatedLoading(true);
    try {
      const params = {
        page: 0,
        size: 4, // Lấy 4 sản phẩm liên quan
        sortBy: "createdAt",
        order: "desc",
      };

      if (prod.categoryName) params.category = prod.categoryName;
      else if (prod.brand) params.brand = prod.brand;

      const res = await getProducts(params);
      const data = res?.content || res?.data?.content || res || [];
      const items = Array.isArray(data) ? data : data.content || [];
      const filtered = items
        .filter((p) => p.id !== prod.id)
        .filter((p) => p.status === "ACTIVE")
        .slice(0, 4);
      setRelatedProducts(filtered);
    } catch (err) {
      console.error("Error fetching related products:", err);
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await getReviewsByProduct(id);
      setReviews(Array.isArray(data) ? data : []);

      if (user?.id) {
        const userReview = await getReviewByUserAndProduct(user.id, id);
        if (userReview) {
          setExistingReview(userReview);
          const reviewDate = new Date(userReview.createdAt);
          const daysSinceReview =
            (new Date() - reviewDate) / (1000 * 60 * 60 * 24);
          setIsEditingReview(daysSinceReview <= 30);
        } else {
          setExistingReview(null);
        }
      }
    } catch (err) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkIfCanReview = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user?.id) {
      setCanReview(false);
      return;
    }

    try {
      const orders = await getOrdersByUserId(user.id);
      const hasPurchased = orders.some((order) => {
        const isCompleted = order.status === "COMPLETED";
        const hasItems = order.items && order.items.length > 0;
        if (isCompleted && hasItems) {
          return order.items.some((item) => item.productId === parseInt(id));
        }
        return false;
      });
      setCanReview(hasPurchased);
    } catch (err) {
      setCanReview(false);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      const success = removeFromWishlist(parseInt(id));
      if (success) {
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } else {
      const success = addToWishlist(product);
      if (success) {
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích ❤️");
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.info("Sản phẩm đã có trong danh sách yêu thích");
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token || !user?.id) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        comment: reviewComment.trim(),
        rating: reviewRating,
        user: { id: user.id },
        product: { id: parseInt(id) },
      };

      if (existingReview && isEditingReview) {
        await updateReview(existingReview.id, reviewData);
        toast.success("Đã cập nhật đánh giá của bạn!");
      } else {
        await createReview(reviewData);
        toast.success("Đánh giá của bạn đã được gửi thành công!");
      }

      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
      setExistingReview(null);
      setIsEditingReview(false);
      fetchReviews();
      checkIfCanReview();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại!"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();

    if (!token || !user?.id) {
      addToGuestCart(product, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng (khách) 🛒`);
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    const maxStock = Number.isFinite(product?.stockQuantity)
      ? product.stockQuantity
      : Number.isFinite(product?.stock)
      ? product.stock
      : Infinity;

    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }

    setAddingToCart(true);
    try {
      const cart = await getCart(user.id);
      const existingItem = (cart.items || []).find(
        (i) => i.productId === product.id || i.id === product.id
      );
      const currentQty = existingItem ? existingItem.quantity : 0;

      if (currentQty + quantity > maxStock) {
        toast.error(
          `Không thể thêm vượt quá tồn kho. Còn lại ${
            maxStock - currentQty
          } sản phẩm`
        );
        return;
      }

      await addToCart(user.id, product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stockQuantity || 999)) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++)
      stars.push(
        <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
      );
    if (hasHalfStar)
      stars.push(
        <Star key="half" className="size-4 fill-yellow-200 text-yellow-400" />
      );
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++)
      stars.push(<Star key={`empty-${i}`} className="size-4 text-gray-300" />);
    return stars;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http") || imageUrl.startsWith("data:"))
      return imageUrl;
    return `/images/products/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">Đang tải sản phẩm...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Sản phẩm không tồn tại
        </div>
        <Footer />
      </div>
    );
  }

  const displayImage = selectedImage
    ? getImageUrl(selectedImage.imageUrl)
    : product.primaryImageUrl
    ? getImageUrl(product.primaryImageUrl)
    : product.imageUrl
    ? getImageUrl(product.imageUrl)
    : null;

  const breadcrumbItems = (() => {
    if (!product) return [];
    const items = [{ label: "Sản phẩm", href: "/products" }];
    if (product.categoryName) {
      items.push({
        label: product.categoryName,
        href: `/products?category=${product.categoryId}`,
      });
    }
    items.push({ label: product.name, isCurrent: true });
    return items;
  })();

  const imagesToDisplay = (product.productImages || []).sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{product.name} | WATCH STORE</title>
        <meta
          name="description"
          content={(product.description || "").substring(0, 160)}
        />
        <meta
          name="keywords"
          content={`đồng hồ, ${product.name}, ${product.brand?.name || ""}`}
        />
        <meta property="og:title" content={product.name} />
        <meta
          property="og:description"
          content={(product.description || "").substring(0, 160)}
        />
        <meta
          property="og:image"
          content={
            product.productImages?.find((img) => img.isPrimary)?.imageUrl
          }
        />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="VND" />
      </Helmet>
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex-1 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Main Product Section - Divided by Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* BLOCK 1: IMAGES (Left - 8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Main Image */}
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center overflow-hidden relative"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                style={{ cursor: isZoomed ? "zoom-in" : "default" }}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={
                      isZoomed && window.innerWidth >= 1024
                        ? {
                            transform: "scale(2)",
                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                          }
                        : {}
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package className="size-16 mb-2" />
                    <p className="text-sm">Không có hình ảnh</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imagesToDisplay.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-1 scrollbar-hide">
                  {imagesToDisplay.map((img) => {
                    const thumbUrl = getImageUrl(img.imageUrl);
                    const isSelected = selectedImage?.id === img.id;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setSelectedImage(img)}
                        className={`relative shrink-0 w-20 h-20 bg-white rounded-lg p-2 cursor-pointer border transition-all ${
                          isSelected
                            ? "border-brand-primary ring-1 ring-brand-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt="thumb"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BLOCK 2: PURCHASE INFO (Right - 4 Cols - Sticky) */}
            <div className="lg:col-span-4 lg:row-span-2">
              <Card className="border-none shadow-md lg:sticky lg:top-24 h-fit">
                <CardContent className="p-5 md:p-6 space-y-6">
                  {/* Name & Brand */}
                  <div>
                    {product.brand && (
                      <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">
                        {product.brand}
                      </p>
                    )}
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h1>
                  </div>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-sm text-gray-500">
                        ({product.numOfRating || 0} đánh giá)
                      </span>
                    </div>
                  )}

                  {/* --- PRICE SECTION (STYLED) --- */}
                  <div className="pb-5 border-b border-gray-100 bg-gray-50/50 -mx-6 px-6 py-4 rounded-b-lg">
                    {(() => {
                      const displayPrice =
                        product.discountedPrice ?? product.price;
                      const original = product.originalPrice ?? product.price;

                      // Check discount
                      const hasDiscount =
                        product.discountedPrice &&
                        Number(product.discountedPrice) < Number(original);

                      const discountPercent = hasDiscount
                        ? Math.round(
                            ((Number(original) - Number(displayPrice)) /
                              Number(original)) *
                              100
                          )
                        : 0;

                      return (
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Giá bán ưu đãi:
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-3xl font-extrabold text-red-600 tracking-tight">
                              {displayPrice
                                ? `${Number(displayPrice).toLocaleString(
                                    "vi-VN"
                                  )}₫`
                                : "Liên hệ"}
                            </p>
                            {hasDiscount && (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                          {hasDiscount && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-400 line-through">
                                {Number(original).toLocaleString("vi-VN")}₫
                              </span>
                              <span className="text-xs text-gray-500">
                                Giá gốc
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quantity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Số lượng
                      </span>
                      {product.stockQuantity > 0 && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Còn{" "}
                          {product.stockQuantity} sản phẩm
                        </span>
                      )}
                    </div>
                    <div className="flex items-center w-max border border-gray-300 rounded-lg bg-white">
                      <button
                        onClick={decreaseQuantity}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors rounded-l-lg"
                        disabled={quantity <= 1}
                      >
                        <Minus className="size-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-sm w-12 text-center border-x border-gray-300 min-w-12">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors rounded-r-lg"
                        disabled={quantity >= (product.stockQuantity || 999)}
                      >
                        <Plus className="size-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={
                        addingToCart ||
                        product.status !== "ACTIVE" ||
                        (Number.isFinite(product?.stockQuantity)
                          ? product.stockQuantity <= 0
                          : product.stock <= 0)
                      }
                      className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white py-6 text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      {addingToCart ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Đang xử lý...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="size-5" />
                          Thêm vào giỏ hàng
                        </div>
                      )}
                    </Button>

                    <Button
                      onClick={handleToggleFavorite}
                      variant="outline"
                      className={`w-full py-6 border transition-colors ${
                        isFavorite
                          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <Heart
                        className={`size-5 mr-2 ${
                          isFavorite ? "fill-red-500" : ""
                        }`}
                      />
                      {isFavorite ? "Đã thích" : "Yêu thích"}
                    </Button>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                    <div className="flex items-start gap-3">
                      <Truck className="size-5 text-brand-primary shrink-0" />
                      <span className="text-gray-600">
                        Miễn phí vận chuyển đơn trên 500k
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="size-5 text-brand-primary shrink-0" />
                      <span className="text-gray-600">
                        Bảo hành chính hãng 12 tháng
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw className="size-5 text-brand-primary shrink-0" />
                      <span className="text-gray-600">
                        Đổi trả trong vòng 30 ngày
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BLOCK 3: DETAILS & REVIEWS (Left - 8 Cols - Below Image) */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              {/* Description */}
              {product.description && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="size-5 text-brand-primary" />
                      Mô tả sản phẩm
                    </h3>
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Specs */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                    Thông số kỹ thuật
                  </h3>
                  <div className="grid grid-cols-1 gap-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Thương hiệu</span>
                      <span className="font-medium text-gray-900">
                        {product.brand || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Danh mục</span>
                      <span className="font-medium text-gray-900">
                        {product.categoryName || "N/A"}
                      </span>
                    </div>
                    {product.productSpecs?.map((spec) => (
                      <div
                        key={spec.id || spec.keyName}
                        className="flex justify-between py-2 border-b border-gray-100"
                      >
                        <span className="text-gray-500">{spec.keyName}</span>
                        <span className="font-medium text-gray-900">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                    Đánh giá & Nhận xét
                  </h3>

                  {canReview && (
                    <div className="mb-8 bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
                      {!showReviewForm ? (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-3">
                            Bạn đã mua sản phẩm này? Hãy chia sẻ cảm nghĩ của
                            bạn.
                          </p>
                          <Button
                            onClick={() => {
                              if (existingReview) {
                                setReviewRating(existingReview.rating);
                                setReviewComment(existingReview.comment || "");
                              }
                              setShowReviewForm(true);
                            }}
                            className="bg-brand-primary hover:bg-brand-primary-soft"
                          >
                            <Star className="size-4 mr-2" />
                            {existingReview
                              ? "Chỉnh sửa đánh giá"
                              : "Viết đánh giá"}
                          </Button>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleSubmitReview}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Đánh giá sao
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`size-8 ${
                                      star <= reviewRating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nhận xét
                            </label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                              placeholder="Sản phẩm thế nào? Chất lượng ra sao?"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="submit"
                              disabled={submittingReview}
                              className="flex-1 bg-brand-primary hover:bg-brand-primary-soft"
                            >
                              {submittingReview
                                ? "Đang gửi..."
                                : "Gửi đánh giá"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowReviewForm(false)}
                            >
                              Hủy
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {loadingReviews ? (
                    <div className="py-8 text-center text-gray-500">
                      Đang tải đánh giá...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-lg">
                      <Star className="size-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Chưa có đánh giá nào</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                                {(review.userFullName || review.username || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {review.userFullName ||
                                    review.username ||
                                    "Khách hàng"}
                                </p>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : ""}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-lg">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* End Left Column (Details) */}
          </div>
          {/* End Main Grid */}

          {/* --- NEW SECTION: RELATED PRODUCTS (MOVED DOWN) --- */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="size-6 text-brand-primary" />
                Sản phẩm liên quan
              </h3>

              {relatedLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((rp) => (
                    <ProductCard
                      key={rp.id}
                      product={rp}
                      onAddToCart={(p) => {
                        navigate(`/product/${p.id}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
