import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface LoadingSpinnerProps {
  open?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ open }) => {
  const globalLoading = useSelector((state: RootState) => state.ui.loading.global);
  const isOpen = typeof open === 'boolean' ? open : globalLoading;

  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }} open={isOpen}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingSpinner;


