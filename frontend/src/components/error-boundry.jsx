import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {error: ""};
    }

    componentDidCatch(error, errorInfo) {
      this.setState({error: `${error.name}: ${error.message}\n${errorInfo.componentStack}`});
    }

    render() {
      const {error} = this.state;
      if (error) {
        return (
          <div>{error}</div>
        );
      } else {
        return <>{this.props.children}</>;
      }
    }
  }
  export default ErrorBoundary