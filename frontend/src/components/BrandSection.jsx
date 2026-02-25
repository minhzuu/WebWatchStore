import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrands } from "@/api/brandAPI";
import { Loader2, ShieldCheck, RefreshCw, Award } from "lucide-react";

export default function BrandSection() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const brandsData = await getBrands();
      const brandsArray = Array.isArray(brandsData)
        ? brandsData
        : Array.isArray(brandsData.data)
        ? brandsData.data
        : [];
      const activeBrands = brandsArray.filter((b) => b.status === "ACTIVE");
      setBrands(activeBrands);
    } catch (error) {
      console.error("BrandSection: Error fetching brands:", error);
      setError(error.message || "Không thể tải thương hiệu");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Group brands by first letter
  const groupBrandsByLetter = (brands) => {
    const grouped = {};
    brands.forEach((brand) => {
      if (!brand.name) return;
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(brand);
    });

    // Sort brands within each letter group
    Object.keys(grouped).forEach((letter) => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  // Get grouped and sorted brands
  const getGroupedBrands = () => {
    const grouped = groupBrandsByLetter(brands);
    const letters = Object.keys(grouped).sort();
    return letters.map((letter) => ({
      letter,
      brands: grouped[letter],
    }));
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (error || !brands || brands.length === 0) {
    return null; // Ẩn section nếu lỗi hoặc không có data để tránh xấu giao diện
  }

  const groupedBrands = getGroupedBrands();

  return (
    <section className="py-12 md:py-20 bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 md:px-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-red-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Thương hiệu
          </div>
          <h2 className="mt-4 text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Thương hiệu đồng hồ
            <span className="block text-red-600 font-bold mt-1">
              chuẩn mực & uy tín
            </span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Lựa chọn những tên tuổi hàng đầu thế giới, từ phong cách cổ điển
            sang trọng đến hiện đại đẳng cấp.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 items-start">
          {/* Left Column: Brands List */}
          <div className="relative order-2 lg:order-1">
            {/* Decorative Border */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl bg-linear-to-br from-red-50 via-white to-transparent shadow-[0_0_0_1px_rgba(248,113,113,0.15)]" />

            <div className="relative rounded-2xl md:rounded-3xl bg-white/80 backdrop-blur-sm p-4 md:p-7 shadow-sm">
              {/* Scrollable Area */}
              <div className="max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {/* CSS Columns Layout: Tự động chia cột theo màn hình */}
                <div className="columns-1 sm:columns-2 md:columns-3 gap-x-8 space-y-8">
                  {groupedBrands.map((group) => (
                    <div key={group.letter} className="break-inside-avoid mb-6">
                      {/* Letter Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold shadow-md shadow-red-200">
                          {group.letter}
                        </div>
                        <div className="h-px flex-1 bg-linear-to-r from-red-200 to-transparent opacity-50" />
                      </div>

                      {/* Brands List */}
                      <ul className="space-y-1">
                        {group.brands.map((brand) => (
                          <li
                            key={brand.id}
                            onClick={() =>
                              navigate(
                                `/products?brand=${encodeURIComponent(
                                  brand.name
                                )}`
                              )
                            }
                            className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm md:text-[15px] text-slate-700 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
                          >
                            <span className="truncate group-hover:font-medium">
                              {brand.name}
                            </span>
                            {/* Arrow icon shown on hover */}
                            <span className="text-red-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-xs">
                              →
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info Card */}
          <div className="space-y-5 order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-red-600 via-red-700 to-rose-800 text-white p-6 md:p-8 shadow-xl shadow-red-200/50">
              {/* Background Blobs */}
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-400/30 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 -bottom-16 h-48 w-48 rounded-full bg-rose-400/20 blur-3xl" />

              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-100/90 mb-3 font-medium">
                  Cam kết chất lượng
                </p>
                <h3 className="text-2xl font-bold tracking-tight mb-3">
                  Hơn {brands.length} Thương Hiệu
                </h3>
                <p className="text-sm text-rose-50/90 leading-relaxed mb-6">
                  Được tuyển chọn kỹ càng về nguồn gốc, mang đến trải nghiệm mua
                  sắm đẳng cấp.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                    <Award className="w-5 h-5 text-rose-200 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-rose-200 uppercase tracking-wider font-semibold">
                        Bảo hành
                      </p>
                      <p className="text-sm font-medium">Lên đến 5 năm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                    <RefreshCw className="w-5 h-5 text-rose-200 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-rose-200 uppercase tracking-wider font-semibold">
                        Đổi trả
                      </p>
                      <p className="text-sm font-medium">
                        1 đổi 1 trong 7 ngày
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                    <ShieldCheck className="w-5 h-5 text-rose-200 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-rose-200 uppercase tracking-wider font-semibold">
                        Chính hãng
                      </p>
                      <p className="text-sm font-medium">
                        Hoàn tiền 200% nếu giả
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold text-red-800">Mẹo:</span> Nhấn vào
              tên thương hiệu để xem bộ sưu tập.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
