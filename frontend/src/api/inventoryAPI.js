import axiosInstance from "./axiosConfig";

const INVENTORY_URL = "/inventories";

// Get all inventories (Admin only)
export const getAllInventories = async () => {
  try {
    const res = await axiosInstance.get(INVENTORY_URL);
    return res?.data || [];
  } catch (err) {
    console.error("Error fetching inventories:", err);
    throw err;
  }
};

// Get inventory by product ID
export const getInventoryByProduct = async (productId) => {
  try {
    const res = await axiosInstance.get(`${INVENTORY_URL}/product/${productId}`);
    return res?.data;
  } catch (err) {
    console.error(`Error fetching inventory for product ${productId}:`, err);
    throw err;
  }
};

// Update inventory stock (Admin only)
export const updateInventoryStock = async (inventoryId, stock, reason = "") => {
  try {
    const res = await axiosInstance.patch(
      `${INVENTORY_URL}/${inventoryId}/stock`,
      { stock, reason }
    );
    return res?.data;
  } catch (err) {
    console.error(`Error updating inventory ${inventoryId}:`, err);
    throw err;
  }
};
