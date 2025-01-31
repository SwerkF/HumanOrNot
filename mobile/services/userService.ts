import API from "./Interceptor";

export default class UserService {
    
    async login(email: string, password: string) {
        try {
            const response = await API.post("/auth/login", { email, password });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async register(username: string, email: string, password: string) {
        try {
            const response = await API.post("/auth/register", { username, email, password });
            return response.data;
        } catch (error) {
            return error;
        }
    }
}