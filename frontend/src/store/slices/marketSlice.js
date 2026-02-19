import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { marketAPI } from '../../services/api';

export const fetchCrops = createAsyncThunk(
    'market/fetchCrops',
    async (params, { rejectWithValue }) => {
        try {
            const response = await marketAPI.getCrops(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch crops');
        }
    }
);

export const fetchCropDetails = createAsyncThunk(
    'market/fetchCropDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await marketAPI.getCropDetails(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch crop details');
        }
    }
);

const marketSlice = createSlice({
    name: 'market',
    initialState: {
        crops: [],
        currentCrop: null,
        insights: null,
        isLoading: false,
        error: null,
        pagination: null
    },
    reducers: {
        clearCurrentCrop: (state) => {
            state.currentCrop = null;
            state.insights = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCrops.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCrops.fulfilled, (state, action) => {
                state.isLoading = false;
                state.crops = action.payload.crops;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchCrops.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchCropDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCropDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCrop = action.payload.crop;
                state.insights = action.payload.insights;
            })
            .addCase(fetchCropDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCurrentCrop } = marketSlice.actions;
export default marketSlice.reducer;
