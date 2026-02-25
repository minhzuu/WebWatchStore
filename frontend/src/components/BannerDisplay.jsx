import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bannerAPI } from "@/api/cmsAPI";
import { filterBanners } from "@/utils/bannerUtils";

/**
 * Generic Banner Display Component
 * Displays banners based on position (HOMEPAGE_BANNER, SIDEBAR, FOOTER, PRODUCT_PAGE)
 */
export default function BannerDisplay({ position, className = "" }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, [position]);

  const loadBanners = async () => {
    try {
      const response = await bannerAPI.getActive();
      const allBanners = Array.isArray(response) ? response : [];

      // Filter banners by position, device, and date
      const filtered = filterBanners(allBanners, position);
      setBanners(filtered);
    } catch (error) {
      console.error(`Error loading banners for ${position}:`, error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || banners.length === 0) return null;

  // Different layouts based on position
  const getLayoutClass = () => {
    switch (position) {
      case "HOMEPAGE_BANNER":
        return "grid grid-cols-1 md:grid-cols-2 gap-4";
      case "SIDEBAR":
        return "flex flex-col gap-4";
      case "FOOTER":
        return "flex flex-wrap gap-4 justify-center";
      case "PRODUCT_PAGE":
        return "grid grid-cols-1 gap-4";
      default:
        return "grid grid-cols-1 gap-4";
    }
  };

  return (
    <div className={`banner-display ${getLayoutClass()} ${className}`}>
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-lg shadow-sm"
        >
          {banner.linkUrl ? (
            <Link to={banner.linkUrl} className="block">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-white/90 text-sm mt-1 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                </div>
              )}
            </Link>
          ) : (
            <div>
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-auto object-cover"
              />
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-white/90 text-sm mt-1 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
