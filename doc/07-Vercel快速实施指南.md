# Vercel 快速实施指南

## 概述

这是 Luckee DAO 前端项目迁移到 Vercel 的快速实施指南，包含核心步骤和命令。

## 前置条件

```bash
# 1. 检查环境
node --version  # 需要 18.0.0+
npm --version   # 需要 8.0.0+

# 2. 安装 Vercel CLI
npm install -g vercel

# 3. 检查项目状态
git status
git log --oneline -3
```

## 快速实施步骤

### 步骤 1: 项目初始化 (5分钟)

```bash
# 1. 进入项目目录
cd /home/lc/luckee_dao/decentralized_decision_frontend

# 2. 创建迁移分支
git checkout -b migration/vercel-deployment

# 3. 登录 Vercel
vercel login

# 4. 初始化项目
vercel
# 按照提示选择：
# - Set up and deploy? [Y/n] Y
# - Which scope? [选择个人账户或团队]
# - Link to existing project? [N] N
# - What's your project's name? luckee-dao-frontend
# - In which directory is your code located? ./
# - Want to override the settings? [y/N] N
```

### 步骤 2: 基础配置 (10分钟)

#### 2.1 创建 Vercel 配置
```bash
# 创建 vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "luckee-dao-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF
```

#### 2.2 更新 Vite 配置
```bash
# 备份原配置
cp vite.config.ts vite.config.ts.backup

# 更新配置（移除 GitHub Pages base 配置）
sed -i 's|base: '\''/decentralized_decision_frontend/'\'',||g' vite.config.ts
```

#### 2.3 更新路由配置
```bash
# 备份原配置
cp src/main.tsx src/main.tsx.backup

# 更新为 BrowserRouter
sed -i 's/HashRouter/BrowserRouter/g' src/main.tsx
```

### 步骤 3: 环境变量配置 (5分钟)

```bash
# 1. 创建环境变量文件
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api/v2
VITE_APP_NAME=Luckee DAO
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
EOF

cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://api.luckeedao.com/api/v2
VITE_APP_NAME=Luckee DAO
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
EOF

# 2. 在 Vercel 中设置环境变量
vercel env add VITE_API_BASE_URL production
vercel env add VITE_APP_NAME production
vercel env add VITE_APP_VERSION production
vercel env add VITE_APP_ENV production

# 3. 设置预览环境变量
vercel env add VITE_API_BASE_URL preview
vercel env add VITE_APP_NAME preview
vercel env add VITE_APP_VERSION preview
vercel env add VITE_APP_ENV preview
```

### 步骤 4: 部署和测试 (10分钟)

```bash
# 1. 本地构建测试
npm run build

# 2. 部署到预览环境
vercel

# 3. 部署到生产环境
vercel --prod

# 4. 检查部署状态
vercel ls

# 5. 获取部署 URL
vercel domains ls
```

### 步骤 5: 验证部署 (5分钟)

```bash
# 1. 创建测试脚本
cat > test-deployment.sh << 'EOF'
#!/bin/bash
echo "Testing Vercel deployment..."

# 获取部署 URL
URL=$(vercel ls --json | jq -r '.[0].url' | head -1)
if [ -z "$URL" ]; then
    echo "No deployment found"
    exit 1
fi

echo "Testing URL: https://$URL"

# 测试主页
curl -f "https://$URL" || exit 1
echo "✓ Homepage works"

# 测试路由
curl -f "https://$URL/voting" || exit 1
echo "✓ Voting page works"

curl -f "https://$URL/nft" || exit 1
echo "✓ NFT page works"

curl -f "https://$URL/governance" || exit 1
echo "✓ Governance page works"

curl -f "https://$URL/settings" || exit 1
echo "✓ Settings page works"

echo "All tests passed! 🎉"
EOF

chmod +x test-deployment.sh

# 2. 运行测试
./test-deployment.sh
```

## 快速验证清单

### 功能验证
- [ ] 主页正常加载
- [ ] 所有路由正常工作
- [ ] 环境变量正确加载
- [ ] 图片和资源正常加载
- [ ] 响应式设计正常

### 性能验证
- [ ] 页面加载速度 < 3秒
- [ ] 移动端性能良好
- [ ] 缓存策略生效

### 安全验证
- [ ] HTTPS 正常工作
- [ ] 安全头正确设置

## 常见问题解决

### 1. 部署失败
```bash
# 查看构建日志
vercel logs [deployment-url]

# 本地构建测试
npm run build
```

### 2. 路由不工作
```bash
# 检查 vercel.json 配置
cat vercel.json

# 重新部署
vercel --prod
```

### 3. 环境变量问题
```bash
# 检查环境变量
vercel env ls

# 重新设置
vercel env add VARIABLE_NAME production
```

## 后续步骤

### 1. 提交代码
```bash
# 提交所有更改
git add .
git commit -m "feat: migrate to Vercel deployment"
git push origin migration/vercel-deployment

# 创建 Pull Request
# 在 GitHub 上创建 PR 并合并
```

### 2. 配置自定义域名（可选）
```bash
# 添加自定义域名
vercel domains add your-domain.com

# 配置 DNS 记录
# 按照 Vercel 提供的 DNS 配置
```

### 3. 设置监控
```bash
# 安装分析工具
npm install @vercel/analytics

# 在 main.tsx 中添加 Analytics 组件
```

## 回滚方案

如果需要回滚到 GitHub Pages：

```bash
# 1. 恢复原配置
cp vite.config.ts.backup vite.config.ts
cp src/main.tsx.backup src/main.tsx

# 2. 重新部署到 GitHub Pages
npm run deploy:pages

# 3. 删除 Vercel 项目（可选）
vercel remove
```

## 总结

通过以上步骤，可以在 30 分钟内完成从 GitHub Pages 到 Vercel 的基础迁移。主要变化包括：

1. **路由方式**: HashRouter → BrowserRouter
2. **部署平台**: GitHub Pages → Vercel
3. **配置方式**: 环境变量管理
4. **性能提升**: 边缘计算和 CDN

迁移完成后，项目将获得更好的性能、更强的功能和更优的开发体验。

---

*快速指南版本: 1.0.0*  
*创建日期: 2024年12月*  
*预计完成时间: 30分钟*
