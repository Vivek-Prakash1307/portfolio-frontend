import { render, screen } from '@testing-library/react';
import LaserTitle from './LaserTitle';

test('renders an accessible title and sequences every visible letter', () => {
  const { container } = render(<LaserTitle text="Vivek Prakash" />);
  const heading = screen.getByRole('heading', { name: 'Vivek Prakash' });
  const letters = [...container.querySelectorAll('.laser-letter')];

  expect(heading).toHaveClass('is-animating');
  expect(container.querySelectorAll('.laser-word')).toHaveLength(2);
  expect(letters).toHaveLength(12);
  expect(letters.map((letter) => letter.textContent).join('')).toBe('VivekPrakash');
  expect(letters[0]).toHaveStyle('--letter-index: 0');
  expect(letters[11]).toHaveStyle('--letter-index: 11');
  expect(letters[0]).toHaveStyle('--letter-delay: 220ms');
  expect(letters[11]).toHaveStyle('--letter-delay: 1375ms');
});

test('waits until the intro finishes before starting the title animation', () => {
  const { rerender } = render(<LaserTitle text="Vivek Prakash" enabled={false} />);
  expect(screen.getByRole('heading', { name: 'Vivek Prakash' })).not.toHaveClass('is-animating');

  rerender(<LaserTitle text="Vivek Prakash" enabled />);
  expect(screen.getByRole('heading', { name: 'Vivek Prakash' })).toHaveClass('is-animating');
});
