import { Platform } from "react-native";

const API_BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.0.164:8000/api" // ✅ No extra spaces or typos
    : "http://127.0.0.1:8000/api";  

export default API_BASE_URL;

