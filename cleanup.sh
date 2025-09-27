#!/bin/bash

# =================================================================
# 项目清理脚本 - version3-step-wizard
# 功能：定期清理项目中的临时文件、日志文件、旧备份等
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
MAX_BACKUPS=10          # 最大保留备份数量
MAX_LOG_DAYS=30         # 日志文件保留天数
MAX_TEMP_HOURS=24       # 临时文件保留小时数
DRY_RUN=false          # 是否为演练模式

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

log_dry_run() {
    echo -e "${YELLOW}[DRY RUN]${NC} $1"
}

# 显示文件大小
show_size() {
    if [ -f "$1" ] || [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "0B"
    fi
}

# 安全删除函数
safe_delete() {
    local target="$1"
    local reason="$2"

    if [ "$DRY_RUN" = true ]; then
        log_dry_run "将删除: $target ($reason)"
        return
    fi

    if [ -f "$target" ]; then
        local size=$(show_size "$target")
        rm -f "$target"
        log_success "删除文件: $target (大小: $size)"
    elif [ -d "$target" ]; then
        local size=$(show_size "$target")
        rm -rf "$target"
        log_success "删除目录: $target (大小: $size)"
    fi
}

# 清理node_modules
cleanup_node_modules() {
    log_info "清理 node_modules 目录..."

    local cleaned=false

    # 前端 node_modules
    if [ -d "frontend/node_modules" ]; then
        local size=$(show_size "frontend/node_modules")
        safe_delete "frontend/node_modules" "前端依赖包"
        cleaned=true
    fi

    # 后端 node_modules
    if [ -d "backend/node_modules" ]; then
        local size=$(show_size "backend/node_modules")
        safe_delete "backend/node_modules" "后端依赖包"
        cleaned=true
    fi

    if [ "$cleaned" = true ]; then
        log_info "重新安装依赖请运行: npm install"
    else
        log_info "未找到 node_modules 目录"
    fi
}

# 清理构建产物
cleanup_build_artifacts() {
    log_info "清理构建产物..."

    local artifacts=(
        "frontend/dist"
        "frontend/build"
        "backend/dist"
        "backend/build"
        "*.tgz"
        "*.tar.gz"
    )

    local cleaned=false

    for artifact in "${artifacts[@]}"; do
        if [[ "$artifact" == *"*"* ]]; then
            # 处理通配符
            for file in $artifact; do
                if [ -f "$file" ] || [ -d "$file" ]; then
                    safe_delete "$file" "构建产物"
                    cleaned=true
                fi
            done
        else
            if [ -f "$artifact" ] || [ -d "$artifact" ]; then
                safe_delete "$artifact" "构建产物"
                cleaned=true
            fi
        fi
    done

    if [ "$cleaned" = false ]; then
        log_info "未找到构建产物"
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份文件..."

    # 获取所有备份目录，按时间排序
    local backup_dirs=($(ls -td backup-* 2>/dev/null))

    if [ ${#backup_dirs[@]} -eq 0 ]; then
        log_info "未找到备份目录"
        return
    fi

    log_info "找到 ${#backup_dirs[@]} 个备份目录"

    # 显示当前备份状态
    local total_size=0
    for dir in "${backup_dirs[@]}"; do
        if [ -d "$dir" ]; then
            local size=$(du -s "$dir" 2>/dev/null | cut -f1)
            total_size=$((total_size + size))
        fi
    done

    log_info "备份总大小: $(echo $total_size | awk '{printf "%.1f MB", $1/1024}')"

    if [ ${#backup_dirs[@]} -gt $MAX_BACKUPS ]; then
        log_warning "备份数量超出限制 (${#backup_dirs[@]} > $MAX_BACKUPS)"

        # 删除超出数量限制的旧备份
        for ((i=MAX_BACKUPS; i<${#backup_dirs[@]}; i++)); do
            if [ -d "${backup_dirs[i]}" ]; then
                local backup_date=$(echo "${backup_dirs[i]}" | sed 's/backup-//')
                safe_delete "${backup_dirs[i]}" "旧备份 ($backup_date)"
            fi
        done
    else
        log_info "备份数量在限制范围内 (${#backup_dirs[@]}/$MAX_BACKUPS)"
    fi

    # 清理压缩备份文件
    local backup_archives=($(ls -t backup-*.tar.gz 2>/dev/null))
    if [ ${#backup_archives[@]} -gt $MAX_BACKUPS ]; then
        log_warning "压缩备份文件超出限制"
        for ((i=MAX_BACKUPS; i<${#backup_archives[@]}; i++)); do
            safe_delete "${backup_archives[i]}" "旧压缩备份"
        done
    fi
}

# 清理日志文件
cleanup_logs() {
    log_info "清理旧日志文件..."

    local log_files=(
        "app.log"
        "error.log"
        "access.log"
        "backend/app.log"
        "backend/error.log"
        "frontend/npm-debug.log"
        "*.log"
    )

    local cleaned=false

    for log_pattern in "${log_files[@]}"; do
        if [[ "$log_pattern" == *"*"* ]]; then
            # 处理通配符
            for log_file in $log_pattern; do
                if [ -f "$log_file" ]; then
                    # 检查文件修改时间
                    local file_age=$(find "$log_file" -mtime +$MAX_LOG_DAYS 2>/dev/null)
                    if [ -n "$file_age" ]; then
                        safe_delete "$log_file" "超期日志 (>$MAX_LOG_DAYS天)"
                        cleaned=true
                    fi
                fi
            done
        else
            if [ -f "$log_pattern" ]; then
                local file_age=$(find "$log_pattern" -mtime +$MAX_LOG_DAYS 2>/dev/null)
                if [ -n "$file_age" ]; then
                    safe_delete "$log_pattern" "超期日志 (>$MAX_LOG_DAYS天)"
                    cleaned=true
                fi
            fi
        fi
    done

    if [ "$cleaned" = false ]; then
        log_info "未找到需要清理的日志文件"
    fi
}

# 清理临时文件
cleanup_temp_files() {
    log_info "清理临时文件..."

    local temp_patterns=(
        "*.tmp"
        "*.temp"
        ".DS_Store"
        "Thumbs.db"
        "*.swp"
        "*.swo"
        "*~"
        "frontend/.vite"
        "frontend/node_modules/.cache"
    )

    local cleaned=false

    for pattern in "${temp_patterns[@]}"; do
        if [[ "$pattern" == *"*"* ]]; then
            # 处理通配符
            for file in $pattern; do
                if [ -f "$file" ] || [ -d "$file" ]; then
                    safe_delete "$file" "临时文件"
                    cleaned=true
                fi
            done
        else
            if [ -f "$pattern" ] || [ -d "$pattern" ]; then
                safe_delete "$pattern" "临时文件"
                cleaned=true
            fi
        fi
    done

    # 清理超期临时文件
    find . -name "*.tmp" -mmin +$((MAX_TEMP_HOURS * 60)) -type f 2>/dev/null | while read -r file; do
        safe_delete "$file" "超期临时文件 (>$MAX_TEMP_HOURS小时)"
        cleaned=true
    done

    if [ "$cleaned" = false ]; then
        log_info "未找到临时文件"
    fi
}

# 清理缓存文件
cleanup_caches() {
    log_info "清理缓存文件..."

    local cache_dirs=(
        "frontend/.vite"
        "frontend/node_modules/.cache"
        "backend/node_modules/.cache"
        ".npm"
        ".cache"
    )

    local cleaned=false

    for cache_dir in "${cache_dirs[@]}"; do
        if [ -d "$cache_dir" ]; then
            safe_delete "$cache_dir" "缓存目录"
            cleaned=true
        fi
    done

    if [ "$cleaned" = false ]; then
        log_info "未找到缓存文件"
    fi
}

# 清理Git相关
cleanup_git() {
    log_info "清理Git相关文件..."

    if [ ! -d ".git" ]; then
        log_warning "当前目录不是Git仓库"
        return
    fi

    # Git垃圾回收
    log_info "执行Git垃圾回收..."
    if [ "$DRY_RUN" = false ]; then
        git gc --prune=now --aggressive 2>/dev/null
        log_success "Git垃圾回收完成"
    else
        log_dry_run "将执行: git gc --prune=now --aggressive"
    fi

    # 清理未跟踪的文件（谨慎操作）
    local untracked=$(git status --porcelain | grep "^??" | wc -l)
    if [ $untracked -gt 0 ]; then
        log_warning "发现 $untracked 个未跟踪的文件"
        log_warning "使用 'git clean -fd' 可以清理（请谨慎操作）"
    fi
}

# 显示清理统计
show_cleanup_stats() {
    log_info "清理统计信息"
    echo "========================================"

    local current_size=$(du -sh . 2>/dev/null | cut -f1)
    echo "当前目录大小: $current_size"

    # 显示各目录大小
    if [ -d "frontend" ]; then
        echo "前端目录大小: $(show_size frontend)"
    fi

    if [ -d "backend" ]; then
        echo "后端目录大小: $(show_size backend)"
    fi

    # 显示备份信息
    local backup_count=$(ls -d backup-* 2>/dev/null | wc -l)
    echo "备份目录数量: $backup_count"

    # 显示磁盘使用情况
    echo ""
    echo "磁盘使用情况:"
    df -h . | tail -1 | awk '{print "  已用: " $3 "/" $2 " (" $5 ")"}'
}

# 自动清理模式
auto_cleanup() {
    log_info "执行自动清理..."

    cleanup_temp_files
    cleanup_logs
    cleanup_old_backups
    cleanup_caches

    log_success "自动清理完成"
}

# 深度清理模式
deep_cleanup() {
    log_warning "执行深度清理（包括依赖包）..."
    log_warning "深度清理后需要重新安装依赖包"

    echo -n "确认执行深度清理？(y/N): "
    read -r confirm

    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "深度清理已取消"
        return
    fi

    cleanup_temp_files
    cleanup_logs
    cleanup_old_backups
    cleanup_caches
    cleanup_build_artifacts
    cleanup_node_modules
    cleanup_git

    log_success "深度清理完成"
    log_info "请运行以下命令重新安装依赖:"
    echo "  cd frontend && npm install"
    echo "  cd backend && npm install"
}

# 显示帮助信息
show_help() {
    cat << EOF
项目清理脚本 - 用法说明

用法: $0 [选项] [命令]

命令:
  auto        - 自动清理（默认）
  deep        - 深度清理（包括依赖包）
  backups     - 仅清理旧备份
  logs        - 仅清理日志文件
  temp        - 仅清理临时文件
  cache       - 仅清理缓存文件
  git         - 仅清理Git相关
  stats       - 显示清理统计
  help        - 显示此帮助

选项:
  --dry-run   - 演练模式，不实际删除文件
  --max-backups N  - 设置最大备份保留数量 (默认: $MAX_BACKUPS)
  --max-log-days N - 设置日志保留天数 (默认: $MAX_LOG_DAYS)

示例:
  $0                          # 自动清理
  $0 deep                     # 深度清理
  $0 --dry-run auto          # 演练自动清理
  $0 --max-backups 5 backups # 保留5个备份
  $0 stats                   # 显示统计信息

清理内容:
  - 临时文件 (*.tmp, .DS_Store, 缓存等)
  - 超期日志文件 (超过 $MAX_LOG_DAYS 天)
  - 超量备份目录 (超过 $MAX_BACKUPS 个)
  - 构建产物 (dist/, build/ 等)
  - node_modules (仅深度清理)

安全特性:
  - 演练模式支持
  - 确认提示
  - 详细日志
  - 分类清理
EOF
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --max-backups)
                MAX_BACKUPS="$2"
                shift 2
                ;;
            --max-log-days)
                MAX_LOG_DAYS="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                COMMAND="$1"
                shift
                ;;
        esac
    done
}

# 主函数
main() {
    local command="${COMMAND:-auto}"

    echo "================================================="
    echo "项目清理脚本"
    if [ "$DRY_RUN" = true ]; then
        echo "模式: 演练模式 (不会实际删除文件)"
    else
        echo "模式: 实际清理"
    fi
    echo "时间: $(date)"
    echo "================================================="

    case "$command" in
        "auto")
            auto_cleanup
            ;;
        "deep")
            deep_cleanup
            ;;
        "backups")
            cleanup_old_backups
            ;;
        "logs")
            cleanup_logs
            ;;
        "temp")
            cleanup_temp_files
            ;;
        "cache")
            cleanup_caches
            ;;
        "git")
            cleanup_git
            ;;
        "stats")
            show_cleanup_stats
            ;;
        "help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            echo "使用 '$0 help' 查看帮助信息"
            exit 1
            ;;
    esac

    echo "================================================="
    if [ "$DRY_RUN" = false ]; then
        log_success "清理完成！"
        show_cleanup_stats
    else
        log_info "演练模式完成"
    fi
    echo "================================================="
}

# 脚本入口
parse_args "$@"
main