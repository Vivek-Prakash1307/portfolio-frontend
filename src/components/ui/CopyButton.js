import { useState } from 'react';
import Icon from './Icon';

export default function CopyButton({ value, label, className = 'secondary-button' }) {
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState(false);
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setStatus('Copied to clipboard.');
      setFallback(false);
    } catch {
      setFallback(true);
      setStatus('Select the text below to copy it.');
    }
  }
  return <div className="copy-control">
    <button type="button" className={className} onClick={copy}><Icon name="copy" />{label}</button>
    <span className="copy-status" role="status">{status}</span>
    {fallback && <input className="copy-fallback" aria-label={`${label} manually`} readOnly value={value} onFocus={(event) => event.target.select()} autoFocus />}
  </div>;
}
