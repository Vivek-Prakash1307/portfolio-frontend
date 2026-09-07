import { useEffect, useRef, useState } from 'react';
import SectionHeading from '../../components/ui/SectionHeading';
import Icon from '../../components/ui/Icon';
import CopyButton from '../../components/ui/CopyButton';
import { submitContact } from '../../services/api';
import { emptyForm, normalizeContact, validateContact } from './validation';
import './contact.css';

function newKey() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  if (window.crypto?.getRandomValues) return [...window.crypto.getRandomValues(new Uint8Array(16))].map((n) => n.toString(16).padStart(2, '0')).join('');
  return `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ContactSection({ profile }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const requestRef = useRef(null);
  const attempt = useRef(null);
  const formRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (status?.kind !== 'success') return undefined;
    const timer = window.setTimeout(() => setStatus(null), 7000);
    return () => window.clearTimeout(timer);
  }, [status]);

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus(null);
  }
  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    const payload = normalizeContact(form);
    const invalid = validateContact(payload);
    setErrors(invalid); setStatus(null);
    if (Object.keys(invalid).length) {
      formRef.current.elements[Object.keys(invalid)[0]]?.focus();
      return;
    }
    // Keep the same key across ambiguous timeouts until the submitted content changes.
    const fingerprint = JSON.stringify(payload);
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: newKey() };
    busy.current = true; setSubmitting(true);
    const controller = new AbortController(); requestRef.current = controller;
    try {
      const result = await submitContact(payload, attempt.current.key, controller.signal);
      if (controller.signal.aborted) return;
      setStatus({ kind: 'success', message: result.message || 'Message accepted and queued for delivery.' });
      setForm(emptyForm); attempt.current = null;
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrors(error.fields || {});
      setStatus({ kind: 'error', message: error.message || 'The message could not be sent. Please email me directly.' });
    } finally {
      busy.current = false;
      if (!controller.signal.aborted) setSubmitting(false);
    }
  }
  return <section id="contact" className="section contact-section">
    <div className="contact-layout">
      <div>
        <SectionHeading eyebrow="Contact" title="Let us build something useful.">
          <p>Open to backend and full-stack engineering roles, internships, and project collaborations.</p>
        </SectionHeading>
        <div className="contact-links">
          <a className="contact-card email-card" href={`mailto:${profile.email}`}><Icon name="mail" /><span><small>Email</small><strong>{profile.email}</strong></span></a>
          <a className="contact-card" href={profile.links.github} target="_blank" rel="noopener noreferrer"><Icon name="code" /><span><small>GitHub</small><strong>View my code</strong></span></a>
          <a className="contact-card" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><Icon name="external" /><span><small>LinkedIn</small><strong>Connect</strong></span></a>
        </div>
        <div className="contact-tools"><CopyButton value={profile.email} label="Copy email address" />
          <a className="secondary-button" href="/resume.pdf" download="Vivek_Prakash_Resume.pdf"><Icon name="download" />Download resume</a></div>
      </div>
      <form ref={formRef} className="contact-form" onSubmit={submit} noValidate aria-label="Contact Vivek" aria-busy={submitting}>
        <p className="form-intro">Have a role or a project in mind? Tell me a little about it.</p>
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" autoComplete="name" value={form.name} onChange={change} placeholder="Your name" required maxLength={80}
          aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} disabled={submitting} />
        {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@company.com" required maxLength={160}
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} disabled={submitting} />
        {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" value={form.message} onChange={change} placeholder="Tell me about the role, team, or project..." rows={5} required maxLength={3000}
          aria-invalid={Boolean(errors.message)} aria-describedby={`message-help${errors.message ? ' message-error' : ''}`} disabled={submitting} />
        <p className="field-help" id="message-help">10-3,000 characters <span>{[...form.message].length}/3,000</span></p>
        {errors.message && <p className="field-error" id="message-error">{errors.message}</p>}
        <div className="honeypot" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label>
          <input id="contact-website" name="website" value={form.website} onChange={change} tabIndex={-1} autoComplete="off" /></div>
        <p className="privacy-note">Your name, email, and message are used only to respond to your enquiry.</p>
        <button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Sending...' : 'Send message'}<Icon name="arrow" /></button>
        {status && <div className={`form-status status-${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>
          <p>{status.message}</p>{status.kind === 'error' && <a href={`mailto:${profile.email}`}>Email {profile.email} directly</a>}
        </div>}
      </form>
    </div>
  </section>;
}
