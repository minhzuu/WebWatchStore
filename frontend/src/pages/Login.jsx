"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosConfig";
import { Loader2, Gift, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { ZaloIcon } from "@/components/ui/ZaloIcon";
import { getGuestCart, clearGuestCart } from "@/api/guestCart";
import { addToCart } from "@/api/cartAPI";
import { googleSignIn } from "@/api/googleAuth";
import { facebookSignIn } from "@/api/facebookAuth";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  // Ref để gắn nút Google ẩn vào
  const googleButtonRef = useRef(null);
  const googleTimeoutRef = useRef(null);

  const syncGuestCart = async (userId) => {
    const guestItems = getGuestCart();
    if (!guestItems || guestItems.length === 0) return;

    for (const item of guestItems) {
      try {
        const maxStock = Number.isFinite(item?.stock) ? item.stock : Infinity;
        if (maxStock <= 0) {
          toast.error(`Sản phẩm ${item.productName || item.id} đã hết hàng`);
          continue;
        }
        const qty = Math.min(item.quantity, maxStock);
        if (qty < item.quantity) {
          toast.warning(
            `Số lượng sản phẩm ${
              item.productName || item.id
            } đã được điều chỉnh theo tồn kho`
          );
        }
        await addToCart(userId, item.id, qty);
      } catch (err) {
        console.error("Sync cart error:", err);
      }
    }

    clearGuestCart();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitLoading(true);
    try {
      if (isLogin) {
        const res = await axiosInstance.post("/auth/login", {
          username: form.username,
          password: form.password,
        });

        const { data } = res;

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", data.role);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          localStorage.removeItem("user");
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        window.dispatchEvent(new Event("userUpdated"));
        await syncGuestCart(data.user.id);

        navigate("/home");
        toast.success("Đăng nhập thành công!");
      } else {
        await axiosInstance.post("/auth/register", {
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        });
        setShowSuccess(true);
        setForm({
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          fullName: "",
        });
      }
    } catch (err) {
      console.error("Auth error", err);
      const errorMsg =
        err.response?.data ||
        (isLogin
          ? "Tên đăng nhập hoặc mật khẩu không đúng"
          : "Đăng ký thất bại. Vui lòng thử lại.");
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Google credential response
  const handleGoogleCredential = async (response) => {
    if (!response?.credential) {
      toast.error("Google sign-in failed");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await googleSignIn(response.credential);
      const { data } = res;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.role);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      else localStorage.removeItem("user");
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      window.dispatchEvent(new Event("userUpdated"));

      if (data.user?.id) await syncGuestCart(data.user.id);
      navigate("/home");
      toast.success("Đăng nhập bằng Google thành công");
    } catch (err) {
      console.error("Google login error", err);
      toast.error(err.response?.data || "Đăng nhập Google thất bại");
    } finally {
      if (googleTimeoutRef.current) {
        clearTimeout(googleTimeoutRef.current);
        googleTimeoutRef.current = null;
      }
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Identity button
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const mount = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredential,
            auto_select: false,
          });

          // Render nút Google thật vào ref, nhưng chúng ta sẽ ẩn nó bằng CSS
          // Tăng width lên 400 để đảm bảo cover được nút trên mobile khi nó giãn ra
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: "400",
            height: "50",
          });
        } catch (err) {
          console.error("Google Identity init error", err);
        }
      }
    };

    if (window.google && window.google.accounts) {
      mount();
    } else {
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        script.addEventListener("load", mount);
        return () => script.removeEventListener("load", mount);
      }
    }
  }, [isLogin]);

  // Initialize Facebook SDK
  useEffect(() => {
    const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!fbAppId) {
      console.warn("VITE_FACEBOOK_APP_ID not set; Facebook login disabled");
      return;
    }

    const initFB = () => {
      try {
        if (window.FB) {
          window.FB.init({
            appId: fbAppId,
            cookie: true,
            xfbml: false,
            version: "v16.0",
          });
        }
      } catch (err) {
        console.error("FB init error", err);
      }
    };

    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    if (window.FB) {
      initFB();
      return;
    }

    const existingScript = document.querySelector(
      'script[src^="https://connect.facebook.net"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", initFB);
      return () => existingScript.removeEventListener("load", initFB);
    }

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/vi_VN/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onload = initFB;
    script.onerror = () => console.error("Failed to load Facebook SDK");
    document.body.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const processFacebookToken = async (token) => {
    setFbLoading(true);
    const loadingToast = toast.loading("Đang xác thực với Facebook...");

    try {
      const res = await facebookSignIn(token);
      const { data } = res;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.role);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      else localStorage.removeItem("user");
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      window.dispatchEvent(new Event("userUpdated"));
      if (data.user?.id) await syncGuestCart(data.user.id);

      toast.dismiss(loadingToast);
      toast.success("Đăng nhập bằng Facebook thành công");
      navigate("/home");
    } catch (err) {
      console.error("Facebook login error", err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data || "Đăng nhập Facebook thất bại");
    } finally {
      setFbLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!fbAppId) {
      toast.error("Facebook App ID chưa cấu hình");
      return;
    }

    const waitForFB = () =>
      new Promise((resolve, reject) => {
        let count = 0;
        const maxTries = 20;
        const interval = setInterval(() => {
          if (window.FB) {
            clearInterval(interval);
            resolve(window.FB);
          } else if (count++ >= maxTries) {
            clearInterval(interval);
            reject(new Error("Timeout: FB SDK not loaded"));
          }
        }, 300);
      });

    setFbLoading(true);

    waitForFB()
      .then((FB) => {
        FB.login(
          (resp) => {
            if (resp.status === "connected") {
              const token = resp.authResponse.accessToken;
              processFacebookToken(token);
            } else {
              console.log("User cancelled login");
              setFbLoading(false);
            }
          },
          { scope: "email,public_profile" }
        );
      })
      .catch((err) => {
        console.error(err);
        setFbLoading(false);
        toast.error("Không thể tải Facebook SDK. Hãy tắt AdBlock và thử lại.");
      });
  };

  const benefits = [
    {
      icon: ShieldCheck,
      text: "Chiết khấu đến 5% khi mua các sản phẩm tại WatchStore",
    },
    { icon: Gift, text: "Miễn phí giao hàng cho thành viên SMEM, SVIP" },
    { icon: Gift, text: "Tặng voucher sinh nhật đến 500.000đ" },
    { icon: Gift, text: "Trợ giá thu cũ lên đến 1 triệu" },
    { icon: Gift, text: "Thăng hạng nhận voucher đến 300.000đ" },
    {
      icon: Gift,
      text: "Đặc quyền S-Student/S-Teacher ưu đãi thêm đến 10%",
    },
  ];

  return (
    <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, #E1BEE7 0%, #F3E5F5 20%, #FCE4EC 40%, #FFF0F5 60%, #F8BBD9 80%, #E1BEE7 100%)`,
        }}
      />
      <>
        {/* Popup thành công */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>🎉 Đăng ký thành công!</DialogTitle>
              <DialogDescription>
                Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu hành
                trình mới.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setIsLogin(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Đăng nhập ngay
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Giao diện chính */}
        <div className="flex items-center justify-center min-h-screen min-w-screen p-4 absolute z-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
            {/* Cột trái: Quảng cáo - Ẩn trên Mobile (hidden), Hiện trên Desktop (md:block) */}
            <div className="hidden md:block w-1/2 p-12 relative bg-white">
              <div className="border-2 border-red-600 rounded-lg p-6 h-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Nhập hội khách hàng thành viên{" "}
                  <span className="text-red-600">SMEMBER</span>
                </h2>
                <p className="text-gray-600 mb-6">
                  Để không bỏ lỡ các ưu đãi hấp dẫn từ WatchStore
                </p>

                <ul className="space-y-4">
                  {benefits.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <item.icon className="h-5 w-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className="text-red-600 hover:underline font-medium mt-6 inline-block"
                >
                  Xem chi tiết chính sách ưu đãi Smember
                </a>
              </div>
            </div>

            {/* Cột phải: Form - Full width trên Mobile */}
            <div className="w-full md:w-1/2 p-6 md:p-12">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                {isLogin ? "Đăng nhập SMEMBER" : "Đăng ký thành viên"}
              </h2>

              {error && (
                <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {isLogin ? "Tên đăng nhập hoặc email" : "Tên đăng nhập"}
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder={
                      isLogin
                        ? "Nhập tên đăng nhập hoặc email"
                        : "Nhập tên đăng nhập"
                    }
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="Nhập họ và tên"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Nhập email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : isLogin ? (
                    "Đăng nhập"
                  ) : (
                    "Đăng ký tài khoản"
                  )}
                </Button>
              </form>

              {forgotOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white p-6 rounded-lg w-full max-w-md m-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Đặt lại mật khẩu
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
                    </p>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Email của bạn"
                      className="w-full mb-4 px-3 py-2 border rounded"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setForgotOpen(false)}
                      >
                        Huỷ
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!forgotEmail) {
                            toast.error("Vui lòng nhập email");
                            return;
                          }
                          setForgotLoading(true);
                          try {
                            await axiosInstance.post("/auth/forgot-password", {
                              email: forgotEmail,
                            });
                            toast.success(
                              "Đã gửi link xác nhận thay đổi mật khẩu về mail"
                            );
                            setForgotOpen(false);
                            setForgotEmail("");
                          } catch (err) {
                            console.error("Forgot password error", err);
                            toast.error("Có lỗi xảy ra, vui lòng thử lại");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                        disabled={forgotLoading}
                        className="bg-[#e7000b]"
                      >
                        {forgotLoading ? "Đang gửi..." : "Gửi link"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isLogin && (
                <>
                  <div className="flex items-center my-6">
                    <hr className="grow border-gray-300" />
                    <span className="mx-4 text-sm text-gray-500">
                      Hoặc đăng nhập bằng
                    </span>
                    <hr className="grow border-gray-300" />
                  </div>

                  {/* Social Buttons Container: Mobile (dọc), Desktop (ngang) */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {/* Nút Google */}
                    <div className="relative w-full sm:w-auto min-w-[130px]">
                      {/* Lớp phủ Google (ẩn) */}
                      <div
                        ref={googleButtonRef}
                        className="absolute inset-0 z-20 opacity-0 overflow-hidden"
                        style={{ transform: "scale(1.05)" }}
                      />

                      {/* Nút Google Giao diện */}
                      <Button
                        variant="outline"
                        className="flex items-center justify-center w-full relative z-10"
                        disabled={googleLoading}
                        type="button"
                      >
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Google
                      </Button>
                    </div>

                    {/* Nút Facebook */}
                    <Button
                      variant="outline"
                      className="flex items-center justify-center w-full sm:w-auto min-w-[130px] hover:bg-gray-100"
                      onClick={handleFacebookLogin}
                      disabled={fbLoading}
                      type="button"
                    >
                      {fbLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <FacebookIcon className="mr-2 h-5 w-5" />
                      )}
                      Facebook
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                {isLogin ? "Bạn chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="text-red-600 hover:underline font-medium"
                >
                  {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
