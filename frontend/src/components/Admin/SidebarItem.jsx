import React from "react";
import { cn } from "@/lib/utils";

export const SidebarItem = ({ icon, name, isActive, onClick, collapsed }) => {
  const iconColor = isActive ? "text-white" : "text-gray-700";
  const textColor = isActive ? "text-white" : "text-gray-700";

  return (
    <div
      className={cn(
        "relative h-12 cursor-pointer flex items-center rounded-lg z-10 transition-all duration-300 py-4",
        isActive ? "bg-brand-primary" : "hover:bg-gray-100",
        collapsed ? "w-14 justify-center" : "w-full px-3"
      )}
      onClick={onClick}
    >
      {/* icon */}
      <i
        className={cn(
          `las ${icon} text-2xl transition-colors duration-300`,
          iconColor,
          !collapsed && "mr-3"
        )}
      ></i>

      {/* text */}
      {!collapsed && (
        <span
          className={cn(
            "font-medium text-base transition-colors duration-300",
            textColor
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
};
