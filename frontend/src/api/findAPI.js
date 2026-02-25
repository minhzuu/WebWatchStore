import axios from 'axios';

const API_URL_PRD = 'http://localhost:8080/api/products';

export const getProductsByCategoryId = async (categoryId) => {
    try {
        const url = `${API_URL_PRD}/category/${categoryId}`;
        const response = await axios.get(url);
        // Đảm bảo luôn trả về mảng cho UI
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Lỗi gọi API tìm sản phẩm theo ID danh mục ${categoryId}:`, error);
        return [];
    }
};

export const searchProductsByName = async (name) => {
    try {
        const res = await axios.get(`${API_URL_PRD}/search`, {
            params: { name },
        });

        // ✨ ĐÃ SỬA LỖI: Luôn đảm bảo kết quả tìm kiếm trả về là một mảng.
        // Xử lý trường hợp res.data là mảng, hoặc object chứa mảng (ví dụ: { data: [...] })
        return Array.isArray(res.data)
            ? res.data
            : (res.data && Array.isArray(res.data.data))
                ? res.data.data
                : []; // Mặc định là mảng rỗng
    } catch (error) {
        console.error("Lỗi tìm sản phẩm:", error);
        return [];
    }
};