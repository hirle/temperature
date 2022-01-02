import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders App', () => {
  const { getByText } = render(<App />);
  const headerElement = getByText(/Temperature/i);
  expect(headerElement).toBeInTheDocument();
});
