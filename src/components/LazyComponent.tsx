import React, { Suspense, ComponentType } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      加载中...
    </Typography>
  </Box>
);

const DefaultErrorFallback = ({ error }: { error?: Error }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      gap: 2,
      p: 3,
    }}
  >
    <Typography variant="h6" color="error">
      加载失败
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {error?.message || '组件加载时发生错误'}
    </Typography>
  </Box>
);

export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(() => 
    Promise.resolve({ default: Component })
  );

  return (props: P & LazyComponentProps) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <Suspense fallback={fallback || <DefaultFallback />}>
    {children}
  </Suspense>
);

export default LazyWrapper;
