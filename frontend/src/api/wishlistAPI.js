// Wishlist API - store only product IDs in localStorage
// This keeps wishlist lightweight and ensures product data (price/discount)
// is loaded fresh when the user opens the wishlist page.

const WISHLIST_KEY = "wishlist";

// Read stored value and normalize to array of IDs.
// Migration: if older entries were full product objects, extract their ids
// and overwrite storage with the id-only list.
const readStoredIds = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // If items look like objects with `id`, migrate to ids
    if (parsed.length > 0 && typeof parsed[0] === "object") {
      const ids = parsed
        .map((it) =>
          it && (it.id || it.productId) ? Number(it.id || it.productId) : null
        )
        .filter((id) => id != null);
      // persist migrated ids
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
      return ids;
    }

    // If items are already ids
    return parsed.map((it) => Number(it)).filter((n) => !Number.isNaN(n));
  } catch (err) {
    console.error("Error reading wishlist ids:", err);
    return [];
  }
};

const writeIds = (ids) => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error("Error writing wishlist ids:", err);
  }
};

/**
 * Return array of product IDs currently in wishlist
 * @returns {number[]}
 */
export const getWishlist = () => {
  return readStoredIds();
};

/**
 * Add product to wishlist by product object or id
 * @param {Object|number} productOrId
 * @returns {boolean} true if added, false if already present
 */
export const addToWishlist = (productOrId) => {
  try {
    const id =
      typeof productOrId === "object"
        ? Number(productOrId.id)
        : Number(productOrId);
    if (!id || Number.isNaN(id)) return false;
    const ids = readStoredIds();
    if (ids.includes(id)) return false;
    ids.unshift(id);
    writeIds(ids);
    return true;
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return false;
  }
};

/**
 * Remove productId from wishlist
 */
export const removeFromWishlist = (productId) => {
  try {
    const id = Number(productId);
    const ids = readStoredIds();
    const filtered = ids.filter((i) => i !== id);
    writeIds(filtered);
    return true;
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    return false;
  }
};

export const isInWishlist = (productId) => {
  const ids = readStoredIds();
  return ids.includes(Number(productId));
};

export const getWishlistCount = () => readStoredIds().length;

export const clearWishlist = () => {
  try {
    localStorage.removeItem(WISHLIST_KEY);
    return true;
  } catch (err) {
    console.error("Error clearing wishlist:", err);
    return false;
  }
};
