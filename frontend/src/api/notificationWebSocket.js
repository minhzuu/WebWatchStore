import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnecting = false;
let reconnectTimeout = null;
let subscriptions = [];

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const WS_URL = `${BACKEND_URL}/ws`;

/**
 * Connect to WebSocket for real-time notifications
 * @param {string} userId - User ID to subscribe to
 * @param {function} onNotification - Callback when new notification arrives
 * @returns {Object} - WebSocket client instance
 */
export const connectNotificationWebSocket = (userId, onNotification) => {
    if (!userId) {
        console.warn("Cannot connect notification WebSocket: userId is required");
        return null;
    }

    // Prevent multiple connections
    if (isConnecting || (stompClient && stompClient.connected)) {
        console.log("WebSocket already connected or connecting");
        return stompClient;
    }

    isConnecting = true;
    console.log("🔌 Connecting to notification WebSocket...");

    const token = localStorage.getItem("accessToken");

    // Create SockJS and STOMP client
    const socket = new SockJS(WS_URL);
    stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: token ? `Bearer ${token}` : "",
        },
        debug: (str) => {
            // console.log("[STOMP Debug]", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    // On successful connection
    stompClient.onConnect = (frame) => {
        isConnecting = false;
        console.log("✅ Notification WebSocket connected:", frame);

        // Subscribe to user-specific notification queue
        const subscription = stompClient.subscribe(
            `/user/${userId}/queue/notifications`,
            (message) => {
                try {
                    const notification = JSON.parse(message.body);
                    console.log("📬 New notification received:", notification);

                    if (onNotification && typeof onNotification === "function") {
                        onNotification(notification);
                    }
                } catch (error) {
                    console.error("Error parsing notification:", error);
                }
            }
        );

        subscriptions.push(subscription);
    };

    // On error
    stompClient.onStompError = (frame) => {
        isConnecting = false;
        console.error("❌ STOMP error:", frame);
    };

    // On disconnect
    stompClient.onDisconnect = () => {
        isConnecting = false;
        console.log("🔌 Notification WebSocket disconnected");
    };

    // On web socket close
    stompClient.onWebSocketClose = () => {
        isConnecting = false;
        console.log("🔌 WebSocket closed");
    };

    // Activate the client
    stompClient.activate();

    return stompClient;
};

/**
 * Disconnect notification WebSocket
 */
export const disconnectNotificationWebSocket = () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }

    if (stompClient) {
        // Unsubscribe all
        subscriptions.forEach((sub) => {
            try {
                sub.unsubscribe();
            } catch (err) {
                console.warn("Error unsubscribing:", err);
            }
        });
        subscriptions = [];

        // Deactivate client
        try {
            stompClient.deactivate();
            console.log("🔌 Notification WebSocket disconnected");
        } catch (err) {
            console.warn("Error disconnecting WebSocket:", err);
        }

        stompClient = null;
    }
    isConnecting = false;
};

/**
 * Check if WebSocket is connected
 */
export const isNotificationWebSocketConnected = () => {
    return stompClient && stompClient.connected;
};

/**
 * Get current WebSocket client
 */
export const getNotificationWebSocketClient = () => {
    return stompClient;
};
