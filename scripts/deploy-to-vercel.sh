#!/bin/bash

echo "🚀 Luckee DAO Frontend - Vercel自动部署脚本"
echo "================================================"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "❌ 检测到未提交的更改，请先提交代码"
    git status -s
    exit 1
fi

echo "✅ 代码状态检查通过"

# 选择部署方式
echo ""
echo "请选择部署方式："
echo "1) 推送到main分支（自动部署）"
echo "2) 推送到当前分支（预览部署）"
echo "3) 直接部署到Vercel"
read -p "请输入选择 (1-3): " choice

case $choice in
    1)
        echo "🔄 切换到main分支并合并代码..."
        git checkout main
        git merge $CURRENT_BRANCH
        echo "📤 推送到GitHub（触发自动部署）..."
        git push origin main
        echo "✅ 代码已推送到main分支，Vercel将自动部署"
        echo "🌐 生产环境: https://luckee.cdao.online/"
        echo "🌐 Vercel默认域名: https://luckee-dao-frontend.vercel.app/"
        ;;
    2)
        echo "📤 推送当前分支到GitHub..."
        git push origin $CURRENT_BRANCH
        echo "✅ 代码已推送，可在Vercel控制台查看预览部署"
        ;;
    3)
        echo "🚀 直接部署到Vercel..."
        vercel --prod
        echo "✅ 直接部署完成"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo "📊 查看部署状态: vercel ls"
echo "🔍 查看部署日志: vercel logs"
