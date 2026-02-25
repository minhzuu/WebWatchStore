import axiosInstance from "./axiosConfig";

export async function googleSignIn(idToken) {
  return axiosInstance.post("/auth/google", { idToken });
}
