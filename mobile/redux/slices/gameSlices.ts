import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import GameService from "@/services/gameService";

const gameService = new GameService();

export const getGames = createAsyncThunk(
    "game/getGames",
    async (_, { rejectWithValue }) => {
        try {
            const response = await gameService.getGames();
            if (response.error) {
                return rejectWithValue(response.error);
            }
            if (response.message) {
                return rejectWithValue(response.message);
            }
            return response.data;
        } catch (error: unknown) {
            const err = error as Error;
            return rejectWithValue(err.message);
        }
    }
)

export const voteGame = createAsyncThunk(
    "game/voteGame",
    async ({ gameId, vote }: { gameId: string; vote: boolean }, { rejectWithValue }) => {
        try {
            const response = await gameService.voteGame(gameId, vote);
            if (response.error) {
                return rejectWithValue(response.error);
            }
            if (response.message) {
                return rejectWithValue(response.message);
            }
            return response.data;
        } catch (error: unknown) {
            const err = error as Error;
            return rejectWithValue(err.message);
        }
    }
)

const gameSlice = createSlice({
    name: "game",
    initialState: {
        games: [],
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
            .addCase(voteGame.fulfilled, (state) => {
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