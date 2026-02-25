import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrdersByUserId, cancelOrder } from "../api/orderAPI";
import { getReviewByUserAndProduct } from "../api/reviewAPI";
import { addToCart, getCart } from "../api/cartAPI";
import { getProductById } from "../api/productAPI";
import { parseStoredUser } from "@/utils/storage";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Star,
  RotateCcw,
  X,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

const orderStatusLabels = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Icon: Clock,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    Icon: CreditCard,
  },
  SHIPPED: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    Icon: Truck,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800 border-green-200",
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800 border-red-200",
    Icon: XCircle,
  },
};

const paymentMethodLabels = {
  CASH: "Tiền mặt (COD)",
  BANK_TRANSFER: "Chuyển khoản",
  CREDIT_CARD: "Thẻ tín dụng",
  VNPAY: "VNPay",
};

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [productReviews, setProductReviews] = useState({});

  const { orderId } = location.state || {};

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const user = parseStoredUser();

      if (!token || !user?.id) {
        toast.error("Vui lòng đăng nhập");
        navigate("/login");
        return;
      }

      const orderList = await getOrdersByUserId(user.id);

      if (Array.isArray(orderList)) {
        setOrders(orderList);
        await loadReviewsForOrders(orderList, user.id);
      } else if (orderList) {
        setOrders([orderList]);
        await loadReviewsForOrders([orderList], user.id);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        toast.error("Phiên đăng nhập hết hạn");
        navigate("/login");
        return;
      }
      toast.error("Lỗi tải đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewsForOrders = async (orderList, userId) => {
    const reviews = {};
    for (const order of orderList) {
      if (order.status === "COMPLETED" && order.items) {
        for (const item of order.items) {
          if (item.productId) {
            try {
              const review = await getReviewByUserAndProduct(
                userId,
                item.productId
              );
              if (review) reviews[item.productId] = review;
            } catch (error) {
              /* ignore */
            }
          }
        }
      }
    }
    setProductReviews(reviews);
  };

  const handleReorder = async (order) => {
    try {
      const user = parseStoredUser();
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập");
        navigate("/login");
        return;
      }

      const loadingToast = toast.loading("Đang thêm vào giỏ hàng...");
      let successCount = 0;

      for (const item of order.items) {
        const productId = item.productId;
        if (!productId) continue;

        try {
          const product = await getProductById(productId);
          const maxStock = Number.isFinite(product?.stockQuantity)
            ? product.stockQuantity
            : Infinity;

          if (maxStock <= 0) continue;

          const cart = await getCart(user.id);
          const existing = (cart.items || []).find(
            (i) => i.productId === productId || i.id === productId
          );
          const currentQty = existing ? existing.quantity : 0;
          const qtyToAdd = Math.min(
            item.quantity,
            Math.max(0, maxStock - currentQty)
          );

          if (qtyToAdd > 0) {
            await addToCart(user.id, productId, qtyToAdd);
            successCount++;
          }
        } catch (err) {
          console.error(err);
        }
      }

      toast.dismiss(loadingToast);
      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} sản phẩm vào giỏ`);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/cart");
      } else {
        toast.error("Không thể thêm sản phẩm (Hết hàng hoặc lỗi)");
      }
    } catch (error) {
      toast.error("Lỗi đặt lại đơn hàng");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      await cancelOrder(orderId);
      toast.success("Đã hủy đơn hàng");
      loadOrders();
    } catch (error) {
      toast.error("Hủy đơn hàng thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumb items={[{ label: "Đơn hàng của tôi", isCurrent: true }]} />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header & Filter */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Lịch sử đơn hàng
          </h1>

          {/* Scrollable Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === "ALL"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(orderStatusLabels).map(([status, info]) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterStatus === status
                      ? "bg-brand-primary text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* <info.Icon size={14} /> Icon optional on mobile tabs to save space */}
                  {info.label}
                  {count > 0 && (
                    <span className="bg-white/20 px-1.5 rounded-md text-xs">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-primary border-t-transparent"></div>
            <p className="mt-3 text-gray-500 text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Bạn chưa mua sắm tại cửa hàng. Hãy khám phá các sản phẩm tuyệt vời
              ngay nhé!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/20"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders
              .filter(
                (order) =>
                  filterStatus === "ALL" || order.status === filterStatus
              )
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => {
                const statusInfo =
                  orderStatusLabels[order.status] || orderStatusLabels.PENDING;

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden ${
                      orderId === order.id
                        ? "border-brand-primary ring-1 ring-brand-primary"
                        : "border-gray-200 shadow-sm"
                    }`}
                  >
                    {/* Order Header */}
                    <div className="px-4 py-4 sm:px-6 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <Package className="text-brand-primary w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-bold text-gray-900">
                              Đơn #{order.id}
                            </h2>
                            <span className="text-xs text-gray-400">•</span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.items?.length || 0} sản phẩm
                          </p>
                        </div>
                      </div>

                      <div
                        className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusInfo.color}`}
                      >
                        <statusInfo.Icon size={12} />
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                      {/* Left: Info */}
                      <div className="lg:col-span-1 space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.fullName}
                            </p>
                            <p className="text-gray-500 leading-snug mt-0.5">
                              {order.address}
                              {order.ward && `, ${order.ward}`}
                              {order.district && `, ${order.district}`}
                              {order.city && `, ${order.city}`}
                            </p>
                            <p className="text-gray-500 mt-0.5">
                              {order.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-600">
                            {paymentMethodLabels[order.paymentMethod] ||
                              order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Right: Products & Actions */}
                      <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="space-y-3 mb-6 flex-1">
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              onClick={() =>
                                item.productId &&
                                navigate(`/product/${item.productId}`)
                              }
                              className="flex gap-4 p-2 -mx-2 sm:mx-0 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0">
                                <img
                                  src={
                                    item.productImageUrl ||
                                    item.product?.imageUrl ||
                                    "/placeholder.jpg"
                                  }
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) =>
                                    (e.target.src =
                                      "https://placehold.co/100x100?text=No+Img")
                                  }
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {item.productName || item.product?.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span>x{item.quantity}</span>
                                  <span>•</span>
                                  <span className="font-medium text-gray-900">
                                    {(item.price || 0).toLocaleString()}đ
                                  </span>
                                </div>
                              </div>
                              <div className="text-right self-center">
                                <span className="font-bold text-sm text-gray-900">
                                  {(
                                    (item.price || 0) * (item.quantity || 1)
                                  ).toLocaleString()}
                                  đ
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer: Total & Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
                          <div className="flex items-baseline gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <span className="text-sm text-gray-500">
                              Tổng thanh toán:
                            </span>
                            <span className="text-xl font-bold text-red-600">
                              {(
                                order.items?.reduce(
                                  (s, i) => s + i.price * i.quantity,
                                  0
                                ) || 0
                              ).toLocaleString()}
                              đ
                            </span>
                          </div>

                          <div className="flex gap-3 w-full sm:w-auto">
                            {order.status === "PENDING" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium"
                              >
                                <X size={16} /> Hủy đơn
                              </button>
                            )}

                            <button
                              onClick={() => handleReorder(order)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-all text-sm font-medium shadow-sm active:scale-95"
                            >
                              <RotateCcw size={16} /> Mua lại
                            </button>

                            {order.status === "COMPLETED" && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/product/${order.items?.[0]?.productId}`
                                  )
                                }
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/5 transition-all text-sm font-medium"
                              >
                                <Star size={16} /> Đánh giá
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
