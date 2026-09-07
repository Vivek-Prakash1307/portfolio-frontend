import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="error-page">
      <p className="eyebrow">Vivek Prakash</p><h1>Let’s stay in touch.</h1>
      <p>This page could not finish loading. You can still download my resume or email me.</p>
      <div className="hero-actions"><a className="primary-button" href="/resume.pdf" download>Download resume</a>
        <a className="secondary-button" href="mailto:alivevivek8@gmail.com">Email Vivek</a>
        <button className="secondary-button" type="button" onClick={() => window.location.reload()}>Reload page</button></div>
    </main>;
    return this.props.children;
  }
}
