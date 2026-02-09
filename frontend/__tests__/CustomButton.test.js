import React from 'react';
import {
    render,
    fireEvent
} from '@testing-library/react-native';
// Adjust import path if necessary based on where this file is relative to CustomButton.js
// Assuming this file is in frontend/__tests__/CustomButton.test.js and component is in frontend/src/components/CustomButton.js
// Path should be ../src/components/CustomButton
import CustomButton from '../src/components/CustomButton';

// Mock theme dependency if needed, but it's a simple JS object so likely fine.
// If theme import fails, we might need moduleNameMapper in jest.config.js

describe('CustomButton', () => {
            it('renders correctly with title', () => {
                        const {
                            getByText
                        } = render( < CustomButton title = "Click Me"
                            onPress = {
                                () => {}
                            }
                            />);
                            expect(getByText('Click Me')).toBeTruthy();
                        });

                    it('handles press events', () => {
                            const onPressMock = jest.fn();
                            const {
                                getByText
                            } = render( < CustomButton title = "Press Me"
                                onPress = {
                                    onPressMock
                                }
                                />);

                                fireEvent.press(getByText('Press Me')); expect(onPressMock).toHaveBeenCalledTimes(1);
                            });

                        it('shows loading indicator instead of text when loading is true', () => {
                            const {
                                queryByText,
                                UNSAFE_getAllByType
                            } = render( <
                                CustomButton title = "Loading"
                                loading = {
                                    true
                                }
                                onPress = {
                                    () => {}
                                }
                                />
                            );

                            // Text should not be visible
                            expect(queryByText('Loading')).toBeNull();
                        });

                        it('is disabled when disabled prop is true', () => {
                                const onPressMock = jest.fn();
                                const {
                                    getByText
                                } = render( < CustomButton title = "Disabled"
                                    disabled = {
                                        true
                                    }
                                    onPress = {
                                        onPressMock
                                    }
                                    />);

                                    const buttonText = getByText('Disabled'); fireEvent.press(buttonText); expect(onPressMock).not.toHaveBeenCalled();
                                });
                        });