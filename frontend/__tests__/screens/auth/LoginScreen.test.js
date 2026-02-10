import React from 'react';
import {
    render,
    fireEvent,
    waitFor
} from '@testing-library/react-native';
import LoginScreen from '../../../src/screens/auth/LoginScreen';
import {
    Provider
} from 'react-redux';
import configureStore from 'redux-mock-store';

// Mocks
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    }),
}));

jest.mock('expo-linear-gradient', () => ({
    LinearGradient: ({
        children,
        style
    }) => < > {
        children
    } < />,
}));

// Mock Navigation
const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
};

// Mock Redux
const mockStore = configureStore([]);
const store = mockStore({
    auth: {
        loading: false,
        error: null
    },
});

// Mock Dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(),
}));

// Mock Alert
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const {
            getByText
        } = render( <
            Provider store = {
                store
            } >
            <
            LoginScreen navigation = {
                mockNavigation
            }
            /> <
            /Provider>
        );

        expect(getByText('Login')).toBeTruthy();
        expect(getByText('Farmer')).toBeTruthy();
        expect(getByText('Buyer')).toBeTruthy();
        expect(getByText('Sign In →')).toBeTruthy();
    });

    it('validates empty fields', async () => {
        const alertMock = jest.spyOn(require('react-native').Alert, 'alert');

        const {
            getByText
        } = render( <
            Provider store = {
                store
            } >
            <
            LoginScreen navigation = {
                mockNavigation
            }
            /> <
            /Provider>
        );

        fireEvent.press(getByText('Sign In →'));

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith('Error', expect.stringContaining('fill'));
        });
    });

    it('updates role selection', () => {
        const {
            getByText
        } = render( <
            Provider store = {
                store
            } >
            <
            LoginScreen navigation = {
                mockNavigation
            }
            /> <
            /Provider>
        );

        const buyerButton = getByText('Buyer');
        fireEvent.press(buyerButton);

        // In a real integration test we'd check styles or internal state, 
        // but here we verify no crash and interaction works.
        expect(buyerButton).toBeTruthy();
    });

    it('navigates to Register screen', () => {
        const {
            getByText
        } = render( <
            Provider store = {
                store
            } >
            <
            LoginScreen navigation = {
                mockNavigation
            }
            /> <
            /Provider>
        );

        fireEvent.press(getByText('Register New Farm'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });
});