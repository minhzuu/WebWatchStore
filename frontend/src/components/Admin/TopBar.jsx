import React from "react";
import { SearchBar } from "./SearchBar";
import { UserInfo } from "./UserInfo";
import { Notification } from "./Notification";
import UserImg from "../../assets/images/user.png";
import { CircleChevronDown, TextAlignJustify } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const TopBar = ({ image, name, role, setCollapsed, collapsed }) => {
  return (
    <div className="flex justify-between mr-14 h-[70px] items-center">
      <div className="flex items-center ml-8">
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-transparent cursor-pointer mr-10 hover:bg-transparent"
          >
            <TextAlignJustify className="text-black" />
          </button>
        )}

        {/* <SearchBar /> */}
      </div>

      <div className="flex items-center gap-[26px]">
        {/* <Notification unreadNum={6} /> */}
        <UserInfo name={name} image={image} role={role} />
      </div>
    </div>
  );
};
