import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import MarketScreen from '../MarketScreen';
import api from '../../../services/api';

// Mock API
jest.mock('../../../services/api', () => ({
    get: jest.fn(),
}));

// Mock Navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

// Mock expo-asset
jest.mock('expo-asset', () => ({
    Asset: {
        fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })),
    },
}));

// Mock Redux Actions
jest.mock('../../../store/slices/marketSlice', () => ({
    fetchCrops: jest.fn(() => ({ type: 'TEST_FETCH_CROPS' })),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn().mockReturnValue(true),
}));

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Dummy Reducer for Store
const initialState = {
    market: {
        crops: [
            { _id: '1', name: 'Tomato', current_price: 25, unit: 'kg', farmer: { name: 'Ramesh' } },
            { _id: '2', name: 'Potato', current_price: 15, unit: 'kg', farmer: { name: 'Suresh' } }
        ],
        isLoading: false,
        pagination: { totalPages: 1 }
    },
    auth: {
        user: { name: 'TestUser' }
    }
};
const reducer = (state = initialState, action) => state;
const store = createStore(reducer);

describe('MarketScreen', () => {
    it('renders correctly and fetches crops', async () => {
        const mockCrops = {
            data: {
                crops: [
                    { _id: '1', name: 'Tomato', current_price: 25, unit: 'kg', farmer: { name: 'Ramesh' } },
                    { _id: '2', name: 'Potato', current_price: 15, unit: 'kg', farmer: { name: 'Suresh' } },
                ],
                pagination: { totalPages: 1 }
            }
        };

        api.get.mockResolvedValue(mockCrops);

        const { getByText, getByPlaceholderText } = render(
            <Provider store={store}>
                <MarketScreen navigation={mockNavigation} />
            </Provider>
        );

        // Check initial render
        expect(getByPlaceholderText('search_placeholder')).toBeTruthy();

        // Wait for data to load
        await waitFor(() => {
            expect(getByText('Tomato')).toBeTruthy();
            expect(getByText('Potato')).toBeTruthy();
        });
    });

    it('navigates to details screen on crop press', async () => {
        const mockCrops = {
            data: {
                crops: [
                    { _id: '1', name: 'Tomato', current_price: 25, unit: 'kg', farmer: { name: 'Ramesh' } }
                ],
                pagination: { totalPages: 1 }
            }
        };
        api.get.mockResolvedValue(mockCrops);

        const { getByText } = render(
            <Provider store={store}>
                <MarketScreen navigation={mockNavigation} />
            </Provider>
        );

        await waitFor(() => expect(getByText('Tomato')).toBeTruthy());

        fireEvent.press(getByText('Tomato'));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('CropDetails', { id: '1' });
    });
});
