import axiosInstance from "./axiosConfig";

const PAYMENT_URL = "/payments";

export const getPayments = async (options = {}) => {
  try {
    const params = options.search ? { search: options.search } : undefined;
    const response = await axiosInstance.get(PAYMENT_URL, { params });
    const payload = response?.data?.data;
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    throw error;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await axiosInstance.get(`${PAYMENT_URL}/${id}`);
    return response?.data?.data ?? null;
  } catch (error) {
    console.error(`Failed to fetch payment ${id}:`, error);
    throw error;
  }
};

export const getPaymentMethods = async () => {
  try {
    const response = await axiosInstance.get(`${PAYMENT_URL}/methods`);
    const payload = response?.data?.data;
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    throw error;
  }
};

// VNPay Integration
export const createVNPayPayment = async (payload) => {
  try {
    const response = await axiosInstance.post("/vnpay/create-payment", payload);
    return response?.data?.data;
  } catch (error) {
    console.error("Failed to create VNPay payment:", error);
    throw error;
  }
};

export const handleVNPayReturn = async (params) => {
  try {
    const response = await axiosInstance.get("/vnpay/payment-return", {
      params,
    });
    return response?.data?.data;
  } catch (error) {
    console.error("Failed to process VNPay return:", error);
    throw error;
  }
};
