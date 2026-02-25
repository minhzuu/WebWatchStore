import axios from "./axiosConfig";

export const changePassword = async (currentPassword, newPassword) => {
  const payload = { currentPassword, newPassword };
  const res = await axios.post("/auth/change-password", payload);
  return res.data;
};
