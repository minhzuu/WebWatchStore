import { Sidebar } from "@/components/Admin/Sidebar";
import { TopBar } from "@/components/Admin/TopBar";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { parseStoredUser } from "@/utils/storage";

export const Admin = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");

    // Dispatch event để các component khác biết user đã thay đổi
    window.dispatchEvent(new Event("userUpdated"));

    navigate("/login");
  };

  const user = parseStoredUser();

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="flex flex-col h-screen sticky top-0 bg-white border-r overflow-auto">
        <Sidebar
          setCollapsed={setCollapsed}
          collapsed={collapsed}
          logout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <TopBar
            setCollapsed={setCollapsed}
            collapsed={collapsed}
            image={user?.avatarUrl || "user.png"}
            name={user?.fullName || "###"}
            role={user?.role || "ADMIN"}
          />
        </div>

        {/* Nội dung chính */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
