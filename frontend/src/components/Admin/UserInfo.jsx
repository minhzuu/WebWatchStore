import { User } from "lucide-react";

export const UserInfo = ({ image, name, role }) => {
  return (
    <div className="flex items-center">
      {image === "user.png" ? (
        <div className="mr-2 border rounded-full p-3">
          <User size={20} />
        </div>
      ) : (
        <img
          src={image}
          alt="User Avatar"
          className="w-12 h-12 rounded-full mr-5"
        />
      )}

      <div className="text-[14px]">
        <p className="font-semibold">{name}</p>
        <p>{role}</p>
      </div>
      {/* <i className="las la-chevron-circle-down text-3xl ml-[26px]"></i> */}
    </div>
  );
};
