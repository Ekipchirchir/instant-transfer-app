import { Platform } from "react-native";
const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";  
Platform.OS === "android"
    ? "http://192.168.0.164:8000/api" 
    : "http://127.0.0.1:8081/api";  

export default API_BASE_URL;
