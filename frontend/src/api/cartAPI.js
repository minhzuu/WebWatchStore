import axiosInstance from "./axiosConfig";

const CART_API = "/cart"; // chỉ /cart thôi

export const getCart = async (userId) => {
  const res = await axiosInstance.get(`${CART_API}/${userId}`);
  return res.data;
};

export const addToCart = async (userId, productId, quantity) => {
  const res = await axiosInstance.post(
    `${CART_API}/${userId}/product/${productId}`,
    null,
    { params: { quantity } }
  );
  return res.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
  const res = await axiosInstance.put(`${CART_API}/item/${cartItemId}`, null, {
    params: { quantity },
  });
  return res.data;
};

export const removeCartItem = async (cartItemId) => {
  const res = await axiosInstance.delete(`${CART_API}/item/${cartItemId}`);
  return res.data;
};

export const clearCart = async (userId) => {
  const res = await axiosInstance.delete(`${CART_API}/${userId}`);
  return res.data;
};

export const getCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
};
