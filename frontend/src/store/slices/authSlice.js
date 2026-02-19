import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export const login = createAsyncThunk(
    'auth/login',
    async ({ phone, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', { phone, password });
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            console.log("AuthSlice: Calling API register with", userData);
            const response = await api.post('/auth/register', userData);
            console.log("AuthSlice: API Response", response.data);
            return response.data;
        } catch (error) {
            console.error("AuthSlice: API Error", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.error || 'Registration failed');
        }
    }
);

export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ phone, otp }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-otp', { phone, otp });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Verification failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            AsyncStorage.removeItem('token');
            AsyncStorage.removeItem('user');
        },
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(verifyOTP.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
