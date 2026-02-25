import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useChatContext } from "@/contexts/ChatContext";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { parseStoredUser } from "@/utils/storage";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [user, setUser] = useState(parseStoredUser());
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    connected,
    messages,
    typing,
    unreadCount,
    loading,
    sendMessage,
    sendTypingNotification,
    markAsRead,
  } = useChatContext();

  const location = useLocation();

  // Update user state khi user thay đổi
  useEffect(() => {
    const handleUserUpdated = () => {
      setUser(parseStoredUser());
      setUserRole(localStorage.getItem("role"));
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
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark as read when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized && unreadCount > 0) {
      markAsRead();
    }
  }, [isOpen, isMinimized, unreadCount, markAsRead]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !connected) return;

    sendMessage(inputMessage);
    setInputMessage("");
    sendTypingNotification(false);
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    // Send typing notification
    if (e.target.value.trim()) {
      sendTypingNotification(true);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingNotification(false);
      }, 1000);
    } else {
      sendTypingNotification(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const hideForAdmin =
    userRole === "ADMIN" || userRole === "STAFF" || userRole === "MANAGER";
  const hideOnSupportPage = location.pathname.startsWith("/support");

  if (!user || hideForAdmin || hideOnSupportPage) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer fixed bottom-6 right-6 z-50 bg-brand-primary hover:bg-brand-primary-soft text-brand-primary-foreground rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-brand-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl transition-all duration-300 ${
            isMinimized ? "h-14 w-80" : "h-[600px] w-96"
          }`}
        >
          {/* Header */}
          <div className="bg-brand-primary text-brand-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <div>
                <h3 className="font-semibold">Hỗ trợ khách hàng</h3>
                {connected ? (
                  <p className="text-xs opacity-90">● Đang kết nối</p>
                ) : (
                  <p className="text-xs opacity-75">○ Đang kết nối...</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-brand-primary-soft p-1 rounded transition-colors"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-brand-primary-soft p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[480px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle size={48} className="mb-2 opacity-50" />
                    <p className="text-sm">Chưa có tin nhắn nào</p>
                    <p className="text-xs mt-1">
                      Gửi tin nhắn để bắt đầu trò chuyện
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      // Message is own if senderId matches current user
                      const isOwnMessage = msg.senderId === user?.id;

                      return (
                        <div
                          key={msg.id || index}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
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
                className="p-3 border-t border-gray-200 bg-brand-primary-foreground rounded-b-lg"
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder={
                      connected ? "Nhập tin nhắn..." : "Đang kết nối..."
                    }
                    disabled={!connected}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!connected || !inputMessage.trim()}
                    className="cursor-pointer bg-brand-primary hover:bg-brand-primary-soft text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
