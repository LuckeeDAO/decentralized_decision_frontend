import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}) => {
  const getVariant = () => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained';
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      case 'danger':
        return 'contained';
      default:
        return 'contained';
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  return (
    <MuiButton
      variant={getVariant()}
      color={getColor()}
      size={getSize()}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: 2,
        ...(variant === 'danger' && {
          backgroundColor: 'error.main',
          '&:hover': {
            backgroundColor: 'error.dark',
          },
        }),
        ...(variant === 'outline' && {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        }),
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button;
