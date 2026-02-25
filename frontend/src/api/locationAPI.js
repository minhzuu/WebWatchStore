import axios from 'axios';

// Using Vietnam provinces API
const PROVINCES_API = 'https://provinces.open-api.vn/api';

/**
 * Get all provinces
 */
export const getProvinces = async () => {
  try {
    const response = await axios.get(`${PROVINCES_API}/p/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

/**
 * Get districts by province code
 * @param {string} provinceCode - Province code
 */
export const getDistrictsByProvince = async (provinceCode) => {
  try {
    const response = await axios.get(`${PROVINCES_API}/p/${provinceCode}?depth=2`);
    return response.data.districts;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

/**
 * Get wards by district code
 * @param {string} districtCode - District code
 */
export const getWardsByDistrict = async (districtCode) => {
  try {
    const response = await axios.get(`${PROVINCES_API}/d/${districtCode}?depth=2`);
    return response.data.wards;
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw error;
  }
};
