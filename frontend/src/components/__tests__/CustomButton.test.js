import React from 'react';
import renderer from 'react-test-renderer';
import CustomButton from '../CustomButton';

describe('CustomButton', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<CustomButton title="Test Button" onPress={() => { }} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
