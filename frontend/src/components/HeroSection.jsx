import React from "react";
import { useNavigate } from "react-router";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleShopCollection = () => {
    navigate("/products");
  };

  const handleLearnMore = () => {
    navigate("/about");
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-64px)] lg:min-h-[700px] flex items-center bg-linear-to-b from-blue-50/50 via-purple-50/30 to-white overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Right Section - Product Image (Order 1 on Mobile, Order 2 on Desktop) */}
          {/* Đưa ảnh lên đầu ở mobile để gây ấn tượng thị giác ngay lập tức */}
          <div className="relative flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[320px] sm:max-w-md lg:max-w-xl mx-auto">
              {/* Background gradient shape */}
              <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-orange-900/80 rounded-4xl transform rotate-3 opacity-95 shadow-2xl transition-transform duration-700 hover:rotate-6"></div>

              {/* Image container */}
              <div className="relative rounded-4xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-700 bg-gray-900">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                  alt="Đồng Hồ Cao Cấp"
                  className="w-full h-auto object-cover aspect-square hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3ESmart Watch%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Decorative blur elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-blue-500 rounded-full opacity-20 blur-[60px] animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 md:w-52 md:h-52 bg-purple-500 rounded-full opacity-20 blur-[60px] animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Left Section - Text Content (Order 2 on Mobile, Order 1 on Desktop) */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8 order-2 lg:order-1 text-center lg:text-left">
            {/* Headline */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-800 font-bold animate-fade-in-up">
                PRECISION TIMEKEEPING
              </p>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                <span className="font-serif block">Elegance Meets</span>
                <span className="font-serif text-blue-900 block mt-1">
                  Innovation
                </span>
              </h1>
            </div>

            {/* Body Text */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
              Khám phá bộ sưu tập đồng hồ điện tử cao cấp được tuyển chọn của
              chúng tôi, nơi độ chính xác gặp gỡ thiết kế đương đại. Mỗi chiếc
              đồng hồ là một kiệt tác của kỹ thuật và nghề thủ công.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center lg:justify-start w-full">
              <button
                onClick={handleShopCollection}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
              >
                Xem Bộ Sưu Tập
              </button>
              <button
                onClick={handleLearnMore}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 active:scale-95"
              >
                Tìm Hiểu Thêm
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-8 border-t border-gray-200 mt-4">
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  500+
                </p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1 font-medium uppercase tracking-wide">
                  Sản Phẩm
                </p>
              </div>
              <div className="text-center lg:text-left border-l border-gray-200 lg:border-none">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  25k+
                </p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1 font-medium uppercase tracking-wide">
                  Khách Hàng
                </p>
              </div>
              <div className="text-center lg:text-left border-l border-gray-200 lg:border-none">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  99%
                </p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-1 font-medium uppercase tracking-wide">
                  Hài Lòng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
