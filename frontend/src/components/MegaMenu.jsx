import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock, Hash, Gift, FileText } from "lucide-react";
import { postCategoryAPI } from "@/api/cmsAPI";

const MegaMenu = ({ categories, brands, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [postCategories, setPostCategories] = useState([]);

  useEffect(() => {
    const loadPostCategories = async () => {
      try {
        const data = await postCategoryAPI.getAll();
        const categoriesArray = Array.isArray(data) ? data : [];
        const activeCategories = categoriesArray.filter(
          (cat) => cat.status === "ACTIVE"
        );
        setPostCategories(activeCategories);
      } catch (error) {
        console.error("Error loading post categories:", error);
      }
    };
    if (isOpen) {
      loadPostCategories();
    }
  }, [isOpen]);

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleCategoryClick = (categoryId) => {
    handleNavigate(`/products?category=${categoryId}`);
  };

  const handleBrandClick = (brandName) => {
    handleNavigate(`/products?brand=${brandName}`);
  };

  if (!isOpen) return null;

  const displayBrands = brands.slice(0, 15);

  return (
    <div className="absolute left-0 mt-2 w-[900px] bg-card text-card-foreground rounded-lg shadow-xl border border-border overflow-hidden z-50">
      <div className="grid grid-cols-4 gap-6 p-6">
        {/* Column 1 - Loại Đồng Hồ */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 pb-2 border-b border-border flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <span>Loại Đồng Hồ</span>
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate("/products")}
              className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
            >
              <span>Tất cả đồng hồ</span>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            {categories.length > 0 ? (
              <div className="space-y-0.5 mt-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
                  >
                    <span>{category.name}</span>
                    <ChevronRight
                      size={14}
                      className={`transition-all ${
                        hoveredCategory === category.id
                          ? "opacity-100 translate-x-1"
                          : "opacity-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground px-3 py-2">
                Đang tải danh mục...
              </p>
            )}
          </div>
        </div>

        {/* Column 2 - Thương Hiệu */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 pb-2 border-b border-border flex items-center gap-2">
            <Hash size={16} className="text-brand-primary" />
            <span>Thương Hiệu</span>
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate("/products")}
              className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
            >
              <span>Tất cả thương hiệu</span>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            {displayBrands.length > 0 ? (
              <div className="space-y-0.5 mt-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {displayBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandClick(brand.name)}
                    onMouseEnter={() => setHoveredBrand(brand.name)}
                    onMouseLeave={() => setHoveredBrand(null)}
                    className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{brand.name}</span>
                    <ChevronRight
                      size={14}
                      className={`flex-shrink-0 transition-all ${
                        hoveredBrand === brand.id
                          ? "opacity-100 translate-x-1"
                          : "opacity-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground px-3 py-2">
                Đang tải thương hiệu...
              </p>
            )}

            {brands.length > 15 && (
              <button
                onClick={() => handleNavigate("/products")}
                className="w-full text-left px-3 py-2 text-sm text-brand-primary font-medium hover:bg-brand-accent-soft/50 rounded transition-colors mt-2 border-t border-border pt-3"
              >
                Xem tất cả ({brands.length})
              </button>
            )}
          </div>
        </div>

        {/* Column 3 - Khuyến Mãi */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 pb-2 border-b border-border flex items-center gap-2">
            <Gift size={16} className="text-red-500" />
            <span>Khuyến Mãi</span>
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate("/promotional-products")}
              className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
            >
              <span>Tất cả khuyến mãi</span>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            <div className="space-y-0.5 mt-2">
              <button
                onClick={() =>
                  handleNavigate("/promotional-products?status=active")
                }
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                <span>Đang diễn ra</span>
              </button>

              <button
                onClick={() =>
                  handleNavigate("/promotional-products?status=upcoming")
                }
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span>Sắp diễn ra</span>
              </button>

              <button
                onClick={() =>
                  handleNavigate("/promotional-products?status=ended")
                }
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
                <span>Đã kết thúc</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 mb-2">
                Ưu đãi đặc biệt
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleNavigate("/products?sort=discount")}
                  className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    SALE
                  </span>
                  <span className="text-xs">Sản phẩm giảm giá</span>
                </button>

                <button
                  onClick={() => handleNavigate("/products?sort=best-seller")}
                  className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    HOT
                  </span>
                  <span className="text-xs">Bán chạy nhất</span>
                </button>

                <button
                  onClick={() => handleNavigate("/products?sort=newest")}
                  className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    MỚI
                  </span>
                  <span className="text-xs">Sản phẩm mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4 - Bài Viết */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 pb-2 border-b border-border flex items-center gap-2">
            <FileText size={16} className="text-brand-primary" />
            <span>Bài Viết</span>
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate("/posts")}
              className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
            >
              <span>Tất cả bài viết</span>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            {postCategories.length > 0 ? (
              <div className="space-y-0.5 mt-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {postCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleNavigate(`/posts/${category.slug}`)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center justify-between group"
                  >
                    <span>{category.name}</span>
                    <ChevronRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground px-3 py-2 mt-2">
                Đang tải danh mục...
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 mb-2">
                Nổi bật
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleNavigate("/posts?featured=true")}
                  className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    HOT
                  </span>
                  <span className="text-xs">Bài viết hot</span>
                </button>

                <button
                  onClick={() => handleNavigate("/posts?sort=latest")}
                  className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    MỚI
                  </span>
                  <span className="text-xs">Bài viết mới</span>
                </button>

                <button
                  onClick={() => handleNavigate("/posts?sort=popular")}
                  className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:text-brand-primary hover:bg-brand-accent-soft/50 rounded transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    TOP
                  </span>
                  <span className="text-xs">Xem nhiều nhất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
