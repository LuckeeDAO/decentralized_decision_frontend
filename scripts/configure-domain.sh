#!/bin/bash

echo "🌐 Luckee DAO 前端 - 自定义域名配置脚本"
echo "================================================"

# 检查是否已安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，请先安装："
    echo "npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 已安装"

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "❌ 请先登录 Vercel："
    echo "vercel login"
    exit 1
fi

echo "✅ 已登录 Vercel"

# 配置自定义域名
echo ""
echo "🔧 配置自定义域名..."

# 添加自定义域名
echo "添加域名: luckee.cdao.online"
vercel domains add luckee.cdao.online

# 检查域名状态
echo ""
echo "📊 域名配置状态："
vercel domains inspect luckee.cdao.online

echo ""
echo "🎉 域名配置完成！"
echo "📝 请确保在您的DNS提供商处配置以下记录："
echo ""
echo "Type: A"
echo "Name: @"
echo "Value: 76.76.19.61"
echo ""
echo "Type: CNAME"
echo "Name: www"
echo "Value: cname.vercel-dns.com"
echo ""
echo "🌐 生产环境: https://luckee.cdao.online/"
echo "🌐 Vercel默认域名: https://luckee-dao-frontend.vercel.app/"
echo ""
echo "⏰ DNS配置生效可能需要几分钟到几小时"
