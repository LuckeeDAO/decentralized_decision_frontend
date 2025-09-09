#!/bin/bash

echo "🔍 检查Vercel分支配置"
echo "========================"

# 检查当前分支
echo "📋 当前分支信息："
echo "当前分支: $(git branch --show-current)"
echo "所有本地分支:"
git branch
echo ""

# 检查远程分支
echo "🌐 远程分支信息："
git branch -r
echo ""

# 检查Vercel项目信息
echo "⚙️ Vercel项目信息："
if command -v vercel &> /dev/null; then
    echo "Vercel CLI已安装"
    vercel project ls 2>/dev/null || echo "无法获取项目列表"
else
    echo "Vercel CLI未安装"
fi
echo ""

# 检查Git状态
echo "📊 Git状态："
git status --porcelain
echo ""

echo "💡 建议："
echo "1. 访问 https://vercel.com 查看项目设置"
echo "2. 检查 'Production Branch' 配置"
echo "3. 确认分支名称是否匹配"
