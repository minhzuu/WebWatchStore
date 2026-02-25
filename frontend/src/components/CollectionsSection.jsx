import React, { useEffect, useState } from "react";
import { getCategories } from "@/api/categoryAPI";
import { getProductsByCategoryId } from "@/api/findAPI";

export default function CollectionsSection({
  onProductsChange,
  onCategorySelect,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        console.log("CollectionsSection - Raw data from API:", data);
        console.log("CollectionsSection - Data type:", typeof data);
        console.log("CollectionsSection - Is array?", Array.isArray(data));

        // Handle different response formats
        let categoriesList = [];

        // If data is a string, try to parse it as JSON
        if (typeof data === "string") {
          console.log(
            "CollectionsSection - Data is string, attempting to parse JSON"
          );
          try {
            const parsed = JSON.parse(data);
            console.log("CollectionsSection - Parsed JSON:", parsed);
            if (Array.isArray(parsed)) {
              categoriesList = parsed;
            } else if (parsed && Array.isArray(parsed.data)) {
              categoriesList = parsed.data;
            } else if (parsed && Array.isArray(parsed.content)) {
              categoriesList = parsed.content;
            }
          } catch (parseError) {
            console.error(
              "CollectionsSection - Failed to parse JSON string:",
              parseError
            );
          }
        } else if (Array.isArray(data)) {
          categoriesList = data;
          console.log(
            "CollectionsSection - Using array directly, length:",
            categoriesList.length
          );
        } else if (data && typeof data === "object") {
          // Check for common response wrappers
          if (Array.isArray(data.data)) {
            categoriesList = data.data;
            console.log(
              "CollectionsSection - Found data.data array, length:",
              categoriesList.length
            );
          } else if (Array.isArray(data.content)) {
            categoriesList = data.content;
            console.log(
              "CollectionsSection - Found data.content array, length:",
              categoriesList.length
            );
          } else if (Array.isArray(data.categories)) {
            categoriesList = data.categories;
            console.log(
              "CollectionsSection - Found data.categories array, length:",
              categoriesList.length
            );
          } else {
            // If data is an object but not an array, try to convert it
            console.log(
              "CollectionsSection - Data is object but not array, keys:",
              Object.keys(data)
            );
            console.log(
              "CollectionsSection - Data values:",
              Object.values(data)
            );
          }
        }

        console.log(
          "CollectionsSection - Final categories list:",
          categoriesList
        );
        console.log(
          "CollectionsSection - Final categories list length:",
          categoriesList.length
        );

        setCategories(categoriesList);
      } catch (error) {
        console.error("Lỗi khi fetch categories:", error);
        console.error("Error response:", error.response);
        console.error("Error message:", error.message);
        setError(error.message || "Không thể tải danh mục");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAllCategories &&
        !event.target.closest(".category-dropdown-container")
      ) {
        setShowAllCategories(false);
      }
    };

    if (showAllCategories) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showAllCategories]);

  const handleCategoryClick = async (categoryId, categoryName) => {
    try {
      const products = await getProductsByCategoryId(categoryId);
      if (onProductsChange) {
        onProductsChange(Array.isArray(products) ? products : []);
      }
      if (onCategorySelect) {
        onCategorySelect({ id: categoryId, name: categoryName });
      }
      // Scroll to products section
      setTimeout(() => {
        const productsSection = document.getElementById("products-section");
        if (productsSection) {
          productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (err) {
      console.error("Lỗi fetch sản phẩm:", err);
      if (onProductsChange) onProductsChange([]);
    }
  };

  // Default images for different category types
  const getCategoryImage = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("classic") || name.includes("cổ điển")) {
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
    } else if (name.includes("sport") || name.includes("thể thao")) {
      return "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80";
    } else if (
      name.includes("luxury") ||
      name.includes("cao cấp") ||
      name.includes("sang trọng")
    ) {
      return "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80";
    } else {
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
    }
  };

  // Default descriptions based on category name
  const getCategoryDescription = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("classic") || name.includes("cổ điển")) {
      return "Timeless designs with traditional craftsmanship";
    } else if (name.includes("sport") || name.includes("thể thao")) {
      return "Rugged performance for active lifestyles";
    } else if (
      name.includes("luxury") ||
      name.includes("cao cấp") ||
      name.includes("sang trọng")
    ) {
      return "Exclusive pieces with premium materials";
    } else {
      return categoryName
        ? `Discover our ${categoryName} collection`
        : "Explore our curated selection";
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white" data-testid="collections-loading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-sm lg:text-base uppercase tracking-[0.2em] text-purple-600 font-bold mb-3">
              OUR COLLECTIONS
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 font-serif">
              Curated for Every Style
            </h2>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Đang tải danh mục...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="py-16 lg:py-24 bg-white"
        data-testid="collections-error"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-sm lg:text-base uppercase tracking-[0.2em] text-purple-600 font-bold mb-3">
              OUR COLLECTIONS
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 font-serif">
              Curated for Every Style
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-2">Lỗi: {error}</p>
            <p className="text-gray-500">Vui lòng thử lại sau.</p>
          </div>
        </div>
      </section>
    );
  }

  // Always render the section, even if no categories
  // Show placeholder if no categories available
  if (!categories || categories.length === 0) {
    return (
      <section
        className="py-16 lg:py-24 bg-white"
        data-testid="collections-empty"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-sm lg:text-base uppercase tracking-[0.2em] text-purple-600 font-bold mb-3">
              OUR COLLECTIONS
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 font-serif">
              Curated for Every Style
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Chưa có danh mục sản phẩm. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Limit to first 3 categories for display (or show all if less than 3)
  const displayCategories = categories.slice(0, 3);

  return (
    <section
      className="py-16 lg:py-24 bg-white"
      data-testid="collections-section"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-sm lg:text-base uppercase tracking-[0.2em] text-purple-600 font-bold mb-3">
            OUR COLLECTIONS
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 font-serif">
            Curated for Every Style
          </h2>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id, category.name)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative w-full h-64 lg:h-80 overflow-hidden bg-gray-100">
                <img
                  src={getCategoryImage(category.name)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Use SVG placeholder instead of external URL
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EWatch Collection%3C/text%3E%3C/svg%3E";
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 font-serif mb-3">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                  {category.description ||
                    getCategoryDescription(category.name)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show more categories if there are more than 3 */}
        {categories.length > 3 && (
          <div className="text-center mt-12 relative category-dropdown-container">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              Xem tất cả danh mục
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${
                  showAllCategories ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showAllCategories && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="py-2">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleCategoryClick(category.id, category.name);
                        setShowAllCategories(false);
                      }}
                      className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-medium">
                          {category.name}
                        </span>
                        {index < 3 && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            Đã hiển thị
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {category.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
