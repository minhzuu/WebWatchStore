import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderAPI";
import { removeCartItem } from "../api/cartAPI";
import { createVNPayPayment } from "../api/paymentAPI";
import { parseStoredUser } from "@/utils/storage";
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
} from "../api/locationAPI";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MapPin,
  Phone,
  User,
  CreditCard,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";

const paymentMethods = [
  { value: "CASH", label: "Tiền mặt khi nhận hàng (COD)" },
  { value: "VNPAY", label: "Thanh toán qua VNPay" },
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu từ trang Giỏ hàng chuyển qua
  const { selectedItems, totalPrice } = location.state || {
    selectedItems: [],
    totalPrice: 0,
  };

  // --- LOGIC TÍNH TOÁN GIẢM GIÁ MỚI THÊM ---
  // Tính tổng tiền gốc (chưa giảm giá) dựa trên giá gốc của sản phẩm
  const originalTotal = selectedItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * (item.quantity || 1);
  }, 0);

  // Tính số tiền được giảm
  const totalDiscount = originalTotal - totalPrice;
  // ------------------------------------------

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    note: "",
    paymentMethod: "CASH",
  });

  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  // ... (Giữ nguyên các hàm fetchProvinces, fetchDistricts, fetchWards...)
  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const json = await res.json();
      setProvinces(json || []);
    } catch (err) {
      console.error("Failed to load provinces", err);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) return setDistricts([]);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const json = await res.json();
      setDistricts(json?.districts || []);
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  const fetchWards = async (districtCode) => {
    if (!districtCode) return setWards([]);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const json = await res.json();
      setWards(json?.wards || []);
    } catch (err) {
      console.error("Failed to load wards", err);
    }
  };

  useEffect(() => {
    fetchProvinces();
    const user = parseStoredUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, []);

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm từ giỏ hàng");
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.district ||
      !formData.ward
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Đơn hàng đang xử lý...");

    try {
      const user = parseStoredUser();
      if (!user?.id) {
        toast.dismiss(loadingToast);
        toast.error("Vui lòng đăng nhập để đặt hàng");
        navigate("/login");
        return;
      }

      const orderRequest = {
        userId: user.id,
        // Build order items and include final unit price (apply totalDiscount proportionally)
        orderItems: (() => {
          const items = [];
          const totalItems = selectedItems.length;
          let runningSubtotal = 0;

          selectedItems.forEach((item, idx) => {
            const productId = item.productId;
            if (!productId) throw new Error("Sản phẩm không hợp lệ");
            const qty = item.quantity || 1;

            // base price (original product price shown in cart)
            const base = Number(item.price || 0);

            // If the item already has a discountedPrice field use it
            if (
              item.discountedPrice !== undefined &&
              item.discountedPrice !== null
            ) {
              const unitPrice = Math.round(Number(item.discountedPrice));
              runningSubtotal += unitPrice * qty;
              items.push({ productId, quantity: qty, price: unitPrice });
              return;
            }

            // If there is a totalDiscount, distribute it proportionally
            let unitPrice;
            if (totalDiscount > 0 && originalTotal > 0) {
              const itemTotal = base * qty;
              const proportion = itemTotal / originalTotal;
              const itemTotalAfter = itemTotal - proportion * totalDiscount;
              unitPrice = Math.round(itemTotalAfter / qty);

              // If this is the last item, fix rounding diff so totals match exactly
              if (idx === totalItems - 1) {
                const expectedTotal = Math.round(totalPrice);
                const currentTotal = runningSubtotal + unitPrice * qty;
                const diff = expectedTotal - currentTotal;
                if (diff !== 0) {
                  // adjust unitPrice to absorb the remaining diff
                  unitPrice = unitPrice + Math.round(diff / qty);
                }
              }
            } else {
              unitPrice = Math.round(base);
            }

            runningSubtotal += unitPrice * qty;
            items.push({ productId, quantity: qty, price: unitPrice });
          });

          return items;
        })(),
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        ward: formData.ward || "",
        district: formData.district || "",
        city: formData.city,
        note: formData.note || "",
        paymentMethod: formData.paymentMethod,
      };

      const response = await createOrder(orderRequest);
      const order = response?.data || response;

      if (formData.paymentMethod === "VNPAY") {
        try {
          sessionStorage.setItem(
            "vnpay_cart_items",
            JSON.stringify(selectedItems)
          );
          const vnpayResponse = await createVNPayPayment({
            orderId: order.id,
            amount: Math.round(totalPrice), // VNPay thanh toán số tiền cuối cùng
            orderInfo: `Thanh toan don hang ${order.id}`,
            returnUrl: `${window.location.origin}/payment/vnpay-return`,
          });

          if (vnpayResponse?.code === "00" && vnpayResponse?.paymentUrl) {
            toast.dismiss(loadingToast);
            toast.success("Đang chuyển đến cổng thanh toán VNPay...");
            window.location.href = vnpayResponse.paymentUrl;
            return;
          } else {
            throw new Error(
              vnpayResponse?.message || "Lỗi tạo thanh toán VNPay"
            );
          }
        } catch (vnpayError) {
          toast.dismiss(loadingToast);
          toast.error("Lỗi VNPay: " + vnpayError.message);
          return;
        }
      }

      try {
        for (const item of selectedItems) {
          if (item.id) await removeCartItem(item.id);
        }
      } catch (error) {
        console.error("Lỗi xóa giỏ hàng:", error);
      }

      toast.dismiss(loadingToast);
      toast.success("Đặt hàng thành công!");
      navigate("/orders", { state: { orderId: order?.id } });
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMsg =
        error.response?.data?.message || error.message || "Lỗi đặt hàng";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedItems || selectedItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumb
        items={[
          { label: "Giỏ hàng", href: "/cart" },
          { label: "Thanh toán", isCurrent: true },
        ]}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Delivery Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                Thông tin giao hàng
              </h2>

              <form
                id="checkout-form"
                onSubmit={handleSubmitOrder}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                        placeholder="09xx xxx xxx"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Select Tỉnh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tỉnh/Thành <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedProvinceCode}
                      onValueChange={(value) => {
                        setSelectedProvinceCode(value);
                        setSelectedDistrictCode("");
                        setSelectedWardCode("");
                        setDistricts([]);
                        setWards([]);

                        const prov = provinces.find(
                          (p) => String(p.code) === String(value)
                        );
                        setFormData((prev) => ({
                          ...prev,
                          city: prov?.name || "",
                          district: "",
                          ward: "",
                        }));

                        if (value) fetchDistricts(value);
                      }}
                    >
                      <SelectTrigger className="w-full h-[42px]">
                        <SelectValue placeholder="Chọn Tỉnh/Thành" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((prov) => (
                          <SelectItem key={prov.code} value={String(prov.code)}>
                            {prov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Huyện */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <Select
                      disabled={!selectedProvinceCode}
                      value={selectedDistrictCode}
                      onValueChange={(value) => {
                        setSelectedDistrictCode(value);
                        setSelectedWardCode("");
                        setWards([]);

                        const dist = districts.find(
                          (d) => String(d.code) === String(value)
                        );
                        setFormData((prev) => ({
                          ...prev,
                          district: dist?.name || "",
                          ward: "",
                        }));

                        if (value) fetchWards(value);
                      }}
                    >
                      <SelectTrigger className="w-full h-[42px]">
                        <SelectValue placeholder="Chọn Quận/Huyện" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.code} value={String(d.code)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Xã */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <Select
                      disabled={!selectedDistrictCode}
                      value={selectedWardCode}
                      onValueChange={(value) => {
                        setSelectedWardCode(value);
                        const ward = wards.find(
                          (w) => String(w.code) === String(value)
                        );
                        setFormData((prev) => ({
                          ...prev,
                          ward: ward?.name || "",
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full h-[42px]">
                        <SelectValue placeholder="Chọn Phường/Xã" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w.code} value={String(w.code)}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none"
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                  />
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-primary" />
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === method.value
                        ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-brand-primary"
                    />
                    <span className="ml-3 font-medium text-gray-900">
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                Đơn hàng của bạn
              </h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {selectedItems.map((item) => {
                  const imageUrl =
                    item.imageUrl || "https://via.placeholder.com/60";
                  // Ở đây dùng item.price gốc (vì nó là thông tin sản phẩm)
                  const price = Number(item.price) || 0;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.productName}
                        </h3>
                        <div className="mt-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">x {item.quantity}</p>
                          <p className="font-semibold text-gray-900">
                            {(price * item.quantity).toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BẮT ĐẦU PHẦN TỔNG TIỀN ĐÃ CẬP NHẬT */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {/* Tổng tiền gốc */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tổng tiền hàng</span>
                  <span>{originalTotal.toLocaleString()}đ</span>
                </div>

                {/* Giảm giá - Chỉ hiện nếu có giảm */}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      <TicketPercent className="w-4 h-4" /> Giảm giá
                    </span>
                    <span>-{totalDiscount.toLocaleString()}đ</span>
                  </div>
                )}

                {/* Phí vận chuyển */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>

                {/* Tổng thanh toán cuối cùng */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-base font-semibold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-bold text-brand-primary">
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>
              {/* KẾT THÚC PHẦN TỔNG TIỀN */}

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full mt-6 bg-brand-primary text-white py-3.5 rounded-xl font-semibold hover:bg-brand-primary-dark transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt hàng ngay"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
