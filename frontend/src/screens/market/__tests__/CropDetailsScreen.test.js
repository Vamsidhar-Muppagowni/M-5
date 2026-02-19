
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CropDetailsScreen from '../CropDetailsScreen';
import { marketAPI } from '../../../services/api';

// Mock Route params
const mockRoute = {
    params: {
        crop: {
            _id: '1',
            name: 'Tomato',
            current_price: 25,
            min_price: 20,
            unit: 'kg',
            farmer: { name: 'Ramesh', phone: '123' },
            description: 'Fresh tomatoes',
            images: [],
            quantity: 100,
            quality_grade: 'A',
            location: { district: 'Guntur' }
        }
    }
};

const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn()
};

// Mock expo-asset
jest.mock('expo-asset', () => ({
    Asset: {
        fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })),
    },
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

// Inline Mock API
jest.mock('../../../services/api', () => ({
    marketAPI: {
        getCropDetails: jest.fn().mockResolvedValue({
            data: {
                crop: {
                    _id: '1',
                    name: 'Tomato',
                    current_price: 25,
                    min_price: 20,
                    unit: 'kg',
                    farmer: { name: 'Ramesh', phone: '123' },
                    description: 'Fresh tomatoes',
                    images: [],
                    quantity: 100,
                    quality_grade: 'A',
                    location: { district: 'Guntur' },
                    status: 'listed'
                },
                bids: []
            }
        }),
        placeBid: jest.fn()
    }
}));

// Dummy Store
const initialState = {
    auth: {
        user: { _id: 'buyer_123', name: 'Test Buyer', user_type: 'buyer' }
    }
};
const store = createStore((state = initialState) => state);

describe('CropDetailsScreen', () => {
    it('renders crop details correctly', async () => {
        const { getByText, getAllByText } = render(
            <Provider store={store}>
                <CropDetailsScreen route={mockRoute} navigation={mockNavigation} />
            </Provider>
        );

        await waitFor(() => {
            expect(getAllByText(/Tomato/i).length).toBeGreaterThan(0);
            expect(getAllByText(/Fresh tomatoes/i).length).toBeGreaterThan(0);
            expect(getAllByText(/₹25/i).length).toBeGreaterThan(0);
        });
    });

    it('shows error if bid is lower than minimum price', async () => {
        const { getByText, getByPlaceholderText } = render(
            <Provider store={store}>
                <CropDetailsScreen route={mockRoute} navigation={mockNavigation} />
            </Provider>
        );

        const bidInput = await waitFor(() => getByPlaceholderText(/enter_bid_error/i));
        fireEvent.changeText(bidInput, '10'); // Below min_price 20

        const placeBidBtn = getByText(/place_bid/i);
        fireEvent.press(placeBidBtn);

        // Verification: ensure API was NOT called for placing bid
        expect(marketAPI.placeBid).not.toHaveBeenCalled();
    });
});

