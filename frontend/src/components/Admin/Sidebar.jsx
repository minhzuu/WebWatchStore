import { sideBars } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import { SidebarItem } from "./SidebarItem";
import { TextAlignJustify } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Sidebar = ({ setCollapsed, collapsed, logout }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Set activeIndex dựa trên route hiện tại
  useEffect(() => {
    const index = sideBars.findIndex((item) => item.path === location.pathname);
    if (index >= 0) setActiveIndex(index);
  }, [location.pathname]);

  return (
    <div
      className="h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col"
      style={{
        width: collapsed ? "80px" : "260px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center border-b border-gray-200 px-4"
        style={{ height: "70px" }}
      >
        {!collapsed ? (
          <div
            className="cursor-pointer w-full flex items-center justify-center"
            onClick={() => navigate("/home")}
          >
            <img
              src="/watchstore-logo-no-bg.jpg"
              alt="Logo"
              className="max-h-[150px] w-auto object-contain py-2"
            />
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <TextAlignJustify className="text-gray-700" size={24} />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex flex-col py-4 overflow-y-auto flex-1"
        style={{
          paddingLeft: collapsed ? "12px" : "16px",
          paddingRight: collapsed ? "12px" : "16px",
          gap: "4px",
        }}
      >
        {/* Danh sách sidebar */}
        {sideBars.map((item, index) => (
          <SidebarItem
            key={item.name}
            name={collapsed ? "" : item.name}
            icon={item.icon}
            isActive={activeIndex === index}
            onClick={() => navigate(item.path)}
            collapsed={collapsed}
          />
        ))}

        {/* Spacer để đẩy logout xuống dưới */}
        <div className="flex-1 min-h-4" />

        {/* Logout item */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <SidebarItem
            name={collapsed ? "" : "Logout"}
            icon={"la-power-off"}
            onClick={logout}
            collapsed={collapsed}
            isActive={false}
          />
        </div>
      </div>
    </div>
  );
};
