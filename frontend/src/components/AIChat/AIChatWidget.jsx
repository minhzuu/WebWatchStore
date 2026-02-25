import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { getProducts } from "@/api/productAPI";
import { addToGuestCart } from "@/api/guestCart";
import { addToCart } from "@/api/cartAPI";
import { parseStoredUser } from "@/utils/storage";

const ENV_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY?.trim() || "";
const ENV_OPENAI_PROJECT_ID =
  import.meta.env.VITE_OPENAI_PROJECT_ID?.trim() || "";
const ENV_OPENAI_BASE_URL =
  import.meta.env.VITE_OPENAI_BASE_URL?.trim() || "https://api.openai.com";
const ENV_OPENAI_MODEL =
  import.meta.env.VITE_OPENAI_MODEL?.trim() || "gpt-4o-mini";
const ENV_OPENAI_TEMPERATURE =
  Number(import.meta.env.VITE_OPENAI_TEMPERATURE ?? "") || 0.7;
const ENV_OPENAI_MAX_TOKENS =
  Number(import.meta.env.VITE_OPENAI_MAX_TOKENS ?? "") || 700;

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return "https://api.openai.com/v1";
  let trimmed = baseUrl.trim();
  if (!trimmed.endsWith("/v1") && !trimmed.includes("/v1/")) {
    trimmed = trimmed.endsWith("/") ? `${trimmed}v1` : `${trimmed}/v1`;
  }
  if (!trimmed.endsWith("/")) {
    trimmed = `${trimmed}/`;
  }
  return trimmed;
};

const buildChatUrl = (baseUrl) =>
  `${normalizeBaseUrl(baseUrl)}chat/completions`;
const buildResponsesUrl = (baseUrl) => `${normalizeBaseUrl(baseUrl)}responses`;

const isProjectScopedKey = (key = "") => key.startsWith("sk-proj-");

const extractResponsesText = (result) => {
  if (!result) return "";
  const output = result.output;
  if (Array.isArray(output)) {
    for (const step of output) {
      const contents = step?.content;
      if (!Array.isArray(contents)) continue;
      for (const contentItem of contents) {
        const type = contentItem?.type;
        if (type === "output_text") {
          const value = contentItem?.text?.value;
          if (value) return value;
        }
        if (type === "text") {
          const value = contentItem?.text?.value ?? contentItem?.text;
          if (value) return value;
        }
      }
    }
  }
  if (Array.isArray(result.output_text) && result.output_text[0]) {
    return result.output_text.join("\n");
  }
  return "";
};

// Floating AI Chat widget for suggestions/chat
export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("suggest"); // suggest, chat
  const [suggestions, setSuggestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // {role: 'user'|'assistant', content}
  const [isThinking, setIsThinking] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const hideForAdmin =
    userRole === "ADMIN" || userRole === "STAFF" || userRole === "MANAGER";

  // Hide on auth pages (login, register, reset password)
  const currentPath = window.location.pathname;
  const isAuthPage =
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath.startsWith("/reset-password") ||
    currentPath === "/change-password";

  const shouldHide = hideForAdmin || isAuthPage;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ENV_OPENAI_KEY && !localStorage.getItem("openai_api_key")) {
      localStorage.setItem("openai_api_key", ENV_OPENAI_KEY);
    }
    if (ENV_OPENAI_PROJECT_ID && !localStorage.getItem("openai_project_id")) {
      localStorage.setItem("openai_project_id", ENV_OPENAI_PROJECT_ID);
    }
    if (ENV_OPENAI_BASE_URL && !localStorage.getItem("openai_base_url")) {
      localStorage.setItem("openai_base_url", ENV_OPENAI_BASE_URL);
    }
    if (ENV_OPENAI_MODEL && !localStorage.getItem("openai_model")) {
      localStorage.setItem("openai_model", ENV_OPENAI_MODEL);
    }
  }, []);

  const getOpenAiClientConfig = () => {
    const read = (key, fallback) => {
      if (typeof window === "undefined") return fallback || "";
      const value = localStorage.getItem(key);
      return value && value.trim() ? value.trim() : fallback || "";
    };
    const apiKey = read("openai_api_key", ENV_OPENAI_KEY);
    const projectId = read("openai_project_id", ENV_OPENAI_PROJECT_ID);
    const baseUrl = read("openai_base_url", ENV_OPENAI_BASE_URL);
    const model = read("openai_model", ENV_OPENAI_MODEL);
    return {
      apiKey,
      projectId,
      baseUrl,
      model,
    };
  };

  const handleConfigureOpenAi = () => {
    if (typeof window === "undefined") return;
    const currentKey = localStorage.getItem("openai_api_key") || ENV_OPENAI_KEY;
    const keyInput = window.prompt(
      "Nhập OpenAI API key (để trống để xóa):",
      currentKey || ""
    );
    if (keyInput === null) return;
    const trimmedKey = keyInput.trim();
    if (trimmedKey) {
      localStorage.setItem("openai_api_key", trimmedKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }

    const currentProject =
      localStorage.getItem("openai_project_id") || ENV_OPENAI_PROJECT_ID;
    const projectInput = window.prompt(
      "Nhập OpenAI Project ID (để trống nếu không dùng):",
      currentProject || ""
    );
    if (projectInput !== null) {
      const trimmedProject = projectInput.trim();
      if (trimmedProject) {
        localStorage.setItem("openai_project_id", trimmedProject);
      } else {
        localStorage.removeItem("openai_project_id");
      }
    }

    const currentBase =
      localStorage.getItem("openai_base_url") || ENV_OPENAI_BASE_URL;
    const baseInput = window.prompt(
      "Nhập OpenAI Base URL:",
      currentBase || "https://api.openai.com"
    );
    if (baseInput !== null) {
      const trimmedBase = baseInput.trim();
      if (trimmedBase) {
        localStorage.setItem("openai_base_url", trimmedBase);
      } else {
        localStorage.removeItem("openai_base_url");
      }
    }

    const currentModel =
      localStorage.getItem("openai_model") || ENV_OPENAI_MODEL;
    const modelInput = window.prompt(
      "Nhập OpenAI model mặc định:",
      currentModel || "gpt-4o-mini"
    );
    if (modelInput !== null) {
      const trimmedModel = modelInput.trim();
      if (trimmedModel) {
        localStorage.setItem("openai_model", trimmedModel);
      } else {
        localStorage.removeItem("openai_model");
      }
    }

    toast.success("Đã cập nhật cấu hình OpenAI");
  };

  useEffect(() => {
    if (open && tab === "suggest") {
      loadSuggestions();
    }
  }, [open, tab]);

  const loadSuggestions = async () => {
    setSuggestLoading(true);
    try {
      // Simple suggestions: promotional products or newest products
      const res = await getProducts({
        page: 0,
        size: 8,
        sortBy: "id",
        order: "desc",
      });
      const content = res?.content || [];
      setSuggestions(content.slice(0, 8));
    } catch (e) {
      console.error("AI suggestions error", e);
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  };

  const sendMessageToAI = async (message) => {
    setIsThinking(true);
    const recordUser = { role: "user", content: message, id: Date.now() };
    setChatMessages((prev) => [...prev, recordUser]);
    try {
      // Try backend endpoint first
      const apiResp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const backendJson = await apiResp.json().catch(() => null);
      if (apiResp.ok) {
        const reply =
          backendJson?.data?.reply ||
          backendJson?.reply ||
          backendJson?.text ||
          backendJson?.message ||
          "Không có phản hồi";
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, id: Date.now() },
        ]);
        return;
      }
      const backendError =
        backendJson?.message || backendJson?.error || backendJson?.details;
      if (backendError) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: backendError,
            id: Date.now(),
          },
        ]);
        return;
      }
      // If backend not available, fallback to OpenAI if key present in localStorage
      const { apiKey, projectId, baseUrl, model } = getOpenAiClientConfig();
      if (!apiKey) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Không có backend AI cấu hình và không tìm thấy OpenAI API key. Vui lòng cấu hình để bật AI.",
            id: Date.now(),
          },
        ]);
        setIsThinking(false);
        return;
      }
      const projectScoped = Boolean(projectId) || isProjectScopedKey(apiKey);
      const endpoint = projectScoped
        ? buildResponsesUrl(baseUrl)
        : buildChatUrl(baseUrl);
      const openaiResp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(projectId ? { "OpenAI-Project": projectId } : {}),
          ...(projectScoped ? { "OpenAI-Beta": "responses=v1" } : {}),
        },
        body: JSON.stringify({
          model: model || ENV_OPENAI_MODEL || "gpt-3.5-turbo",
          ...(projectScoped
            ? {
                input: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: message,
                      },
                    ],
                  },
                ],
                max_output_tokens: ENV_OPENAI_MAX_TOKENS,
              }
            : {
                messages: [{ role: "user", content: message }],
                max_tokens: ENV_OPENAI_MAX_TOKENS,
              }),
          temperature: ENV_OPENAI_TEMPERATURE,
        }),
      });
      if (!openaiResp.ok) {
        const errText = await openaiResp.text();
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Lỗi khi gọi OpenAI: " + errText,
            id: Date.now(),
          },
        ]);
        return;
      }
      const openaiResult = await openaiResp.json();
      const replyText = projectScoped
        ? extractResponsesText(openaiResult) || "Không có trả lời từ AI."
        : openaiResult?.choices?.[0]?.message?.content ||
          "Không có trả lời từ AI.";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText, id: Date.now() },
      ]);
    } catch (err) {
      console.error("AI chat send error", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lỗi khi gửi yêu cầu AI.",
          id: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("accessToken");
    const user = parseStoredUser();
    try {
      if (!token || !user?.id) {
        addToGuestCart(product, 1);
        toast.success("Đã thêm vào giỏ hàng (Khách)");
        return;
      }
      // logged-in add to cart
      await addToCart(user.id, product.id, 1);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error("Error add to cart", err);
      toast.error("Thêm vào giỏ hàng thất bại");
    }
  };

  if (shouldHide) return null;

  return (
    <>
      <div className="fixed left-6 bottom-6 z-40 flex flex-col items-start gap-3">
        {/* Panel */}
        {open && (
          <div
            className="w-full max-w-[360px] h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{ width: "min(360px, calc(100vw - 3rem))" }}
          >
            <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-red-600 font-bold">
                  AI
                </div>
                <div>
                  <h4 className="text-sm font-semibold">AI Assistant</h4>
                  <p className="text-xs opacity-90">Gợi ý • Chat</p>
                </div>
              </div>
              <div className="text-xs opacity-90">Beta</div>
            </div>
            <div className="p-3 flex flex-col gap-3 h-full">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("suggest")}
                  className={`flex-1 py-2 rounded-lg ${
                    tab === "suggest"
                      ? "bg-red-50 text-red-600 font-semibold"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Sparkles size={16} className="inline mr-2" />
                  Gợi ý
                </button>
                <button
                  onClick={() => setTab("chat")}
                  className={`flex-1 py-2 rounded-lg ${
                    tab === "chat"
                      ? "bg-red-50 text-red-600 font-semibold"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <MessageCircle size={16} className="inline mr-2" />
                  Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {tab === "suggest" && (
                  <div>
                    {suggestLoading ? (
                      <div>Loading suggestions...</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {suggestions.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50"
                          >
                            <img
                              src={p.imageUrl || p.primaryImageUrl}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {p.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {p.discountedPrice
                                  ? `${p.discountedPrice.toLocaleString(
                                      "vi-VN"
                                    )}₫`
                                  : (p.currentPrice || p.price) + "₫"}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => navigate(`/product/${p.id}`)}
                                className="text-xs text-blue-600"
                              >
                                Xem
                              </button>
                              <button
                                onClick={() => handleAddToCart(p)}
                                className="text-xs text-green-600"
                              >
                                Thêm
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "chat" && (
                  <div className="flex flex-col h-full pb-4">
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {chatMessages.length === 0 ? (
                        <div className="text-xs text-gray-500">
                          Bạn có thể hỏi AI để được gợi ý, tìm kiếm hoặc trợ
                          giúp.
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-2 rounded ${
                              msg.role === "user"
                                ? "bg-red-50 text-red-700 text-right"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!chatInput.trim()) return;
                          await sendMessageToAI(chatInput.trim());
                          setChatInput("");
                        }}
                        className="flex gap-2"
                      >
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Hỏi AI..."
                          className="flex-1 px-3 py-2 border rounded"
                        />
                        <button
                          disabled={isThinking || !chatInput.trim()}
                          className="px-3 py-2 bg-red-600 text-white rounded"
                        >
                          Gửi
                        </button>
                      </form>
                      {isThinking && (
                        <div className="text-xs mt-2 text-gray-500">
                          AI đang trả lời...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfigureOpenAi}
                  className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                >
                  Cấu hình AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Button (AI) */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
          title="AI Assistant"
        >
          <span className="font-bold text-sm">AI</span>
        </button>
      </div>
    </>
  );
}
