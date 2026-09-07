import { render, screen } from '@testing-library/react';
import App from './App';
import { fetchPortfolio } from './services/api';
jest.mock('./services/api', () => ({ fetchPortfolio: jest.fn(), submitContact: jest.fn() }));
test('renders the profile, all work, internship, and downloadable resume without an API', () => {
  fetchPortfolio.mockRejectedValue(new Error('Offline'));
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Vivek Prakash' })).toBeInTheDocument();
  expect(screen.getAllByText('Go Backend Developer').length).toBeGreaterThanOrEqual(2);
  expect(screen.getByRole('heading', { name: 'Automated Financial Data Extraction and Analysis System' })).toBeInTheDocument();
  expect(screen.getByText('LIMDX PRIVATE LIMITED - Remote')).toBeInTheDocument();
  expect(screen.getByText('Evtaar')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Bulk Employee Onboarding System' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Download resume/ })[0]).toHaveAttribute('href', '/resume.pdf');
});
