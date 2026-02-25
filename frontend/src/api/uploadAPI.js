import axios from "axios";

const UPLOAD_URL = "http://localhost:8080/api/upload";

// Upload nhiều ảnh sản phẩm
export const uploadProductImages = async (files) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(
      `${UPLOAD_URL}/product-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Error uploading images:", err);
    throw err;
  }
};

// Xóa ảnh sản phẩm (gửi Cloudinary URL)
export const deleteProductImage = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(`${UPLOAD_URL}/product-images`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting image:", err);
    throw err;
  }
};

// Upload ảnh banner
export const uploadBannerImages = async (files) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(`${UPLOAD_URL}/banner-images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading banner images:", err);
    throw err;
  }
};

// Xóa ảnh banner (gửi Cloudinary URL)
export const deleteBannerImage = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(`${UPLOAD_URL}/banner-images`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting banner image:", err);
    throw err;
  }
};

// Upload ảnh bài viết (cover image)
export const uploadPostImages = async (files) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(`${UPLOAD_URL}/post-images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading post images:", err);
    throw err;
  }
};

// Xóa ảnh bài viết (gửi Cloudinary URL)
export const deletePostImage = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(`${UPLOAD_URL}/post-images`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting post image:", err);
    throw err;
  }
};

// Upload avatar image for user
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${UPLOAD_URL}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error uploading avatar:", err);
    throw err;
  }
};

// Delete avatar (if you want to support removing files)
export const deleteAvatar = async (filename) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(
      `${UPLOAD_URL}/post-images/${filename}`,
      {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error deleting avatar:", err);
    throw err;
  }
};

// Upload logo (settings)
export const uploadLogo = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${UPLOAD_URL}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading logo:", err);
    throw err;
  }
};

// Delete logo
export const deleteLogo = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(`${UPLOAD_URL}/logo`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting logo:", err);
    throw err;
  }
};

// Upload payment method images
export const uploadPaymentMethodImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("accessToken");
    const response = await axios.post(
      `${UPLOAD_URL}/payment-methods`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Error uploading payment method images:", err);
    throw err;
  }
};

// Delete payment method image
export const deletePaymentMethodImage = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(`${UPLOAD_URL}/payment-methods`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting payment method image:", err);
    throw err;
  }
};

// Upload social media images
export const uploadSocialMediaImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${UPLOAD_URL}/social-media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading social media images:", err);
    throw err;
  }
};

// Delete social media image
export const deleteSocialMediaImage = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(`${UPLOAD_URL}/social-media`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting social media image:", err);
    throw err;
  }
};

// Upload brand logo images
export const uploadBrandLogos = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${UPLOAD_URL}/brand-logos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error uploading brand logo images:", err);
    throw err;
  }
};

// Delete brand logo image
export const deleteBrandLogo = async (imageUrl) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.delete(`${UPLOAD_URL}/brand-logos`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      data: { url: imageUrl },
    });
    return response.data;
  } catch (err) {
    console.error("Error deleting brand logo image:", err);
    throw err;
  }
};
