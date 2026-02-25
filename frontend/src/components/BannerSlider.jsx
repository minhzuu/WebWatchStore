import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bannerAPI } from "../api/cmsAPI";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filterBanners } from "../utils/bannerUtils";

export default function BannerSlider({ startIndex = 0 }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      setCurrentIndex(startIndex % banners.length);
    }
  }, [banners.length, startIndex]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Auto slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const response = await bannerAPI.getActive();
      const allBanners = Array.isArray(response) ? response : [];

      // Filter banners for HOMEPAGE_SLIDER position with device and date checks
      const filtered = filterBanners(allBanners, "HOMEPAGE_SLIDER");
      setBanners(filtered);
    } catch (error) {
      console.error("Error loading banners:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading || banners.length === 0) return null;

  return (
    <div className="relative w-full h-[200px] md:h-[250px] lg:h-[300px] overflow-hidden bg-gray-200 rounded-lg">
      {/* Banners */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {banner.linkUrl ? (
            <Link to={banner.linkUrl} className="block w-full h-full">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-8">
                  <h2 className="text-white text-2xl md:text-4xl font-bold mb-2">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-white/90 text-sm md:text-base max-w-2xl">
                      {banner.description}
                    </p>
                  )}
                </div>
              )}
            </Link>
          ) : (
            <>
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-8">
                  <h2 className="text-white text-2xl md:text-4xl font-bold mb-2">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-white/90 text-sm md:text-base max-w-2xl">
                      {banner.description}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 bg-brand-accent-soft hover:bg-brand-accent p-2 rounded-full shadow-lg transition-all z-20"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6 text-brand-ink" />
          </button>
          <button
            onClick={goToNext}
            className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 bg-brand-accent-soft hover:bg-brand-accent p-2 rounded-full shadow-lg transition-all z-20"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6 text-brand-ink" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`cursor-pointer w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-brand-accent w-8"
                  : "bg-brand-accent-soft/50 hover:bg-brand-accent-soft/75"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
