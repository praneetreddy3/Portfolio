import { Component } from "react";

/**
 * Keeps one failing subtree from taking down the whole page.
 *
 * The chatbot is the riskiest thing on this site: it talks to a network, it
 * parses a provider's response, and it renders whatever comes back. Without
 * a boundary, a single unexpected shape in that data unmounts the entire
 * React tree and the visitor gets a blank white page instead of a portfolio.
 * Losing the widget is survivable; losing the page is not.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Visible in the browser console for debugging; never shown to visitors.
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
