import React, { forwardRef } from 'react';
import { 
  TextField, 
  TextFieldProps, 
  InputAdornment, 
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputProps as MuiInputProps,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'outlined',
  size = 'medium',
  error = false,
  helperText,
  startAdornment,
  endAdornment,
  showPasswordToggle = false,
  fullWidth = false,
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getEndAdornment = () => {
    if (showPasswordToggle && type === 'password') {
      return (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleTogglePassword}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    }
    return endAdornment;
  };

  return (
    <TextField
      ref={ref}
      variant={variant}
      size={size}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      type={getInputType()}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: getEndAdornment(),
        ...props.InputProps,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
          },
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
        },
        ...props.sx,
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
