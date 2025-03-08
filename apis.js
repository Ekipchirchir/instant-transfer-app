import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "./config";

export const refreshToken = async () => {
  try {
    const storedRefreshToken = await AsyncStorage.getItem("refresh_token");

    if (!storedRefreshToken) {
      console.error("🚨 No refresh token found in storage!");
      return null;
    }

    console.log("🔄 Using stored refresh token:", storedRefreshToken);

    // ✅ Ensure correct URL (remove extra "/api")
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: storedRefreshToken,
    });

    console.log("✅ New Access Token:", response.data.access);

    await AsyncStorage.setItem("access_token", response.data.access);
    return response.data.access;
  } catch (error) {
    console.error("🚨 Token Refresh Failed:", error.response?.data || error);
    return null;
  }
};
