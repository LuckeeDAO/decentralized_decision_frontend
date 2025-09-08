import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // TODO: 可接入错误上报
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>出了点问题</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || '页面发生未知错误，请重试。'}
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>重新加载</Button>
        </Box>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;


