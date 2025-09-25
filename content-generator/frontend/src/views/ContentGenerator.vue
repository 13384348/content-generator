<template>
  <div class="content-generator">
    <div class="generator-container">
      <h1>选题+钩子自动写文案</h1>
      <p class="subtitle">基于您的选题和钩子，智能生成高质量的短视频文案</p>

      <el-card>
        <el-form :model="form" label-position="top" class="generator-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="文案类型" required>
                <el-select
                  v-model="form.contentType"
                  placeholder="请选择文案类型"
                  style="width: 100%"
                  @change="handleTypeChange"
                >
                  <el-option
                    v-for="type in contentTypes"
                    :key="type.type"
                    :label="type.name"
                    :value="type.type"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="选题内容" required>
            <div class="input-with-button">
              <el-input
                v-model="form.topic"
                type="textarea"
                :rows="3"
                placeholder="请输入您的选题内容，或点击右侧按钮智能生成"
                maxlength="200"
                show-word-limit
                class="input-area"
              />
              <el-button
                type="success"
                @click="showTopicGenerator"
                class="generate-btn"
                size="large"
              >
                <el-icon><Magic /></el-icon>
                智能生成选题
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="钩子内容" required>
            <div class="input-with-button">
              <el-input
                v-model="form.hook"
                type="textarea"
                :rows="3"
                placeholder="请输入您的钩子内容，或点击右侧按钮智能生成"
                maxlength="200"
                show-word-limit
                class="input-area"
              />
              <el-button
                type="warning"
                @click="showHookGenerator"
                :disabled="!form.topic.trim()"
                class="generate-btn"
                size="large"
              >
                <el-icon><Lightning /></el-icon>
                智能生成钩子
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="generateContent"
              :loading="generating"
              :disabled="!canGenerate"
              size="large"
              style="width: 100%"
            >
              <el-icon><Edit /></el-icon>
              {{ generating ? '正在流式生成文案...' : '一键生成文案' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 生成结果 -->
      <el-card v-if="generatedContent" class="result-card">
        <template #header>
          <div class="result-header">
            <span>生成的文案</span>
            <el-button type="primary" size="small" @click="copyContent">
              <el-icon><DocumentCopy /></el-icon>
              复制文案
            </el-button>
          </div>
        </template>

        <div class="content-result">
          <pre :class="{ typing: generating }">{{ generatedContent }}</pre>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card class="help-card">
        <template #header>
          <span>使用说明</span>
        </template>
        <div class="help-content">
          <h4>4种文案类型说明：</h4>
          <ul>
            <li><strong>讲故事类文案</strong>：适合用故事情节吸引观众，有起承转合，结尾有感悟</li>
            <li><strong>共鸣型段子类文案</strong>：贴近生活，容易引起共鸣，语言幽默风趣</li>
            <li><strong>教知识类文案</strong>：知识性强，逻辑清晰，举例生动，便于理解</li>
            <li><strong>晒过程类文案</strong>：展示操作过程，有前后对比，画面感强</li>
          </ul>

          <h4>使用技巧：</h4>
          <ul>
            <li>选题要具体明确，避免过于宽泛</li>
            <li>钩子要有吸引力，能够引起用户的好奇心</li>
            <li>不同的文案类型适合不同的内容主题</li>
          </ul>
        </div>
      </el-card>

    <!-- 选题生成模态框 -->
    <el-dialog
      v-model="topicDialog.visible"
      title="智能生成选题"
      width="700px"
      @closed="resetTopicDialog"
    >
      <el-form :model="topicDialog.form" label-width="100px">
        <el-form-item label="行业" required>
          <el-input
            v-model="topicDialog.form.industry"
            placeholder="请输入行业，例如：汽车、美妆、餐饮"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="选题类型" required>
          <el-select
            v-model="topicDialog.form.selectedType"
            placeholder="请选择选题类型"
            style="width: 100%"
          >
            <el-option
              v-for="type in topicTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="generateTopics"
            :loading="topicDialog.loading"
            :disabled="!topicDialog.form.industry.trim() || !topicDialog.form.selectedType"
          >
            <el-icon><Magic /></el-icon>
            生成选题
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="topicDialog.topics.length > 0" class="topic-results">
        <h4>选择一个选题（点击直接使用）：</h4>
        <div class="topic-list">
          <div
            v-for="(topic, index) in topicDialog.topics"
            :key="index"
            class="topic-item"
            @click="selectTopic(topic)"
          >
            <span class="topic-index">{{ index + 1 }}</span>
            <span class="topic-text">{{ topic }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 钩子生成模态框 -->
    <el-dialog
      v-model="hookDialog.visible"
      title="智能生成钩子"
      width="700px"
      @closed="resetHookDialog"
    >
      <el-form :model="hookDialog.form" label-width="100px">
        <el-form-item label="选题内容">
          <el-input
            :value="form.topic"
            type="textarea"
            :rows="2"
            readonly
            style="background-color: #f5f7fa;"
          />
        </el-form-item>
        <el-form-item label="钩子类型" required>
          <el-select
            v-model="hookDialog.form.selectedType"
            placeholder="请选择钩子类型"
            style="width: 100%"
          >
            <el-option
              v-for="type in hookTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="generateHooks"
            :loading="hookDialog.loading"
            :disabled="!hookDialog.form.selectedType"
          >
            <el-icon><Lightning /></el-icon>
            生成钩子
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="hookDialog.hooks.length > 0" class="hook-results">
        <h4>选择一个钩子（点击直接使用）：</h4>
        <div class="hook-list">
          <div
            v-for="(hook, index) in hookDialog.hooks"
            :key="index"
            class="hook-item"
            @click="selectHook(hook)"
          >
            <span class="hook-index">{{ index + 1 }}</span>
            <span class="hook-text">{{ hook }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, DocumentCopy, Magic, Lightning } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'ContentGenerator',
  components: {
    Edit,
    DocumentCopy,
    Magic,
    Lightning
  },
  setup() {
    const contentTypes = ref([])
    const generating = ref(false)
    const generatedContent = ref('')

    const form = reactive({
      contentType: '',
      topic: '',
      hook: ''
    })

    // 选题类型数据
    const topicTypes = ref([
      { value: 'headline', label: '头牌选题' },
      { value: 'nostalgia', label: '怀旧选题' },
      { value: 'opposite', label: '对立选题' },
      { value: 'worst', label: '最差选题' },
      { value: 'hormone', label: '荷尔蒙选题' },
      { value: 'curious', label: '猎奇选题' },
      { value: 'target', label: '圈人群选题' },
      { value: 'cost', label: '成本选题' }
    ])

    // 钩子类型数据
    const hookTypes = ref([
      { value: 'target_audience', label: '圈定人群' },
      { value: 'direct_question', label: '直接提问' },
      { value: 'self_denial', label: '自我否定' },
      { value: 'counter_cognition', label: '反认知' },
      { value: 'high_value', label: '高价值展示' }
    ])

    // 选题生成模态框数据
    const topicDialog = reactive({
      visible: false,
      loading: false,
      topics: [],
      form: {
        industry: '',
        selectedType: ''
      }
    })

    // 钩子生成模态框数据
    const hookDialog = reactive({
      visible: false,
      loading: false,
      hooks: [],
      form: {
        selectedType: ''
      }
    })

    const canGenerate = computed(() => {
      return form.contentType && form.topic.trim() && form.hook.trim()
    })

    const loadContentTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/contents')
        contentTypes.value = response.data

        // 默认选择第一个类型
        if (response.data.length > 0) {
          form.contentType = response.data[0].type
        }
      } catch (error) {
        ElMessage.error('加载文案类型失败')
      }
    }

    const handleTypeChange = (type) => {
      // 可以在这里添加类型切换的逻辑
      console.log('选择的文案类型:', type)
    }

    const generateContent = async () => {
      if (!canGenerate.value) {
        ElMessage.warning('请填写完整信息')
        return
      }

      generating.value = true
      generatedContent.value = ''

      try {
        // 使用fetch + ReadableStream实现流式生成
        const response = await fetch('http://localhost:5001/api/generate-content-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: form.contentType,
            topic: form.topic.trim(),
            hook: form.hook.trim()
          })
        })

        if (!response.ok) {
          throw new Error('网络错误')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.trim()) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data.trim() === '[DONE]') {
                  generating.value = false
                  ElMessage.success('文案生成完成')

                  // 滚动到结果区域
                  setTimeout(() => {
                    const resultCard = document.querySelector('.result-card')
                    if (resultCard) {
                      resultCard.scrollIntoView({ behavior: 'smooth' })
                    }
                  }, 100)
                  return
                }

                try {
                  const parsed = JSON.parse(data)

                  if (parsed.type === 'chunk') {
                    // 逐字显示
                    generatedContent.value = parsed.fullContent
                  } else if (parsed.type === 'complete') {
                    generatedContent.value = parsed.content
                    generating.value = false
                    ElMessage.success('文案生成完成')

                    // 滚动到结果区域
                    setTimeout(() => {
                      const resultCard = document.querySelector('.result-card')
                      if (resultCard) {
                        resultCard.scrollIntoView({ behavior: 'smooth' })
                      }
                    }, 100)
                  } else if (parsed.type === 'error') {
                    ElMessage.error(parsed.error)
                    generating.value = false
                    return
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        }

      } catch (error) {
        console.error('文案生成失败:', error)
        ElMessage.error('文案生成失败，请稍后重试')
        generating.value = false
      }
    }

    const copyContent = async () => {
      try {
        await navigator.clipboard.writeText(generatedContent.value)
        ElMessage.success('文案已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = generatedContent.value
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          ElMessage.success('文案已复制到剪贴板')
        } catch (err) {
          ElMessage.error('复制失败，请手动复制')
        }
        document.body.removeChild(textArea)
      }
    }

    // 显示选题生成器
    const showTopicGenerator = () => {
      topicDialog.visible = true
    }

    // 显示钩子生成器
    const showHookGenerator = () => {
      if (!form.topic.trim()) {
        ElMessage.warning('请先输入或生成选题内容')
        return
      }
      hookDialog.visible = true
    }

    // 生成选题
    const generateTopics = async () => {
      if (!topicDialog.form.industry.trim() || !topicDialog.form.selectedType) {
        ElMessage.warning('请输入行业并选择选题类型')
        return
      }

      topicDialog.loading = true
      topicDialog.topics = []

      try {
        const response = await axios.post('http://localhost:5001/api/generate', {
          type: topicDialog.form.selectedType,
          industry: topicDialog.form.industry.trim()
        })

        if (response.data.success) {
          topicDialog.topics = response.data.topics
          ElMessage.success(`成功生成 ${response.data.topics.length} 条选题`)
        } else {
          ElMessage.error(response.data.error || '生成选题失败')
        }
      } catch (error) {
        console.error('生成选题失败:', error)
        ElMessage.error('生成选题失败，请稍后重试')
      } finally {
        topicDialog.loading = false
      }
    }

    // 生成钩子
    const generateHooks = async () => {
      if (!hookDialog.form.selectedType) {
        ElMessage.warning('请选择钩子类型')
        return
      }

      hookDialog.loading = true
      hookDialog.hooks = []

      try {
        const response = await axios.post('http://localhost:5001/api/generate-hooks', {
          type: hookDialog.form.selectedType,
          topic: form.topic.trim()
        })

        if (response.data.success) {
          hookDialog.hooks = response.data.hooks
          ElMessage.success(`成功生成 ${response.data.hooks.length} 条钩子`)
        } else {
          ElMessage.error(response.data.error || '生成钩子失败')
        }
      } catch (error) {
        console.error('生成钩子失败:', error)
        ElMessage.error('生成钩子失败，请稍后重试')
      } finally {
        hookDialog.loading = false
      }
    }

    // 选择选题
    const selectTopic = (topic) => {
      form.topic = topic
      topicDialog.visible = false
      ElMessage.success('选题已填入')
    }

    // 选择钩子
    const selectHook = (hook) => {
      form.hook = hook
      hookDialog.visible = false
      ElMessage.success('钩子已填入')
    }

    // 重置选题对话框
    const resetTopicDialog = () => {
      topicDialog.form.industry = ''
      topicDialog.form.selectedType = ''
      topicDialog.topics = []
      topicDialog.loading = false
    }

    // 重置钩子对话框
    const resetHookDialog = () => {
      hookDialog.form.selectedType = ''
      hookDialog.hooks = []
      hookDialog.loading = false
    }

    onMounted(() => {
      loadContentTypes()
    })

    return {
      form,
      contentTypes,
      generating,
      generatedContent,
      canGenerate,
      topicTypes,
      hookTypes,
      topicDialog,
      hookDialog,
      loadContentTypes,
      handleTypeChange,
      generateContent,
      copyContent,
      showTopicGenerator,
      showHookGenerator,
      generateTopics,
      generateHooks,
      selectTopic,
      selectHook,
      resetTopicDialog,
      resetHookDialog
    }
  }
}
</script>

<style scoped>
.content-generator {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.generator-container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: white;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.generator-form {
  margin-bottom: 20px;
}

.result-card {
  margin-top: 20px;
  animation: slideInUp 0.3s ease-out;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.content-result {
  max-height: 400px;
  overflow-y: auto;
}

.content-result pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  position: relative;
}

/* 打字机效果 */
.content-result pre.typing::after {
  content: '|';
  animation: blink 1s infinite;
  color: #409eff;
  font-weight: bold;
}

.help-card {
  margin-top: 20px;
}

.help-content h4 {
  color: #409eff;
  margin-top: 20px;
  margin-bottom: 10px;
}

.help-content h4:first-child {
  margin-top: 0;
}

.help-content ul {
  margin: 0;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.5;
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

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.el-card {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

/* 输入框和按钮组合样式 */
.input-with-button {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.input-area {
  flex: 1;
}

.generate-btn {
  min-width: 140px;
  height: auto;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 选题结果样式 */
.topic-results, .hook-results {
  margin-top: 20px;
}

.topic-results h4, .hook-results h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
}

.topic-list, .hook-list {
  max-height: 300px;
  overflow-y: auto;
}

.topic-item, .hook-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-item:hover, .hook-item:hover {
  background-color: #e3f2fd;
  border-color: #2196f3;
  transform: translateX(4px);
}

.topic-item:last-child, .hook-item:last-child {
  margin-bottom: 0;
}

.topic-index, .hook-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.topic-text, .hook-text {
  flex: 1;
  line-height: 1.5;
  color: #2c3e50;
  font-size: 14px;
}

/* 模态框样式优化 */
:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  margin: 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 20px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-with-button {
    flex-direction: column;
    gap: 8px;
  }

  .generate-btn {
    width: 100%;
    min-width: auto;
  }

  .topic-item, .hook-item {
    padding: 10px 12px;
  }

  .topic-text, .hook-text {
    font-size: 13px;
  }
}

.el-button.is-loading {
  position: relative;
}
</style>