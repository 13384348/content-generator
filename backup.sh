#!/bin/bash

# =================================================================
# 项目自动化备份脚本 - version3-step-wizard
# 功能：创建完整的项目备份，包含代码、文档、配置等
# 作者：Claude Code Assistant
# 创建时间：2025-09-27
# =================================================================

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="content-generator-v3"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup-${DATE}"
MAX_BACKUPS=10  # 保留最大备份数量

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
    log_info "检查依赖环境..."

    if ! command -v git &> /dev/null; then
        log_error "Git 未安装，请先安装 Git"
        exit 1
    fi

    if [ ! -d ".git" ]; then
        log_warning "当前目录不是 Git 仓库"
    fi
}

# 创建备份目录结构
create_backup_structure() {
    log_info "创建备份目录结构..."

    mkdir -p "${BACKUP_DIR}"/{code,docs,prompts,configs,logs}

    if [ $? -eq 0 ]; then
        log_success "备份目录创建成功: ${BACKUP_DIR}"
    else
        log_error "备份目录创建失败"
        exit 1
    fi
}

# 备份代码文件
backup_code() {
    log_info "备份源代码..."

    # 排除 node_modules 和其他不必要的目录
    rsync -av --exclude='node_modules' \
              --exclude='.git' \
              --exclude='dist' \
              --exclude='build' \
              --exclude='*.log' \
              --exclude='.DS_Store' \
              frontend/ "${BACKUP_DIR}/code/frontend/" 2>/dev/null

    rsync -av --exclude='node_modules' \
              --exclude='*.log' \
              --exclude='.DS_Store' \
              backend/ "${BACKUP_DIR}/code/backend/" 2>/dev/null

    log_success "源代码备份完成"
}

# 备份配置文件
backup_configs() {
    log_info "备份配置文件..."

    # 后端配置
    [ -f "backend/.env" ] && cp backend/.env "${BACKUP_DIR}/prompts/" 2>/dev/null
    [ -f "backend/.env.example" ] && cp backend/.env.example "${BACKUP_DIR}/prompts/" 2>/dev/null
    [ -f "backend/package.json" ] && cp backend/package.json "${BACKUP_DIR}/prompts/" 2>/dev/null
    [ -f "backend/package-lock.json" ] && cp backend/package-lock.json "${BACKUP_DIR}/prompts/" 2>/dev/null

    # 前端配置
    [ -f "frontend/package.json" ] && cp frontend/package.json "${BACKUP_DIR}/configs/" 2>/dev/null
    [ -f "frontend/package-lock.json" ] && cp frontend/package-lock.json "${BACKUP_DIR}/configs/" 2>/dev/null
    [ -f "frontend/vite.config.js" ] && cp frontend/vite.config.js "${BACKUP_DIR}/configs/" 2>/dev/null

    # 其他配置文件
    [ -f ".gitignore" ] && cp .gitignore "${BACKUP_DIR}/configs/" 2>/dev/null
    [ -f "nginx-default" ] && cp nginx-default "${BACKUP_DIR}/configs/" 2>/dev/null

    # 提示词相关脚本
    find backend -name "*prompt*.js" -exec cp {} "${BACKUP_DIR}/prompts/" \; 2>/dev/null

    log_success "配置文件备份完成"
}

# 备份项目文档
backup_docs() {
    log_info "备份项目文档..."

    # 如果docs目录存在，备份所有文档
    if [ -d "docs" ]; then
        cp -r docs/* "${BACKUP_DIR}/docs/" 2>/dev/null
    fi

    # 备份根目录的文档文件
    [ -f "README.md" ] && cp README.md "${BACKUP_DIR}/docs/" 2>/dev/null
    [ -f "CHANGELOG.md" ] && cp CHANGELOG.md "${BACKUP_DIR}/docs/" 2>/dev/null

    log_success "项目文档备份完成"
}

# 生成备份信息
generate_backup_info() {
    log_info "生成备份信息文件..."

    cat > "${BACKUP_DIR}/backup_info.txt" << EOF
# 备份信息文件
# ================================

备份时间: $(date)
项目名称: ${PROJECT_NAME}
备份目录: ${BACKUP_DIR}
Git分支: $(git branch --show-current 2>/dev/null || echo "未知")
Git提交: $(git rev-parse --short HEAD 2>/dev/null || echo "未知")

# 目录结构
$(tree "${BACKUP_DIR}" 2>/dev/null || find "${BACKUP_DIR}" -type d | sed 's/^/  /')

# 文件统计
总文件数: $(find "${BACKUP_DIR}" -type f | wc -l)
总大小: $(du -sh "${BACKUP_DIR}" | cut -f1)

# Git状态
$(git status --porcelain 2>/dev/null || echo "非Git仓库")
EOF

    log_success "备份信息文件生成完成"
}

# 备份系统日志
backup_logs() {
    log_info "备份系统日志..."

    # 备份应用日志
    [ -f "app.log" ] && cp app.log "${BACKUP_DIR}/logs/" 2>/dev/null
    [ -f "backend/app.log" ] && cp backend/app.log "${BACKUP_DIR}/logs/" 2>/dev/null
    [ -f "error.log" ] && cp error.log "${BACKUP_DIR}/logs/" 2>/dev/null

    # 生成当前系统状态
    cat > "${BACKUP_DIR}/logs/system_status.txt" << EOF
# 系统状态快照 - $(date)
# ================================

## 进程状态
$(ps aux | grep -E "(node|npm)" | grep -v grep)

## 端口占用
$(netstat -tulpn 2>/dev/null | grep -E ":(3000|3001|3006|3008)" || echo "无相关端口占用")

## 磁盘使用
$(df -h .)

## 内存使用
$(free -h 2>/dev/null || echo "内存信息不可用")
EOF

    log_success "系统日志备份完成"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份文件..."

    # 获取所有备份目录，按时间排序
    backup_dirs=($(ls -td backup-* 2>/dev/null | head -n $((MAX_BACKUPS + 5))))

    if [ ${#backup_dirs[@]} -gt $MAX_BACKUPS ]; then
        # 删除超出数量限制的旧备份
        for ((i=MAX_BACKUPS; i<${#backup_dirs[@]}; i++)); do
            if [ -d "${backup_dirs[i]}" ]; then
                log_warning "删除旧备份: ${backup_dirs[i]}"
                rm -rf "${backup_dirs[i]}"
            fi
        done
    fi

    log_success "旧备份清理完成"
}

# 压缩备份文件（可选）
compress_backup() {
    if [ "$1" == "compress" ]; then
        log_info "压缩备份文件..."

        tar -czf "${BACKUP_DIR}.tar.gz" "${BACKUP_DIR}"

        if [ $? -eq 0 ]; then
            log_success "备份文件压缩完成: ${BACKUP_DIR}.tar.gz"
            log_info "是否删除原备份目录? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                rm -rf "${BACKUP_DIR}"
                log_success "原备份目录已删除"
            fi
        else
            log_error "备份文件压缩失败"
        fi
    fi
}

# 主函数
main() {
    echo "================================================="
    echo "项目自动化备份脚本"
    echo "项目: ${PROJECT_NAME}"
    echo "时间: $(date)"
    echo "================================================="

    # 执行备份流程
    check_dependencies
    create_backup_structure
    backup_code
    backup_configs
    backup_docs
    backup_logs
    generate_backup_info
    cleanup_old_backups

    # 可选压缩
    compress_backup "$1"

    echo "================================================="
    log_success "备份完成！"
    echo "备份位置: $(pwd)/${BACKUP_DIR}"
    echo "备份大小: $(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1 || echo "未知")"
    echo "文件数量: $(find "${BACKUP_DIR}" -type f 2>/dev/null | wc -l || echo "未知")"
    echo "================================================="
}

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [选项]

选项:
  无参数      - 执行标准备份
  compress   - 执行备份并压缩为tar.gz文件
  -h, --help - 显示此帮助信息

示例:
  $0                # 标准备份
  $0 compress       # 备份并压缩
  $0 --help         # 显示帮助

备份内容:
  - 前端和后端源代码（排除node_modules）
  - 配置文件和环境变量
  - 项目文档和说明
  - 系统日志和状态
  - Git信息和提交历史

备份位置: backup-YYYYMMDD_HHMMSS/
最大保留: ${MAX_BACKUPS} 个备份
EOF
}

# 脚本入口
case "$1" in
    -h|--help)
        show_help
        ;;
    *)
        main "$1"
        ;;
esac