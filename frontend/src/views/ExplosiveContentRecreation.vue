<template>
  <div class="explosive-recreation-container">
    <div class="header-section">
      <div class="title-section">
        <el-icon class="title-icon"><DocumentCopy /></el-icon>
        <h1>爆款文案二创工具</h1>
        <p class="subtitle">基于原文案进行智能改写，生成符合平台特色的二创内容</p>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧输入区域 -->
      <el-col :span="12">
        <el-card class="input-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>原始文案输入</span>
              <el-tag type="info">{{ originalContent.length }} 字</el-tag>
            </div>
          </template>

          <el-form :model="formData" label-width="100px" class="recreation-form">
            <el-form-item required>
              <template #label>
                <div class="collapse-title-with-tip">
                  <span>原始文案</span>
                  <el-tooltip effect="dark" placement="top" raw-content>
                    <template #content>
                      <div class="tooltip-content">
                        <div class="tip-title">原始文案说明：</div>
                        <div class="tip-text">• 输入需要进行二次创作的原始文案内容</div>
                        <div class="tip-text">• 支持最多2000个字符，建议内容完整清晰</div>
                        <div class="tip-text">• AI将基于此内容进行风格转换和创新改写</div>
                      </div>
                    </template>
                    <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input
                v-model="originalContent"
                type="textarea"
                :rows="12"
                placeholder="请输入需要进行二创的爆款文案内容..."
                show-word-limit
                maxlength="2000"
                @input="handleContentChange"
              />
            </el-form-item>

            <!-- 高级二创配置选项 -->
            <div class="advanced-options">
              <el-collapse v-model="advancedOptionsOpen">
                <el-collapse-item name="1">
                  <template #title>
                    <div class="collapse-title-with-tip">
                      <span>高级二创选项（可选）</span>
                      <el-tooltip effect="dark" placement="top" raw-content>
                        <template #content>
                          <div class="tooltip-content">
                            <div class="tip-title">高级二创选项说明：</div>
                            <div class="tip-text">• 所有选项都是可选的，不选则使用默认配置</div>
                            <div class="tip-text">• 可根据需要精细调整二创内容的风格和特点</div>
                          </div>
                        </template>
                        <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </div>
                  </template>

                  <div class="advanced-form">
                    <el-form-item>
                      <template #label>
                        <div class="collapse-title-with-tip">
                          <span>二创类型</span>
                          <el-tooltip effect="dark" placement="top" raw-content>
                            <template #content>
                              <div class="tooltip-content">
                                <div class="tip-title">二创类型说明：</div>
                                <div class="tip-text">• 选择内容改写的方式，不同类型会生成不同风格的内容</div>
                              </div>
                            </template>
                            <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                          </el-tooltip>
                        </div>
                      </template>
                      <el-select
                        v-model="formData.recreationType"
                        placeholder="选择二创类型"
                        style="width: 100%"
                        @change="handleRecreationTypeChange"
                      >
                        <el-option
                          v-for="type in recreationTypes"
                          :key="type.value"
                          :label="type.label"
                          :value="type.value"
                        >
                          <div class="option-content">
                            <div class="option-title">{{ type.label }}</div>
                            <div class="option-desc">{{ type.description }}</div>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item>
                      <template #label>
                        <div class="collapse-title-with-tip">
                          <span>目标平台</span>
                          <el-tooltip effect="dark" placement="top" raw-content>
                            <template #content>
                              <div class="tooltip-content">
                                <div class="tip-title">目标平台说明：</div>
                                <div class="tip-text">• 选择内容投放的平台，AI会根据不同平台的特点调整内容风格和表达方式</div>
                              </div>
                            </template>
                            <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                          </el-tooltip>
                        </div>
                      </template>
                      <el-checkbox-group v-model="formData.targetPlatforms">
                        <el-checkbox value="douyin" label="抖音" />
                        <el-checkbox value="xiaohongshu" label="小红书" />
                        <el-checkbox value="weibo" label="微博" />
                        <el-checkbox value="bilibili" label="B站" />
                      </el-checkbox-group>
                    </el-form-item>

                    <el-form-item>
                      <template #label>
                        <div class="collapse-title-with-tip">
                          <span>创意程度</span>
                          <el-tooltip effect="dark" placement="top" raw-content>
                            <template #content>
                              <div class="tooltip-content">
                                <div class="tip-title">创意程度说明：</div>
                                <div class="tip-text">• 调整内容创新的程度：数值越高，内容变化越大；数值越低，保持原文风格越多</div>
                              </div>
                            </template>
                            <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                          </el-tooltip>
                        </div>
                      </template>
                      <el-slider
                        v-model="formData.creativityLevel"
                        :min="1"
                        :max="5"
                        show-stops
                        :marks="creativityMarks"
                        style="margin: 12px 0;"
                      />
                    </el-form-item>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-form>

          <div class="action-section">
            <el-button
              type="primary"
              size="large"
              @click="generateRecreation"
              :loading="loading"
              :disabled="!canGenerate"
              style="width: 100%;"
            >
              <el-icon><Magic /></el-icon>
              {{ loading ? '正在生成二创内容...' : '开始二创' }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧结果区域 -->
      <el-col :span="12">
        <el-card class="result-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>二创结果</span>
              <div class="result-actions" v-if="recreatedContent">
                <el-tag type="success">{{ recreatedContent.length }} 字</el-tag>
                <el-button type="text" @click="copyContent" size="small">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
                <el-button type="text" @click="regenerate" size="small">
                  <el-icon><Refresh /></el-icon>
                  重新生成
                </el-button>
                <el-button type="text" @click="addToFavorites" size="small">
                  <el-icon><Star /></el-icon>
                  收藏
                </el-button>
              </div>
            </div>
          </template>

          <div class="result-content">
            <div v-if="!recreatedContent && !loading" class="empty-state">
              <el-icon class="empty-icon"><DocumentCopy /></el-icon>
              <p>请输入原始文案并点击"开始二创"</p>
              <p class="empty-tip">AI将为您生成独特的二创内容</p>
            </div>

            <div v-if="loading" class="loading-state">
              <el-skeleton :rows="8" animated />
            </div>

            <div v-if="recreatedContent && !loading" class="content-display">
              <div class="content-text">
                {{ recreatedContent }}
              </div>

              <!-- 生成信息 -->
              <div class="generation-info" v-if="generationInfo">
                <el-divider />
                <div class="info-item">
                  <span class="info-label">二创类型：</span>
                  <el-tag size="small">{{ generationInfo.type }}</el-tag>
                </div>
                <div class="info-item">
                  <span class="info-label">目标平台：</span>
                  <el-tag
                    v-for="platform in generationInfo.platforms"
                    :key="platform"
                    size="small"
                    style="margin-right: 8px;"
                  >
                    {{ platform }}
                  </el-tag>
                </div>
                <div class="info-item">
                  <span class="info-label">生成时间：</span>
                  <span class="info-value">{{ generationInfo.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 历史记录 -->
        <el-card class="history-card" shadow="hover" v-if="history.length > 0" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>历史记录</span>
              <el-button type="text" @click="clearHistory" size="small">
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
          </template>

          <div class="history-list">
            <div
              v-for="(item, index) in history"
              :key="index"
              class="history-item"
            >
              <div class="history-item-main" @click="loadHistoryItem(item)">
                <div class="history-content">{{ item.recreatedContent.substring(0, 50) }}...</div>
                <div class="history-meta">
                  <el-tag size="mini">{{ item.type }}</el-tag>
                  <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                </div>
              </div>
              <div class="history-actions">
                <el-button
                  type="text"
                  size="small"
                  @click.stop="addHistoryToFavorites(item)"
                  title="收藏此项"
                >
                  <el-icon><Star /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled, Star } from '@element-plus/icons-vue'

// 响应式数据
const originalContent = ref('')
const recreatedContent = ref('')
const loading = ref(false)
const history = ref([])

const formData = reactive({
  recreationType: '',
  targetPlatforms: [],
  creativityLevel: 3
})

// 高级配置选项
const advancedOptionsOpen = ref([])

const generationInfo = ref(null)

// 二创类型选项
const recreationTypes = ref([
  {
    value: 'style_change',
    label: '风格转换',
    description: '保持内容核心，改变表达风格'
  },
  {
    value: 'angle_shift',
    label: '角度转换',
    description: '从不同角度重新阐述同一主题'
  },
  {
    value: 'platform_adapt',
    label: '平台适配',
    description: '针对不同平台特点进行改写'
  },
  {
    value: 'tone_adjust',
    label: '语调调整',
    description: '调整语言风格和情感色彩'
  },
  {
    value: 'structure_reorg',
    label: '结构重组',
    description: '重新组织内容结构和逻辑'
  }
])

// 创意程度标记
const creativityMarks = {
  1: '保守',
  2: '稳妥',
  3: '适中',
  4: '创新',
  5: '大胆'
}

// 计算属性
const canGenerate = computed(() => {
  return originalContent.value.trim().length > 0
})

// 方法
const handleContentChange = () => {
  // 内容变化时的处理
}

const handleRecreationTypeChange = () => {
  // 类型变化时的处理
}

const generateRecreation = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请输入原始文案内容')
    return
  }

  loading.value = true
  recreatedContent.value = ''

  try {
    // 创建EventSource来接收流式数据
    const requestBody = {
      originalContent: originalContent.value,
      recreationType: formData.recreationType,
      targetPlatforms: formData.targetPlatforms,
      creativityLevel: formData.creativityLevel
    }

    // 使用fetch POST请求，然后通过EventSource接收流式响应
    const response = await fetch('/api/explosive-recreation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      // 保留最后一个可能不完整的行
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim() === '') continue

        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'chunk') {
              // 流式更新内容
              recreatedContent.value = parsed.accumulated
            } else if (parsed.type === 'complete') {
              // 生成完成
              recreatedContent.value = parsed.content

              // 保存生成信息
              generationInfo.value = {
                type: recreationTypes.value.find(t => t.value === formData.recreationType)?.label || '',
                platforms: formData.targetPlatforms.map(p => {
                  const platformMap = {
                    'douyin': '抖音',
                    'xiaohongshu': '小红书',
                    'weibo': '微博',
                    'bilibili': 'B站'
                  }
                  return platformMap[p] || p
                }),
                timestamp: new Date().toLocaleString()
              }

              // 添加到历史记录
              addToHistory()

              ElMessage.success('二创内容生成成功！')
              break
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error)
            }
          } catch (parseError) {
            console.error('解析流数据失败:', parseError, 'Data:', data)
          }
        }
      }
    }

  } catch (error) {
    console.error('生成二创内容失败:', error)
    ElMessage.error('生成失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(recreatedContent.value)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const regenerate = () => {
  generateRecreation()
}

const addToHistory = () => {
  const historyItem = {
    originalContent: originalContent.value,
    recreatedContent: recreatedContent.value,
    type: recreationTypes.value.find(t => t.value === formData.recreationType)?.label || '',
    timestamp: Date.now(),
    formData: { ...formData }
  }

  history.value.unshift(historyItem)

  // 限制历史记录数量
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }

  // 保存到本地存储
  localStorage.setItem('explosiveRecreationHistory', JSON.stringify(history.value))
}

const loadHistoryItem = (item) => {
  originalContent.value = item.originalContent
  recreatedContent.value = item.recreatedContent
  Object.assign(formData, item.formData)

  generationInfo.value = {
    type: item.type,
    platforms: item.formData.targetPlatforms.map(p => {
      const platformMap = {
        'douyin': '抖音',
        'xiaohongshu': '小红书',
        'weibo': '微博',
        'bilibili': 'B站'
      }
      return platformMap[p] || p
    }),
    timestamp: new Date(item.timestamp).toLocaleString()
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有历史记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    history.value = []
    localStorage.removeItem('explosiveRecreationHistory')
    ElMessage.success('历史记录已清空')
  } catch {
    // 用户取消
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const addToFavorites = () => {
  if (!recreatedContent.value) {
    ElMessage.warning('没有可收藏的内容')
    return
  }

  try {
    const savedFavorites = localStorage.getItem('myFavorites')
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : { topics: [], hooks: [], contents: [], recreations: [] }

    if (!favorites.recreations) {
      favorites.recreations = []
    }

    const favoriteItem = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      originalContent: originalContent.value,
      recreatedContent: recreatedContent.value,
      contentType: '爆款文案二创',
      recreationType: formData.recreationType,
      targetPlatforms: formData.targetPlatforms,
      creativityLevel: formData.creativityLevel,
      generationInfo: generationInfo.value,
      createdAt: new Date().toISOString()
    }

    favorites.recreations.unshift(favoriteItem)

    if (favorites.recreations.length > 100) {
      favorites.recreations = favorites.recreations.slice(0, 100)
    }

    localStorage.setItem('myFavorites', JSON.stringify(favorites))
    ElMessage.success('已添加到收藏夹')
  } catch (error) {
    console.error('保存收藏失败:', error)
    ElMessage.error('收藏失败，请重试')
  }
}

const addHistoryToFavorites = (historyItem) => {
  try {
    const savedFavorites = localStorage.getItem('myFavorites')
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : { topics: [], hooks: [], contents: [], recreations: [] }

    if (!favorites.recreations) {
      favorites.recreations = []
    }

    const favoriteItem = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      originalContent: historyItem.originalContent,
      recreatedContent: historyItem.recreatedContent,
      contentType: '爆款文案二创',
      recreationType: historyItem.formData?.recreationType || '',
      targetPlatforms: historyItem.formData?.targetPlatforms || [],
      creativityLevel: historyItem.formData?.creativityLevel || 3,
      generationInfo: {
        type: historyItem.type,
        platforms: (historyItem.formData?.targetPlatforms || []).map(p => {
          const platformMap = {
            'douyin': '抖音',
            'xiaohongshu': '小红书',
            'weibo': '微博',
            'bilibili': 'B站'
          }
          return platformMap[p] || p
        }),
        timestamp: new Date(historyItem.timestamp).toLocaleString()
      },
      createdAt: new Date().toISOString()
    }

    favorites.recreations.unshift(favoriteItem)

    if (favorites.recreations.length > 100) {
      favorites.recreations = favorites.recreations.slice(0, 100)
    }

    localStorage.setItem('myFavorites', JSON.stringify(favorites))
    ElMessage.success('历史记录已添加到收藏夹')
  } catch (error) {
    console.error('保存收藏失败:', error)
    ElMessage.error('收藏失败，请重试')
  }
}

// 组件挂载时加载历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem('explosiveRecreationHistory')
  if (savedHistory) {
    try {
      history.value = JSON.parse(savedHistory)
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }
})
</script>

<style scoped>
/* 全局容器 */
.explosive-recreation-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  background-size: 400% 400%;
  min-height: 100vh;
  background-attachment: fixed;
  animation: fadeInUp 0.8s ease-out, backgroundFlow 20s ease infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes backgroundFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  color: #333;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe);
  background-size: 200% 100%;
  animation: gradientFlow 3s ease-in-out infinite;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.title-section h1 {
  margin: 0;
  font-size: 2.8em;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 2s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { filter: drop-shadow(0 0 5px rgba(102, 126, 234, 0.3)); }
  100% { filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.6)); }
}

.title-icon {
  font-size: 1.3em;
  color: #667eea;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

.subtitle {
  margin: 15px 0 0 0;
  font-size: 1.2em;
  color: #666;
  font-weight: 400;
}

/* 卡片样式 */
.input-card,
.result-card,
.history-card {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(44, 62, 80, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-card:hover,
.result-card:hover,
.history-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border-color: rgba(44, 62, 80, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.1em;
  color: #333;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0fe 100%);
  border-bottom: 1px solid rgba(44, 62, 80, 0.1);
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-actions .el-button {
  border-radius: 20px;
  transition: all 0.3s ease;
}

.result-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 表单样式 */
.recreation-form {
  margin-bottom: 20px;
}

.recreation-form .el-textarea__inner {
  border-radius: 15px;
  border: 2px solid rgba(44, 62, 80, 0.15);
  transition: all 0.3s ease;
  font-size: 16px;
  line-height: 1.6;
}

.recreation-form .el-textarea__inner:focus {
  border-color: rgba(44, 62, 80, 0.4);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
  transform: scale(1.01);
}

.recreation-form .el-select {
  border-radius: 15px;
}

.recreation-form .el-select .el-input__inner {
  border-radius: 15px;
  border: 2px solid rgba(44, 62, 80, 0.15);
  transition: all 0.3s ease;
}

.recreation-form .el-select:hover .el-input__inner {
  border-color: rgba(44, 62, 80, 0.4);
}

/* 选项内容样式 */
.option-content {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.option-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 操作按钮区域 */
.action-section {
  text-align: center;
  margin-top: 30px;
}

.action-section .el-button {
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-section .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-section .el-button:hover::before {
  left: 100%;
}

.action-section .el-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.action-section .el-button:active {
  transform: translateY(-1px) scale(1.02);
}

/* 结果内容区域 */
.result-content {
  min-height: 350px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 15px;
  margin: 15px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 5em;
  color: #ddd;
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-tip {
  font-size: 16px;
  margin-top: 15px;
  color: #888;
}

.loading-state {
  padding: 30px;
}

.content-display {
  padding: 30px;
}

.content-text {
  font-size: 18px;
  line-height: 2;
  color: #333;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 30px;
  border-radius: 15px;
  border-left: 5px solid rgba(44, 62, 80, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}

.content-text::before {
  content: '"';
  position: absolute;
  top: 10px;
  left: 15px;
  font-size: 3em;
  color: #667eea;
  opacity: 0.3;
  font-family: serif;
}

.content-text:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

/* 生成信息样式 */
.generation-info {
  margin-top: 25px;
  padding: 20px;
  background: rgba(44, 62, 80, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(44, 62, 80, 0.15);
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-label {
  font-weight: 600;
  margin-right: 12px;
  min-width: 90px;
  color: #667eea;
}

.info-value {
  color: #666;
}

/* 历史记录样式 */
.history-list {
  max-height: 350px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #667eea transparent;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3px;
}

.history-item {
  padding: 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 8px;
}

.history-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  transform: translateX(8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.history-item-main {
  flex: 1;
  cursor: pointer;
}

.history-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(10px);
}

.history-item:hover .history-actions {
  opacity: 1;
  transform: translateX(0);
}

.history-content {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 500;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.history-time {
  font-size: 13px;
  color: #999;
}

/* 高级选项样式 */
.advanced-options {
  margin: 25px 0;
}

.advanced-options .el-collapse {
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(44, 62, 80, 0.15);
}

.advanced-options .el-collapse-item__header {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0fe 100%);
  border-radius: 15px 15px 0 0;
  font-weight: 600;
  color: #667eea;
}

.advanced-form {
  padding: 25px;
  background: linear-gradient(135deg, #fafcff 0%, #f0f4ff 100%);
  border-radius: 15px;
  margin: 10px;
}

.collapse-title-with-tip {
  display: flex;
  align-items: center;
  width: 100%;
  font-weight: 600;
}

.help-icon-small {
  margin-left: 10px;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s ease;
}

.help-icon-small:hover {
  color: #667eea;
  transform: scale(1.2);
}

.tooltip-content {
  max-width: 320px;
}

.tip-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #667eea;
  font-size: 14px;
}

.tip-text {
  margin: 6px 0;
  line-height: 1.5;
  font-size: 13px;
}

/* 滑块样式 */
.advanced-form .el-slider__runway {
  background: linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 100%);
  border-radius: 10px;
  height: 8px;
}

.advanced-form .el-slider__bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.advanced-form .el-slider__button {
  border: 3px solid rgba(44, 62, 80, 0.4);
  background: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.advanced-form .el-slider__button:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 复选框组样式 */
.advanced-form .el-checkbox {
  margin-right: 20px;
  margin-bottom: 15px;
}

.advanced-form .el-checkbox__label {
  font-weight: 500;
  color: #333;
}

.advanced-form .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: rgba(44, 62, 80, 0.8);
  border-color: rgba(44, 62, 80, 0.8);
}

/* 强制 el-form-item 标签中的图标对齐 */
.el-form-item__label .collapse-title-with-tip {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* 标签样式 */
.el-tag {
  border-radius: 20px;
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .explosive-recreation-container {
    padding: 15px;
  }

  .header-section {
    padding: 25px 15px;
  }

  .title-section h1 {
    font-size: 2.2em;
    flex-direction: column;
    gap: 10px;
  }

  .subtitle {
    font-size: 1.1em;
  }

  .input-card,
  .result-card,
  .history-card {
    margin-bottom: 20px;
  }

  .content-text {
    font-size: 16px;
    padding: 20px;
  }

  .action-section .el-button {
    height: 45px;
    font-size: 14px;
  }
}

/* 竖屏优化 - 针对手机竖屏模式 */
@media (orientation: portrait) and (max-aspect-ratio: 4/5) {
  .explosive-recreation-container {
    padding: 10px;
  }

  .header-section {
    padding: 20px 10px;
    margin-bottom: 20px;
  }

  .title-section h1 {
    font-size: 1.8em;
    flex-direction: column;
    gap: 8px;
  }

  .subtitle {
    font-size: 1em;
    margin: 10px 0 0 0;
  }

  /* 改为单列布局 */
  .el-row {
    flex-direction: column !important;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 15px;
  }

  /* 卡片优化 */
  .input-card,
  .result-card,
  .history-card {
    margin: 0 0 15px 0;
    border-radius: 15px;
  }

  .card-header {
    padding: 15px 20px;
    font-size: 1em;
  }

  /* 表单优化 */
  .recreation-form {
    margin-bottom: 15px;
  }

  .recreation-form .el-textarea__inner {
    border-radius: 10px;
    font-size: 14px;
  }

  /* 高级选项优化 */
  .advanced-form {
    padding: 15px;
    margin: 5px;
  }

  .collapse-title-with-tip {
    font-size: 14px;
  }

  /* 按钮优化 */
  .action-section .el-button {
    height: 40px;
    font-size: 14px;
    border-radius: 20px;
  }

  /* 结果内容优化 */
  .result-content {
    min-height: 250px;
    margin: 10px;
  }

  .content-text {
    font-size: 14px;
    line-height: 1.8;
    padding: 20px;
  }

  .empty-state {
    padding: 50px 15px;
  }

  .empty-icon {
    font-size: 3em;
  }

  /* 历史记录优化 */
  .history-list {
    max-height: 250px;
  }

  .history-item {
    padding: 15px;
  }

  .history-content {
    font-size: 14px;
  }

  /* 生成信息优化 */
  .generation-info {
    padding: 15px;
    margin-top: 20px;
  }

  .info-item {
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .info-label {
    min-width: 70px;
    font-size: 13px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .explosive-recreation-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #0f3460 100%);
  }

  .header-section {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
  }

  .input-card,
  .result-card,
  .history-card {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .card-header {
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
    color: #e0e0e0;
  }

  .content-text {
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
    color: #e0e0e0;
  }

  .advanced-form {
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
  }
}
</style>