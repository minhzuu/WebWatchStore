import axiosInstance from "./axiosConfig";

const ORDER_URL = "/orders";

export const searchOrders = async (params = {}) => {
    const {
        page = 0,
        size = 10,
        status,
        search,
        user,
        userId,
        fromDate,
        toDate,
        minTotal,
        maxTotal,
        sortBy = "createdAt",
        sortDir = "desc",
    } = params;

    const query = new URLSearchParams();
    query.set("page", page);
    query.set("size", size);
    query.set("sortBy", sortBy);
    query.set("sortDir", sortDir);

    if (status) query.set("status", status);
    if (search) query.set("customerName", search);
    if (user) query.set("username", user);
    if (userId) query.set("userId", userId);
    if (fromDate) query.set("fromDate", fromDate);
    if (toDate) query.set("toDate", toDate);
    if (minTotal !== undefined && minTotal !== null)
        query.set("minTotal", minTotal);
    if (maxTotal !== undefined && maxTotal !== null)
        query.set("maxTotal", maxTotal);

    const response = await axiosInstance.get(
        `${ORDER_URL}?${query.toString()}`
    );
    return response.data;
};

export const getOrderDetail = async (id) => {
    const response = await axiosInstance.get(`${ORDER_URL}/${id}/detail`);
    return response.data;
};

export const getOrdersByUser = async ({
    userId,
    username,
    page = 0,
    size = 10,
} = {}) => {
    const params = {};
    if (userId) {
        params.userId = userId;
    }
    if (username) {
        params.username = username;
    }
    params.page = page;
    params.size = size;

    const response = await axiosInstance.get(`${ORDER_URL}/by-user`, {
        params,
    });
    return response.data;
};

export const getOrderTimeline = async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) {
        params.startDate = startDate;
    }
    if (endDate) {
        params.endDate = endDate;
    }
    const response = await axiosInstance.get(`${ORDER_URL}/timeline`, {
        params,
    });
    return Array.isArray(response?.data?.data)
        ? response.data.data
        : response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await axiosInstance.put(`${ORDER_URL}/${id}/status`, {
        status,
    });
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await axiosInstance.post(ORDER_URL, orderData);
    return response.data;
};

export const getOrdersByUserId = async (userId) => {
    const response = await axiosInstance.get(`${ORDER_URL}/user/${userId}`);
    return response.data;
};

export const cancelOrder = async (orderId) => {
    // Thử endpoint user cancel trước
    try {
        const response = await axiosInstance.post(
            `${ORDER_URL}/${orderId}/cancel`
        );
        return response.data;
    } catch (error) {
        // Nếu không có endpoint này, thử dùng updateOrderStatus
        if (error.response?.status === 404) {
            const response = await axiosInstance.put(
                `${ORDER_URL}/${orderId}/status`,
                {
                    status: "CANCELLED",
                }
            );
            return response.data;
        }
        throw error;
    }
};
