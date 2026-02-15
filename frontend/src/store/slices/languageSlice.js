import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languageSlice = createSlice({
    name: 'language',
    initialState: {
        currentLanguage: 'en'
    },
    reducers: {
        setLanguage: (state, action) => {
            state.currentLanguage = action.payload;
            AsyncStorage.setItem('appLanguage', action.payload);
        }
    }
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
