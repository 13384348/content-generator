#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# 读取文件
with open('frontend/src/views/ContentGenerator.vue', 'r', encoding='utf-8') as f:
    content = f.read()

print("开始删除批量功能...")

# 删除批量控件的HTML部分
batch_controls_patterns = [
    # 选题的批量控件
    r'            <div class="batch-controls">\s*<div class="batch-option">\s*<el-checkbox v-model="batchMode\.topics"[^>]*>\s*批量生成\s*</el-checkbox>\s*<el-select[^>]*v-if="batchMode\.topics"[^>]*>.*?</el-select>\s*</div>\s*</div>',
    # 钩子的批量控件
    r'            <div class="batch-controls">\s*<div class="batch-option">\s*<el-checkbox v-model="batchMode\.hooks"[^>]*>\s*批量生成\s*</el-checkbox>\s*<el-select[^>]*v-if="batchMode\.hooks"[^>]*>.*?</el-select>\s*</div>\s*</div>',
    # 文案的批量控件
    r'            <div class="batch-controls">\s*<div class="batch-option">\s*<el-checkbox v-model="batchMode\.content"[^>]*>\s*批量生成\s*</el-checkbox>\s*<el-select[^>]*v-if="batchMode\.content"[^>]*>.*?</el-select>\s*</div>\s*</div>',
]

# 删除批量相关的显示逻辑
display_patterns = [
    # 按钮文本中的批量逻辑
    r"{{ loading\.topics \? '正在生成选题\.\.\.' : batchMode\.topics \? `生成\$\{batchCount\.topics\}条选题` : '生成选题' }}",
    r"{{ loading\.hooks \? '正在生成钩子\.\.\.' : batchMode\.hooks \? `生成\$\{batchCount\.hooks\}条钩子` : '生成钩子' }}",
    r"{{ loading\.content \? '正在生成文案\.\.\.' : batchMode\.content \? `生成\$\{batchCount\.content\}条文案` : '一键选题钩子生文案' }}",
    # 条件显示
    r'v-if="stepData\.step4\.content && !batchMode\.content"',
    r'v-if="stepData\.step4\.contents && stepData\.step4\.contents\.length > 0 && batchMode\.content"',
    # 批量内容显示区域
    r'            <!-- 批量文案显示 -->\s*<div[^>]*class="batch-content-preview"[^>]*>.*?</div>',
]

# 删除JavaScript中的批量相关变量和函数
js_patterns = [
    # 批量状态变量
    r'    // Batch generation states\s*const batchMode = reactive\(\{[^}]*\}\)\s*',
    r'    const batchCount = reactive\(\{[^}]*\}\)\s*',
    r'    const batchOptions = \[[^\]]*\]\s*',
    # 批量模式变化处理函数
    r'    // 批量模式变化处理\s*const onBatchModeChange = \(type\) => \{[^}]*\}\s*',
    # 生成函数中的批量逻辑
    r'        // 如果是批量模式，添加数量参数\s*if \(batchMode\.[^}]*\}\s*',
    r'      // 根据批量模式初始化数据结构\s*if \(batchMode\.content\) \{[^}]*\}\s*',
    # 批量处理逻辑
    r'                if \(batchMode\.content\) \{[^}]*\} else if \(data\.type === \'batch_complete\'\) \{[^}]*\}',
    # 选择和复制函数
    r'    // 选择批量文案中的一条[^}]*\}\s*',
    r'    // 复制单条文案（用于批量模式）[^}]*\}\s*',
    # return语句中的批量相关项
    r'      // Batch generation\s*batchMode,\s*batchCount,\s*batchOptions,\s*onBatchModeChange,\s*',
]

# 删除CSS样式
css_patterns = [
    r'/\* 批量控制样式 \*/\s*\.batch-controls \{[^}]*\}\s*',
    r'\.batch-option \{[^}]*\}\s*',
    r'\.batch-option \.el-checkbox \{[^}]*\}\s*',
    r'/\* 批量内容选项样式 \*/\s*\.batch-content-preview \{[^}]*\}\s*',
    r'\.batch-content-actions \{[^}]*\}\s*',
    r'/\* 批量内容响应式调整 \*/\s*@media[^{]*\{\s*\.batch-controls[^}]*\}\s*\.batch-option[^}]*\}\s*\}',
]

# 应用所有删除模式
for pattern in batch_controls_patterns + display_patterns + js_patterns + css_patterns:
    content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE)

# 手动删除一些复杂的部分
lines = content.split('\n')
filtered_lines = []
skip_until = None
batch_content_start = False

i = 0
while i < len(lines):
    line = lines[i]

    # 跳过批量内容显示区域
    if '<!-- 批量文案显示 -->' in line:
        batch_content_start = True
        # 跳过整个批量内容区域直到找到对应的结束div
        depth = 0
        i += 1
        while i < len(lines):
            if '<div' in lines[i]:
                depth += 1
            if '</div>' in lines[i]:
                if depth == 0:
                    break
                depth -= 1
            i += 1
        i += 1
        continue

    # 跳过批量控件
    if 'batch-controls' in line:
        # 跳过整个批量控件区域
        depth = 0
        while i < len(lines):
            if '<div' in lines[i]:
                depth += 1
            if '</div>' in lines[i]:
                if depth == 1:  # 找到对应的结束div
                    break
                depth -= 1
            i += 1
        i += 1
        continue

    # 跳过包含批量相关内容的行
    if any(keyword in line for keyword in ['batchMode', 'batchCount', 'batchOptions', 'batch_chunk', 'batch_complete', '批量']):
        i += 1
        continue

    filtered_lines.append(line)
    i += 1

# 重新组合内容
content = '\n'.join(filtered_lines)

# 清理多余的空行
content = re.sub(r'\n{3,}', '\n\n', content)

# 写回文件
with open('frontend/src/views/ContentGenerator.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 批量功能删除完成！")