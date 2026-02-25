import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  ChevronDown,
  Grid3x3,
  Bell,
  Heart,
  LifeBuoy,
  Menu,
  X,
  Clock,
  Gift,
  FileText,
  Hash,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { getCategories } from "@/api/categoryAPI.js"; // Đảm bảo đường dẫn import đúng
import { getBrands } from "@/api/brandAPI.js"; // Đảm bảo đường dẫn import đúng
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "@/api/notificationAPI";
import {
  connectNotificationWebSocket,
  disconnectNotificationWebSocket,
} from "@/api/notificationWebSocket";
import { parseStoredUser } from "@/utils/storage";
import { getWishlistCount } from "@/api/wishlistAPI";
import { getCart, getCartCount } from "@/api/cartAPI";
import { getGuestCartCount } from "@/api/guestCart";
import { searchProducts, getProducts } from "@/api/productAPI";
import { MdTrendingUp } from "react-icons/md";
import { getGeneralSettings } from "@/api/settingsAPI";
import MegaMenu from "./MegaMenu";

export default function Header() {
  const navigate = useNavigate();
  // State quản lý UI
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // State quản lý Accordion trên Mobile
  const [mobileSubmenu, setMobileSubmenu] = useState("");

  // Data State
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cartCount, _setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [settings, setSettings] = useState({
    siteName: "WATCH STORE",
    logo: "",
  });

  // Animation State
  const [cartAnimation, setCartAnimation] = useState(false);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationAnimation, setNotificationAnimation] = useState(false);

  const userDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // User info
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const [userState, setUserState] = useState(parseStoredUser() || {});

  const formatNotificationDate = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "--";

  const getNotificationType = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const message = notification.message?.toLowerCase() || "";

    if (title.includes("khuyến mãi") || title.includes("🎉"))
      return "promotion";
    if (title.includes("đơn hàng") || message.includes("đơn hàng"))
      return "order";
    if (title.includes("đánh giá")) return "review";
    return "general";
  };

  const handleNotificationClick = async (notification) => {
    const type = getNotificationType(notification);
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id, userState.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      }
    }
    setIsNotificationDropdownOpen(false);
    switch (type) {
      case "promotion":
        navigate("/promotional-products");
        break;
      case "order":
        navigate("/orders");
        break;
      case "review":
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  // Load search history từ localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Lỗi khi đọc lịch sử tìm kiếm:", error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Load trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const data = await getProducts({
          page: 0,
          size: 6,
          sortBy: "createdAt",
          order: "desc",
        });
        setTrendingProducts(data.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm trending:", error);
        setTrendingProducts([]);
      }
    };
    fetchTrendingProducts();
  }, []);

  // Lưu search history vào localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Xử lý tìm kiếm realtime
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Logic: Chỉ search khi có input. Nếu rỗng thì chỉ mở dropdown (để hiện history)
      if (searchTerm.trim() === "") {
        setSearchSuggestions(null);
        return;
      }
      setIsLoading(true);
      try {
        const searchResults = await searchProducts(searchTerm);
        const results = Array.isArray(searchResults) ? searchResults : [];
        const suggestions = {
          exactMatches: results.slice(0, 5),
          suggestedProducts: results.slice(5, 10),
        };
        setSearchSuggestions(suggestions);
      } catch (error) {
        setSearchSuggestions({
          exactMatches: [],
          suggestedProducts: [],
        });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [searchTerm]);

  // Load notifications callback
  const loadNotifications = useCallback(async () => {
    if (!userState?.id || !token) {
      setNotifications([]);
      setUnreadNotifications(0);
      return 0;
    }
    try {
      const data = await getNotificationsByUser(userState.id);
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const unreadCount = list.filter((item) => !item.read).length;
      setUnreadNotifications(unreadCount);
      return unreadCount;
    } catch (error) {
      setNotifications([]);
      setUnreadNotifications(0);
      return 0;
    }
  }, [userState?.id, token]);

  // Initial Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        const categoriesArray = Array.isArray(categoriesData)
          ? categoriesData
          : Array.isArray(categoriesData.data)
          ? categoriesData.data
          : [];
        setCategories(categoriesArray.filter((cat) => cat.status === "ACTIVE"));

        const brandsData = await getBrands();
        const brandsArray = Array.isArray(brandsData)
          ? brandsData
          : Array.isArray(brandsData.data)
          ? brandsData.data
          : [];
        setBrands(brandsArray.filter((b) => b.status === "ACTIVE"));

        const settingsData = await getGeneralSettings();
        setSettings(settingsData);
      } catch (error) {
        setCategories([]);
        setBrands([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // WebSocket
  useEffect(() => {
    if (!userState?.id || !token) return;
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotifications((prev) => prev + 1);
      setNotificationAnimation(true);
      setTimeout(() => setNotificationAnimation(false), 600);
      toast.success(notification.title, { description: notification.message });
    };
    const ws = connectNotificationWebSocket(
      userState.id,
      handleNewNotification
    );
    return () => disconnectNotificationWebSocket();
  }, [userState?.id, token]);

  // Update counts (Wishlist, Cart)
  useEffect(() => {
    const updateWishlistCount = () => {
      const newCount = getWishlistCount();
      if (newCount > wishlistCount) {
        setWishlistAnimation(true);
        setTimeout(() => setWishlistAnimation(false), 600);
      }
      setWishlistCount(newCount);
    };
    updateWishlistCount();
    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
    };
  }, [wishlistCount]);

  useEffect(() => {
    const updateCartCount = () => {
      const token = localStorage.getItem("accessToken");
      const user = parseStoredUser();
      if (!token || !user?.id) {
        _setCartCount(getGuestCartCount());
      } else {
        getCart(user.id)
          .then((res) => {
            const totalQuantity = Array.isArray(res?.items)
              ? res.items.reduce(
                  (sum, it) => sum + (Number(it.quantity) || 0),
                  0
                )
              : 0;
            _setCartCount(totalQuantity);
          })
          .catch(() => _setCartCount(0));
      }
    };
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const onUserUpdated = () => setUserState(parseStoredUser() || {});
    const onStorage = (e) => {
      if (
        !e.key ||
        e.key === "user" ||
        e.key === "accessToken" ||
        e.key === "role"
      ) {
        setUserState(parseStoredUser() || {});
      }
    };
    window.addEventListener("userUpdated", onUserUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("userUpdated", onUserUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        // Chỉ đóng desktop dropdown khi click ra ngoài, mobile xử lý riêng
        setIsSearchDropdownOpen(false);
        setIsSearchInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("userUpdated"));
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = () => {
    const term = searchTerm.trim();
    if (!term) return;

    const newHistory = [
      term,
      ...searchHistory.filter((item) => item !== term),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    setIsSearchDropdownOpen(false);
    setIsMobileSearchOpen(false); // Close mobile search
    navigate(`/products?name=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryClick = (categoryId) => {
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/products?category=${categoryId}`);
  };

  const handleBrandClick = (brandName) => {
    setIsMobileMenuOpen(false);
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  const handleToggleNotifications = async () => {
    if (!userState?.id || !token) {
      navigate("/login");
      return;
    }
    if (!isNotificationDropdownOpen) await loadNotifications();
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  const handleClearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleRemoveSearchHistoryItem = (index) => {
    const newHistory = [...searchHistory];
    newHistory.splice(index, 1);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleSuggestionClick = (product) => {
    setIsSearchDropdownOpen(false);
    setIsMobileSearchOpen(false); // Close mobile search
    setSearchTerm("");
    navigate(`/product/${product.productId || product.id}`);
  };

  const formatPrice = (product) => {
    if (product.currentPrice) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.currentPrice);
    }
    if (product.price) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.price);
    }
    return "Liên hệ";
  };

  const getPrimaryImage = (product) => {
    if (!product) return "https://via.placeholder.com/80";
    if (product.imageUrl) return product.imageUrl;
    if (product.primaryImageUrl) return product.primaryImageUrl;
    if (Array.isArray(product.productImages)) {
      const primary = product.productImages.find((img) => img.isPrimary);
      if (primary && primary.imageUrl) return primary.imageUrl;
      if (product.productImages.length > 0 && product.productImages[0].imageUrl)
        return product.productImages[0].imageUrl;
    }
    return "https://via.placeholder.com/80";
  };

  const toggleSubmenu = (menu) => {
    setMobileSubmenu(mobileSubmenu === menu ? "" : menu);
  };

  // --- REUSABLE CONTENT: Search Dropdown Content ---
  // Tách phần render nội dung dropdown ra để dùng chung cho cả Mobile và Desktop
  const searchDropdownContent = (
    <div className="bg-white rounded-lg">
      {!searchTerm.trim() && (
        <div className="p-4">
          {searchHistory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Clock size={16} /> Lịch sử tìm kiếm
                </h3>
                <button
                  onClick={handleClearSearchHistory}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer group"
                    onClick={() => {
                      setSearchTerm(item);
                      // Chạy tìm kiếm
                      const newHistory = [
                        item,
                        ...searchHistory.filter((i) => i !== item),
                      ].slice(0, 10);
                      setSearchHistory(newHistory);
                      localStorage.setItem(
                        "searchHistory",
                        JSON.stringify(newHistory)
                      );
                      setIsSearchDropdownOpen(false);
                      setIsMobileSearchOpen(false);
                      setIsSearchInputFocused(false);
                      navigate(`/products?name=${encodeURIComponent(item)}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSearchHistoryItem(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MdTrendingUp className="text-xl text-blue-500" /> Xu hướng tìm
              kiếm
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {trendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    handleSuggestionClick(product);
                  }}
                >
                  <img
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-brand-primary">
                      {formatPrice(product)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {searchTerm.trim() && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              <span className="ml-3 text-gray-500">Đang tìm kiếm...</span>
            </div>
          ) : searchSuggestions ? (
            <>
              <div className="mb-2 text-xs text-gray-400">
                Tìm thấy{" "}
                {searchSuggestions.exactMatches?.length +
                  searchSuggestions.suggestedProducts?.length}{" "}
                kết quả
              </div>

              {searchSuggestions.exactMatches?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Có phải bạn muốn tìm
                  </h3>
                  <div className="space-y-3">
                    {searchSuggestions.exactMatches.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => {
                          setIsSearchInputFocused(false);
                          handleSuggestionClick(product);
                        }}
                      >
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-brand-primary mt-1">
                            {formatPrice(product)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchSuggestions.suggestedProducts?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Sản phẩm gợi ý
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {searchSuggestions.suggestedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => {
                          setIsSearchInputFocused(false);
                          handleSuggestionClick(product);
                        }}
                      >
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-brand-primary">
                            {formatPrice(product)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchSuggestions.exactMatches?.length === 0 &&
                searchSuggestions.suggestedProducts?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Không tìm thấy sản phẩm phù hợp
                    </p>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nhập từ khóa để tìm kiếm</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-primary text-brand-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-4">
          {/* --- MOBILE: Hamburger Menu --- */}
          <button
            className="lg:hidden p-2 -ml-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* --- Logo --- */}
          <div
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:opacity-90 transition-opacity shrink-0 mr-auto lg:mr-0"
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              <div className="text-brand-primary-foreground text-lg md:text-2xl font-bold whitespace-nowrap">
                {settings.siteName}
              </div>
            )}
          </div>

          {/* --- DESKTOP: Category Mega Menu --- */}
          <div className="relative hidden lg:block" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-brand-primary-foreground/10 hover:bg-brand-primary-foreground/20 text-brand-primary-foreground rounded-lg transition-colors"
            >
              <Grid3x3 size={18} />
              <span className="font-medium">Danh mục</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <MegaMenu
              categories={categories}
              brands={brands}
              isOpen={isCategoryDropdownOpen}
              onClose={() => setIsCategoryDropdownOpen(false)}
            />
          </div>

          {/* --- DESKTOP: Search Bar --- */}
          <div className="flex-1 max-w-2xl relative" ref={searchDropdownRef}>
            <div className="relative hidden lg:block">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  setIsSearchInputFocused(true);
                  setIsSearchDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Bạn muốn mua gì hôm nay?"
                className="bg-brand-primary-foreground w-full px-4 py-2.5 pr-12 rounded-lg border-0 focus:outline-none text-brand-ink placeholder-text-muted"
              />
              <button
                onClick={handleSearch}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:text-brand-primary-soft transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </div>

            {/* Desktop Search Dropdown */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto z-50 hidden lg:block">
                {searchDropdownContent}
              </div>
            )}
          </div>

          {/* --- ACTION ICONS --- */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden cursor-pointer p-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg"
            >
              {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className={`cursor-pointer relative flex items-center gap-2 p-2 md:px-3 md:py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                wishlistAnimation ? "animate-bounce scale-110" : ""
              }`}
            >
              <Heart
                size={20}
                className={`transition-all ${
                  wishlistAnimation ? "scale-125 text-red-400" : ""
                }`}
              />
              <span className="hidden xl:inline font-medium">Yêu thích</span>
              {wishlistCount > 0 && (
                <span
                  className={`absolute top-0 right-0 md:-top-1 md:-right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1 ${
                    wishlistAnimation ? "animate-ping" : ""
                  }`}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className={`cursor-pointer relative flex items-center gap-2 p-2 md:px-3 md:py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                cartAnimation ? "animate-bounce scale-110" : ""
              }`}
            >
              <ShoppingCart
                size={20}
                className={`transition-all ${
                  cartAnimation ? "scale-125 text-green-400" : ""
                }`}
              />
              <span className="hidden xl:inline font-medium">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 md:-top-1 md:-right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={handleToggleNotifications}
                className={`cursor-pointer relative flex items-center gap-2 p-2 md:px-3 md:py-2 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-all ${
                  notificationAnimation ? "animate-bounce scale-110" : ""
                }`}
              >
                <Bell
                  size={20}
                  className={`transition-all ${
                    notificationAnimation ? "scale-125 text-yellow-400" : ""
                  }`}
                />
                <span className="hidden xl:inline font-medium">Thông báo</span>
                {unreadNotifications > 0 && (
                  <span
                    className={`absolute top-0 right-0 md:-top-1 md:-right-1 bg-brand-accent-soft text-brand-accent text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1 ${
                      notificationAnimation ? "animate-ping" : ""
                    }`}
                  >
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>
              {isNotificationDropdownOpen && (
                <div className="fixed inset-x-4 top-16 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 bg-brand-primary-foreground rounded-lg shadow-xl border border-border overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Thông báo
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {unreadNotifications > 0
                        ? `${unreadNotifications} chưa đọc`
                        : "Đã đọc tất cả"}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 text-sm text-foreground transition-colors cursor-pointer hover:bg-brand-accent-soft/50 ${
                            notification.read
                              ? "bg-card"
                              : "bg-brand-accent-soft"
                          }`}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {formatNotificationDate(notification.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Menu */}
            <div className="relative hidden md:block" ref={userDropdownRef}>
              {token ? (
                <>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 md:px-3 text-brand-primary-foreground hover:bg-brand-primary-foreground/20 rounded-lg transition-colors"
                  >
                    {userState.avatarUrl ? (
                      <img
                        src={userState.avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="hidden xl:inline font-medium max-w-[100px] truncate">
                      {userState.fullName || userState.username || "User"}
                    </span>
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-card text-card-foreground rounded-lg shadow-xl py-2 border border-border z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {userState.fullName || userState.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userState.email || ""}
                        </p>
                      </div>
                      {role === "ADMIN" && (
                        <button
                          onClick={() => {
                            navigate("/admin");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          <span>Quản trị</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                      >
                        <User size={16} />
                        <span>Hồ sơ</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/orders");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                      >
                        <Package size={16} />
                        <span>Đơn hàng</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/support");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-brand-accent-soft transition-colors"
                      >
                        <LifeBuoy size={16} />
                        <span>Hỗ trợ</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-accent hover:bg-brand-accent-soft transition-colors border-t border-border mt-1"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-3 py-2 bg-brand-primary-foreground/10 hover:bg-brand-primary-foreground/20 text-brand-primary-foreground rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="hidden xl:inline">Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- MOBILE SEARCH OVERLAY (UPDATED) --- */}
        {isMobileSearchOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-xl z-50 border-t border-gray-200 lg:hidden max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 bg-brand-primary/5 sticky top-0 z-10">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Bạn muốn mua gì?"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-gray-800 text-sm shadow-sm"
                />
                <button
                  onClick={handleSearch}
                  className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
            {/* Render nội dung gợi ý/lịch sử/xu hướng */}
            {searchDropdownContent}
          </div>
        )}
      </div>

      {/* --- MOBILE MENU SIDEBAR --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-60 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-70 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="font-bold text-xl text-brand-primary">Menu</div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          {token ? (
            <div
              className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3 hover:cursor-pointer hover:bg-gray-100"
              onClick={() => {
                navigate("/profile");
                setIsMobileMenuOpen(false);
              }}
            >
              {userState.avatarUrl ? (
                <img
                  src={userState.avatarUrl}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <User size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {userState.fullName || userState.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userState.email}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="w-full mb-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-soft transition-colors"
            >
              Đăng nhập / Đăng ký
            </button>
          )}

          {/* --- ACCORDION MENUS --- */}
          <div className="flex-1 space-y-2">
            {/* 1. Loại Đồng Hồ (Categories) */}
            <div>
              <button
                onClick={() => toggleSubmenu("categories")}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-brand-primary" />
                  <span>Loại Đồng Hồ</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileSubmenu === "categories" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSubmenu === "categories" && (
                <div className="pl-10 pr-2 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      handleCategoryClick(null);
                    }}
                    className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                  >
                    Tất cả đồng hồ
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Thương Hiệu (Brands) */}
            <div>
              <button
                onClick={() => toggleSubmenu("brands")}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Hash size={18} className="text-brand-primary" />
                  <span>Thương Hiệu</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileSubmenu === "brands" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSubmenu === "brands" && (
                <div className="pl-10 pr-2 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/products");
                    }}
                    className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                  >
                    Tất cả thương hiệu
                  </button>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {brands.slice(0, 10).map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandClick(brand.name)}
                        className="text-left py-1.5 text-sm text-gray-600 hover:text-brand-primary truncate"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                  {brands.length > 10 && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/products");
                      }}
                      className="w-full text-left py-2 text-sm font-medium text-brand-primary mt-1"
                    >
                      Xem thêm...
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Khuyến Mãi (Promotions) */}
            <div>
              <button
                onClick={() => toggleSubmenu("promotions")}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Gift size={18} className="text-red-500" />
                  <span>Khuyến Mãi</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileSubmenu === "promotions" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSubmenu === "promotions" && (
                <div className="pl-10 pr-2 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/promotional-products");
                    }}
                    className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                  >
                    Tất cả khuyến mãi
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/promotional-products?status=active");
                    }}
                    className="w-full text-left py-2 text-sm text-green-600 hover:underline"
                  >
                    ● Đang diễn ra
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/products?sort=discount");
                    }}
                    className="w-full text-left py-2 text-sm text-red-600 hover:underline"
                  >
                    ● Sản phẩm SALE sốc
                  </button>
                </div>
              )}
            </div>

            {/* 4. Bài Viết (Posts) */}
            <div>
              <button
                onClick={() => toggleSubmenu("posts")}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brand-primary" />
                  <span>Bài Viết</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileSubmenu === "posts" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSubmenu === "posts" && (
                <div className="pl-10 pr-2 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/posts");
                    }}
                    className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                  >
                    Tất cả bài viết
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/posts?category=news");
                    }}
                    className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                  >
                    Tin công nghệ
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/posts?category=review");
                    }}
                    className="w-full text-left py-2 text-sm text-gray-600 hover:text-brand-primary"
                  >
                    Đánh giá sản phẩm
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 my-2"></div>

            {/* User Account Links (Mobile) */}
            {token && (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User size={18} /> Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => {
                    navigate("/orders");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Package size={18} /> Đơn hàng của tôi
                </button>
                <button
                  onClick={() => {
                    navigate("/wishlist");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Heart size={18} /> Sản phẩm yêu thích
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
