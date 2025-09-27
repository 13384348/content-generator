#!/bin/bash

# =================================================================
# Git 标签管理脚本 - version3-step-wizard
# 功能：自动化Git标签的创建、管理和版本控制
# 作者：Claude Code Assistant
# 创建时间：2025-09-27
# =================================================================

# 设置颜色输出
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

# 检查Git仓库
check_git_repo() {
    if [ ! -d ".git" ]; then
        log_error "当前目录不是Git仓库"
        exit 1
    fi

    if [ -n "$(git status --porcelain)" ]; then
        log_warning "工作区有未提交的更改"
        echo "请先提交所有更改再创建标签"
        git status --short
        exit 1
    fi
}

# 获取版本号
get_version_info() {
    local version_type="$1"

    case $version_type in
        "major"|"1")
            echo "主版本更新 (Major Version)"
            echo "  - 重大功能更新"
            echo "  - 架构重大变更"
            echo "  - 不兼容的API变更"
            ;;
        "minor"|"2")
            echo "次版本更新 (Minor Version)"
            echo "  - 新功能添加"
            echo "  - 功能增强"
            echo "  - 向后兼容"
            ;;
        "patch"|"3")
            echo "补丁更新 (Patch Version)"
            echo "  - Bug修复"
            echo "  - 小优化"
            echo "  - 安全修复"
            ;;
        "stable"|"4")
            echo "稳定版本 (Stable Version)"
            echo "  - 功能完整稳定"
            echo "  - 测试完成"
            echo "  - 可用于生产"
            ;;
        "beta"|"5")
            echo "测试版本 (Beta Version)"
            echo "  - 功能基本完成"
            echo "  - 需要测试验证"
            echo "  - 可能有已知问题"
            ;;
        "alpha"|"6")
            echo "内测版本 (Alpha Version)"
            echo "  - 功能开发中"
            echo "  - 内部测试"
            echo "  - 不稳定"
            ;;
    esac
}

# 生成版本号
generate_version() {
    local version_type="$1"
    local custom_version="$2"

    if [ -n "$custom_version" ]; then
        echo "$custom_version"
        return
    fi

    # 获取最新标签
    local latest_tag=$(git describe --tags --abbrev=0 2>/dev/null)

    if [ -z "$latest_tag" ]; then
        case $version_type in
            "major"|"1") echo "v1.0.0" ;;
            "minor"|"2") echo "v0.1.0" ;;
            "patch"|"3") echo "v0.0.1" ;;
            "stable"|"4") echo "v1.0.0-stable" ;;
            "beta"|"5") echo "v0.1.0-beta" ;;
            "alpha"|"6") echo "v0.0.1-alpha" ;;
        esac
        return
    fi

    # 解析版本号
    local version_core=$(echo "$latest_tag" | sed 's/^v//' | sed 's/-.*$//')
    local major=$(echo "$version_core" | cut -d. -f1)
    local minor=$(echo "$version_core" | cut -d. -f2)
    local patch=$(echo "$version_core" | cut -d. -f3)

    case $version_type in
        "major"|"1")
            echo "v$((major + 1)).0.0"
            ;;
        "minor"|"2")
            echo "v${major}.$((minor + 1)).0"
            ;;
        "patch"|"3")
            echo "v${major}.${minor}.$((patch + 1))"
            ;;
        "stable"|"4")
            echo "v${major}.${minor}.${patch}-stable"
            ;;
        "beta"|"5")
            echo "v${major}.${minor}.${patch}-beta"
            ;;
        "alpha"|"6")
            echo "v${major}.${minor}.${patch}-alpha"
            ;;
    esac
}

# 创建标签
create_tag() {
    local version="$1"
    local message="$2"

    if [ -z "$message" ]; then
        echo "请输入标签说明："
        read -r message
    fi

    log_info "创建标签: $version"
    log_info "说明: $message"

    git tag -a "$version" -m "$message"

    if [ $? -eq 0 ]; then
        log_success "标签创建成功: $version"
    else
        log_error "标签创建失败"
        exit 1
    fi
}

# 列出所有标签
list_tags() {
    log_info "项目标签列表:"
    echo "========================================"

    local tags=$(git tag -l --sort=-version:refname)

    if [ -z "$tags" ]; then
        log_warning "暂无标签"
        return
    fi

    while IFS= read -r tag; do
        local commit_hash=$(git rev-list -n 1 "$tag")
        local commit_date=$(git log -1 --format=%cd --date=short "$tag")
        local commit_message=$(git tag -l --format='%(contents:subject)' "$tag")

        echo -e "${GREEN}$tag${NC} (${commit_date})"
        echo "  提交: ${commit_hash:0:8}"
        echo "  说明: $commit_message"
        echo ""
    done <<< "$tags"
}

# 删除标签
delete_tag() {
    local tag="$1"

    if [ -z "$tag" ]; then
        echo "请输入要删除的标签名："
        read -r tag
    fi

    if ! git tag -l | grep -q "^$tag$"; then
        log_error "标签 '$tag' 不存在"
        exit 1
    fi

    log_warning "确定要删除标签 '$tag' 吗？(y/N)"
    read -r confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        git tag -d "$tag"
        log_success "标签 '$tag' 已删除"
    else
        log_info "操作已取消"
    fi
}

# 推送标签到远程
push_tags() {
    log_info "推送标签到远程仓库..."

    # 检查是否有远程仓库
    if ! git remote | grep -q "origin"; then
        log_warning "未找到远程仓库 'origin'"
        return
    fi

    git push origin --tags

    if [ $? -eq 0 ]; then
        log_success "标签推送成功"
    else
        log_error "标签推送失败"
    fi
}

# 检出标签版本
checkout_tag() {
    local tag="$1"

    if [ -z "$tag" ]; then
        echo "可用标签:"
        git tag -l --sort=-version:refname
        echo ""
        echo "请输入要检出的标签名："
        read -r tag
    fi

    if ! git tag -l | grep -q "^$tag$"; then
        log_error "标签 '$tag' 不存在"
        exit 1
    fi

    log_warning "检出标签将进入分离头指针状态，确定继续？(y/N)"
    read -r confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        git checkout "$tag"
        log_success "已检出标签: $tag"
        log_warning "当前处于分离头指针状态"
    else
        log_info "操作已取消"
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
Git标签管理脚本 - 用法说明

用法: $0 [命令] [选项]

命令:
  create [类型] [版本号] [说明]  - 创建标签
  list                         - 列出所有标签
  delete [标签名]              - 删除标签
  push                         - 推送标签到远程
  checkout [标签名]            - 检出标签版本
  help                         - 显示此帮助

标签类型:
  1|major   - 主版本更新 (x.0.0)
  2|minor   - 次版本更新 (x.y.0)
  3|patch   - 补丁更新 (x.y.z)
  4|stable  - 稳定版本 (x.y.z-stable)
  5|beta    - 测试版本 (x.y.z-beta)
  6|alpha   - 内测版本 (x.y.z-alpha)

示例:
  $0 create major              # 创建主版本标签
  $0 create stable v1.0.0      # 创建指定版本的稳定标签
  $0 create patch "" "修复登录bug"  # 创建补丁标签并指定说明
  $0 list                      # 列出所有标签
  $0 delete v0.1.0-beta        # 删除指定标签
  $0 push                      # 推送标签到远程

版本命名规范:
  - 主版本: v1.0.0, v2.0.0
  - 次版本: v1.1.0, v1.2.0
  - 补丁版本: v1.0.1, v1.0.2
  - 稳定版: v1.0.0-stable
  - 测试版: v1.0.0-beta
  - 内测版: v1.0.0-alpha
EOF
}

# 交互式标签创建
interactive_create() {
    echo "========================================"
    echo "交互式标签创建"
    echo "========================================"

    echo "选择标签类型:"
    echo "1. 主版本更新 (Major)"
    echo "2. 次版本更新 (Minor)"
    echo "3. 补丁更新 (Patch)"
    echo "4. 稳定版本 (Stable)"
    echo "5. 测试版本 (Beta)"
    echo "6. 内测版本 (Alpha)"
    echo ""
    echo -n "请选择 (1-6): "
    read -r choice

    get_version_info "$choice"
    echo ""

    local version=$(generate_version "$choice")
    echo "建议版本号: $version"
    echo -n "使用建议版本号？(Y/n): "
    read -r use_suggested

    if [[ ! "$use_suggested" =~ ^[Nn]$ ]]; then
        local final_version="$version"
    else
        echo -n "请输入自定义版本号: "
        read -r final_version
    fi

    echo -n "请输入标签说明: "
    read -r tag_message

    echo ""
    echo "标签信息确认:"
    echo "  版本号: $final_version"
    echo "  说明: $tag_message"
    echo ""
    echo -n "确认创建？(y/N): "
    read -r confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        create_tag "$final_version" "$tag_message"
    else
        log_info "操作已取消"
    fi
}

# 主函数
main() {
    local command="$1"
    local param1="$2"
    local param2="$3"
    local param3="$4"

    case "$command" in
        "create")
            check_git_repo
            if [ -z "$param1" ]; then
                interactive_create
            else
                local version=$(generate_version "$param1" "$param2")
                create_tag "$version" "$param3"
            fi
            ;;
        "list")
            list_tags
            ;;
        "delete")
            check_git_repo
            delete_tag "$param1"
            ;;
        "push")
            check_git_repo
            push_tags
            ;;
        "checkout")
            check_git_repo
            checkout_tag "$param1"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "")
            interactive_create
            ;;
        *)
            log_error "未知命令: $command"
            echo "使用 '$0 help' 查看帮助信息"
            exit 1
            ;;
    esac
}

# 脚本入口
main "$@"