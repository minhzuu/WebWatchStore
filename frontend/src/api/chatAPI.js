import axiosInstance from "./axiosConfig";

const CHAT_URL = "/chat";

export const getChatRoom = async () => {
    const response = await axiosInstance.get(`${CHAT_URL}/room`);
    return response.data;
};

export const getAllChatRooms = async () => {
    const response = await axiosInstance.get(`${CHAT_URL}/rooms`);
    return response.data;
};

export const getChatMessages = async (roomId, page = 0, size = 50) => {
    const response = await axiosInstance.get(`${CHAT_URL}/room/${roomId}/messages`, {
        params: { page, size }
    });
    return response.data;
};

export const markChatAsRead = async (roomId) => {
    const response = await axiosInstance.post(`${CHAT_URL}/room/${roomId}/read`);
    return response.data;
};

export const getAdminUnreadCount = async () => {
    const response = await axiosInstance.get(`${CHAT_URL}/admin/unread-count`);
    return response.data;
};
