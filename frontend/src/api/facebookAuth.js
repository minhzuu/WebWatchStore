import axiosInstance from "./axiosConfig";

export async function facebookSignIn(accessToken) {
  return axiosInstance.post("/auth/facebook", { accessToken });
}
