import axiosInstance from "./axiosConfig";

const REVIEW_URL = "/reviews";

export const getAllReviews = async () => {
    const response = await axiosInstance.get(REVIEW_URL);
    return response.data || [];
};

export const getReviewsByProduct = async (productId) => {
    const response = await axiosInstance.get(`${REVIEW_URL}/product/${productId}`);
    return response.data || [];
};

export const updateReview = async (id, reviewData) => {
    const response = await axiosInstance.put(`${REVIEW_URL}/${id}`, reviewData);
    return response.data;
};

export const getReviewByUserAndProduct = async (userId, productId) => {
    try {
        const response = await axiosInstance.get(
            `${REVIEW_URL}/user/${userId}/product/${productId}`,
            { 
                suppressError404: true,
                // Accept 404 as valid response (user simply hasn't reviewed yet)
                validateStatus: (status) => (status >= 200 && status < 300) || status === 404
            }
        );
        // If 404, response.data will be undefined/null
        if (response.status === 404) {
            return null;
        }
        return response.data;
    } catch (error) {
        // Should not reach here for 404 due to validateStatus
        // But keep as fallback
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const createReview = async (reviewData) => {
    const response = await axiosInstance.post(REVIEW_URL, reviewData);
    return response.data;
};

export const deleteReview = async (id, reason) => {
    const response = await axiosInstance.delete(`${REVIEW_URL}/${id}`, {
        data: { reason },
    });
    return response.data;
};
