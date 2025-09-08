import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, ThemeProvider, createTheme, CircularProgress } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

import { store } from './store'
import ResponsiveLayout from './components/ResponsiveLayout'
import ErrorBoundary from './components/ErrorBoundary'
import LazyWrapper from './components/LazyComponent'
import {
  LazyHomePage,
  LazyVotingPage,
  LazyVotingDetailPage,
  LazyNFTPage,
  LazyNFTDetailPage,
  LazyGovernancePage,
  LazyGovernanceProposalPage,
  LazyTokenPage,
  LazySettingsPage,
  LazyHelpPage,
} from './pages/LazyPages'

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ResponsiveLayout>
              <ErrorBoundary>
                <LazyWrapper>
                  <Routes>
                    <Route index element={<LazyHomePage />} />
                    <Route path="" element={<Navigate to="/" replace />} />
                    <Route path="/index.html" element={<Navigate to="/" replace />} />
                    <Route path="/" element={<LazyHomePage />} />
                    <Route path="/voting" element={<LazyVotingPage />} />
                    <Route path="/voting/:id" element={<LazyVotingDetailPage />} />
                    <Route path="/nft" element={<LazyNFTPage />} />
                    <Route path="/nft/:id" element={<LazyNFTDetailPage />} />
                    <Route path="/governance" element={<LazyGovernancePage />} />
                    <Route path="/governance/proposals" element={<LazyGovernanceProposalPage />} />
                    <Route path="/token" element={<LazyTokenPage />} />
                    <Route path="/settings" element={<LazySettingsPage />} />
                    <Route path="/help" element={<LazyHelpPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </LazyWrapper>
              </ErrorBoundary>
            </ResponsiveLayout>
          </Box>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
