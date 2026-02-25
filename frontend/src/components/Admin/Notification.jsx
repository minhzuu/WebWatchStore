import { Bell } from "lucide-react";
import React from "react";

export const Notification = ({ unreadNum }) => {
  const notiNum = unreadNum >= 10 ? "9+" : unreadNum;
  return (
    <div className="relative inline-block">
      <div className="absolute bg-[#F93C65] text-[10px] text-white right-[-2px] top-[-2px] rounded-full w-4 h-4 text-center leading-4">
        <span>{notiNum}</span>
      </div>
      <Bell size={28} />
    </div>
  );
};
