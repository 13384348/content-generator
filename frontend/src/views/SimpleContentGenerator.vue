<template>
  <div class="simple-content-generator">
    <el-card class="generator-card">
      <template #header>
        <div class="card-header">
          <h2>📝 文案生成工具</h2>
          <p>直接输入选题和钩子，一键生成文案</p>
        </div>
      </template>

      <el-form :model="form" label-width="120px" class="generator-form">
        <el-form-item label="文案类型" required>
          <el-select
            v-model="form.contentType"
            placeholder="请选择文案类型"
            style="width: 100%"
            size="large"
          >
            <el-option
              v-for="type in contentTypes"
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

        <el-form-item label="选题内容" required>
          <el-input
            v-model="form.topic"
            type="textarea"
            :rows="4"
            placeholder="请输入选题内容"
            maxlength="500"
            show-word-limit
          />
          <div class="input-action-buttons">
            <el-button
              size="small"
              type="primary"
              @click="showTopicSelector = true"
              title="从收藏选择"
            >
              <el-icon><Star /></el-icon>
              收藏选择
            </el-button>
            <el-button
              size="small"
              type="success"
              @click="showTopicGenerator = true"
              title="生成选题"
            >
              <el-icon><Plus /></el-icon>
              生成选题
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="钩子内容" required>
          <el-input
            v-model="form.hook"
            type="textarea"
            :rows="4"
            placeholder="请输入钩子内容"
            maxlength="500"
            show-word-limit
          />
          <div class="input-action-buttons">
            <el-button
              size="small"
              type="warning"
              @click="showHookSelector = true"
              title="从收藏选择"
            >
              <el-icon><Star /></el-icon>
              收藏选择
            </el-button>
            <el-button
              size="small"
              type="info"
              @click="showHookGenerator = true"
              title="生成钩子"
            >
              <el-icon><Plus /></el-icon>
              生成钩子
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <div class="generation-section">
        <el-button
          type="primary"
          size="large"
          @click="generateContent"
          :loading="loading"
          :disabled="!canGenerate"
          class="generate-btn"
        >
          <el-icon><Edit /></el-icon>
          {{ loading ? '正在生成文案...' : '一键生成文案' }}
        </el-button>
      </div>

      <div v-if="generatedContent" class="content-result">
        <h3>生成的文案：</h3>
        <div class="content-display">
          <pre>{{ generatedContent }}</pre>
        </div>
        <div class="result-actions">
          <el-button type="primary" @click="copyContent">
            <el-icon><CopyDocument /></el-icon>
            复制文案
          </el-button>
          <el-button @click="regenerateContent">
            <el-icon><Refresh /></el-icon>
            重新生成
          </el-button>
          <el-button type="success" @click="addToFavorites">
            <el-icon><Star /></el-icon>
            收藏文案
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 选题选择弹窗 -->
    <el-dialog
      v-model="showTopicSelector"
      title="选择收藏的选题"
      width="70%"
      top="5vh"
    >
      <div v-if="favorites.topics.length === 0" class="empty-state">
        <el-empty description="暂无收藏的选题">
          <el-button type="primary" @click="$router.push('/')">去生成选题</el-button>
        </el-empty>
      </div>
      <div v-else class="favorites-list">
        <el-card
          v-for="item in favorites.topics"
          :key="item.id"
          class="favorite-item"
          shadow="hover"
          @click="selectTopic(item)"
        >
          <div class="item-header">
            <span class="item-type">{{ item.contentType }} - {{ item.industry }}</span>
            <span class="item-date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="item-content">
            <p>{{ item.content }}</p>
          </div>
        </el-card>
      </div>
    </el-dialog>

    <!-- 钩子选择弹窗 -->
    <el-dialog
      v-model="showHookSelector"
      title="选择收藏的钩子"
      width="70%"
      top="5vh"
    >
      <div v-if="favorites.hooks.length === 0" class="empty-state">
        <el-empty description="暂无收藏的钩子">
          <el-button type="warning" @click="$router.push('/hooks')">去生成钩子</el-button>
        </el-empty>
      </div>
      <div v-else class="favorites-list">
        <el-card
          v-for="item in favorites.hooks"
          :key="item.id"
          class="favorite-item"
          shadow="hover"
          @click="selectHook(item)"
        >
          <div class="item-header">
            <span class="item-type">{{ item.contentType }} - {{ item.industry }}</span>
            <span class="item-date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="item-content">
            <p>{{ item.content }}</p>
            <div class="item-meta">
              <span>关联选题：{{ item.topic || '无' }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </el-dialog>

    <!-- 选题生成弹窗 -->
    <el-dialog
      v-model="showTopicGenerator"
      title="生成选题"
      width="70%"
      top="5vh"
    >
      <div class="generator-form">
        <el-form :model="topicForm" label-width="120px">
          <el-form-item label="行业领域" required>
            <el-input
              v-model="topicForm.industry"
              placeholder="请输入您的行业，如：汽车、医美、教育、餐饮等"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="选题类型" required>
            <el-select
              v-model="topicForm.topicType"
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
        </el-form>

        <div class="generator-actions">
          <el-button
            type="success"
            @click="generateTopics"
            :loading="topicGenerating"
            :disabled="!canGenerateTopics"
          >
            <el-icon><Plus /></el-icon>
            {{ topicGenerating ? '正在生成...' : '生成选题' }}
          </el-button>
        </div>

        <div v-if="generatedTopics.length > 0" class="generated-results">
          <h4>生成的选题：</h4>
          <div class="results-grid">
            <el-card
              v-for="(topic, index) in generatedTopics"
              :key="index"
              class="result-item"
              shadow="hover"
            >
              <div class="result-content">
                <p>{{ topic }}</p>
              </div>
              <div class="result-actions">
                <el-button size="small" type="primary" @click="useTopicFromGenerator(topic)">
                  使用
                </el-button>
                <el-button size="small" type="success" @click="addTopicToFavorites(topic)">
                  <el-icon><Star /></el-icon>
                  收藏
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 钩子生成弹窗 -->
    <el-dialog
      v-model="showHookGenerator"
      title="生成钩子"
      width="70%"
      top="5vh"
    >
      <div class="generator-form">
        <el-form :model="hookForm" label-width="120px">
          <el-form-item label="钩子类型" required>
            <el-select
              v-model="hookForm.hookType"
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
          <el-form-item label="基于选题" required>
            <el-input
              v-model="hookForm.baseTopic"
              type="textarea"
              :rows="3"
              placeholder="请输入选题内容作为钩子生成的基础"
              maxlength="500"
              show-word-limit
            />
            <div class="form-tip">
              <el-button size="small" type="text" @click="useCurrentTopic">
                使用当前选题
              </el-button>
            </div>
          </el-form-item>
        </el-form>

        <div class="generator-actions">
          <el-button
            type="info"
            @click="generateHooks"
            :loading="hookGenerating"
            :disabled="!canGenerateHooks"
          >
            <el-icon><Plus /></el-icon>
            {{ hookGenerating ? '正在生成...' : '生成钩子' }}
          </el-button>
        </div>

        <div v-if="generatedHooks.length > 0" class="generated-results">
          <h4>生成的钩子：</h4>
          <div class="results-grid">
            <el-card
              v-for="(hook, index) in generatedHooks"
              :key="index"
              class="result-item"
              shadow="hover"
            >
              <div class="result-content">
                <p>{{ hook }}</p>
              </div>
              <div class="result-actions">
                <el-button size="small" type="warning" @click="useHookFromGenerator(hook)">
                  使用
                </el-button>
                <el-button size="small" type="success" @click="addHookToFavorites(hook)">
                  <el-icon><Star /></el-icon>
                  收藏
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, CopyDocument, Refresh, Star, Plus } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'SimpleContentGenerator',
  setup() {
    const loading = ref(false)
    const generatedContent = ref('')
    const showTopicSelector = ref(false)
    const showHookSelector = ref(false)
    const showTopicGenerator = ref(false)
    const showHookGenerator = ref(false)

    const topicGenerating = ref(false)
    const hookGenerating = ref(false)
    const generatedTopics = ref([])
    const generatedHooks = ref([])

    const favorites = reactive({
      topics: [],
      hooks: [],
      contents: []
    })

    const form = reactive({
      contentType: '',
      topic: '',
      hook: ''
    })

    const topicForm = reactive({
      industry: '',
      topicType: ''
    })

    const hookForm = reactive({
      hookType: '',
      baseTopic: ''
    })

    const contentTypes = [
      {
        value: 'story',
        label: '讲故事类文案',
        description: '用故事情节吸引观众，有起承转合，结尾有感悟'
      },
      {
        value: 'resonance',
        label: '共鸣型段子类文案',
        description: '贴近生活，容易引起共鸣，语言幽默风趣'
      },
      {
        value: 'knowledge',
        label: '教知识类文案',
        description: '知识性强，逻辑清晰，举例生动，便于理解'
      },
      {
        value: 'process',
        label: '晒过程类文案',
        description: '展示操作过程，有前后对比，画面感强'
      }
    ]

    const topicTypes = [
      { value: 'headline', label: '头牌选题' },
      { value: 'nostalgia', label: '怀旧选题' },
      { value: 'opposite', label: '对立选题' },
      { value: 'worst', label: '最差选题' },
      { value: 'hormone', label: '荷尔蒙选题' },
      { value: 'curious', label: '猎奇选题' },
      { value: 'target', label: '圈人群选题' },
      { value: 'cost', label: '成本选题' }
    ]

    const hookTypes = [
      { value: 'target_audience', label: '圈定人群' },
      { value: 'direct_question', label: '直接提问' },
      { value: 'self_denial', label: '自我否定' },
      { value: 'counter_cognition', label: '反认知' },
      { value: 'high_value', label: '高价值展示' },
      { value: 'hit_pain_point', label: '直击痛点' },
      { value: 'loss_aversion', label: '损失厌恶' },
      { value: 'contrast_opposition', label: '对比对立' },
      { value: 'celebrity_trend', label: '头牌借势' },
      { value: 'warning_pitfall', label: '警告避坑' }
    ]

    const canGenerate = computed(() => {
      return form.contentType && form.topic.trim() && form.hook.trim()
    })

    const canGenerateTopics = computed(() => {
      return topicForm.industry.trim() && topicForm.topicType
    })

    const canGenerateHooks = computed(() => {
      return hookForm.hookType && hookForm.baseTopic.trim()
    })

    const generateContent = async () => {
      loading.value = true
      generatedContent.value = ''

      try {
        const response = await fetch('/api/generate-content-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: form.contentType,
            topic: form.topic,
            hook: form.hook
          })
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6)
              if (dataStr === '[DONE]') {
                loading.value = false
                return
              }

              try {
                const data = JSON.parse(dataStr)
                if (data.type === 'chunk') {
                  generatedContent.value = data.fullContent
                } else if (data.type === 'complete') {
                  generatedContent.value = data.content
                  ElMessage.success('文案生成完成')
                } else if (data.type === 'error') {
                  ElMessage.error(data.error)
                }
              } catch (e) {
                console.log('Parse error:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('生成文案失败:', error)
        ElMessage.error('生成文案失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    const regenerateContent = () => {
      generateContent()
    }

    const copyContent = async () => {
      if (!generatedContent.value) return

      try {
        await navigator.clipboard.writeText(generatedContent.value)
        ElMessage.success('文案已复制到剪贴板')
      } catch (error) {
        const textarea = document.createElement('textarea')
        textarea.value = generatedContent.value
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('文案已复制到剪贴板')
      }
    }

    const addToFavorites = () => {
      try {
        const existingFavorites = JSON.parse(localStorage.getItem('myFavorites') || '{ "topics": [], "hooks": [], "contents": [] }')

        const favoriteItem = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          contentType: contentTypes.find(t => t.value === form.contentType)?.label || form.contentType,
          industry: '用户输入',
          content: generatedContent.value,
          topic: form.topic,
          hook: form.hook,
          createdAt: new Date().toISOString()
        }

        const isAlreadyFavorited = existingFavorites.contents.some(item => item.content === generatedContent.value)
        if (isAlreadyFavorited) {
          ElMessage.warning('该内容已经在收藏中')
          return
        }

        existingFavorites.contents.push(favoriteItem)
        localStorage.setItem('myFavorites', JSON.stringify(existingFavorites))
        ElMessage.success('添加到收藏成功')
      } catch (error) {
        console.error('添加收藏失败:', error)
        ElMessage.error('添加收藏失败')
      }
    }

    const loadFavorites = () => {
      try {
        const savedFavorites = JSON.parse(localStorage.getItem('myFavorites') || '{ "topics": [], "hooks": [], "contents": [] }')
        Object.assign(favorites, savedFavorites)
      } catch (error) {
        console.error('加载收藏失败:', error)
      }
    }

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString()
    }

    const selectTopic = (item) => {
      form.topic = item.content
      showTopicSelector.value = false
      ElMessage.success('选题已选择')
    }

    const selectHook = (item) => {
      form.hook = item.content
      showHookSelector.value = false
      ElMessage.success('钩子已选择')
    }

    // 生成选题
    const generateTopics = async () => {
      if (!canGenerateTopics.value) {
        ElMessage.warning('请填写完整的选题生成信息')
        return
      }

      topicGenerating.value = true
      generatedTopics.value = []

      try {
        const response = await axios.post('/api/generate', {
          type: topicForm.topicType,
          industry: topicForm.industry
        })

        if (response.data.success) {
          generatedTopics.value = response.data.topics
          ElMessage.success('选题生成成功')
        } else {
          ElMessage.error(response.data.message || '生成失败')
        }
      } catch (error) {
        console.error('生成选题失败:', error)
        ElMessage.error('生成选题失败')
      } finally {
        topicGenerating.value = false
      }
    }

    // 生成钩子
    const generateHooks = async () => {
      if (!canGenerateHooks.value) {
        ElMessage.warning('请填写完整的钩子生成信息')
        return
      }

      hookGenerating.value = true
      generatedHooks.value = []

      try {
        const response = await axios.post('/api/generate-hooks', {
          type: hookForm.hookType,
          topic: hookForm.baseTopic
        })

        if (response.data.success) {
          generatedHooks.value = response.data.hooks
          ElMessage.success('钩子生成成功')
        } else {
          ElMessage.error(response.data.message || '生成失败')
        }
      } catch (error) {
        console.error('生成钩子失败:', error)
        ElMessage.error('生成钩子失败')
      } finally {
        hookGenerating.value = false
      }
    }

    // 使用生成的选题
    const useTopicFromGenerator = (topic) => {
      form.topic = topic
      showTopicGenerator.value = false
      ElMessage.success('选题已应用')
    }

    // 使用生成的钩子
    const useHookFromGenerator = (hook) => {
      form.hook = hook
      showHookGenerator.value = false
      ElMessage.success('钩子已应用')
    }

    // 添加选题到收藏
    const addTopicToFavorites = (topic) => {
      try {
        const existingFavorites = JSON.parse(localStorage.getItem('myFavorites') || '{ "topics": [], "hooks": [], "contents": [] }')

        const favoriteItem = {
          id: Date.now().toString(),
          content: topic,
          contentType: topicForm.topicType,
          industry: topicForm.industry,
          createdAt: new Date().toISOString()
        }

        const isAlreadyFavorited = existingFavorites.topics.some(item => item.content === topic)
        if (isAlreadyFavorited) {
          ElMessage.warning('该选题已经在收藏中')
          return
        }

        existingFavorites.topics.push(favoriteItem)
        localStorage.setItem('myFavorites', JSON.stringify(existingFavorites))
        loadFavorites()
        ElMessage.success('选题已添加到收藏')
      } catch (error) {
        console.error('添加收藏失败:', error)
        ElMessage.error('添加收藏失败')
      }
    }

    // 添加钩子到收藏
    const addHookToFavorites = (hook) => {
      try {
        const existingFavorites = JSON.parse(localStorage.getItem('myFavorites') || '{ "topics": [], "hooks": [], "contents": [] }')

        const favoriteItem = {
          id: Date.now().toString(),
          content: hook,
          contentType: hookForm.hookType,
          industry: '通用',
          topic: hookForm.baseTopic,
          createdAt: new Date().toISOString()
        }

        const isAlreadyFavorited = existingFavorites.hooks.some(item => item.content === hook)
        if (isAlreadyFavorited) {
          ElMessage.warning('该钩子已经在收藏中')
          return
        }

        existingFavorites.hooks.push(favoriteItem)
        localStorage.setItem('myFavorites', JSON.stringify(existingFavorites))
        loadFavorites()
        ElMessage.success('钩子已添加到收藏')
      } catch (error) {
        console.error('添加收藏失败:', error)
        ElMessage.error('添加收藏失败')
      }
    }

    onMounted(() => {
      loadFavorites()
    })

    return {
      form,
      contentTypes,
      loading,
      generatedContent,
      canGenerate,
      generateContent,
      regenerateContent,
      copyContent,
      addToFavorites,
      showTopicSelector,
      showHookSelector,
      showTopicGenerator,
      showHookGenerator,
      topicGenerating,
      hookGenerating,
      topicForm,
      hookForm,
      topicTypes,
      hookTypes,
      generatedTopics,
      generatedHooks,
      canGenerateTopics,
      canGenerateHooks,
      generateTopics,
      generateHooks,
      useTopicFromGenerator,
      useHookFromGenerator,
      addTopicToFavorites,
      addHookToFavorites,
      favorites,
      selectTopic,
      selectHook,
      formatDate,
      Edit,
      CopyDocument,
      Refresh,
      Star,
      Plus
    }
  }
}
</script>

<style scoped>
.simple-content-generator {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.generator-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-size: 28px;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.generator-form {
  margin: 30px 0;
}

.option-content {
  text-align: left;
}

.option-title {
  font-weight: bold;
  color: #333;
}

.option-desc {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.generation-section {
  text-align: center;
  margin: 40px 0;
}

.generate-btn {
  width: 200px;
  height: 50px;
  font-size: 16px;
}

.content-result {
  margin-top: 30px;
}

.content-result h3 {
  color: #333;
  margin-bottom: 15px;
}

.content-display {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.content-display pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.8;
  color: #333;
  margin: 0;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.input-with-button {
  position: relative;
}

.selector-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
  padding: 5px 8px;
  min-width: auto;
}

.favorites-list {
  max-height: 60vh;
  overflow-y: auto;
}

.favorite-item {
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-type {
  color: #409eff;
  font-weight: bold;
  font-size: 13px;
}

.item-date {
  color: #999;
  font-size: 12px;
}

.item-content p {
  margin: 0 0 10px 0;
  line-height: 1.6;
  color: #333;
}

.item-meta {
  color: #666;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .simple-content-generator {
    padding: 10px;
  }

  .result-actions {
    flex-direction: column;
    align-items: center;
  }

  .selector-btn {
    position: static;
    margin-top: 10px;
    width: 100%;
  }

  .input-with-button {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

/* Generator Dialog Styles */
.generator-dialog .el-dialog__body {
  max-height: 80vh;
  overflow-y: auto;
}

.generator-form {
  margin-bottom: 20px;
}

.generator-form .el-form-item {
  margin-bottom: 16px;
}

.generated-results {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.generated-results h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  font-size: 16px;
}

.result-item {
  margin-bottom: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.result-content {
  line-height: 1.6;
  margin-bottom: 10px;
  color: #333;
  white-space: pre-line;
}

.result-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.input-action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  justify-content: flex-start;
}

.input-action-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.generator-btn {
  background-color: #67c23a;
  border-color: #67c23a;
}

.generator-btn:hover {
  background-color: #5daf34;
  border-color: #5daf34;
}
</style>