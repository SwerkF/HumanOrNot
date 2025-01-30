import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import GameService from "@/services/gameService";
import { toast } from "react-toastify";

const gameService = new GameService();

const getGames = createAsyncThunk(
    "game/getGames",
    async (_, { rejectWithValue }) => {
        try {
            const response = await gameService.getGames();
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const voteGame = createAsyncThunk(
    "game/voteGame",
    async ({ gameId, vote }: { gameId: string; vote: boolean }, { rejectWithValue }) => {
        try {
            const response = await gameService.voteGame(gameId, vote);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

const gameSlice = createSlice({
    name: "game",
    initialState: {
        games: null,
        error: "",
        status: "idle",
    },
    reducers: {
        setGames: (state, action) => {
            state.games = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getGames.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getGames.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.games = action.payload;
            })
            .addCase(getGames.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(voteGame.pending, (state) => {
                state.status = "loading";
            })
            .addCase(voteGame.fulfilled, (state, action) => {
                state.status = "succeeded";
            })
            .addCase(voteGame.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
    },
});

export const { setGames, setError, setStatus } = gameSlice.actions;

export default gameSlice.reducer;