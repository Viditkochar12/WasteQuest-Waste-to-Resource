import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            padding: "2rem",
            margin: "1.5rem auto",
            maxWidth: "600px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "12px",
            color: "#fecaca",
            textAlign: "center"
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#f87171" }}>
            {this.props.title || "Something went wrong in this section"}
          </h3>
          <p style={{ fontSize: "0.875rem", marginBottom: "1rem", color: "#fca5a5" }}>
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={this.handleReset}
            style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
          >
            Try reloading section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
