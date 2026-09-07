import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactSection from './ContactSection';
import { submitContact } from '../../services/api';
import snapshot from '../../data/portfolio.generated.json';

jest.mock('../../services/api', () => ({ submitContact: jest.fn() }));
beforeEach(() => submitContact.mockReset());
afterEach(() => jest.useRealTimers());
function fill() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Hiring Manager  ' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'HIRING@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'We would like to discuss a backend role.' } });
}

test('validates fields before making a request and focuses the first error', () => {
  render(<ContactSection profile={snapshot.profile} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(submitContact).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Name')).toHaveFocus();
  expect(screen.getByText('Write a message between 10 and 3000 characters.')).toBeInTheDocument();
});

test('normalizes input, prevents duplicate submissions, and acknowledges queue acceptance', async () => {
  let finish;
  submitContact.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  render(<ContactSection profile={snapshot.profile} />); fill();
  fireEvent.submit(screen.getByRole('form', { name: 'Contact Vivek' }));
  fireEvent.submit(screen.getByRole('form', { name: 'Contact Vivek' }));
  expect(submitContact).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  expect(submitContact.mock.calls[0][0]).toEqual({ name: 'Hiring Manager', email: 'hiring@example.com', message: 'We would like to discuss a backend role.', website: '' });
  finish({ id: 'receipt', status: 'queued', message: 'Accepted and queued for delivery.' });
  await waitFor(() => expect(screen.getByText('Accepted and queued for delivery.')).toBeInTheDocument());
  expect(screen.getByLabelText('Message')).toHaveValue('');
});

test('hides the success acknowledgement after a short delay', async () => {
  jest.useFakeTimers();
  submitContact.mockResolvedValue({ id: 'receipt', status: 'queued', message: 'Accepted and queued for delivery.' });
  render(<ContactSection profile={snapshot.profile} />); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByText('Accepted and queued for delivery.')).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(7000); });
  await waitFor(() => expect(screen.queryByText('Accepted and queued for delivery.')).not.toBeInTheDocument());
  jest.useRealTimers();
});

test('preserves the message and retry key after a network error', async () => {
  submitContact.mockRejectedValueOnce(new Error('The service could not be reached.')).mockResolvedValueOnce({ id: 'receipt', status: 'queued', message: 'Message queued.' });
  render(<ContactSection profile={snapshot.profile} />); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Message')).toHaveValue('We would like to discuss a backend role.');
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  await screen.findByText('Message queued.');
  expect(submitContact.mock.calls[0][1]).toBe(submitContact.mock.calls[1][1]);
});

test('shows backend field feedback and a direct email path', async () => {
  submitContact.mockRejectedValue({ message: 'Please correct your email.', fields: { email: 'That email is not valid.' } });
  render(<ContactSection profile={snapshot.profile} />); fill();
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Please correct your email.');
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('link', { name: /Email alivevivek8@gmail.com directly/ })).toHaveAttribute('href', 'mailto:alivevivek8@gmail.com');
});
