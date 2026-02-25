import axiosInstance from "./axiosConfig";

const CATEGORY_URL = "/categories";

// Lấy tất cả categories
export const getCategories = async () => {
  try {
    const res = await axiosInstance.get(CATEGORY_URL);
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.content)) return res.content;
    if (typeof res === "string") {
      try {
        const parsed = JSON.parse(res);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.data)) return parsed.data;
        if (Array.isArray(parsed?.content)) return parsed.content;
      } catch (e) {
        console.error("categoryAPI - Failed to parse string response", e);
      }
    }
    return [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    console.error("Error details:", err.response?.data || err.message);
    return [];
  }
};

// Nếu muốn thêm các API khác cho category:
export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`${CATEGORY_URL}/${id}`);
    return response.data;
  } catch (err) {
    console.error(`Error fetching category ${id}:`, err);
    return null;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post(CATEGORY_URL, categoryData);
    return response.data;
  } catch (err) {
    console.error("Error creating category:", err);
    throw err; // Throw error để component có thể handle
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(
      `${CATEGORY_URL}/${id}`,
      categoryData
    );
    return response.data;
  } catch (err) {
    console.error(`Error updating category ${id}:`, err);
    throw err; // Throw error để component có thể handle
  }
};

export const deleteCategory = async (id) => {
  try {
    await axiosInstance.delete(`${CATEGORY_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting category ${id}:`, err);
    throw err; // Throw error để component có thể handle
  }
};
