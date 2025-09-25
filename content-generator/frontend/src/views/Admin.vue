<template>
  <div class="admin">

    <!-- 管理面板 -->
    <div v-if="authenticated">
      <el-row :gutter="20">
        <!-- 提示词管理 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>提示词管理</span>
                <div>
                  <el-select
                    v-model="managementMode"
                    @change="switchManagementMode"
                    style="margin-right: 10px; width: 120px"
                  >
                    <el-option label="选题" value="topics" />
                    <el-option label="钩子" value="hooks" />
                    <el-option label="文案" value="contents" />
                  </el-select>
                  <el-button type="primary" @click="refreshCurrentMode">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </div>
            </template>

            <!-- 选题提示词管理 -->
            <el-tabs v-if="managementMode === 'topics'" v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane
                v-for="prompt in prompts"
                :key="prompt.type"
                :label="prompt.name"
                :name="prompt.type"
              >
                <div class="prompt-editor">
                  <el-form>
                    <el-form-item label="提示词内容">
                      <el-input
                        v-model="editingPrompts[prompt.type]"
                        type="textarea"
                        :rows="15"
                        placeholder="请输入提示词内容"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click.stop="savePrompt(prompt.type)"
                        :loading="saving[prompt.type]"
                        :disabled="saving[prompt.type]"
                      >
                        <el-icon><Check /></el-icon>
                        保存修改
                      </el-button>
                      <el-button @click="resetPrompt(prompt.type)">
                        <el-icon><RefreshLeft /></el-icon>
                        重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 钩子提示词管理 -->
            <el-tabs v-if="managementMode === 'hooks'" v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane
                v-for="hookPrompt in hookPrompts"
                :key="hookPrompt.type"
                :label="hookPrompt.name"
                :name="hookPrompt.type"
              >
                <div class="prompt-editor">
                  <el-form>
                    <el-form-item label="钩子提示词内容">
                      <el-input
                        v-model="editingHookPrompts[hookPrompt.type]"
                        type="textarea"
                        :rows="15"
                        placeholder="请输入钩子提示词内容"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click.stop="saveHookPrompt(hookPrompt.type)"
                        :loading="savingHooks[hookPrompt.type]"
                        :disabled="savingHooks[hookPrompt.type]"
                      >
                        <el-icon><Check /></el-icon>
                        保存修改
                      </el-button>
                      <el-button @click="resetHookPrompt(hookPrompt.type)">
                        <el-icon><RefreshLeft /></el-icon>
                        重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 文案提示词管理 -->
            <el-tabs v-if="managementMode === 'contents'" v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane
                v-for="contentPrompt in contentPrompts"
                :key="contentPrompt.type"
                :label="contentPrompt.name"
                :name="contentPrompt.type"
              >
                <div class="prompt-editor">
                  <el-form>
                    <el-form-item label="文案提示词内容">
                      <el-input
                        v-model="editingContentPrompts[contentPrompt.type]"
                        type="textarea"
                        :rows="15"
                        placeholder="请输入文案提示词内容"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click.stop="saveContentPrompt(contentPrompt.type)"
                        :loading="savingContents[contentPrompt.type]"
                        :disabled="savingContents[contentPrompt.type]"
                      >
                        <el-icon><Check /></el-icon>
                        保存修改
                      </el-button>
                      <el-button @click="resetContentPrompt(contentPrompt.type)">
                        <el-icon><RefreshLeft /></el-icon>
                        重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

        <!-- 统计信息和历史记录 -->
        <el-col :span="8">
          <el-card style="margin-bottom: 20px;">
            <template #header>
              <span>系统统计</span>
            </template>
            <div v-if="managementMode === 'topics'">
              <el-statistic title="选题总生成次数" :value="statistics.totalGenerations" />
              <el-divider />
              <el-statistic title="选题今日生成" :value="statistics.todayGenerations" />
            </div>
            <div v-else-if="managementMode === 'hooks'">
              <el-statistic title="钩子总生成次数" :value="statistics.totalHookGenerations" />
              <el-divider />
              <el-statistic title="钩子今日生成" :value="statistics.todayHookGenerations" />
            </div>
            <div v-else-if="managementMode === 'contents'">
              <el-statistic title="文案总生成次数" :value="statistics.totalContentGenerations" />
              <el-divider />
              <el-statistic title="文案今日生成" :value="statistics.todayContentGenerations" />
            </div>
          </el-card>

          <el-card>
            <template #header>
              <div class="card-header">
                <span>最近生成记录</span>
                <el-button type="text" @click="refreshCurrentHistory">刷新</el-button>
              </div>
            </template>

            <!-- 选题生成历史 -->
            <div v-if="managementMode === 'topics'" class="history-list">
              <div v-if="history.length > 0">
                <div
                  v-for="record in history.slice(0, 10)"
                  :key="record.id"
                  class="history-item"
                >
                  <div class="history-info">
                    <div class="history-title">{{ record.industry }}</div>
                    <div class="history-meta">
                      {{ getPromptName(record.prompt_type) }} •
                      {{ formatDate(record.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无选题生成记录" />
            </div>

            <!-- 钩子生成历史 -->
            <div v-else-if="managementMode === 'hooks'" class="history-list">
              <div v-if="hookHistory.length > 0">
                <div
                  v-for="record in hookHistory.slice(0, 10)"
                  :key="record.id"
                  class="history-item"
                >
                  <div class="history-info">
                    <div class="history-title">{{ record.topic.substring(0, 30) }}...</div>
                    <div class="history-meta">
                      {{ getHookTypeName(record.hook_type) }} •
                      {{ formatDate(record.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无钩子生成记录" />
            </div>

            <!-- 文案生成历史 -->
            <div v-else-if="managementMode === 'contents'" class="history-list">
              <div v-if="contentHistory.length > 0">
                <div
                  v-for="record in contentHistory.slice(0, 10)"
                  :key="record.id"
                  class="history-item"
                >
                  <div class="history-info">
                    <div class="history-title">{{ record.topic.substring(0, 30) }}...</div>
                    <div class="history-meta">
                      {{ getContentTypeName(record.content_type) }} •
                      {{ formatDate(record.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无文案生成记录" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 防抖的消息显示函数
let messageTimer = null
const showMessage = (type, message) => {
  // 清除之前的定时器
  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  // 立即关闭所有消息
  ElMessage.closeAll()

  // 延迟显示新消息
  messageTimer = setTimeout(() => {
    ElMessage({
      type: type,
      message: message,
      showClose: true,
      duration: 3000
    })
    messageTimer = null
  }, 100)
}

export default {
  name: 'Admin',
  setup() {
    const authenticated = ref(true)
    const activeTab = ref('')
    const managementMode = ref('topics') // 'topics': 选题管理, 'hooks': 钩子管理, 'contents': 文案管理

    const prompts = ref([])
    const hookPrompts = ref([])
    const contentPrompts = ref([])
    const editingPrompts = reactive({})
    const editingHookPrompts = reactive({})
    const editingContentPrompts = reactive({})
    const saving = reactive({})
    const savingHooks = reactive({})
    const savingContents = reactive({})
    const history = ref([])
    const hookHistory = ref([])
    const contentHistory = ref([])
    const statistics = reactive({
      totalGenerations: 0,
      todayGenerations: 0,
      totalHookGenerations: 0,
      todayHookGenerations: 0,
      totalContentGenerations: 0,
      todayContentGenerations: 0
    })


    const loadPrompts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/prompts')
        prompts.value = response.data

        // 初始化编辑状态
        response.data.forEach(prompt => {
          editingPrompts[prompt.type] = prompt.content
          saving[prompt.type] = false
        })

        if (response.data.length > 0 && !activeTab.value) {
          activeTab.value = response.data[0].type
        }
      } catch (error) {
        showMessage('error', '加载提示词失败')
      }
    }

    const handleTabChange = (tabName) => {
      activeTab.value = tabName
    }

    const savePrompt = async (type) => {
      if (saving[type]) return

      saving[type] = true

      try {
        const response = await axios.put(`http://localhost:5001/api/admin/prompts/${type}`, {
          content: editingPrompts[type]
        })

        if (response.data.success) {
          // 更新原始数据
          const prompt = prompts.value.find(p => p.type === type)
          if (prompt) {
            prompt.content = editingPrompts[type]
          }
          showMessage('success', '保存成功')
        } else {
          showMessage('error', response.data.error || '保存失败')
        }
      } catch (error) {
        console.error('保存提示词失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '保存失败'
        showMessage('error', `保存失败: ${errorMsg}`)
      }

      saving[type] = false
    }

    const resetPrompt = (type) => {
      const prompt = prompts.value.find(p => p.type === type)
      if (prompt) {
        editingPrompts[type] = prompt.content
        showMessage('info', '已重置为原始内容')
      }
    }

    const loadHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/admin/history')
        history.value = response.data

        // 计算统计信息
        statistics.totalGenerations = response.data.length

        const today = new Date().toISOString().split('T')[0]
        statistics.todayGenerations = response.data.filter(record =>
          record.created_at.startsWith(today)
        ).length
      } catch (error) {
        showMessage('error', '加载历史记录失败')
      }
    }

    const getPromptName = (type) => {
      const typeMap = {
        headline: '头牌选题',
        nostalgia: '怀旧选题',
        opposite: '对立选题',
        worst: '最差选题',
        hormone: '荷尔蒙选题',
        curious: '猎奇选题',
        target: '圈人群选题',
        cost: '成本选题'
      }
      return typeMap[type] || type
    }

    const getHookTypeName = (type) => {
      const typeMap = {
        target_audience: '圈定人群',
        direct_question: '直接提问',
        self_denial: '自我否定',
        counter_cognition: '反认知',
        high_value: '高价值展示',
        hit_pain_point: '直击痛点',
        loss_aversion: '损失厌恶',
        contrast_opposition: '对比对立',
        celebrity_trend: '头牌借势',
        warning_pitfall: '警告避坑',
        create_anxiety: '引起焦虑',
        insider_reveal: '内幕揭露',
        quick_success: '速成诱惑',
        create_resonance: '引发共鸣',
        numerical_extreme: '数字极限',
        different_perspective: '不同视角',
        superlative: '最',
        future_trend: '未来趋势',
        bet_confrontation: '对赌对抗',
        money_related: '金钱相关',
        inventory_recommend: '盘点推荐',
        cross_combination: '跨界组合',
        send_surprise: '送惊喜',
        hormone: '荷尔蒙',
        blind_box: '盲盒',
        quirky_related: '奇葩相关',
        negative: '负面的',
        specific_thing: '具体的事',
        high_emotion: '高情绪',
        strong_rhythm: '强节奏',
        join_excitement: '凑热闹',
        immersion: '沉浸感',
        contrast_feel: '反差感',
        special_perspective: '特殊视角',
        story_feel: '故事感',
        retro_nostalgia: '复古怀旧'
      }
      return typeMap[type] || type
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }

    // 模式切换相关方法
    const switchManagementMode = () => {
      activeTab.value = ''
      if (managementMode.value === 'topics') {
        loadPrompts()
        loadHistory()
      } else if (managementMode.value === 'hooks') {
        loadHookPrompts()
        loadHookHistory()
      } else if (managementMode.value === 'contents') {
        loadContentPrompts()
        loadContentHistory()
      }
    }

    const refreshCurrentMode = () => {
      if (managementMode.value === 'topics') {
        loadPrompts()
      } else if (managementMode.value === 'hooks') {
        loadHookPrompts()
      } else if (managementMode.value === 'contents') {
        loadContentPrompts()
      }
    }

    const refreshCurrentHistory = () => {
      if (managementMode.value === 'topics') {
        loadHistory()
      } else if (managementMode.value === 'hooks') {
        loadHookHistory()
      } else if (managementMode.value === 'contents') {
        loadContentHistory()
      }
    }

    const loadHookPrompts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/hooks')
        hookPrompts.value = response.data

        // 初始化编辑状态
        response.data.forEach(prompt => {
          editingHookPrompts[prompt.type] = prompt.content
          savingHooks[prompt.type] = false
        })

        if (response.data.length > 0 && !activeTab.value) {
          activeTab.value = response.data[0].type
        }
      } catch (error) {
        showMessage('error', '加载钩子提示词失败')
      }
    }

    const saveHookPrompt = async (type) => {
      if (savingHooks[type]) return

      savingHooks[type] = true

      try {
        const response = await axios.put(`http://localhost:5001/api/admin/hooks/${type}`, {
          content: editingHookPrompts[type]
        })

        if (response.data.success) {
          // 更新原始数据
          const prompt = hookPrompts.value.find(p => p.type === type)
          if (prompt) {
            prompt.content = editingHookPrompts[type]
          }
          showMessage('success', '保存成功')
        } else {
          showMessage('error', response.data.error || '保存失败')
        }
      } catch (error) {
        console.error('保存钩子提示词失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '保存失败'
        showMessage('error', `保存失败: ${errorMsg}`)
      }

      savingHooks[type] = false
    }

    const resetHookPrompt = (type) => {
      const prompt = hookPrompts.value.find(p => p.type === type)
      if (prompt) {
        editingHookPrompts[type] = prompt.content
        showMessage('info', '已重置为原始内容')
      }
    }

    const loadHookHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/admin/hook-history')
        hookHistory.value = response.data

        // 计算统计信息
        statistics.totalHookGenerations = response.data.length

        const today = new Date().toISOString().split('T')[0]
        statistics.todayHookGenerations = response.data.filter(record =>
          record.created_at.startsWith(today)
        ).length
      } catch (error) {
        showMessage('error', '加载钩子历史记录失败')
      }
    }

    // 文案管理相关方法
    const loadContentPrompts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/contents')
        contentPrompts.value = response.data

        // 初始化编辑状态
        response.data.forEach(prompt => {
          editingContentPrompts[prompt.type] = prompt.content
          savingContents[prompt.type] = false
        })

        if (response.data.length > 0 && !activeTab.value) {
          activeTab.value = response.data[0].type
        }
      } catch (error) {
        showMessage('error', '加载文案提示词失败')
      }
    }

    const saveContentPrompt = async (type) => {
      if (savingContents[type]) return

      savingContents[type] = true

      try {
        const response = await axios.put(`http://localhost:5001/api/admin/contents/${type}`, {
          content: editingContentPrompts[type]
        })

        if (response.data.success) {
          // 更新原始数据
          const prompt = contentPrompts.value.find(p => p.type === type)
          if (prompt) {
            prompt.content = editingContentPrompts[type]
          }
          showMessage('success', '保存成功')
        } else {
          showMessage('error', response.data.error || '保存失败')
        }
      } catch (error) {
        console.error('保存文案提示词失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '保存失败'
        showMessage('error', `保存失败: ${errorMsg}`)
      }

      savingContents[type] = false
    }

    const resetContentPrompt = (type) => {
      const prompt = contentPrompts.value.find(p => p.type === type)
      if (prompt) {
        editingContentPrompts[type] = prompt.content
        showMessage('info', '已重置为原始内容')
      }
    }

    const loadContentHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/admin/content-history')
        contentHistory.value = response.data

        // 计算统计信息
        statistics.totalContentGenerations = response.data.length

        const today = new Date().toISOString().split('T')[0]
        statistics.todayContentGenerations = response.data.filter(record =>
          record.created_at.startsWith(today)
        ).length
      } catch (error) {
        showMessage('error', '加载文案历史记录失败')
      }
    }

    const getContentTypeName = (type) => {
      const typeMap = {
        story: '讲故事类文案',
        resonance: '共鸣型段子类文案',
        knowledge: '教知识类文案',
        process: '晒过程类文案'
      }
      return typeMap[type] || type
    }

    // 组件挂载时自动加载数据
    onMounted(() => {
      loadPrompts()
      loadHistory()
    })

    return {
      authenticated,
      activeTab,
      managementMode,
      prompts,
      hookPrompts,
      contentPrompts,
      editingPrompts,
      editingHookPrompts,
      editingContentPrompts,
      saving,
      savingHooks,
      savingContents,
      history,
      hookHistory,
      contentHistory,
      statistics,
      loadPrompts,
      loadHookPrompts,
      loadContentPrompts,
      handleTabChange,
      savePrompt,
      saveHookPrompt,
      saveContentPrompt,
      resetPrompt,
      resetHookPrompt,
      resetContentPrompt,
      loadHistory,
      loadHookHistory,
      loadContentHistory,
      switchManagementMode,
      refreshCurrentMode,
      refreshCurrentHistory,
      getPromptName,
      getHookTypeName,
      getContentTypeName,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.prompt-editor {
  padding: 20px 0;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.history-meta {
  font-size: 12px;
  color: #999;
}

.el-statistic {
  text-align: center;
}
</style>