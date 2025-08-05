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
            return <ServerError error={this.state.error} />;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
