import axiosInstance from "./axiosConfig";

const PRODUCT_URL = "/products";

// Lấy danh sách sản phẩm với phân trang và tìm kiếm
export const getProducts = async (params = {}) => {
  try {
    const {
      page = 0,
      size = 10,
      name = "",
      search = "",
      category = "",
      brand = "",
      supplier = "",
      minPrice = null,
      maxPrice = null,
      status = "",
      sortBy = "id",
      order = "desc", // Sort mới nhất lên đầu
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);
    // Support both `name` and `search` query params (some callers use `search`).
    if (name) queryParams.append("name", name);
    if (search) queryParams.append("search", search);
    if (category) queryParams.append("category", category);
    if (brand) queryParams.append("brand", brand);
    if (supplier) queryParams.append("supplier", supplier);
    if (minPrice !== null) queryParams.append("minPrice", minPrice);
    if (maxPrice !== null) queryParams.append("maxPrice", maxPrice);
    if (status) queryParams.append("status", status);
    queryParams.append("sortBy", sortBy);
    queryParams.append("order", order);

    const res = await axiosInstance.get(`${PRODUCT_URL}?${queryParams}`);
    const data = res?.data;
    return data || { content: [], totalPages: 0 };
  } catch (err) {
    console.error("Error fetching products:", err);
    return { content: [], totalPages: 0 };
  }
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const product = await axiosInstance.get(`${PRODUCT_URL}/${id}`);
    return product?.data;
  } catch (err) {
    console.error(`Error fetching product ${id}:`, err);
    return null;
  }
};

// Tìm kiếm sản phẩm theo tên
export const searchProducts = async (name) => {
  const term = name?.trim();
  if (!term) return [];

  try {
    // thử search endpoint riêng - chỉ lấy sản phẩm ACTIVE
    const resSearch = await axiosInstance.get(`${PRODUCT_URL}/search`, {
      params: { name: term, status: "ACTIVE" },
    });

    const listSearch = resSearch?.data;
    if (Array.isArray(listSearch) && listSearch.length > 0) {
      return listSearch;
    }
  } catch (err) {
    console.warn("Search endpoint failed, fallback to getProducts", err);
  }

  // fallback sang getProducts - chỉ lấy sản phẩm ACTIVE
  try {
    const res = await getProducts({
      page: 0,
      size: 50,
      name: term,
      status: "ACTIVE",
      sortBy: "createdAt",
      order: "desc",
    });

    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.content && Array.isArray(res.content)) return res.content;
  } catch (err) {
    console.error("Error searching products via fallback:", err);
  }

  return [];
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    // Transform data to match backend DTO structure
    const payload = {
      name: productData.name,
      description: productData.description,
      status: productData.status || "ACTIVE",
      brandId: Number(productData.brandId),
      categoryId: Number(productData.categoryId),
      supplierId: Number(productData.supplierId),
      price: productData.price ? Number(productData.price) : null,
      stockQuantity: productData.stockQuantity
        ? Number(productData.stockQuantity)
        : null,
      images: productData.images || [], // Array of {imageUrl, isPrimary}
      productSpecs: Array.isArray(productData.productSpecs)
        ? productData.productSpecs.map((s) => ({
            keyName: s.name || s.keyName || s.key,
            value: s.value || s.val || s.specValue || "",
          }))
        : undefined,
    };

    const newProduct = await axiosInstance.post(PRODUCT_URL, payload);
    return newProduct?.data;
  } catch (err) {
    console.error("Error creating product:", err);
    throw err;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    // Transform data to match backend DTO structure
    const payload = {
      name: productData.name,
      description: productData.description,
      status: productData.status,
      brandId: Number(productData.brandId),
      categoryId: Number(productData.categoryId),
      supplierId: Number(productData.supplierId),
      price: productData.price ? Number(productData.price) : null,
      stockQuantity: productData.stockQuantity
        ? Number(productData.stockQuantity)
        : null,
      images: productData.images || [],
      productSpecs: Array.isArray(productData.productSpecs)
        ? productData.productSpecs.map((s) => ({
            keyName: s.name || s.keyName || s.key,
            value: s.value || s.val || s.specValue || "",
          }))
        : undefined,
    };

    const updatedProduct = await axiosInstance.put(
      `${PRODUCT_URL}/${id}`,
      payload
    );
    return updatedProduct?.data;
  } catch (err) {
    console.error(`Error updating product ${id}:`, err);
    throw err;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    await axiosInstance.delete(`${PRODUCT_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting product ${id}:`, err);
    throw err;
  }
};

export const getPriceRange = async () => {
  try {
    const res = await axiosInstance.get(`${PRODUCT_URL}/price-range`);
    return res?.data;
  } catch (err) {
    console.error("Error fetching price range:", err);
    return { minPrice: 0, maxPrice: 10000000 };
  }
};
