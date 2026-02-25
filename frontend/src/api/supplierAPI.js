import axiosInstance from "./axiosConfig";

const SUPPLIER_URL = "/suppliers";

// Lấy tất cả suppliers
export const getSuppliers = async () => {
  try {
    const res = await axiosInstance.get(SUPPLIER_URL);
    const data = res.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    return [];
  }
};

// Lấy supplier theo ID
export const getSupplierById = async (id) => {
  try {
    const res = await axiosInstance.get(`${SUPPLIER_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching supplier ${id}:`, err);
    return null;
  }
};

// Tạo supplier mới
export const createSupplier = async (supplierData) => {
  try {
    const res = await axiosInstance.post(SUPPLIER_URL, supplierData);
    return res.data;
  } catch (err) {
    console.error("Error creating supplier:", err);
    throw err;
  }
};

// Cập nhật supplier
export const updateSupplier = async (id, supplierData) => {
  try {
    const res = await axiosInstance.put(`${SUPPLIER_URL}/${id}`, supplierData);
    return res.data;
  } catch (err) {
    console.error(`Error updating supplier ${id}:`, err);
    throw err;
  }
};

// Xóa supplier
export const deleteSupplier = async (id) => {
  try {
    await axiosInstance.delete(`${SUPPLIER_URL}/${id}`);
  } catch (err) {
    console.error(`Error deleting supplier ${id}:`, err);
    throw err;
  }
};
