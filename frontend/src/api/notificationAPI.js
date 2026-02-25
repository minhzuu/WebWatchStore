import axiosInstance from "./axiosConfig";

const NOTIFICATION_URL = "/notifications";

export const getNotificationsByUser = async (userId) => {
    if (!userId) {
        return [];
    }
    const response = await axiosInstance.get(
        `${NOTIFICATION_URL}/user/${userId}`
    );
    return response.data || [];
};

export const markNotificationAsRead = async (notificationId, userId) => {
    const response = await axiosInstance.patch(
        `${NOTIFICATION_URL}/${notificationId}/read`,
        {
            userId,
        }
    );
    return response.data;
};

export const markAllNotificationsAsRead = async (userId) => {
    const response = await axiosInstance.patch(
        `${NOTIFICATION_URL}/user/${userId}/read`
    );
    return response.data;
};

export const getUnreadNotificationCount = async (userId) => {
    const response = await axiosInstance.get(
        `${NOTIFICATION_URL}/user/${userId}/unread-count`
    );
    return response.data?.total ?? 0;
};
