import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosConfig";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = query.get("token");
    if (t) setToken(t);
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password !== confirm) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      toast.success("Đặt lại mật khẩu thành công");
      navigate("/login");
    } catch (err) {
      console.error("Reset password error", err);
      const msg = err.response?.data || "Đặt lại mật khẩu thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Lavender Blush Flow Gradient (Top Left to Bottom Right) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, #E1BEE7 0%, #F3E5F5 20%, #FCE4EC 40%, #FFF0F5 60%, #F8BBD9 80%, #E1BEE7 100%)`,
        }}
      />
      {/* Your Content/Components */}
      <div className="min-h-screen min-w-screen flex items-center justify-center p-4 absolute z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Đặt lại mật khẩu
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <button
              onClick={() => navigate("/login")}
              className="text-red-600 hover:underline font-medium"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
