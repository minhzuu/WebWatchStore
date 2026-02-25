import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCart, updateCartItem, removeCartItem } from "@/api/cartAPI";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getGuestCart } from "@/api/guestCart";
import { getPromotions, getProductsWithPromotions } from "@/api/promotionAPI";
import { parseStoredUser } from "@/utils/storage";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "sonner";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  TicketPercent,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [productsWithPromotions, setProductsWithPromotions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const navigate = useNavigate();
  const user = parseStoredUser();
  const userId = user?.id;

  const loadCart = async () => {
    if (userId) {
      try {
        const res = await getCart(userId);
        let items = res.items || [];
        let loginModified = false;
        for (const it of items) {
          if (Number.isFinite(it.stock) && it.quantity > it.stock) {
            loginModified = true;
            try {
              await updateCartItem(it.id, Math.max(1, it.stock));
              it.quantity = Math.max(1, it.stock);
            } catch (e) {
              console.error("Failed to adjust cart item", e);
            }
          }
        }
        if (loginModified) {
          toast.warning("Số lượng sản phẩm đã được điều chỉnh theo tồn kho");
        }
        setCartItems(items);
        if (selectAll) setSelectedItems(items.map((item) => item.id));
        return;
      } catch (err) {
        console.error("Lỗi load giỏ hàng:", err);
      }
    }
    let guestCart = getGuestCart();
    let modified = false;
    guestCart = guestCart.map((it) => {
      if (Number.isFinite(it.stock) && it.quantity > it.stock) {
        modified = true;
        return { ...it, quantity: Math.max(1, it.stock) };
      }
      return it;
    });
    if (modified) {
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      toast.warning("Số lượng sản phẩm đã được điều chỉnh theo tồn kho");
    }
    setCartItems(guestCart);
    if (selectAll) setSelectedItems(guestCart.map((item) => item.id));
  };

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
      setPromotions([]);
      setProductsWithPromotions([]);
    }
  };

  useEffect(() => {
    loadCart();
    loadPromotionsData();
  }, []);

  const isValidPromotion = (promotion) => {
    if (!promotion.startDate || !promotion.endDate) return false;
    const now = new Date();
    return (
      now >= new Date(promotion.startDate) && now <= new Date(promotion.endDate)
    );
  };

  const getItemPromotions = (item) => {
    const allPromotions = [];
    const productId = item.productId || item.product?.id || item.id;

    if (promotions?.length > 0) {
      const promoFromSummaries = promotions.filter((promo) => {
        if (!isValidPromotion(promo)) return false;
        return (
          promo.productIds &&
          Array.isArray(promo.productIds) &&
          promo.productIds.includes(productId)
        );
      });
      allPromotions.push(...promoFromSummaries);
    }

    if (productsWithPromotions?.length > 0) {
      const productWithPromo = productsWithPromotions.find((product) => {
        const promoProductId = product.productId || product.id;
        return promoProductId === productId;
      });
      if (productWithPromo && Array.isArray(productWithPromo.promotions)) {
        allPromotions.push(
          ...productWithPromo.promotions.filter(isValidPromotion)
        );
      }
    }

    return Array.from(new Map(allPromotions.map((p) => [p.id, p])).values());
  };

  const getDiscountedPrice = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return item.price;
    const maxDiscount = Math.max(
      ...itemPromos.map((p) => parseFloat(p.discount || 0))
    );
    return Math.round(item.price * (1 - maxDiscount / 100));
  };

  const getSavingsAmount = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return 0;
    const maxDiscount = Math.max(
      ...itemPromos.map((p) => parseFloat(p.discount || 0))
    );
    return Math.round(item.price * (maxDiscount / 100));
  };

  const getDiscountPercent = (item) => {
    const itemPromos = getItemPromotions(item);
    if (itemPromos.length === 0) return 0;
    const maxDiscount = Math.max(
      ...itemPromos.map((p) => parseFloat(p.discount || 0))
    );
    return Math.round(maxDiscount);
  };

  useEffect(() => {
    if (cartItems.length === 0) setSelectAll(false);
    else if (selectedItems.length === cartItems.length) setSelectAll(true);
    else setSelectAll(false);
  }, [selectedItems, cartItems]);

  const handleSelectAll = () => {
    if (selectAll) setSelectedItems([]);
    else setSelectedItems(cartItems.map((item) => item.id));
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id))
      setSelectedItems(selectedItems.filter((x) => x !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  const handleQuantityChange = async (cartItemId, delta) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);
    const stock = Number.isFinite(item.stock) ? item.stock : Infinity;

    if (newQuantity > stock) {
      toast.error(`Kho chỉ còn ${stock} sản phẩm`);
      return;
    }

    if (!userId) {
      let cart = getGuestCart();
      const target = cart.find((i) => i.id === cartItemId);
      if (target) target.quantity = newQuantity;
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      setCartItems(cart);
      return;
    }

    try {
      await updateCartItem(cartItemId, newQuantity);
      loadCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!userId) {
      let cart = getGuestCart().filter((i) => i.id !== cartItemId);
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      setCartItems(cart);
      setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
      return;
    }
    try {
      await removeCartItem(cartItemId);
      window.dispatchEvent(new Event("cartUpdated"));
      loadCart();
      setSelectedItems(selectedItems.filter((id) => id !== cartItemId));
    } catch (err) {
      console.error("Lỗi xóa item:", err);
    }
  };

  const totalPrice = selectedItems
    .map((id) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return 0;
      return getDiscountedPrice(item) * item.quantity;
    })
    .reduce((a, b) => a + b, 0);

  const originalTotalPrice = selectedItems
    .map((id) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return 0;
      return item.price * item.quantity;
    })
    .reduce((a, b) => a + b, 0);

  const totalSavings = originalTotalPrice - totalPrice;

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
      return;
    }
    const itemsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    navigate("/checkout", {
      state: { selectedItems: itemsToCheckout, totalPrice },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative mb-21">
      <Header />
      <Breadcrumb items={[{ label: "Giỏ hàng", isCurrent: true }]} />

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-40 md:pb-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Giỏ hàng
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({cartItems.length} sản phẩm)
            </span>
          </h1>
        </div>

        {cartItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-4 flex items-center">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-3 text-gray-700 hover:text-brand-primary transition-colors"
            >
              {selectAll ? (
                <CheckSquare className="w-5 h-5 text-brand-primary" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium">
                Chọn tất cả ({cartItems.length})
              </span>
            </button>
          </div>
        )}

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Giỏ hàng của bạn đang trống
              </h3>
              <p className="text-gray-500 mb-6">
                Hãy chọn thêm sản phẩm để mua sắm nhé
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-dark transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPromos = getItemPromotions(item);
              const hasPromotion = itemPromos.length > 0;
              const discountedPrice = getDiscountedPrice(item);
              const savingsAmount = getSavingsAmount(item);
              const discountPercent = getDiscountPercent(item);
              const isSelected = selectedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  // 1. Thêm sự kiện onClick vào wrapper div
                  onClick={() => handleSelectItem(item.id)}
                  className={`group relative bg-white rounded-xl border p-3 md:p-4 shadow-sm transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-brand-primary/50 ring-1 ring-brand-primary/10"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex gap-3 md:gap-4">
                    {/* Checkbox & Image */}
                    <div className="flex items-start gap-3">
                      <button
                        // Checkbox giữ nguyên stopPropagation (đã có ở bản gốc)
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item.id);
                        }}
                        className="mt-8 md:mt-10 text-gray-400 hover:text-brand-primary transition-colors focus:outline-none"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-brand-primary" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div
                        className="relative w-20 h-20 md:w-28 md:h-28 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer shrink-0"
                        // 2. Click ảnh thì navigate (nhớ stopPropagation)
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${item.productId || item.id}`);
                        }}
                      >
                        <img
                          src={
                            item.imageUrl || "https://via.placeholder.com/150"
                          }
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                        {hasPromotion && (
                          <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Top: Name & Remove */}
                      <div className="flex justify-between items-start gap-2">
                        <h3
                          className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 cursor-pointer hover:text-brand-primary transition-colors"
                          // 3. Click tên thì navigate (nhớ stopPropagation)
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${item.productId || item.id}`);
                          }}
                        >
                          {item.productName}
                        </h3>
                        <button
                          // 4. Nút xóa (nhớ stopPropagation)
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>

                      {/* Middle: Price */}
                      <div className="mt-1 md:mt-2">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-bold text-brand-primary text-base md:text-lg">
                            {hasPromotion
                              ? discountedPrice.toLocaleString("vi-VN")
                              : item.price.toLocaleString("vi-VN")}
                            đ
                          </span>
                          {hasPromotion && (
                            <span className="text-xs md:text-sm text-gray-400 line-through">
                              {item.price.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                        {hasPromotion && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded">
                            <TicketPercent className="w-3 h-3" />
                            Giảm {savingsAmount.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </div>

                      {/* Bottom: Quantity */}
                      <div className="mt-3 flex items-center">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-8 md:h-9">
                          <button
                            // 5. Nút giảm SL (nhớ stopPropagation)
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item.id, -1);
                            }}
                            disabled={item.quantity <= 1}
                            className="w-8 md:w-9 h-full flex items-center justify-center hover:bg-white rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          {/* Vùng hiển thị số lượng click vào cũng không nên trigger select item */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 md:w-10 text-center font-medium text-sm text-gray-900 border-x border-gray-200 bg-white h-full flex items-center justify-center"
                          >
                            {item.quantity}
                          </div>
                          <button
                            // 6. Nút tăng SL (nhớ stopPropagation)
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item.id, 1);
                            }}
                            disabled={item.quantity >= item.stock}
                            className="w-8 md:w-9 h-full flex items-center justify-center hover:bg-white rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="ml-3 text-xs text-gray-500 hidden sm:inline-block">
                          Kho: {item.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4 md:px-6 safe-area-pb">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500">
                Tổng thanh toán ({selectedItems.length} sản phẩm):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-bold text-brand-primary">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
                {totalSavings > 0 && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded hidden md:inline-block">
                    Tiết kiệm {totalSavings.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
            </div>

            {totalSavings > 0 && (
              <span className="md:hidden text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                - {totalSavings.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className={`w-full md:w-auto px-8 py-3.5 md:py-3 rounded-xl font-bold text-white shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 ${
              selectedItems.length > 0
                ? "bg-brand-primary hover:bg-brand-primary-dark"
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
          >
            <span>Mua Hàng</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
