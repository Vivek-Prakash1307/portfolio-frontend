const API_BASE = (process.env.REACT_APP_API_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://portfolio-backend-9kf0.onrender.com')).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'network_error', fields = {}, requestId } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.requestId = requestId;
  }
}

async function request(path, { signal, timeout = 12000, ...options } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);

  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal });
    let data;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok) {
      throw new ApiError(data?.error || 'The service could not accept this request. Please try again.', {
        status: response.status,
        code: data?.code || 'request_failed',
        fields: data?.fields && typeof data.fields === 'object' ? data.fields : {},
        requestId: data?.requestId,
      });
    }
    if (!data) throw new ApiError('The service returned an unreadable response.', { code: 'invalid_response' });
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(timedOut
      ? 'The request took too long. Your message may already be queued; retrying the same message is safe.'
      : 'The service could not be reached. Please check your connection or email me directly.',
    { code: timedOut ? 'timeout' : 'network_error' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export function fetchPortfolio(signal) {
  return request('/api/v1/portfolio', { signal, timeout: 6000 });
}

export async function submitContact(payload, idempotencyKey, signal) {
  const data = await request('/api/v1/contact', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
  if (data.status !== 'queued' || typeof data.id !== 'string') {
    throw new ApiError('The service did not confirm receipt. Please retry or email me directly.', { code: 'invalid_response' });
  }
  return data;
}
