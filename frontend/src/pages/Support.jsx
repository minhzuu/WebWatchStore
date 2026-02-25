import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { useChatContext } from "@/contexts/ChatContext";
import { parseStoredUser } from "@/utils/storage";

export default function Support() {
  const navigate = useNavigate();
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

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = parseStoredUser();

  // Nếu chưa có user (dù đã có token), điều hướng về login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Đánh dấu đã đọc khi vào màn hình
  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead();
    }
  }, [unreadCount, markAsRead]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !connected) return;

    sendMessage(inputMessage);
    setInputMessage("");
    sendTypingNotification(false);
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {/* Breadcrumb dùng chung */}
      <Breadcrumb items={[{ label: "Hỗ trợ khách hàng", isCurrent: true }]} />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 lg:py-10">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-red-500 mb-2">
              Hỗ trợ khách hàng
            </p>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
              Trò chuyện với đội ngũ chăm sóc khách hàng
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Nếu bạn có bất kỳ thắc mắc nào về đơn hàng, sản phẩm hoặc chế độ
              bảo hành, hãy nhắn tin trực tiếp cho chúng tôi. Đội ngũ{" "}
              <span className="font-semibold text-red-600">Admin</span> sẽ phản
              hồi trong thời gian sớm nhất.
            </p>
          </div>

          {/* Chat area */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            {/* Header chat */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-600 to-red-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <p className="font-semibold">Hỗ trợ khách hàng trực tuyến</p>
                  <p className="text-xs text-red-100">
                    {connected
                      ? "Đã kết nối với hệ thống hỗ trợ"
                      : "Đang kết nối tới hệ thống..."}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
                  {unreadCount} tin chưa đọc
                </span>
              )}
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle size={48} className="mb-2 text-red-300" />
                  <p className="text-sm">Chưa có tin nhắn nào</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Hãy gửi tin nhắn đầu tiên để chúng tôi hỗ trợ bạn
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isOwnMessage = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                            isOwnMessage
                              ? "bg-red-600 text-white rounded-br-none"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold text-red-600 mb-1">
                              {msg.senderName || "Admin"}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[11px] mt-1 ${
                              isOwnMessage ? "text-red-100" : "text-gray-400"
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
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                        <div className="flex gap-1 items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSend}
              className="border-t border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleTyping}
                  placeholder={
                    connected
                      ? "Nhập nội dung tin nhắn của bạn..."
                      : "Đang kết nối tới hệ thống, vui lòng chờ..."
                  }
                  disabled={!connected}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!connected || !inputMessage.trim()}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
