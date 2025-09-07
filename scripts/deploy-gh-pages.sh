#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err() { echo -e "${RED}[error]${NC} $1"; }

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

REMOTE_NAME="origin"
BRANCH_TMP="gh-pages-deploy"
BRANCH_TARGET="gh-pages"

SKIP_BUILD=${SKIP_BUILD:-false}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "Not a git repository: $ROOT_DIR"
  exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  err "Git remote '$REMOTE_NAME' not found. Configure it first (git remote add origin <url>)."
  exit 1
fi

if [[ "$SKIP_BUILD" != "true" ]]; then
  log "Building project with Vite..."
  npm run build
else
  warn "Skipping build as SKIP_BUILD=true"
fi

if [[ ! -d dist ]]; then
  err "dist/ not found. Build failed or skipped incorrectly."
  exit 1
fi

log "Preparing SPA fallback and .nojekyll..."
cat > dist/404.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      (function() {
        var path = window.location.pathname;
        var base = '/decentralized_decision_frontend/';
        var hash = window.location.hash || '#/';
        // 如果路径不是仓库子路径开头，直接跳回根
        if (!path.startsWith(base)) {
          window.location.replace(base + '#/');
          return;
        }
        // 将子路径映射到哈希路由
        var sub = path.slice(base.length);
        if (!hash || hash === '#/' || hash === '#') {
          if (sub && sub !== '' && sub !== 'index.html') {
            // 去掉末尾斜杠
            if (sub.endsWith('/')) sub = sub.slice(0, -1);
            window.location.replace(base + '#/' + sub);
            return;
          }
        }
        window.location.replace(base + '#/');
      })();
    </script>
  </head>
  <body>
    Redirecting...
  </body>
  </html>
EOF
touch dist/.nojekyll

# Force a new tree so gh-pages always gets a fresh commit (avoid "Everything up-to-date")
VERSION_TS="$(date -u +%Y%m%d%H%M%S)"
echo "$VERSION_TS" > dist/.deploy-version
# Append a tiny HTML comment to bust CDN caches on index.html
echo "<!-- deploy:$VERSION_TS -->" >> dist/index.html

log "Creating subtree branch ($BRANCH_TMP) from dist/..."
git subtree split --prefix dist -b "$BRANCH_TMP"

log "Pushing to $REMOTE_NAME:$BRANCH_TARGET (force)..."
git push -f "$REMOTE_NAME" "$BRANCH_TMP":"$BRANCH_TARGET"

log "Cleaning up temporary branch..."
git branch -D "$BRANCH_TMP" || true

log "Done. Verify at your GitHub Pages settings and open the site."

