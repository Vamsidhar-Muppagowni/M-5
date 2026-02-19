import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import marketReducer from './slices/marketSlice';
import languageReducer from './slices/languageSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        market: marketReducer,
        language: languageReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export default store;
