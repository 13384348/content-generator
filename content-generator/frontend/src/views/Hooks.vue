<template>
  <div class="hooks">
    <el-row :gutter="20">
      <!-- 输入区域 -->
      <el-col :span="8">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>选择钩子类型</span>
            </div>
          </template>

          <el-form :model="form" label-width="80px">
            <el-form-item label="选题内容">
              <el-input
                v-model="form.topic"
                type="textarea"
                :rows="4"
                placeholder="请输入你的视频选题内容"
                clearable
              />
            </el-form-item>

            <el-form-item label="钩子类型">
              <el-select v-model="form.selectedType" placeholder="请选择钩子类型" style="width: 100%">
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
                :loading="loading"
                :disabled="!form.topic || !form.selectedType"
                style="width: 100%"
                size="large"
              >
                <el-icon><Magic /></el-icon>
                一键生成钩子
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 结果区域 -->
      <el-col :span="16">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>生成结果</span>
              <el-tag v-if="currentResult.topic" type="success">
                {{ getTypeName(currentResult.type) }} - {{ currentResult.topic.substring(0, 20) }}...
              </el-tag>
            </div>
          </template>

          <div v-if="!currentResult.hooks || currentResult.hooks.length === 0" class="empty-result">
            <el-empty description="请输入选题内容并选择钩子类型，然后点击生成钩子" />
          </div>

          <div v-else class="hooks-container">
            <div
              v-for="(hook, index) in currentResult.hooks"
              :key="index"
              class="hook-item"
            >
              <div class="hook-content">
                <span class="hook-number">{{ index + 1 }}.</span>
                <span class="hook-text">{{ hook }}</span>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="copyHook(hook)"
                :icon="DocumentCopy"
              >
                复制
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'Hooks',
  setup() {
    const loading = ref(false)

    const form = reactive({
      topic: '',
      selectedType: ''
    })

    const currentResult = reactive({
      hooks: [],
      topic: '',
      type: ''
    })

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
      { value: 'warning_pitfall', label: '警告避坑' },
      { value: 'create_anxiety', label: '引起焦虑' },
      { value: 'insider_reveal', label: '内幕揭露' },
      { value: 'quick_success', label: '速成诱惑' },
      { value: 'create_resonance', label: '引发共鸣' },
      { value: 'numerical_extreme', label: '数字极限' },
      { value: 'different_perspective', label: '不同视角' },
      { value: 'superlative', label: '最' },
      { value: 'future_trend', label: '未来趋势' },
      { value: 'bet_confrontation', label: '对赌对抗' },
      { value: 'money_related', label: '金钱相关' },
      { value: 'inventory_recommend', label: '盘点推荐' },
      { value: 'cross_combination', label: '跨界组合' },
      { value: 'send_surprise', label: '送惊喜' },
      { value: 'hormone', label: '荷尔蒙' },
      { value: 'blind_box', label: '盲盒' },
      { value: 'quirky_related', label: '奇葩相关' },
      { value: 'negative', label: '负面的' },
      { value: 'specific_thing', label: '具体的事' },
      { value: 'high_emotion', label: '高情绪' },
      { value: 'strong_rhythm', label: '强节奏' },
      { value: 'join_excitement', label: '凑热闹' },
      { value: 'immersion', label: '沉浸感' },
      { value: 'contrast_feel', label: '反差感' },
      { value: 'special_perspective', label: '特殊视角' },
      { value: 'story_feel', label: '故事感' },
      { value: 'retro_nostalgia', label: '复古怀旧' }
    ]

    const getTypeName = (type) => {
      const typeObj = hookTypes.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    }

    const generateHooks = async () => {
      if (!form.topic || !form.selectedType) {
        ElMessage.warning('请填写选题内容并选择钩子类型')
        return
      }

      loading.value = true

      try {
        const response = await axios.post('http://localhost:5001/api/generate-hooks', {
          type: form.selectedType,
          topic: form.topic
        })

        if (response.data.success) {
          currentResult.hooks = response.data.hooks
          currentResult.topic = response.data.topic
          currentResult.type = response.data.type

          ElMessage.success(`成功生成 ${response.data.hooks.length} 条钩子`)
        } else {
          ElMessage.error(response.data.error || '生成失败')
        }
      } catch (error) {
        console.error('生成钩子失败:', error)
        ElMessage.error('生成钩子失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }

    const copyHook = async (hook) => {
      try {
        await navigator.clipboard.writeText(hook)
        ElMessage.success('已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = hook
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('已复制到剪贴板')
      }
    }

    return {
      loading,
      form,
      currentResult,
      hookTypes,
      getTypeName,
      generateHooks,
      copyHook,
      DocumentCopy
    }
  }
}
</script>

<style scoped>
.hooks {
  max-width: 1200px;
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

.empty-result {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hooks-container {
  max-height: 600px;
  overflow-y: auto;
}

.hook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #e6a23c;
}

.hook-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.hook-number {
  font-weight: bold;
  color: #e6a23c;
  margin-right: 10px;
  min-width: 30px;
}

.hook-text {
  line-height: 1.5;
  color: #333;
}

.hook-item:hover {
  background-color: #fff7e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>