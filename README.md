# Luckee DAO Frontend

基于比特承诺模型的去中心化投票系统前端应用。

## 🚀 在线演示

- **Vercel部署**: https://luckee.cdao.online/
- **GitHub Pages**: https://luckeedao.github.io/decentralized_decision_frontend/
- **主仓库**: https://github.com/LuckeeDAO/decentralized_decision

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 4.x
- **UI库**: Material-UI (MUI) 5.x
- **状态管理**: Redux Toolkit + React Query
- **路由**: React Router DOM 6.x
- **样式**: Emotion + CSS-in-JS
- **动画**: Framer Motion
- **图表**: Recharts
- **表单**: React Hook Form
- **通知**: React Hot Toast

## 📋 功能特性

- 🗳️ **去中心化投票**: 基于比特承诺协议的隐私投票
- 🎨 **NFT类型驱动**: 支持多种应用场景
- 🔐 **钱包集成**: 支持Keplr和MetaMask
- 📊 **实时数据**: 投票结果和统计图表
- 🎯 **响应式设计**: 适配各种设备
- 🌙 **主题切换**: 支持明暗主题
- 🚀 **性能优化**: 代码分割和懒加载

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 🚀 部署

### GitHub Pages

```bash
npm run deploy
```

### Vercel部署

项目已部署到Vercel，享受更好的性能和全球CDN：

```bash
# 部署到Vercel
vercel --prod
```

**生产环境**: https://luckee.cdao.online/

### 其他平台

- [Netlify](https://netlify.com) - 支持表单处理
- [Firebase Hosting](https://firebase.google.com/products/hosting)

## 🔧 开发规范

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier代码规范
- 使用语义化提交信息
- 编写单元测试和集成测试

### 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Layout/         # 布局组件
│   ├── LazyImage.tsx   # 懒加载图片
│   └── VirtualizedList.tsx # 虚拟化列表
├── pages/              # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── VotingPage.tsx  # 投票页面
│   ├── NFTPage.tsx     # NFT页面
│   └── ...
├── hooks/              # 自定义Hooks
│   ├── useVoting.ts    # 投票相关
│   └── useWallet.ts    # 钱包相关
├── services/           # API服务
├── store/              # 状态管理
│   ├── api/           # RTK Query API
│   └── slices/        # Redux切片
├── utils/              # 工具函数
├── types/              # TypeScript类型
└── styles/             # 样式文件
```

## 🧪 测试

```bash
# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI
npm run test:ui
```

## 📊 性能监控

```bash
# 性能审计
npm run perf:audit

# 性能测试
npm run test:performance
```

## 🔗 相关项目

### 后端仓库
- **主仓库**: https://github.com/LuckeeDAO/decentralized_decision
- **技术栈**: Rust + WebAssembly + CosmWasm
- **API文档**: [后端README](https://github.com/LuckeeDAO/decentralized_decision#api文档)

### 智能合约
- **合约地址**: 待部署
- **网络**: Injective Protocol
- **标准**: CW20/CW721

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 提交规范

使用语义化提交信息：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

- **问题反馈**: [GitHub Issues](https://github.com/LuckeeDAO/decentralized_decision_frontend/issues)
- **技术讨论**: [GitHub Discussions](https://github.com/LuckeeDAO/decentralized_decision/discussions)
- **项目主页**: https://github.com/LuckeeDAO/decentralized_decision

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**Luckee DAO** - 构建去中心化的未来 🚀
