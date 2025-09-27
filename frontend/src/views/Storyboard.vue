<template>
  <div class="storyboard">
    <el-row :gutter="20">
      <!-- 输入区域 -->
      <el-col :span="10">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>分镜脚本生成器</span>
            </div>
          </template>

          <el-form :model="form" label-width="100px">
            <el-form-item label="脚本类型">
              <el-select v-model="form.selectedType" placeholder="请选择脚本类型" style="width: 100%">
                <el-option
                  v-for="type in storyboardTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item>
              <template #label>
                <div class="form-label-with-action">
                  <span>文案内容</span>
                  <el-button
                    size="small"
                    type="primary"
                    text
                    @click="showFavoriteSelector = true"
                    title="从收藏中选择文案"
                  >
                    <el-icon><Star /></el-icon>
                    从收藏选择
                  </el-button>
                </div>
              </template>
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="8"
                placeholder="请粘贴需要生成分镜脚本的文案内容..."
                maxlength="2000"
                show-word-limit
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="generateStoryboard"
                :loading="loading"
                :disabled="!form.content || !form.selectedType"
                style="width: 100%"
                size="large"
              >
                <el-icon><Plus /></el-icon>
                生成分镜脚本
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 结果区域 -->
      <el-col :span="14">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>分镜脚本结果</span>
              <div class="header-actions" v-if="currentResult.storyboard">
                <el-button size="small" @click="copyStoryboard" :icon="CopyDocument">
                  复制脚本
                </el-button>
                <el-button size="small" @click="downloadStoryboard" :icon="Download">
                  下载脚本
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="!currentResult.storyboard" class="empty-result">
            <el-empty description="请输入文案内容并选择脚本类型，然后点击生成分镜脚本" />
          </div>

          <div v-else class="storyboard-container">
            <div class="storyboard-info">
              <el-tag type="success">{{ getTypeName(currentResult.type) }}</el-tag>
              <span class="content-preview">{{ currentResult.originalContent.substring(0, 50) }}...</span>
              <el-tag v-if="isGenerating" type="info" class="generating-tag">
                <el-icon class="is-loading"><Loading /></el-icon>
                正在生成...
              </el-tag>
            </div>

            <div class="storyboard-content">
              <div class="storyboard-text" v-html="formatStoryboardContent(currentResult.storyboard)"></div>
              <div v-if="isGenerating && !currentResult.storyboard" class="generating-placeholder">
                <el-skeleton :rows="8" animated />
                <div class="generating-tip">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  AI正在为您生成详细的分镜脚本，请稍候...
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 收藏文案选择对话框 -->
    <el-dialog
      v-model="showFavoriteSelector"
      title="选择收藏的文案"
      width="800px"
      :before-close="closeFavoriteSelector"
    >
      <div v-if="favoriteContents.length === 0" class="empty-favorites">
        <el-empty description="暂无收藏的文案">
          <el-button type="primary" @click="$router.push('/simple')">去生成文案</el-button>
        </el-empty>
      </div>
      <div v-else class="favorites-list">
        <div
          v-for="item in favoriteContents"
          :key="item.id"
          class="favorite-item"
          @click="selectFavoriteContent(item.content)"
        >
          <div class="favorite-meta">
            <el-tag size="small" type="info">{{ item.contentType }} - {{ item.industry }}</el-tag>
            <span class="favorite-time">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="favorite-content">
            {{ item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content }}
          </div>
          <div class="favorite-details">
            <span class="favorite-topic">选题：{{ item.topic || '无' }}</span>
            <span class="favorite-hook">钩子：{{ item.hook || '无' }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Download, Plus, Loading, Star } from '@element-plus/icons-vue'
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'

export default {
  name: 'Storyboard',
  setup() {
    const loading = ref(false)
    const isGenerating = ref(false)
    const showFavoriteSelector = ref(false)
    const favoriteContents = ref([])

    const form = reactive({
      content: '',
      selectedType: ''
    })

    const currentResult = reactive({
      storyboard: '',
      type: '',
      originalContent: ''
    })

    const storyboardTypes = ref([])

    const getTypeName = (type) => {
      const typeObj = storyboardTypes.value.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    }

    const loadStoryboardTypes = async () => {
      try {
        const response = await axios.get('/api/storyboards')
        storyboardTypes.value = response.data.map(item => ({
          value: item.type,
          label: item.name
        }))
      } catch (error) {
        console.error('加载分镜脚本类型失败:', error)
        ElMessage.error('加载分镜脚本类型失败')
      }
    }

    // 加载收藏的文案
    const loadFavoriteContents = () => {
      try {
        const favorites = localStorage.getItem('myFavorites')
        if (favorites) {
          const parsedFavorites = JSON.parse(favorites)
          favoriteContents.value = parsedFavorites.contents || []
        }
      } catch (error) {
        console.error('加载收藏文案失败:', error)
      }
    }

    // 选择收藏的文案
    const selectFavoriteContent = (content) => {
      form.content = content
      showFavoriteSelector.value = false
      ElMessage.success('文案已填入')
    }

    // 关闭收藏选择对话框
    const closeFavoriteSelector = () => {
      showFavoriteSelector.value = false
    }

    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const generateStoryboard = async () => {
      if (!form.content || !form.selectedType) {
        ElMessage.warning('请输入文案内容并选择脚本类型')
        return
      }

      loading.value = true
      isGenerating.value = true

      // 重置结果
      currentResult.storyboard = ''
      currentResult.type = form.selectedType
      currentResult.originalContent = form.content

      try {
        // 使用fetch进行流式请求
        const response = await fetch('/api/generate-storyboard-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: form.selectedType,
            content: form.content
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()

              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                  const dataStr = line.slice(6)

                  if (dataStr.trim() === '[DONE]') {
                    isGenerating.value = false
                    loading.value = false
                    return
                  }

                  try {
                    const data = JSON.parse(dataStr)

                    if (data.type === 'chunk') {
                      // 追加流式内容
                      currentResult.storyboard += data.content
                    } else if (data.type === 'complete') {
                      // 生成完成
                      isGenerating.value = false
                      loading.value = false
                      ElMessage.success('分镜脚本生成完成！')
                      return
                    } else if (data.type === 'error') {
                      // 错误处理
                      isGenerating.value = false
                      loading.value = false
                      ElMessage.error(data.error || '生成失败')
                      return
                    }
                  } catch (parseError) {
                    console.error('解析流数据失败:', parseError)
                  }
                }
              }
            }
          } catch (streamError) {
            console.error('读取流数据失败:', streamError)
            isGenerating.value = false
            loading.value = false
            ElMessage.error('数据流中断，请重试')
          }
        }

        processStream()

        // 120秒超时处理 - 给后端足够时间
        setTimeout(() => {
          if (isGenerating.value) {
            isGenerating.value = false
            loading.value = false
            ElMessage.error('生成超时，请重试')
          }
        }, 120000)

      } catch (error) {
        console.error('生成分镜脚本失败:', error)
        isGenerating.value = false
        loading.value = false
        ElMessage.error('生成分镜脚本失败，请检查网络连接')
      }
    }

    const copyStoryboard = async () => {
      try {
        await navigator.clipboard.writeText(currentResult.storyboard)
        ElMessage.success('分镜脚本已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = currentResult.storyboard
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('分镜脚本已复制到剪贴板')
      }
    }

    const downloadStoryboard = () => {
      if (!currentResult.storyboard) {
        ElMessage.warning('没有可下载的分镜脚本')
        return
      }

      // 检查是否为表格格式
      const storyboardContent = currentResult.storyboard
      const isTable = storyboardContent.includes('| 镜头号') || storyboardContent.includes('|镜头号') ||
                      storyboardContent.includes('| 第1镜') || storyboardContent.includes('|第1镜') ||
                      (storyboardContent.includes('|') && storyboardContent.includes('镜头') && storyboardContent.includes('场景'))

      if (isTable) {
        // 解析表格数据并生成XLSX格式
        try {
          const tableData = parseTableData(storyboardContent)
          if (tableData.length > 0) {
            // 创建工作簿
            const wb = XLSX.utils.book_new()

            // 创建工作表
            const ws = XLSX.utils.aoa_to_sheet(tableData)

            // 设置列宽（调整为更合理的宽度）
            const colWidths = []
            if (tableData[0]) {
              for (let i = 0; i < tableData[0].length; i++) {
                let maxWidth = 12  // 基础宽度

                // 根据列的位置设置不同的宽度策略
                if (i === 0) {
                  // 第一列（通常是镜头号）：较窄
                  maxWidth = 8
                } else {
                  // 其他列（场景、运镜、画面描述等）：适中宽度
                  maxWidth = 18

                  // 计算内容长度进行微调
                  for (let j = 0; j < tableData.length; j++) {
                    if (tableData[j][i]) {
                      const cellLength = tableData[j][i].toString().length
                      if (cellLength > 30) {
                        maxWidth = Math.min(maxWidth * 1.3, 25) // 长内容稍微增加宽度，但不超过25
                      }
                    }
                  }
                }

                colWidths.push({ wch: maxWidth })
              }
            }
            ws['!cols'] = colWidths

            // 设置行高（大幅增加行高以适应多行内容）
            const rowHeights = []
            for (let i = 0; i < tableData.length; i++) {
              let height
              if (i === 0) {
                // 表头行
                height = 35
              } else {
                // 数据行：根据内容长度动态计算行高
                let maxContentLength = 0
                for (let j = 0; j < tableData[i].length; j++) {
                  if (tableData[i][j]) {
                    const contentLength = tableData[i][j].toString().length
                    maxContentLength = Math.max(maxContentLength, contentLength)
                  }
                }
                // 基础高度50，内容长度超过30字符时增加高度
                height = maxContentLength > 30 ?
                         Math.min(50 + Math.floor(maxContentLength / 20) * 15, 120) : 50
              }
              rowHeights.push({ hpt: height })
            }
            ws['!rows'] = rowHeights

            // 设置单元格样式
            const range = XLSX.utils.decode_range(ws['!ref'])
            for (let row = range.s.r; row <= range.e.r; row++) {
              for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
                if (!ws[cellAddress]) continue

                // 基础样式：边框 + 对齐 + 自动换行
                let cellStyle = {
                  border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                  },
                  alignment: {
                    vertical: 'center',
                    horizontal: 'left',
                    wrapText: true  // 自动换行
                  },
                  font: {
                    name: 'Microsoft YaHei',
                    sz: 11,
                    color: { rgb: '000000' }
                  }
                }

                // 表头样式（第一行）
                if (row === 0) {
                  cellStyle = {
                    ...cellStyle,
                    fill: {
                      patternType: 'solid',
                      fgColor: { rgb: '409EFF' },
                      bgColor: { rgb: '409EFF' }
                    },
                    font: {
                      name: 'Microsoft YaHei',
                      sz: 12,
                      bold: true,
                      color: { rgb: 'FFFFFF' }
                    },
                    alignment: {
                      ...cellStyle.alignment,
                      horizontal: 'center'
                    }
                  }
                }

                // 应用样式
                ws[cellAddress].s = cellStyle
              }
            }

            // 设置打印选项
            ws['!printHeader'] = [tableData[0]] // 设置打印时重复表头
            ws['!margins'] = {
              left: 0.7,
              right: 0.7,
              top: 0.75,
              bottom: 0.75,
              header: 0.3,
              footer: 0.3
            }

            // 添加工作表到工作簿
            XLSX.utils.book_append_sheet(wb, ws, '分镜脚本')

            // 设置工作簿属性
            wb.Props = {
              Title: `${getTypeName(currentResult.type)}分镜脚本`,
              Subject: '分镜脚本',
              Author: '分镜脚本生成器',
              CreatedDate: new Date()
            }

            // 下载XLSX文件
            const fileName = `${getTypeName(currentResult.type)}_分镜脚本_${new Date().toISOString().slice(0, 10)}.xlsx`
            XLSX.writeFile(wb, fileName)
            ElMessage.success('分镜脚本XLSX文件下载成功')
          } else {
            throw new Error('表格数据解析失败')
          }
        } catch (error) {
          console.error('XLSX生成失败:', error)
          // 降级到HTML格式
          downloadAsHtml()
        }
      } else {
        // 原有的纯文本格式下载
        const content = `${getTypeName(currentResult.type)}分镜脚本\n\n原文案：\n${currentResult.originalContent}\n\n分镜脚本：\n${currentResult.storyboard}`
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${getTypeName(currentResult.type)}_分镜脚本_${new Date().toISOString().slice(0, 10)}.txt`
        link.click()
        ElMessage.success('分镜脚本TXT文件下载成功')
      }
    }

    // 解析表格数据
    const parseTableData = (content) => {
      const lines = content.split('\n')
      const tableData = []
      let headerProcessed = false

      for (let line of lines) {
        line = line.trim()

        // 跳过空行和非表格行
        if (!line || !line.includes('|')) continue

        // 跳过分隔符行
        if (line.includes('---') || line.includes(':---')) continue

        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')

        if (cells.length >= 2) {
          const isHeader = !headerProcessed && (
            cells.some(cell => cell.includes('镜头') || cell.includes('场景') ||
                              cell.includes('运镜') || cell.includes('画面') ||
                              cell.includes('台词') || cell.includes('时间'))
          )

          let transformedCells = cells.map(cell =>
            cell.replace(/\*+/g, '').replace(/#+/g, '').trim()
          )

          if (isHeader) {
            // 转换表头为新格式
            transformedCells = ['时间轴 (秒)', '文案 (配音)', '画面分镜描述', '景别', '镜头运动/特效', '备注/道具']
            headerProcessed = true
          } else {
            // 转换数据行为新格式
            // 原始格式：[镜头号, 场景描述, 镜头类型/运镜, 画面内容/动作, 台词/音效, 时间（秒）]
            // 新格式：[时间轴 (秒), 文案 (配音), 画面分镜描述, 景别, 镜头运动/特效, 备注/道具]

            // 确保有足够的列，不足的用空字符串填充
            while (transformedCells.length < 6) {
              transformedCells.push('')
            }

            const timeValue = transformedCells[5] ? `${transformedCells[5]}` : '' // 时间（秒）
            const scriptValue = transformedCells[4] ? transformedCells[4].replace(/<br>/g, ' ').replace(/\*\*/g, '') : '' // 台词/音效，清理HTML标签
            const sceneDescription = `${transformedCells[1] || ''} - ${transformedCells[3] || ''}`.trim() // 场景描述 + 画面内容/动作
            const shotType = extractShotType(transformedCells[2] || '') // 从镜头类型/运镜中提取景别
            const cameraMovement = extractCameraMovement(transformedCells[2] || '') // 从镜头类型/运镜中提取镜头运动
            const notes = transformedCells[1] || '' // 场景描述作为备注

            transformedCells = [
              timeValue,
              scriptValue,
              sceneDescription,
              shotType,
              cameraMovement,
              notes
            ]
          }

          tableData.push(transformedCells)
        }
      }

      return tableData
    }

    // HTML格式下载（作为XLSX的降级方案）
    const downloadAsHtml = () => {
      const formattedContent = formatStoryboardContent(currentResult.storyboard)
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${getTypeName(currentResult.type)}分镜脚本</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; }
    .original-content { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .storyboard-table table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 2px solid #409eff;
      background: white;
    }
    .storyboard-table th, .storyboard-table td {
      padding: 12px 8px;
      text-align: left;
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
    }
    .storyboard-table th:last-child, .storyboard-table td:last-child {
      border-right: none;
    }
    .storyboard-table tr:last-child td {
      border-bottom: none;
    }
    .table-header th {
      background-color: #409eff;
      color: white;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${getTypeName(currentResult.type)}分镜脚本</h1>
  <h2>原文案：</h2>
  <div class="original-content">${currentResult.originalContent}</div>
  <h2>分镜脚本：</h2>
  ${formattedContent}
</body>
</html>`
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${getTypeName(currentResult.type)}_分镜脚本_${new Date().toISOString().slice(0, 10)}.html`
      link.click()
      ElMessage.success('分镜脚本HTML文件下载成功')
    }

    // 格式化分镜脚本内容，智能检测并优化表格显示
    const formatStoryboardContent = (content) => {
      if (!content) return ''

      console.log('=== 开始格式化内容 ===')
      console.log('原始内容长度:', content.length)

      // 简化方法：直接检测是否包含表格特征
      const hasTable = content.includes('| 镜头号') || content.includes('|镜头号') ||
                       content.includes('| 第1镜') || content.includes('|第1镜') ||
                       (content.includes('|') && content.includes('镜头') && content.includes('场景'))

      console.log('是否检测到表格特征:', hasTable)
      console.log('内容包含 |:', content.includes('|'))
      console.log('内容包含 镜头:', content.includes('镜头'))
      console.log('内容包含 场景:', content.includes('场景'))

      if (hasTable) {
        console.log('使用表格渲染模式')
        return renderAsTable(content)
      } else {
        console.log('使用普通文本渲染模式')
        return renderAsText(content)
      }
    }

    // 提取景别信息
    const extractShotType = (cameraInfo) => {
      // 清理HTML标签和Markdown格式
      const cleanInfo = cameraInfo.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim()
      const shotTypes = ['大远景', '远景', '全景', '中景', '近景', '特写', '大特写']

      for (let type of shotTypes) {
        if (cleanInfo.includes(type)) {
          return type
        }
      }

      // 如果没有找到具体景别，尝试从描述中提取第一个词
      const parts = cleanInfo.split(/[，,、]/)[0]
      return parts || '中景'
    }

    // 提取镜头运动信息
    const extractCameraMovement = (cameraInfo) => {
      // 清理HTML标签和Markdown格式
      const cleanInfo = cameraInfo.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim()
      const movements = ['快速推进', '推进', '拉开', '摇移', '跟拍', '跟随', '环绕', '升降', '快速切镜', '切换', '淡入', '淡出', '手持晃动', '固定镜头', '慢动作']

      for (let movement of movements) {
        if (cleanInfo.includes(movement)) {
          return movement
        }
      }

      // 如果包含逗号，取后面的部分作为运动信息
      if (cleanInfo.includes('，')) {
        const parts = cleanInfo.split('，')
        if (parts.length > 1) {
          return parts.slice(1).join('，').trim()
        }
      } else if (cleanInfo.includes(',')) {
        const parts = cleanInfo.split(',')
        if (parts.length > 1) {
          return parts.slice(1).join(',').trim()
        }
      }

      return cleanInfo
    }

    // 表格渲染函数
    const renderAsTable = (content) => {
      console.log('开始渲染表格，原始内容:', content.substring(0, 200))
      const lines = content.split('\n')
      let tableHtml = '<div class="storyboard-table"><table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 2px solid #409eff; background: white;"><tbody>'
      let headerProcessed = false
      let totalRows = 0

      for (let line of lines) {
        line = line.trim()

        // 跳过空行和非表格行
        if (!line || !line.includes('|')) {
          console.log('跳过非表格行:', line.substring(0, 50))
          continue
        }

        // 跳过分隔符行（包含 --- 或 :--- 等）
        if (line.includes('---') || line.includes(':---')) {
          console.log('跳过分隔符行:', line)
          continue
        }

        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')

        if (cells.length >= 2) {
          const isHeader = !headerProcessed && (
            cells.some(cell => cell.includes('镜头') || cell.includes('场景') ||
                              cell.includes('运镜') || cell.includes('画面') ||
                              cell.includes('台词') || cell.includes('时间'))
          )

          let transformedCells = cells

          if (isHeader) {
            // 转换表头为新格式
            transformedCells = ['时间轴 (秒)', '文案 (配音)', '画面分镜描述', '景别', '镜头运动/特效', '备注/道具']
            tableHtml += '<tr class="table-header">'
            headerProcessed = true
            console.log('创建表头行，转换为新格式')
          } else {
            // 转换数据行为新格式
            // 原始格式：[镜头号, 场景描述, 镜头类型/运镜, 画面内容/动作, 台词/音效, 时间（秒）]
            // 新格式：[时间轴 (秒), 文案 (配音), 画面分镜描述, 景别, 镜头运动/特效, 备注/道具]

            // 确保有足够的列，不足的用空字符串填充
            while (cells.length < 6) {
              cells.push('')
            }

            const timeValue = cells[5] ? `${cells[5]}` : '' // 时间（秒）
            const scriptValue = cells[4] ? cells[4].replace(/<br>/g, ' ').replace(/\*\*/g, '') : '' // 台词/音效，清理HTML标签
            const sceneDescription = `${cells[1] || ''} - ${cells[3] || ''}`.trim() // 场景描述 + 画面内容/动作
            const shotType = extractShotType(cells[2] || '') // 从镜头类型/运镜中提取景别
            const cameraMovement = extractCameraMovement(cells[2] || '') // 从镜头类型/运镜中提取镜头运动
            const notes = cells[1] || '' // 场景描述作为备注

            transformedCells = [
              timeValue,
              scriptValue,
              sceneDescription,
              shotType,
              cameraMovement,
              notes
            ]

            tableHtml += '<tr>'
            console.log('创建数据行，转换为新格式:', transformedCells)
          }

          transformedCells.forEach(cell => {
            const cleanCell = cell.replace(/\*+/g, '').trim()
            const tag = isHeader ? 'th' : 'td'
            const cellStyle = isHeader
              ? 'style="border: 1px solid #000; padding: 12px 8px; background: repeating-linear-gradient(45deg, #000 0px, #000 10px, #fff 10px, #fff 20px) !important; color: #000 !important; font-weight: bold; text-align: center; text-shadow: 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff;"'
              : 'style="border: 1px solid #ddd; padding: 12px 8px; background: white; color: #303133;"'
            tableHtml += `<${tag} ${cellStyle}>${cleanCell}</${tag}>`
          })

          tableHtml += '</tr>'
          totalRows++
        }
      }

      tableHtml += '</tbody></table></div>'
      console.log('表格渲染完成，总行数:', totalRows)
      console.log('生成的HTML长度:', tableHtml.length)

      // 添加其他非表格内容
      const otherContent = lines
        .filter(line => line.trim() && !line.includes('|'))
        .map(line => `<div class="text-line">${line.trim()}</div>`)
        .join('')

      return tableHtml + otherContent
    }

    // 普通文本渲染函数
    const renderAsText = (content) => {
      return content.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
          // 处理标题
          if (line.includes('分镜') || line.includes('脚本') || line.startsWith('#')) {
            return `<h3 class="storyboard-heading">${line.replace(/^#+\s*/, '')}</h3>`
          }
          return `<div class="text-line">${line}</div>`
        })
        .join('')
    }

    // 组件挂载时加载分镜脚本类型和收藏数据
    loadStoryboardTypes()
    loadFavoriteContents()

    // 监听收藏对话框开启时重新加载数据
    const handleShowFavoriteSelector = () => {
      loadFavoriteContents()
      showFavoriteSelector.value = true
    }

    return {
      loading,
      isGenerating,
      form,
      currentResult,
      storyboardTypes,
      showFavoriteSelector,
      favoriteContents,
      getTypeName,
      generateStoryboard,
      copyStoryboard,
      downloadStoryboard,
      formatStoryboardContent,
      selectFavoriteContent,
      closeFavoriteSelector,
      formatDate,
      CopyDocument,
      Download,
      Plus,
      Loading,
      Star
    }
  }
}
</script>

<style scoped>
.storyboard {
  max-width: 1400px;
  margin: 0 auto;
}

.input-card, .result-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.empty-result {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.storyboard-container {
  max-height: 600px;
  overflow-y: auto;
}

.storyboard-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.content-preview {
  color: #666;
  font-size: 12px;
}

/* 表单标签与操作按钮布局 */
.form-label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.form-label-with-action span {
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-label-with-action .el-button {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  transition: var(--transition-base);
}

.form-label-with-action .el-button:hover {
  background: var(--color-accent-primary-light);
  transform: translateY(-1px);
}

/* 竖屏优化 - 针对竖屏设备的布局优化 */
@media (orientation: portrait) and (max-aspect-ratio: 4/5) {
  .storyboard {
    padding: 10px;
  }

  .storyboard .el-row {
    flex-direction: column !important;
    margin: 0 !important;
  }

  .storyboard .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 15px;
    padding: 0 !important;
  }

  .storyboard .el-card {
    margin: 0;
    width: 100%;
  }

  .form-label-with-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .form-label-with-action .el-button {
    align-self: flex-end;
    font-size: 11px;
    padding: 3px 8px;
  }

  .card-header {
    font-size: 14px;
  }

  .el-form-item__label {
    font-size: 13px !important;
  }

  .storyboard-container {
    max-height: 400px;
  }
}


/* 表格容器样式 - 提供完整的表格框架 */
.storyboard-table {
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
  border: 1px solid #e1e8ed;
}

/* 标准HTML表格样式 - 使用更具体的选择器 */
.storyboard-text .storyboard-table table {
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 14px !important;
  border: 2px solid #409eff !important;
  background-color: #fff !important;
}

.storyboard-text .storyboard-table th,
.storyboard-text .storyboard-table td {
  padding: 12px 8px !important;
  text-align: left !important;
  border: 1px solid #409eff !important;
  vertical-align: top !important;
  word-wrap: break-word !important;
  background-color: #fff !important;
  box-sizing: border-box !important;
}

.storyboard-text .storyboard-table th {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%) !important;
  color: white !important;
  font-weight: bold !important;
  font-size: 13px !important;
}

.storyboard-table tr:hover {
  background-color: #f5f7fa;
}

.storyboard-table td {
  max-width: 200px;
  min-width: 80px;
}

/* 表格列特定样式 */
.storyboard-table td:first-child {
  font-weight: bold;
  text-align: center;
  min-width: 60px;
  background-color: #fafafa;
}

.storyboard-table td:nth-child(6) {
  text-align: center;
  font-weight: bold;
  color: #409eff;
}

/* 表格样式重构 - 智能自适应表格 */
.table-row {
  display: flex;
  background-color: #ebeef5;
  margin-bottom: 1px;
  min-height: 45px;
  align-items: stretch;
  gap: 1px;
}

.table-row.table-header {
  background-color: #409eff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-row:first-child {
  background-color: #409eff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-row:first-child .table-cell {
  background-color: #409eff;
  color: white;
  font-weight: bold;
  text-align: center;
}

.table-row:nth-child(even) {
  background-color: #f0f9ff;
}

.table-row:nth-child(odd) {
  background-color: #ffffff;
}

/* 表格单元格样式 - 动态自适应 */
.table-cell {
  flex: 1;
  background-color: #ffffff;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  min-width: 0;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
  border-right: 1px solid #eee;
}

.table-cell:last-child {
  border-right: none;
}

.table-header .table-cell {
  background-color: #409eff;
  color: white;
  font-weight: bold;
  justify-content: center;
}

/* 表头单元格特殊样式 */
.header-cell {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%) !important;
  color: white !important;
  font-weight: bold !important;
  text-align: center;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 表格行悬停效果 */
.storyboard-table .table-row:not(.table-header):hover {
  background-color: rgba(64, 158, 255, 0.1);
  transition: background-color 0.2s ease;
}

/* 根据列位置调整样式 */
.table-cell-1 {
  flex: 0 0 80px;
  justify-content: center;
  font-weight: bold;
  background-color: #f5f7fa;
}

.table-cell-2,
.table-cell-3 {
  flex: 0 0 120px;
  justify-content: center;
  font-weight: 500;
}

.table-cell-4,
.table-cell-5 {
  flex: 2;
  text-align: left;
  padding-left: 12px;
}

.table-cell-6,
.table-cell-7 {
  flex: 0 0 100px;
  justify-content: center;
  font-size: 12px;
}

/* 当单元格数量较少时自动调整 */
.table-row:has(.table-cell:nth-child(3):last-child) .table-cell {
  flex: 1;
}

.table-row:has(.table-cell:nth-child(4):last-child) .table-cell {
  flex: 1;
}

.table-row:has(.table-cell:nth-child(5):last-child) .table-cell {
  flex: 1;
}

/* 标题样式 */
.storyboard-heading {
  color: #409eff;
  margin: 20px 0 10px 0;
  font-weight: bold;
}

/* 文本行样式 */
.text-line {
  margin: 8px 0;
  line-height: 1.8;
  padding: 8px 12px;
  background-color: #fafbfc;
  border-left: 3px solid #e1e8ed;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.text-line:hover {
  background-color: #f0f9ff;
  border-left-color: #409eff;
}

.line-break {
  margin: 16px 0;
  height: 1px;
  background-color: #eee;
}

/* 分镜脚本容器改进 */
.storyboard-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.storyboard-text {
  font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  max-width: 100%;
  overflow-x: auto;
}

.storyboard-content:hover {
  background-color: #f0f9ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.generating-tag {
  margin-left: 10px;
}

.generating-placeholder {
  padding: 20px 0;
  text-align: center;
}

.generating-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  color: #409eff;
  font-size: 14px;
}

.generating-tip .el-icon {
  margin-right: 8px;
}

.storyboard-content {
  position: relative;
  min-height: 200px;
}

/* 文案输入容器样式 */
.content-input-container {
  position: relative;
}

.input-action-buttons {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.input-action-buttons .el-button {
  margin-left: 5px;
}

/* 收藏选择对话框样式 */
.empty-favorites {
  text-align: center;
  padding: 40px 20px;
}

.favorites-list {
  max-height: 500px;
  overflow-y: auto;
}

.favorite-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.favorite-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.favorite-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.favorite-time {
  color: #999;
  font-size: 12px;
}

.favorite-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 10px;
  word-break: break-word;
}

.favorite-details {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.favorite-topic, .favorite-hook {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .storyboard .el-row {
    flex-direction: column;
  }

  .storyboard .el-col {
    width: 100% !important;
  }

  .input-action-buttons {
    position: static;
    margin-top: 10px;
    text-align: right;
  }

  .favorite-details {
    flex-direction: column;
    gap: 5px;
  }
}
</style>