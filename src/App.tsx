import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

import { store } from './store'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import VotingPage from './pages/VotingPage'
import NFTPage from './pages/NFTPage'
import GovernancePage from './pages/GovernancePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

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
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/voting" element={<VotingPage />} />
                <Route path="/nft" element={<NFTPage />} />
                <Route path="/governance" element={<GovernancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </Box>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
