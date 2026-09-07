import { fireEvent, render, screen, within } from '@testing-library/react';
import ProjectExplorer from './ProjectExplorer';
import snapshot from '../../data/portfolio.generated.json';

beforeEach(() => window.history.replaceState({}, '', '/'));
afterEach(() => window.history.replaceState({}, '', '/'));

test('combines project search and technology filters with a useful empty state', () => {
  render(<ProjectExplorer projects={snapshot.projects} />);
  expect(screen.getByRole('status')).toHaveTextContent('Showing 9 of 9');
  fireEvent.change(screen.getByLabelText('Search projects'), { target: { value: 'load balancer' } });
  expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 9');
  expect(screen.getByRole('heading', { name: 'HTTP Load Balancer' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Technology'), { target: { value: 'React' } });
  expect(screen.getByText('No projects match those filters.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show all projects' }));
  expect(screen.getByRole('status')).toHaveTextContent('Showing 9 of 9');
});

test('project details support deep links, Escape, and focus restoration', () => {
  render(<ProjectExplorer projects={snapshot.projects} />);
  const trigger = screen.getByRole('button', { name: 'Explore HTTP Load Balancer' });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'HTTP Load Balancer' });
  expect(within(dialog).getByText('Round-robin backend selection')).toBeInTheDocument();
  expect(window.location.search).toContain('project=http-load-balancer');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(window.location.search).not.toContain('project=');
});

test('a shared URL opens the intended project on first render', () => {
  window.history.replaceState({}, '', '/?project=chunked-file-uploader#work');
  render(<ProjectExplorer projects={snapshot.projects} />);
  expect(screen.getByRole('dialog', { name: 'Chunked File Uploader' })).toBeInTheDocument();
});
