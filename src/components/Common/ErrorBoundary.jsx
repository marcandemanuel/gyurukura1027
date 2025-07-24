import React from "react";
import ServerError from "../../pages/ServerError/ServerError";
import { triggerCollapseEffect } from "../../utils/collapseEffect";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showErrorPage: false };
    this.collapseTimeout = null;
    this.collapseTriggered = false;
  }

  static getDerivedStateFromError(error) {
    // Set hasError and error, but not showErrorPage yet
    return { hasError: true, error };
  }

  componentWillUnmount() {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.showErrorPage) {
        return <ServerError error={this.state.error} />;
      }
      // Only trigger collapse effect and timer once
      if (!this.collapseTriggered) {
        this.collapseTriggered = true;
        const duration = triggerCollapseEffect();
        this.collapseTimeout = setTimeout(() => {
          this.setState({ showErrorPage: true });
        }, duration > 3000 ? duration : 4000); // fallback to 4s if duration is too short
      }
      // Optionally, render nothing or a transparent overlay during collapse
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;