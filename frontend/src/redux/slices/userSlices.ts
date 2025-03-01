import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "@/services/userService";
import { toast } from "react-toastify";
import { Error } from "@/models/Error";

const userService = new UserService();

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.login(email, password);
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
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      username,
      email,
      password,
    }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
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
);

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
        toast.success("Connexion réussie");
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        toast.error(state.error);
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuth = true;
        state.error = "";
        toast.success("Inscription réussie");
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        toast.error(state.error);
      });
  },
});

export const { logout, setError, setStatus } = authSlice.actions;

export default authSlice.reducer;
