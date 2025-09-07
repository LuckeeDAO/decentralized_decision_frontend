import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 部署到 /decentralized_decision_frontend/ 子路径
  base: '/decentralized_decision_frontend/',
  plugins: [
    react({
      // 启用React Fast Refresh
      fastRefresh: true,
      // 启用JSX运行时
      jsxRuntime: 'automatic',
      // 启用babel插件优化
      babel: {
        plugins: [
          // 启用React组件懒加载
          ['@babel/plugin-syntax-dynamic-import'],
          // 启用React组件优化
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // 启用HMR优化
    hmr: {
      overlay: true,
    },
    // 启用预构建优化
    force: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    // 启用源码映射（仅开发环境）
    sourcemap: process.env.NODE_ENV === 'development',
    // 启用压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console.log
        drop_console: process.env.NODE_ENV === 'production',
        // 移除debugger
        drop_debugger: process.env.NODE_ENV === 'production',
        // 启用死代码消除
        dead_code: true,
        // 启用无用代码消除
        unused: true,
      },
      mangle: {
        // 启用变量名混淆
        toplevel: true,
      },
    },
    // 启用代码分割优化
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          router: ['react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
          utils: ['lodash', 'date-fns'],
          charts: ['recharts'],
          animation: ['framer-motion'],
        },
        // 启用chunk文件名优化
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
      // 不将 react/react-dom 外部化，避免与 manualChunks 冲突
    },
    // 启用chunk大小警告
    chunkSizeWarningLimit: 1000,
    // 启用资源内联阈值
    assetsInlineLimit: 4096,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用资源压缩
    reportCompressedSize: true,
  },
  // 启用预构建优化
  optimizeDeps: {
    // 预构建依赖
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'lodash',
      'date-fns',
      'recharts',
      'framer-motion',
    ],
    // 排除预构建
    exclude: ['@vite/client', '@vite/env'],
    // 启用强制预构建
    force: true,
  },
  // 启用ESBuild优化
  esbuild: {
    // 启用JSX优化
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    // 启用代码压缩
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    minifySyntax: process.env.NODE_ENV === 'production',
    minifyWhitespace: process.env.NODE_ENV === 'production',
    // 启用Tree Shaking
    treeShaking: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 启用测试覆盖率
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
})
