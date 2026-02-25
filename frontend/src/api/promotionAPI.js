import axiosInstance from "./axiosConfig";

const PROMOTION_URL = "/promotions";

export const getPromotions = async (options = {}) => {
    try {
        const params = options.search ? { search: options.search } : undefined;
        const response = await axiosInstance.get(`${PROMOTION_URL}/summaries`, {
            params,
        });
        const payload =
            response && response.data ? response.data.data : undefined;
        return Array.isArray(payload) ? payload : [];
    } catch (error) {
        console.error("Failed to fetch promotions:", error);
        throw error;
    }
};

// Lấy danh sách sản phẩm có promotion
export const getProductsWithPromotions = async () => {
    try {
        const response = await axiosInstance.get(PROMOTION_URL);
        console.log("promotionAPI: Raw response:", response);
        console.log("promotionAPI: response.data:", response?.data);
        
        // Handle different response structures
        let payload = undefined;
        
        if (response?.data) {
            // If response.data is already an array
            if (Array.isArray(response.data)) {
                payload = response.data;
            }
            // If response.data has a data property (ApiResponse structure)
            else if (response.data.data) {
                payload = response.data.data;
            }
            // If response.data has a content property
            else if (response.data.content) {
                payload = response.data.content;
            }
            // If response.data is an object, try to get the data property
            else if (typeof response.data === 'object') {
                payload = response.data;
            }
        }
        
        console.log("promotionAPI: Parsed payload:", payload);
        
        return Array.isArray(payload) ? payload : [];
    } catch (error) {
        console.error("Failed to fetch products with promotions:", error);
        console.error("Error response:", error.response?.data);
        return [];
    }
};

export const getPromotionById = async (id) => {
    try {
        const response = await axiosInstance.get(`${PROMOTION_URL}/${id}`);
        const payload =
            response && response.data ? response.data.data : undefined;
        return payload !== undefined && payload !== null ? payload : null;
    } catch (error) {
        console.error(`Failed to fetch promotion ${id}:`, error);
        throw error;
    }
};

export const createPromotion = async (payload) => {
    try {
        const response = await axiosInstance.post(PROMOTION_URL, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to create promotion:", error);
        throw error;
    }
};

export const updatePromotion = async (id, payload) => {
    try {
        const response = await axiosInstance.put(
            `${PROMOTION_URL}/${id}`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to update promotion ${id}:`, error);
        throw error;
    }
};

export const deletePromotion = async (id) => {
    try {
        const response = await axiosInstance.delete(`${PROMOTION_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete promotion ${id}:`, error);
        throw error;
    }
};
