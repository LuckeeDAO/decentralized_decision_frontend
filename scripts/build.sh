#!/bin/bash

# Luckee DAO 前端构建脚本
# 用于生产环境构建和部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查构建依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18.0+"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，将跳过Docker构建"
    fi
    
    log_success "依赖检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 清理缓存
    npm cache clean --force
    
    # 安装依赖
    npm ci --only=production
    
    log_success "依赖安装完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    # 运行单元测试
    npm run test:unit
    
    # 运行集成测试
    npm run test:integration
    
    # 运行端到端测试
    npm run test:e2e
    
    log_success "测试完成"
}

# 代码检查
run_linting() {
    log_info "运行代码检查..."
    
    # ESLint检查
    npm run lint
    
    # TypeScript类型检查
    npm run type-check
    
    # 代码格式化检查
    npm run format:check
    
    log_success "代码检查完成"
}

# 构建应用
build_app() {
    log_info "构建应用..."
    
    # 设置环境变量
    export NODE_ENV=production
    export GENERATE_SOURCEMAP=false
    
    # 构建应用
    npm run build
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        log_error "构建失败，dist目录不存在"
        exit 1
    fi
    
    log_success "应用构建完成"
}

# 优化构建
optimize_build() {
    log_info "优化构建..."
    
    # 压缩图片
    if command -v imagemin &> /dev/null; then
        log_info "压缩图片..."
        npx imagemin dist/assets/images/* --out-dir=dist/assets/images
    fi
    
    # 生成sitemap
    if command -v sitemap-generator &> /dev/null; then
        log_info "生成sitemap..."
        npx sitemap-generator https://luckee-dao.com --out-dir=dist
    fi
    
    # 生成robots.txt
    cat > dist/robots.txt << EOF
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://luckee-dao.com/sitemap.xml
EOF
    
    log_success "构建优化完成"
}

# 构建Docker镜像
build_docker() {
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，跳过Docker构建"
        return
    fi
    
    log_info "构建Docker镜像..."
    
    # 构建镜像
    docker build -t luckee-dao/frontend:latest .
    docker build -t luckee-dao/frontend:$(git rev-parse --short HEAD) .
    
    log_success "Docker镜像构建完成"
}

# 部署到生产环境
deploy_production() {
    log_info "部署到生产环境..."
    
    # 检查部署配置
    if [ ! -f "deploy/docker-compose.prod.yml" ]; then
        log_error "生产环境配置文件不存在"
        exit 1
    fi
    
    # 停止现有服务
    docker-compose -f deploy/docker-compose.prod.yml down
    
    # 启动新服务
    docker-compose -f deploy/docker-compose.prod.yml up -d
    
    # 等待服务启动
    sleep 30
    
    # 检查服务状态
    if ! docker-compose -f deploy/docker-compose.prod.yml ps | grep -q "Up"; then
        log_error "服务启动失败"
        exit 1
    fi
    
    log_success "生产环境部署完成"
}

# 清理构建文件
cleanup() {
    log_info "清理构建文件..."
    
    # 清理临时文件
    rm -rf .next
    rm -rf .cache
    rm -rf node_modules/.cache
    
    log_success "清理完成"
}

# 主函数
main() {
    log_info "开始构建 Luckee DAO 前端应用"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-lint)
                SKIP_LINT=true
                shift
                ;;
            --docker-only)
                DOCKER_ONLY=true
                shift
                ;;
            --deploy)
                DEPLOY=true
                shift
                ;;
            --clean)
                CLEAN=true
                shift
                ;;
            -h|--help)
                echo "用法: $0 [选项]"
                echo "选项:"
                echo "  --skip-tests    跳过测试"
                echo "  --skip-lint     跳过代码检查"
                echo "  --docker-only   仅构建Docker镜像"
                echo "  --deploy        部署到生产环境"
                echo "  --clean         清理构建文件"
                echo "  -h, --help      显示帮助信息"
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                exit 1
                ;;
        esac
    done
    
    # 执行构建步骤
    if [ "$CLEAN" = true ]; then
        cleanup
        exit 0
    fi
    
    check_dependencies
    
    if [ "$DOCKER_ONLY" = true ]; then
        build_docker
        exit 0
    fi
    
    install_dependencies
    
    if [ "$SKIP_LINT" != true ]; then
        run_linting
    fi
    
    if [ "$SKIP_TESTS" != true ]; then
        run_tests
    fi
    
    build_app
    optimize_build
    build_docker
    
    if [ "$DEPLOY" = true ]; then
        deploy_production
    fi
    
    log_success "构建完成！"
    log_info "构建文件位置: ./dist"
    log_info "Docker镜像: luckee-dao/frontend:latest"
}

# 执行主函数
main "$@"
