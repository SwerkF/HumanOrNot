import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/userSlices';
import gameSlice from './slices/gameSlices';

const store = configureStore({
    reducer: {
        auth: authSlice,
        game: gameSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }).concat(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;