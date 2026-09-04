import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the portfolio hero and featured work', () => {
  render(<App />);
  expect(screen.getAllByText(/Vivek Prakash/i)[0]).toBeInTheDocument();
  expect(screen.getByText(/Backend-Focused Full Stack Developer/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Automated Financial Data Extraction and Analysis System/i)
  ).toBeInTheDocument();
});
