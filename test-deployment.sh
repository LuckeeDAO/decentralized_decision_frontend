#!/bin/bash
echo "Testing Vercel deployment..."

# 获取部署 URL
URL="https://decentralizeddecisionfrontend-lekywzh7y-iunknow588s-projects.vercel.app"
echo "Testing URL: $URL"

# 测试主页
if curl -f "$URL" > /dev/null 2>&1; then
    echo "✓ Homepage works"
else
    echo "✗ Homepage failed"
    exit 1
fi

# 测试路由
if curl -f "$URL/voting" > /dev/null 2>&1; then
    echo "✓ Voting page works"
else
    echo "✗ Voting page failed"
fi

if curl -f "$URL/nft" > /dev/null 2>&1; then
    echo "✓ NFT page works"
else
    echo "✗ NFT page failed"
fi

if curl -f "$URL/governance" > /dev/null 2>&1; then
    echo "✓ Governance page works"
else
    echo "✗ Governance page failed"
fi

if curl -f "$URL/settings" > /dev/null 2>&1; then
    echo "✓ Settings page works"
else
    echo "✗ Settings page failed"
fi

echo "Deployment test completed! 🎉"
echo "Production URL: $URL"
