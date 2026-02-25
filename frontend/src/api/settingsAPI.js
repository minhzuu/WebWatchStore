import axiosInstance from "./axiosConfig";

/**
 * Get general settings
 */
export const getGeneralSettings = async () => {
  const response = await axiosInstance.get("/settings/general");
  return response.data;
};

/**
 * Update general settings (ADMIN only)
 */
export const updateGeneralSettings = async (settings) => {
  const response = await axiosInstance.put("/settings/general", settings);
  return response.data;
};
