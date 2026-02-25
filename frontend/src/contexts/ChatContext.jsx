import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { parseStoredUser } from "@/utils/storage";
import { getChatRoom, getChatMessages, markChatAsRead } from "@/api/chatAPI";

const ChatContext = createContext(null);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within ChatProvider");
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState(null);
    const [typing, setTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState(parseStoredUser() || null);
    const [userRole, setUserRole] = useState(localStorage.getItem("role"));

    const clientRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Load chat room và messages
    const loadChatRoom = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            const roomData = await getChatRoom();
            setRoom(roomData);
            setUnreadCount(roomData.unreadCountForUser || 0);

            // Load messages
            if (roomData.id) {
                const msgs = await getChatMessages(roomData.id);
                // Messages come in DESC order, reverse to show oldest first, newest at bottom
                const orderedMessages = msgs.reverse();
                
                // Map messages và xác định isOwnMessage dựa trên user.id hiện tại
                const mappedMessages = orderedMessages.map(msg => ({
                    ...msg,
                    isOwnMessage: msg.senderId === user.id
                }));
                
                // If no messages, add welcome message
                if (mappedMessages.length === 0) {
                    const welcomeMessage = {
                        id: 'welcome-msg',
                        roomId: roomData.id,
                        senderId: 0,
                        senderName: 'Hệ thống',
                        senderRole: 'ADMIN',
                        content: 'Xin chào bạn đến với website, bạn cần giúp gì?',
                        createdAt: new Date().toISOString(),
                        isOwnMessage: false
                    };
                    setMessages([welcomeMessage]);
                } else {
                    setMessages(mappedMessages);
                }
            }
        } catch (error) {
            console.error("Error loading chat room:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Theo dõi thay đổi user (login / logout) tương tự Header
    useEffect(() => {
        const handleUserUpdated = () => {
            const newUser = parseStoredUser() || null;
            const newRole = localStorage.getItem("role");
            
            // Nếu user thay đổi (logout hoặc login user khác), reset toàn bộ state
            if (user?.id !== newUser?.id) {
                console.log('User changed, clearing chat state...', {
                    oldUserId: user?.id,
                    newUserId: newUser?.id
                });
                
                // Clear messages và state
                setMessages([]);
                setRoom(null);
                setTyping(false);
                setUnreadCount(0);
                setConnected(false);
                setLoading(false);
                
                // Disconnect WebSocket cũ nếu có
                if (clientRef.current) {
                    clientRef.current.deactivate();
                    clientRef.current = null;
                }
            }
            
            setUser(newUser);
            setUserRole(newRole);
        };

        const handleStorage = (e) => {
            if (
                !e.key ||
                e.key === "user" ||
                e.key === "accessToken" ||
                e.key === "role"
            ) {
                handleUserUpdated();
            }
        };

        window.addEventListener("userUpdated", handleUserUpdated);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("userUpdated", handleUserUpdated);
            window.removeEventListener("storage", handleStorage);
        };
    }, [user?.id]);

    // Initialize WebSocket connection (only for non-admin users)
    useEffect(() => {
        if (!user?.id) {
            // Clear state khi không có user
            setMessages([]);
            setRoom(null);
            setTyping(false);
            setUnreadCount(0);
            setConnected(false);
            return;
        }

        // Không khởi tạo chat cho admin/staff/manager
        if (userRole === "ADMIN" || userRole === "STAFF" || userRole === "MANAGER") {
            return;
        }

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = async () => {
            console.log('WebSocket connected for user:', user?.id);
            setConnected(true);
            // Load lại chat room và messages mỗi khi connect thành công
            await loadChatRoom();
        };

        stompClient.onStompError = () => {
            console.error('WebSocket STOMP error');
            setConnected(false);
        };

        stompClient.onWebSocketClose = () => {
            console.log('WebSocket closed');
            setConnected(false);
        };

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [user?.id, userRole, loadChatRoom]);

    // Subscribe to room messages
    useEffect(() => {
        if (!connected || !room || !clientRef.current || !user?.id) return;

        const subscriptions = [];

        // Subscribe to room messages
        const messageSub = clientRef.current.subscribe(
            `/topic/room/${room.id}`,
            (message) => {
                const newMessage = JSON.parse(message.body);
                
                // Xác định isOwnMessage dựa trên user.id hiện tại
                const mappedMessage = {
                    ...newMessage,
                    isOwnMessage: newMessage.senderId === user.id
                };
                
                // Replace temp message or add new message at bottom
                setMessages((prev) => {
                    // Remove temp message if exists
                    const filtered = prev.filter(msg => !msg.id?.toString().startsWith('temp-'));
                    
                    // Check if message already exists (prevent duplicates)
                    const exists = filtered.some(msg => msg.id === mappedMessage.id);
                    if (exists) return prev;
                    
                    // Add new message at the end (newest at bottom)
                    return [...filtered, mappedMessage];
                });
                
                // Update unread count if message is not from current user
                if (mappedMessage.senderId !== user.id) {
                    setUnreadCount((prev) => prev + 1);
                }
            }
        );
        subscriptions.push(messageSub);

        // Subscribe to typing notifications
        const typingSub = clientRef.current.subscribe(
            `/topic/room/${room.id}/typing`,
            (message) => {
                const notification = JSON.parse(message.body);
                if (notification.userId !== user.id) {
                    setTyping(notification.typing);
                    if (notification.typing) {
                        clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                            setTyping(false);
                        }, 3000);
                    }
                }
            }
        );
        subscriptions.push(typingSub);

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [connected, room, user?.id]);



    const sendMessage = (content) => {
        if (!clientRef.current || !connected || !room) {
            return;
        }

        const message = {
            roomId: room.id,
            content: content.trim(),
            senderId: user.id,
        };

        // Optimistic update - add message immediately at bottom
        const tempMessage = {
            id: `temp-${Date.now()}`,
            roomId: room.id,
            senderId: user.id,
            senderName: user.fullName || user.username,
            senderRole: user.role,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            isOwnMessage: true,
            status: 'SENDING'
        };
        
        // Add at the end (bottom)
        setMessages((prev) => [...prev, tempMessage]);

        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(message),
        });
    };

    const sendTypingNotification = (isTyping) => {
        if (!clientRef.current || !connected || !room) return;

        const notification = {
            roomId: room.id,
            userId: user.id,
            userName: user.fullName || user.username,
            typing: isTyping,
        };

        clientRef.current.publish({
            destination: "/app/chat.typing",
            body: JSON.stringify(notification),
        });
    };

    const markAsRead = async () => {
        if (!room) return;
        
        try {
            await markChatAsRead(room.id);
            setUnreadCount(0);
        } catch (error) {
            // Error marking as read
        }
    };

    return (
        <ChatContext.Provider
            value={{
                connected,
                messages,
                room,
                typing,
                unreadCount,
                loading,
                sendMessage,
                sendTypingNotification,
                markAsRead,
                loadChatRoom,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
