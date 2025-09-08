import React from 'react';
import { Box, Typography, Link, Stack } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ mt: 4, py: 3, color: 'text.secondary' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Typography variant="body2">© {new Date().getFullYear()} Luckee DAO</Typography>
        <Stack direction="row" spacing={2}>
          <Link href="https://github.com/LuckeeDAO" target="_blank" rel="noreferrer">GitHub</Link>
          <Link href="/docs" underline="hover">文档</Link>
          <Link href="/help" underline="hover">帮助</Link>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;


