// Footer.jsx
import React, { useState, useEffect } from "react";
import { getGeneralSettings } from "@/api/settingsAPI";
import BannerDisplay from "@/components/BannerDisplay";
import {
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [settings, setSettings] = useState({
    siteName: "WATCH STORE",
    logo: "",
    email: "",
    hotline: "",
    address: "",
    copyright: "",
    slogan: "",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    zaloUrl: "",
    paymentMethods: "[]",
    socialMedia: "[]",
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getGeneralSettings();
        setSettings(data);

        try {
          const methods = JSON.parse(data.paymentMethods || "[]");
          setPaymentMethods(methods);
        } catch (e) {
          console.error("Failed to parse payment methods:", e);
          setPaymentMethods([]);
        }

        try {
          const social = JSON.parse(data.socialMedia || "[]");
          setSocialMedia(social);
        } catch (e) {
          console.error("Failed to parse social media:", e);
          setSocialMedia([]);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!subscribeEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Đăng ký nhận tin thành công!");
      setSubscribeEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-gray-100 text-gray-800 mt-16 w-full border-t border-gray-200">
      {/* Footer Banners */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <BannerDisplay position="FOOTER" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-gray-300 mb-8">
          {/* Logo & Company */}
          <div className="flex flex-col items-start">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-12 md:h-14 w-auto mb-4 object-contain"
              />
            ) : (
              <h3 className="text-2xl font-bold mb-4 text-brand-primary">
                {settings.siteName}
              </h3>
            )}
            {settings.slogan && (
              <p className="text-sm italic text-gray-600 leading-relaxed max-w-xs">
                {settings.slogan}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            {/* <h3 className="font-bold text-gray-900 mb-4 text-base uppercase tracking-wide">
              Liên hệ
            </h3>
            <div className="space-y-3">
              {settings.address && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="shrink-0 mt-0.5">📍</span>
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.hotline && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="shrink-0">📞</span>
                  <a
                    href={`tel:${settings.hotline}`}
                    className="font-bold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {settings.hotline}
                  </a>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="shrink-0">✉️</span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
            </div> */}
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            {settings.address && (
              <p className="text-sm mb-3 flex items-center gap-2">
                <MapPin size={20} />
                <span>{settings.address}</span>
              </p>
            )}
            {settings.hotline && (
              <p className="text-sm mb-3 flex items-center gap-2">
                <Phone size={20} />
                <a
                  href={`tel:${(settings.hotline || "").replace(/\s+/g, "")}`}
                  aria-label={`Gọi ${settings.hotline}`}
                  title={`Gọi ${settings.hotline}`}
                  className="font-semibold hover:underline"
                >
                  {settings.hotline}
                </a>
              </p>
            )}
            {settings.email && (
              <p className="text-sm flex items-center gap-2">
                <Mail size={20} />
                <a
                  href={`mailto:${settings.email}`}
                  aria-label={`Gửi email tới ${settings.email}`}
                  title={`Gửi email tới ${settings.email}`}
                  className="hover:underline"
                >
                  {settings.email}
                </a>
              </p>
            )}
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-base uppercase tracking-wide">
              Đăng ký nhận tin
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Nhận thông tin khuyến mãi và sản phẩm mới nhất từ chúng tôi.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex gap-2 w-full max-w-sm"
            >
              <input
                type="email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Policy */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              Chính sách
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[
                "Hướng dẫn mua hàng",
                "Phương thức thanh toán",
                "Chính sách giao hàng",
                "Chính sách đổi trả",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              Về chúng tôi
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[
                "Giới thiệu công ty",
                "Tin tức & Sự kiện",
                "Hệ thống cửa hàng",
                "Liên hệ hợp tác",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {[
                "Chính sách bảo hành",
                "Kiểm tra bảo hành",
                "Chính sách bảo mật",
                "Điều khoản sử dụng",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Payment */}
          <div className="col-span-2 md:col-span-1">
            {socialMedia.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  Kết nối
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      className="hover:opacity-80 hover:scale-110 transition-transform duration-200"
                    >
                      <img
                        src={social.imageUrl}
                        alt={social.name}
                        className="h-8 w-8 object-contain rounded-md"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {paymentMethods.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                  Thanh toán
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      className="bg-white p-1.5 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={method.imageUrl}
                        alt={method.name}
                        title={method.name}
                        className="h-6 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-200 border-t border-gray-300 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-xs md:text-sm font-medium">
            {settings.copyright ||
              `© ${new Date().getFullYear()} ${
                settings.siteName
              }. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
