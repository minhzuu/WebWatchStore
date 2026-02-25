import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import HeroSection from "@/components/HeroSection";
// import CollectionsSection from "@/components/CollectionsSection"; // Tạm ẩn theo code gốc
import SaleBanner from "@/components/SaleBanner";
import BrandSection from "@/components/BrandSection";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import BannerSlider from "@/components/BannerSlider";
import BannerDisplay from "@/components/BannerDisplay";
import { bannerAPI } from "@/api/cmsAPI";
import { addToCart, getCart } from "@/api/cartAPI";
import { addToGuestCart } from "@/api/guestCart";
import { getProductById } from "@/api/productAPI";
import { parseStoredUser } from "@/utils/storage";
import LatestPosts from "@/components/LatestPosts";

export const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [hasBanners, setHasBanners] = useState(false);

  useEffect(() => {
    const checkBanners = async () => {
      try {
        const response = await bannerAPI.getActive();
        setHasBanners(Array.isArray(response) && response.length > 0);
      } catch {
        setHasBanners(false);
      }
    };
    checkBanners();
  }, []);

  const handleProductsChange = (newProducts, category = null) => {
    if (category) {
      setSelectedCategory(category);
    }
    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();

    // Fetch full product data vì wishlist product không đủ thông tin
    const full = await getProductById(product.id);
    if (!full) {
      toast.error("Không lấy được thông tin sản phẩm 😢");
      return;
    }

    // Guest cart
    if (!token || !user?.id) {
      addToGuestCart(full, 1);
      toast.success("Đã thêm vào giỏ hàng (Khách) 🛒");
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    const maxStock = Number.isFinite(full.stockQuantity)
      ? full.stockQuantity
      : Number.isFinite(full.stock)
      ? full.stock
      : Infinity;

    if (maxStock <= 0) {
      toast.error("Sản phẩm hết hàng");
      return;
    }

    try {
      const cart = await getCart(user.id);
      const existing = (cart.items || []).find(
        (i) => i.productId === full.id || i.id === full.id
      );

      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > maxStock) {
        toast.error("Không thể thêm vượt quá tồn kho");
        return;
      }

      await addToCart(user.id, full.id, 1);
      toast.success("Đã thêm vào giỏ hàng ✅");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ hàng thất bại 😢");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Đồng Hồ Chính Hãng Giá Tốt | WATCH STORE</title>
        <meta
          name="description"
          content="Mua đồng hồ cao cấp chính hãng giá tốt. Rolex, Omega, Casio, G-Shock. Giao hàng toàn quốc, bảo hành chính hãng."
        />
        <meta
          name="keywords"
          content="đồng hồ, đồng hồ chính hãng, mua đồng hồ, rolex, omega, casio"
        />
      </Helmet>
      {/* Header */}
      <Header />

      {/* Navbar for search and categories */}
      {/* Ẩn breadcrumb ở trang chủ vì thường không cần thiết, hoặc để trống như logic cũ */}
      <div className="hidden md:block">
        <Breadcrumb items={[]} />
      </div>

      <main className="flex-1 w-full">
        {/* Banner Slider Section */}
        {hasBanners && (
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Slider 1: Luôn hiện */}
              <div className="rounded-xl overflow-hidden shadow-sm">
                <BannerSlider startIndex={0} />
              </div>

              {/* Slider 2: Ẩn trên mobile để tiết kiệm diện tích dọc */}
              <div className="hidden md:block rounded-xl overflow-hidden shadow-sm">
                <BannerSlider startIndex={2} />
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection />

        {/* Homepage Banners - Static position banners */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <BannerDisplay position="HOMEPAGE_BANNER" />
        </div>

        {/* Sale Banner - Products on Sale */}
        <SaleBanner onAddToCart={handleAddToCart} />

        {/* Brand Section */}
        <BrandSection />

        {/* Collections Section (Optional/Commented out in original) */}
        {/* <CollectionsSection 
          onProductsChange={handleProductsChange}
          onCategorySelect={handleCategorySelect}
        /> */}

        {/* Products Section */}
        <section id="products-section" className="py-12 md:py-20 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <ProductList
              category={selectedCategory}
              sortBy={sortBy}
              order={order}
              pageSize={8}
              status="ACTIVE"
              title={
                selectedCategory ? selectedCategory.name : "Sản Phẩm Mới Nhất"
              }
              description={
                selectedCategory
                  ? `Khám phá bộ sưu tập ${selectedCategory.name} với thiết kế đẳng cấp và công nghệ tiên tiến`
                  : "Khám phá bộ sưu tập đồng hồ cao cấp với thiết kế đẳng cấp và công nghệ tiên tiến"
              }
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>

        {/* Latest Posts */}
        <LatestPosts />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
