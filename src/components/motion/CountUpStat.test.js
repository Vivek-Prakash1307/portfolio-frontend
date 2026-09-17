import { act, render, screen } from '@testing-library/react';
import CountUpStat from './CountUpStat';

const originalMatchMedia = window.matchMedia;
let intersect;
let preference;
let preferenceChange;
let frames;
let nextFrame;
let disconnect;

beforeEach(() => {
  frames = new Map();
  nextFrame = 0;
  disconnect = jest.fn();
  preference = { matches: false, addEventListener: jest.fn((_, cb) => { preferenceChange = cb; }), removeEventListener: jest.fn() };
  window.matchMedia = jest.fn(() => preference);
  jest.spyOn(window, 'IntersectionObserver').mockImplementation((callback) => {
    intersect = callback;
    return { observe: jest.fn(), disconnect };
  });
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
});
afterEach(() => { jest.restoreAllMocks(); window.matchMedia = originalMatchMedia; });
function tick(time) {
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(time));
  });
}

test.each(['5000+', '2026'])('counts %s only after entering view and ends at the exact value', value => {
  const { container } = render(<CountUpStat value={value} />);
  const number = container.querySelector('.stat-count');
  expect(screen.getByText(value)).toHaveClass('stat-readable');
  expect(frames.size).toBe(0);
  act(() => intersect([{ isIntersecting: false }]));
  expect(frames.size).toBe(0);
  act(() => intersect([{ isIntersecting: true }]));
  tick(0);
  tick(1100);
  expect(parseInt(number.textContent, 10)).toBeGreaterThan(1);
  expect(parseInt(number.textContent, 10)).toBeLessThan(parseInt(value, 10));
  tick(2200);
  expect(number).toHaveTextContent(value);
  expect(frames.size).toBe(0);
  act(() => intersect([{ isIntersecting: true }]));
  expect(frames.size).toBe(0);
});

test('waits for the intro to finish and cleans up an active counter', () => {
  const { rerender, unmount } = render(<CountUpStat value="5000+" enabled={false} />);
  expect(window.IntersectionObserver).not.toHaveBeenCalled();
  rerender(<CountUpStat value="5000+" enabled />);
  act(() => intersect([{ isIntersecting: true }]));
  expect(frames.size).toBe(1);
  unmount();
  expect(frames.size).toBe(0);
  expect(disconnect).toHaveBeenCalled();
});

test('shows the final value immediately for reduced motion and preference changes', () => {
  preference.matches = true;
  const { container, unmount } = render(<CountUpStat value="2026" />);
  expect(container.querySelector('.stat-count')).toHaveTextContent('2026');
  expect(window.IntersectionObserver).not.toHaveBeenCalled();
  unmount();
  preference.matches = false;
  const next = render(<CountUpStat value="5000+" />);
  act(() => intersect([{ isIntersecting: true }]));
  act(() => { preference.matches = true; preferenceChange(); });
  expect(next.container.querySelector('.stat-count')).toHaveTextContent('5000+');
  expect(frames.size).toBe(0);
});
