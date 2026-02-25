import axiosInstance from "./axiosConfig";

const BRAND_URL = "/brands";

// Lấy tất cả brands
export const getBrands = async () => {
  try {
    const res = await axiosInstance.get(BRAND_URL);

    // Axios wraps response in .data property
    let data = res?.data;

    // If data is a string, try to parse it
    if (typeof data === "string") {
      try {
        // Try to parse the string directly
        data = JSON.parse(data);
        console.log("brandAPI: Successfully parsed JSON string");
      } catch (parseError) {
        console.error("brandAPI: Failed to parse JSON string:", parseError);
        console.error("brandAPI: String length:", data.length);
        console.error(
          "brandAPI: String preview (first 1000 chars):",
          data.substring(0, 1000)
        );
        console.error(
          "brandAPI: String preview (last 500 chars):",
          data.substring(data.length - 500)
        );

        // The string might contain multiple JSON objects or be corrupted
        // Try to find the first valid JSON array in the string
        let parsedData = null;

        // Method 1: Try to find first complete array
        const arrayStartIndex = data.indexOf("[");
        if (arrayStartIndex !== -1) {
          // Try to find matching closing bracket
          let bracketCount = 0;
          let arrayEndIndex = -1;

          for (let i = arrayStartIndex; i < data.length; i++) {
            if (data[i] === "[") bracketCount++;
            if (data[i] === "]") {
              bracketCount--;
              if (bracketCount === 0) {
                arrayEndIndex = i;
                break;
              }
            }
          }

          if (arrayEndIndex !== -1) {
            const arrayString = data.substring(
              arrayStartIndex,
              arrayEndIndex + 1
            );
            try {
              parsedData = JSON.parse(arrayString);
              if (Array.isArray(parsedData)) {
                console.log(
                  "brandAPI: Successfully extracted array from string"
                );
                data = parsedData;
              }
            } catch (e) {
              console.error("brandAPI: Failed to parse extracted array:", e);
            }
          }
        }

        // Method 2: Try regex to extract array
        if (!parsedData) {
          const arrayMatch = data.match(/\[[\s\S]*?\]/);
          if (arrayMatch && arrayMatch[0]) {
            try {
              parsedData = JSON.parse(arrayMatch[0]);
              if (Array.isArray(parsedData)) {
                console.log(
                  "brandAPI: Successfully extracted array using regex"
                );
                data = parsedData;
              }
            } catch (e) {
              console.error(
                "brandAPI: Failed to parse regex-extracted array:",
                e
              );
            }
          }
        }

        // If still failed, try to manually parse brands
        if (!parsedData || !Array.isArray(data)) {
          console.warn(
            "brandAPI: Could not parse string, trying manual extraction"
          );

          // Try to extract individual brand objects
          const brandMatches = data.match(/\{"id":\d+,"name":"[^"]+"/g);
          if (brandMatches && brandMatches.length > 0) {
            const extractedBrands = [];
            for (const match of brandMatches) {
              try {
                // Try to complete the JSON object
                const brandStr = match + "}";
                const brand = JSON.parse(brandStr);
                extractedBrands.push({
                  id: brand.id,
                  name: brand.name,
                  description: brand.description || "",
                  logoUrl: brand.logoUrl || brand.logo_url || "",
                });
              } catch (e) {
                // Skip invalid matches
              }
            }
            if (extractedBrands.length > 0) {
              console.log(
                "brandAPI: Extracted",
                extractedBrands.length,
                "brands manually"
              );
              data = extractedBrands;
            } else {
              return [];
            }
          } else {
            return [];
          }
        }
      }
    }

    // Backend returns array directly, so data should be the array
    if (Array.isArray(data)) {
      // Clean up brands - remove products list if exists (circular reference issue)
      const cleanedBrands = data
        .map((brand) => {
          // Handle both snake_case and camelCase
          const brandObj = {
            id: brand.id,
            name: brand.name,
            description: brand.description,
            logoUrl: brand.logoUrl || brand.logo_url,
            status: brand.status, // Include status field
          };
          return brandObj;
        })
        .filter((brand) => brand.id && brand.name); // Filter out invalid brands

      console.log(
        "brandAPI: Returning",
        cleanedBrands.length,
        "cleaned brands"
      );
      return cleanedBrands;
    }

    // Check for nested data structures
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (Array.isArray(data.data)) {
        return data.data.map((brand) => ({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          logoUrl: brand.logoUrl || brand.logo_url,
        }));
      }
      if (Array.isArray(data.content)) {
        return data.content.map((brand) => ({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          logoUrl: brand.logoUrl || brand.logo_url,
        }));
      }
    }

    console.warn("brandAPI: No valid array found");
    return [];
  } catch (err) {
    console.error("Error fetching brands:", err);
    console.error("Error details:", err.response?.data || err.message);
    return [];
  }
};

// Lấy brand theo ID
export const getBrandById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BRAND_URL}/${id}`);
    return response.data;
  } catch (err) {
    console.error(`Error fetching brand ${id}:`, err);
    return null;
  }
};

// Tạo brand mới
export const createBrand = async (brandData) => {
  try {
    const newBrand = await axiosInstance.post(BRAND_URL, brandData);
    return newBrand;
  } catch (err) {
    console.error("Error creating brand:", err);
    return null;
  }
};

// Cập nhật brand
export const updateBrand = async (id, brandData) => {
  try {
    const updatedBrand = await axiosInstance.put(
      `${BRAND_URL}/${id}`,
      brandData
    );
    return updatedBrand.data;
  } catch (err) {
    console.error(`Error updating brand ${id}:`, err);
    throw err;
  }
};

// Xóa brand
export const deleteBrand = async (id) => {
  try {
    await axiosInstance.delete(`${BRAND_URL}/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting brand ${id}:`, err);
    return false;
  }
};
