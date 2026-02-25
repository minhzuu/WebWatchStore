import { useState, useEffect, useRef } from "react";
import {
  getAllChatRooms,
  getChatMessages,
  markChatAsRead,
  getAdminUnreadCount,
} from "@/api/chatAPI";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { MessageCircle, Send, Search, User, Circle } from "lucide-react";
import { parseStoredUser } from "@/utils/storage";

export default function AdminChat() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = parseStoredUser();

  // Initialize WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      setConnected(true);
      loadRooms(true); // Auto-select first room on initial connection
      loadUnreadCount();

      // Subscribe to new message notifications
      stompClient.subscribe("/topic/admin/new-message", (message) => {
        const newMsg = JSON.parse(message.body);
        loadRooms(); // Refresh rooms list
        loadUnreadCount();

        // If current room, add message (prevent duplicate)
        if (selectedRoom && newMsg.roomId === selectedRoom.id) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMsg.id);
            if (exists) return prev;
            return [newMsg, ...prev];
          });
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setConnected(false);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [user?.id]);

  // Subscribe to selected room
  useEffect(() => {
    if (!connected || !selectedRoom || !clientRef.current) return;

    const subscriptions = [];

    // Subscribe to room messages
    const messageSub = clientRef.current.subscribe(
      `/topic/room/${selectedRoom.id}`,
      (message) => {
        const newMessage = JSON.parse(message.body);

        // Replace temp message or add new message at bottom
        setMessages((prev) => {
          // Remove temp messages
          const filtered = prev.filter(
            (msg) => !msg.id?.toString().startsWith("temp-")
          );

          // Check if message already exists
          const exists = filtered.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;

          // Add new message at the end (newest at bottom)
          return [...filtered, newMessage];
        });
      }
    );
    subscriptions.push(messageSub);

    // Subscribe to typing
    const typingSub = clientRef.current.subscribe(
      `/topic/room/${selectedRoom.id}/typing`,
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
  }, [connected, selectedRoom, user?.id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRooms = async (autoSelect = false) => {
    try {
      setLoading(true);
      const data = await getAllChatRooms();
      setRooms(data);

      // Auto-select first room on initial load
      if (autoSelect && data.length > 0) {
        await selectRoom(data[0]);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await getAdminUnreadCount();
      setTotalUnread(data.unreadCount);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const selectRoom = async (room) => {
    setSelectedRoom(room);
    setMessages([]); // Clear old messages first
    setLoadingMessages(true);
    try {
      const msgs = await getChatMessages(room.id);
      // Messages come in DESC order from backend, reverse to show oldest first, newest at bottom
      setMessages(msgs.reverse());

      // Mark as read
      if (room.unreadCountForAdmin > 0) {
        await markChatAsRead(room.id);
        loadRooms();
        loadUnreadCount();
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !connected || !selectedRoom) return;

    const message = {
      roomId: selectedRoom.id,
      content: inputMessage.trim(),
      senderId: user.id, // Add senderId to message
    };

    // Optimistic update for admin - add at bottom
    const tempMessage = {
      id: `temp-${Date.now()}`,
      roomId: selectedRoom.id,
      senderId: user.id,
      senderName: user.fullName || user.username,
      senderRole: "ADMIN",
      content: inputMessage.trim(),
      createdAt: new Date().toISOString(),
      isOwnMessage: true,
      status: "SENDING",
    };

    // Add at the end (bottom)
    setMessages((prev) => [...prev, tempMessage]);

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });

    setInputMessage("");
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    if (e.target.value.trim() && selectedRoom) {
      clientRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          roomId: selectedRoom.id,
          userId: user.id,
          userName: user.fullName || user.username,
          typing: true,
        }),
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        clientRef.current.publish({
          destination: "/app/chat.typing",
          body: JSON.stringify({
            roomId: selectedRoom.id,
            userId: user.id,
            userName: user.fullName || user.username,
            typing: false,
          }),
        });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatTime(timestamp);
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.userFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Rooms List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
            <MessageCircle className="text-brand-primary" />
            Tin nhắn khách hàng
            {totalUnread > 0 && (
              <span className="bg-brand-primary text-brand-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
          </h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary text-brand-primary-foreground"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id
                    ? "bg-red-50 border-l-4 border-l-brand-primary text-brand-primary"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-500" />
                    </div>
                    {room.isUserOnline && (
                      <Circle
                        size={12}
                        className="absolute bottom-0 right-0 fill-green-500 text-green-500"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {room.userFullName || room.userName}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatDate(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {room.lastMessage?.content || "Chưa có tin nhắn"}
                    </p>
                  </div>
                  {room.unreadCountForAdmin > 0 && (
                    <span className="bg-brand-primary text-brand-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {room.unreadCountForAdmin}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedRoom.userFullName || selectedRoom.userName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedRoom.isUserOnline ? (
                    <span className="text-green-600">● Đang hoạt động</span>
                  ) : (
                    <span>
                      Hoạt động{" "}
                      {selectedRoom.userLastSeen
                        ? formatDate(selectedRoom.userLastSeen)
                        : "chưa rõ"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary text-brand-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Chưa có tin nhắn nào</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    // Check if message is from current admin user
                    const isOwnMessage = msg.senderId === user.id;

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? "bg-brand-primary text-brand-primary-foreground"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold text-brand-primary mb-1">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-red-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-200"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleTyping}
                  placeholder={
                    connected ? "Nhập tin nhắn..." : "Đang kết nối..."
                  }
                  disabled={!connected}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!connected || !inputMessage.trim()}
                  className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-soft px-6 py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
