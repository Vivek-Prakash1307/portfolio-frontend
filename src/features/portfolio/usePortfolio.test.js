import { renderHook, waitFor } from '@testing-library/react';
import usePortfolio, { isPortfolioData } from './usePortfolio';
import { fetchPortfolio } from '../../services/api';
import snapshot from '../../data/portfolio.generated.json';
jest.mock('../../services/api', () => ({ fetchPortfolio: jest.fn() }));
beforeEach(() => fetchPortfolio.mockReset());

test('keeps bundled content when the API is unavailable or sends partial data', async () => {
  fetchPortfolio.mockRejectedValue(new Error('Offline'));
  const first = renderHook(() => usePortfolio());
  await waitFor(() => expect(fetchPortfolio).toHaveBeenCalled());
  expect(first.result.current).toEqual(snapshot); first.unmount();
  expect(isPortfolioData({ profile: { name: 'Partial' } })).toBe(false);
  fetchPortfolio.mockResolvedValue({ projects: [] });
  const second = renderHook(() => usePortfolio());
  await waitFor(() => expect(fetchPortfolio).toHaveBeenCalledTimes(2));
  expect(second.result.current).toEqual(snapshot);
});

test('refreshes the snapshot only with a complete portfolio response', async () => {
  const updated = { ...snapshot, profile: { ...snapshot.profile, name: 'Updated profile' } };
  fetchPortfolio.mockResolvedValue(updated);
  const { result } = renderHook(() => usePortfolio());
  await waitFor(() => expect(result.current.profile.name).toBe('Updated profile'));
});
