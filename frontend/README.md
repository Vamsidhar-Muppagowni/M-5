# Frontend Testing Guide

This project uses Jest and React Native Testing Library (RNTL) for testing the React Native application.

## Prerequisites

Ensure you have installed the necessary dependencies:

```bash
npm install
```

This will install `jest`, `jest-expo`, `@testing-library/react-native`, and `react-test-renderer`.

## Running Tests

To run all tests in the project, execute the following command in the `frontend` directory:

```bash
npm test
```

This command runs Jest, which will find all files ending in `.test.js` or `.spec.js` and execute them.

### Running Specific Tests

To run a specific test file, pass the filename to the command:

```bash
npm test CustomButton
```

### Watching for Changes

To run tests in watch mode (automatically re-run when files change):

```bash
npm test -- --watch
```

## Structure

- **`__tests__`**: Directory containing test files.
- **`jest.config.js`**: Jest configuration file.

## Example Test

A sample test file for `CustomButton` has been created in `__tests__/CustomButton.test.js`.

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../src/components/CustomButton';

test('renders correctly', () => {
  const { getByText } = render(<CustomButton title="Hello" />);
  expect(getByText('Hello')).toBeTruthy();
});
```
