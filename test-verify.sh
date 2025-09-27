#!/bin/bash

# =================================================================
# 项目测试验证脚本 - version3-step-wizard
# 功能：验证项目功能完整性、性能和配置正确性
# 作者：Claude Code Assistant
# 创建时间：2025-09-27
# =================================================================

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
FRONTEND_PORT=3008
BACKEND_PORT=3001
TEST_TIMEOUT=30
VERBOSE=false

# 计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# 详细输出函数
verbose_log() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${YELLOW}[DEBUG]${NC} $1"
    fi
}

# 测试前置检查
check_prerequisites() {
    log_info "检查测试前置条件..."

    # 检查必要命令
    local commands=("node" "npm" "curl" "git")
    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_fail "缺少必要命令: $cmd"
            exit 1
        fi
    done

    # 检查项目结构
    local required_dirs=("frontend" "backend")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_fail "缺少必要目录: $dir"
            exit 1
        fi
    done

    # 检查配置文件
    if [ ! -f "backend/.env" ]; then
        log_warning "后端环境配置文件 (.env) 不存在"
    fi

    log_success "前置条件检查通过"
}

# 测试依赖安装
test_dependencies() {
    log_info "测试依赖安装状态..."

    # 前端依赖
    log_test "检查前端依赖"
    if [ -d "frontend/node_modules" ] && [ -f "frontend/package-lock.json" ]; then
        log_success "前端依赖已安装"
    else
        log_fail "前端依赖未安装或不完整"
        return 1
    fi

    # 后端依赖
    log_test "检查后端依赖"
    if [ -d "backend/node_modules" ] && [ -f "backend/package-lock.json" ]; then
        log_success "后端依赖已安装"
    else
        log_fail "后端依赖未安装或不完整"
        return 1
    fi

    # 检查关键依赖包
    log_test "检查关键依赖包"
    local frontend_deps=("vue" "element-plus" "vite")
    local backend_deps=("express" "mysql2" "axios")

    for dep in "${frontend_deps[@]}"; do
        if [ -d "frontend/node_modules/$dep" ]; then
            verbose_log "前端依赖 $dep 存在"
        else
            log_fail "前端缺少关键依赖: $dep"
        fi
    done

    for dep in "${backend_deps[@]}"; do
        if [ -d "backend/node_modules/$dep" ]; then
            verbose_log "后端依赖 $dep 存在"
        else
            log_fail "后端缺少关键依赖: $dep"
        fi
    done

    log_success "依赖检查完成"
}

# 测试配置文件
test_configurations() {
    log_info "测试配置文件..."

    # 前端配置
    log_test "检查前端配置"
    if [ -f "frontend/vite.config.js" ]; then
        if grep -q "proxy" frontend/vite.config.js; then
            log_success "前端代理配置存在"
        else
            log_warning "前端可能缺少代理配置"
        fi
    else
        log_fail "前端配置文件不存在"
    fi

    # 后端配置
    log_test "检查后端配置"
    if [ -f "backend/.env" ]; then
        local required_vars=("DB_HOST" "DB_USER" "DB_NAME" "DEEPSEEK_API_KEY")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" backend/.env; then
                verbose_log "环境变量 $var 已配置"
            else
                log_warning "环境变量 $var 未配置"
            fi
        done
        log_success "后端环境配置检查完成"
    else
        log_fail "后端环境配置文件不存在"
    fi

    # 检查Git配置
    log_test "检查Git配置"
    if [ -f ".gitignore" ]; then
        if grep -q "node_modules" .gitignore && grep -q ".env" .gitignore; then
            log_success "Git忽略配置正确"
        else
            log_warning "Git忽略配置可能不完整"
        fi
    else
        log_warning "缺少.gitignore文件"
    fi
}

# 测试代码质量
test_code_quality() {
    log_info "测试代码质量..."

    # 检查关键文件存在性
    local key_files=(
        "frontend/src/main.js"
        "frontend/src/App.vue"
        "frontend/src/views/ContentGenerator.vue"
        "backend/server.js"
        "backend/services/deepseekService.js"
    )

    log_test "检查关键文件"
    for file in "${key_files[@]}"; do
        if [ -f "$file" ]; then
            verbose_log "文件存在: $file"
        else
            log_fail "关键文件缺失: $file"
        fi
    done

    # 检查代码语法（简单检查）
    log_test "检查JavaScript语法"
    local js_files=$(find . -name "*.js" -not -path "*/node_modules/*" | head -10)
    local syntax_errors=0

    for js_file in $js_files; do
        if node -c "$js_file" 2>/dev/null; then
            verbose_log "语法正确: $js_file"
        else
            log_fail "语法错误: $js_file"
            syntax_errors=$((syntax_errors + 1))
        fi
    done

    if [ $syntax_errors -eq 0 ]; then
        log_success "JavaScript语法检查通过"
    else
        log_fail "发现 $syntax_errors 个语法错误"
    fi

    # 检查Vue文件
    log_test "检查Vue组件"
    local vue_files=$(find frontend/src -name "*.vue" | head -5)
    for vue_file in $vue_files; do
        if grep -q "<template>" "$vue_file" && grep -q "<script>" "$vue_file"; then
            verbose_log "Vue组件结构正确: $vue_file"
        else
            log_warning "Vue组件可能缺少必要部分: $vue_file"
        fi
    done

    log_success "代码质量检查完成"
}

# 测试服务启动
test_service_startup() {
    log_info "测试服务启动..."

    # 检查端口占用
    log_test "检查端口占用情况"
    if netstat -tulpn 2>/dev/null | grep -q ":$BACKEND_PORT "; then
        log_success "后端服务已运行 (端口 $BACKEND_PORT)"
        BACKEND_RUNNING=true
    else
        log_warning "后端服务未运行"
        BACKEND_RUNNING=false
    fi

    if netstat -tulpn 2>/dev/null | grep -q ":$FRONTEND_PORT "; then
        log_success "前端服务已运行 (端口 $FRONTEND_PORT)"
        FRONTEND_RUNNING=true
    else
        log_warning "前端服务未运行"
        FRONTEND_RUNNING=false
    fi

    # 如果服务未运行，尝试启动测试
    if [ "$BACKEND_RUNNING" = false ]; then
        log_test "尝试启动后端服务"
        cd backend
        timeout $TEST_TIMEOUT npm start &>/dev/null &
        local backend_pid=$!
        cd ..

        sleep 5

        if kill -0 $backend_pid 2>/dev/null; then
            log_success "后端服务启动成功"
            kill $backend_pid 2>/dev/null
        else
            log_fail "后端服务启动失败"
        fi
    fi
}

# 测试API接口
test_api_endpoints() {
    log_info "测试API接口..."

    if [ "$BACKEND_RUNNING" = false ]; then
        log_warning "后端服务未运行，跳过API测试"
        return
    fi

    local base_url="http://localhost:$BACKEND_PORT"

    # 测试健康检查接口
    log_test "测试健康检查接口"
    if curl -s -f "$base_url/health" >/dev/null 2>&1; then
        log_success "健康检查接口正常"
    else
        log_fail "健康检查接口异常"
    fi

    # 测试API路由
    local api_endpoints=(
        "/api/topics"
        "/api/hooks"
        "/api/content"
        "/api/storyboard"
    )

    for endpoint in "${api_endpoints[@]}"; do
        log_test "测试接口: $endpoint"
        local response=$(curl -s -w "%{http_code}" -o /dev/null "$base_url$endpoint" 2>/dev/null)

        if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "405" ]; then
            verbose_log "接口 $endpoint 可访问 (状态码: $response)"
        else
            log_warning "接口 $endpoint 可能异常 (状态码: $response)"
        fi
    done

    log_success "API接口测试完成"
}

# 测试前端构建
test_frontend_build() {
    log_info "测试前端构建..."

    log_test "执行前端构建"
    cd frontend

    if npm run build &>/dev/null; then
        log_success "前端构建成功"

        # 检查构建产物
        if [ -d "dist" ]; then
            local dist_size=$(du -sh dist 2>/dev/null | cut -f1)
            log_success "构建产物大小: $dist_size"

            # 清理构建产物
            rm -rf dist
        else
            log_fail "构建产物目录不存在"
        fi
    else
        log_fail "前端构建失败"
    fi

    cd ..
}

# 测试数据库连接
test_database_connection() {
    log_info "测试数据库连接..."

    if [ ! -f "backend/.env" ]; then
        log_warning "无环境配置文件，跳过数据库测试"
        return
    fi

    # 从环境文件读取数据库配置
    source backend/.env 2>/dev/null || true

    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
        log_warning "数据库配置不完整，跳过连接测试"
        return
    fi

    log_test "测试数据库连接"

    # 创建临时测试脚本
    cat > /tmp/db_test.js << EOF
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: '$DB_HOST',
            user: '$DB_USER',
            password: '$DB_PASSWORD',
            database: '$DB_NAME'
        });

        await connection.execute('SELECT 1');
        await connection.end();
        console.log('DATABASE_OK');
    } catch (error) {
        console.log('DATABASE_ERROR:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF

    cd backend
    if node /tmp/db_test.js 2>/dev/null | grep -q "DATABASE_OK"; then
        log_success "数据库连接正常"
    else
        log_fail "数据库连接失败"
    fi
    cd ..

    rm -f /tmp/db_test.js
}

# 测试备份功能
test_backup_functionality() {
    log_info "测试备份功能..."

    log_test "测试自动化备份脚本"
    if [ -f "backup.sh" ] && [ -x "backup.sh" ]; then
        # 测试演练模式
        if ./backup.sh --dry-run auto &>/dev/null; then
            log_success "备份脚本演练模式正常"
        else
            log_fail "备份脚本演练模式失败"
        fi
    else
        log_fail "备份脚本不存在或无执行权限"
    fi

    log_test "测试Git标签管理"
    if [ -f "tag-manager.sh" ] && [ -x "tag-manager.sh" ]; then
        if ./tag-manager.sh help &>/dev/null; then
            log_success "标签管理脚本正常"
        else
            log_fail "标签管理脚本异常"
        fi
    else
        log_fail "标签管理脚本不存在或无执行权限"
    fi

    log_test "测试清理脚本"
    if [ -f "cleanup.sh" ] && [ -x "cleanup.sh" ]; then
        if ./cleanup.sh --dry-run stats &>/dev/null; then
            log_success "清理脚本正常"
        else
            log_fail "清理脚本异常"
        fi
    else
        log_fail "清理脚本不存在或无执行权限"
    fi
}

# 性能测试
test_performance() {
    log_info "测试系统性能..."

    # 检查磁盘空间
    log_test "检查磁盘空间"
    local disk_usage=$(df . | tail -1 | awk '{print $(NF-1)}' | sed 's/%//')
    if [ "$disk_usage" -lt 90 ]; then
        log_success "磁盘空间充足 (已用 $disk_usage%)"
    else
        log_warning "磁盘空间不足 (已用 $disk_usage%)"
    fi

    # 检查内存使用
    log_test "检查内存使用"
    if command -v free &>/dev/null; then
        local mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
        if [ "$mem_usage" -lt 80 ]; then
            log_success "内存使用正常 (已用 $mem_usage%)"
        else
            log_warning "内存使用较高 (已用 $mem_usage%)"
        fi
    else
        log_warning "无法检查内存使用情况"
    fi

    # 检查项目大小
    log_test "检查项目大小"
    local project_size=$(du -sh . 2>/dev/null | cut -f1)
    log_success "项目总大小: $project_size"

    # 检查node_modules大小
    local node_modules_size=0
    if [ -d "frontend/node_modules" ]; then
        local frontend_modules=$(du -sh frontend/node_modules 2>/dev/null | cut -f1)
        verbose_log "前端依赖大小: $frontend_modules"
    fi

    if [ -d "backend/node_modules" ]; then
        local backend_modules=$(du -sh backend/node_modules 2>/dev/null | cut -f1)
        verbose_log "后端依赖大小: $backend_modules"
    fi
}

# 生成测试报告
generate_report() {
    echo ""
    echo "================================================="
    echo "测试验证报告"
    echo "================================================="
    echo "测试时间: $(date)"
    echo "总测试数: $TOTAL_TESTS"
    echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"

    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    fi

    echo "成功率: $success_rate%"
    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ 所有测试通过！项目状态良好。${NC}"
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}⚠️  大部分测试通过，有少量问题需要关注。${NC}"
    else
        echo -e "${RED}❌ 多个测试失败，需要检查项目配置。${NC}"
    fi

    echo ""
    echo "建议操作:"
    if [ $FAILED_TESTS -gt 0 ]; then
        echo "- 检查失败的测试项目"
        echo "- 确保所有依赖正确安装"
        echo "- 验证配置文件完整性"
    fi
    echo "- 定期运行此测试脚本"
    echo "- 在部署前执行完整验证"
    echo "================================================="
}

# 显示帮助信息
show_help() {
    cat << EOF
项目测试验证脚本 - 用法说明

用法: $0 [选项] [测试类型]

测试类型:
  all         - 执行所有测试（默认）
  deps        - 仅测试依赖安装
  config      - 仅测试配置文件
  code        - 仅测试代码质量
  service     - 仅测试服务启动
  api         - 仅测试API接口
  build       - 仅测试前端构建
  db          - 仅测试数据库连接
  backup      - 仅测试备份功能
  perf        - 仅测试性能指标

选项:
  -v, --verbose    - 显示详细输出
  --frontend-port  - 指定前端端口 (默认: $FRONTEND_PORT)
  --backend-port   - 指定后端端口 (默认: $BACKEND_PORT)
  --timeout       - 设置测试超时时间 (默认: $TEST_TIMEOUT秒)
  -h, --help      - 显示此帮助

示例:
  $0                      # 执行所有测试
  $0 deps                 # 仅测试依赖
  $0 -v api               # 详细模式测试API
  $0 --backend-port 3001  # 指定后端端口

测试内容:
  ✓ 前置条件检查
  ✓ 依赖安装状态
  ✓ 配置文件完整性
  ✓ 代码质量检查
  ✓ 服务启动测试
  ✓ API接口测试
  ✓ 前端构建测试
  ✓ 数据库连接测试
  ✓ 备份功能测试
  ✓ 性能指标检查
EOF
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --frontend-port)
                FRONTEND_PORT="$2"
                shift 2
                ;;
            --backend-port)
                BACKEND_PORT="$2"
                shift 2
                ;;
            --timeout)
                TEST_TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                TEST_TYPE="$1"
                shift
                ;;
        esac
    done
}

# 主函数
main() {
    local test_type="${TEST_TYPE:-all}"

    echo "================================================="
    echo "项目测试验证脚本"
    echo "测试类型: $test_type"
    echo "详细模式: $VERBOSE"
    echo "时间: $(date)"
    echo "================================================="

    check_prerequisites

    case "$test_type" in
        "all")
            test_dependencies
            test_configurations
            test_code_quality
            test_service_startup
            test_api_endpoints
            test_build
            test_database_connection
            test_backup_functionality
            test_performance
            ;;
        "deps")
            test_dependencies
            ;;
        "config")
            test_configurations
            ;;
        "code")
            test_code_quality
            ;;
        "service")
            test_service_startup
            ;;
        "api")
            test_api_endpoints
            ;;
        "build")
            test_frontend_build
            ;;
        "db")
            test_database_connection
            ;;
        "backup")
            test_backup_functionality
            ;;
        "perf")
            test_performance
            ;;
        *)
            log_error "未知测试类型: $test_type"
            echo "使用 '$0 --help' 查看帮助信息"
            exit 1
            ;;
    esac

    generate_report
}

# 脚本入口
parse_args "$@"
main