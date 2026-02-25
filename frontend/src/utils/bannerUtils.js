/**
 * Helper functions for banner filtering and display logic
 */

/**
 * Check if banner is within display date range
 */
export const isWithinDateRange = (startDate, endDate) => {
  const now = new Date();

  // If no date constraints, always show
  if (!startDate && !endDate) return true;

  // Check start date
  if (startDate) {
    const start = new Date(startDate);
    if (now < start) return false;
  }

  // Check end date
  if (endDate) {
    const end = new Date(endDate);
    if (now > end) return false;
  }

  return true;
};

/**
 * Filter banners by position and date range
 */
export const filterBanners = (banners, position) => {
  if (!Array.isArray(banners)) return [];

  return banners.filter((banner) => {
    // Must be active
    if (!banner.active) return false;

    // Must match position
    if (position && banner.position !== position) return false;

    // Must be within date range
    if (!isWithinDateRange(banner.startDate, banner.endDate)) return false;

    return true;
  });
};
