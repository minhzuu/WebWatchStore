import axios from "./axiosConfig";

// Posts Admin
export const adminPostAPI = {
  getAll: async (
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "DESC",
    filters = {}
  ) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    params.append("sortBy", sortBy);
    params.append("direction", direction);
    if (filters.title) params.append("title", filters.title);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.status) params.append("status", filters.status);
    if (filters.createdFrom) params.append("createdFrom", filters.createdFrom);
    if (filters.createdTo) params.append("createdTo", filters.createdTo);

    const response = await axios.get(`/posts/admin/all?${params.toString()}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`/posts/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/posts", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.put(`/posts/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/posts/${id}`);
    return response.data;
  },
  search: async (keyword, page = 0, size = 10) => {
    const response = await axios.get(
      `/posts/search?keyword=${keyword}&page=${page}&size=${size}`
    );
    return response.data;
  },
};

// Post Categories Admin
export const adminPostCategoryAPI = {
  getAll: async () => {
    const response = await axios.get("/post-categories");
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`/post-categories/${id}`);
    return response.data;
  },
  getBySlug: async (slug) => {
    const response = await axios.get(`/post-categories/slug/${slug}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/post-categories", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.put(`/post-categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/post-categories/${id}`);
    return response.data;
  },
};

// Banners Admin
export const adminBannerAPI = {
  getAll: async () => {
    const response = await axios.get("/banners/all");
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`/banners/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axios.post("/banners", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axios.put(`/banners/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/banners/${id}`);
    return response.data;
  },
};

// Posts Public
export const postAPI = {
  getPublished: async (page = 0, size = 10) => {
    const response = await axios.get(`/posts?page=${page}&size=${size}`);
    return response.data;
  },
  getBySlug: async (slug) => {
    const response = await axios.get(`/posts/slug/${slug}`);
    return response.data;
  },
  getByCategory: async (categoryId, page = 0, size = 10) => {
    const response = await axios.get(
      `/posts/category/${categoryId}?page=${page}&size=${size}`
    );
    return response.data;
  },
  getLatest: async (limit = 5) => {
    const response = await axios.get(`/posts/latest?limit=${limit}`);
    return response.data;
  },
};

// Post Categories Public
export const postCategoryAPI = {
  getAll: async () => {
    const response = await axios.get("/post-categories");
    return response.data;
  },
  getBySlug: async (slug) => {
    const response = await axios.get(`/post-categories/slug/${slug}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`/post-categories/${id}`);
    return response.data;
  },
};

// Banners Public
export const bannerAPI = {
  getActive: async () => {
    const response = await axios.get("/banners");
    return response.data;
  },
};

export const cmsAPI = {
  admin: {
    posts: adminPostAPI,
    postCategories: adminPostCategoryAPI,
    banners: adminBannerAPI,
  },
  public: {
    posts: postAPI,
    postCategories: postCategoryAPI,
    banners: bannerAPI,
  },
};

export default cmsAPI;
