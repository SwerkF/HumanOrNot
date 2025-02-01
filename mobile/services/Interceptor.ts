import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VITE_API_BASE_URL } from "@env";

const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  async (response) => {
    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
