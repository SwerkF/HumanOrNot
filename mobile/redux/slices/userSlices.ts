import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const userService = new UserService();

export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await userService.login(email, password);
            if (response.error) {
                return rejectWithValue(response.error);
            }
            if (response.message) {
                return rejectWithValue(response.message);
            }

            await AsyncStorage.setItem("token", response.token);

            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async ({  username, email, password }: { username: string; email: string; password: string; }, { rejectWithValue }) => {
        try {
            const response = await userService.register(username, email, password);
            if (response.error) {
                return rejectWithValue(response.error);
            }
            if (response.message) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const err = error as Error;
            return rejectWithValue(err.message);
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: "",
        isAuth: false,
        error: "",
        token: "",
        status: "idle",
    },
    reducers: {
        logout: (state) => {
            state.user = "";
            state.isAuth = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.token = action.payload.token;
                state.isAuth = true;
                state.error = "";
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(register.pending, (state) => {
                state.status = "loading";
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.isAuth = true;
                state.error = "";
            })
            .addCase(register.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const { logout, setError, setStatus } = authSlice.actions;

export default authSlice.reducer;