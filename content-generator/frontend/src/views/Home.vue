<template>
  <div class="home">
    <el-row :gutter="20">
      <!-- 输入区域 -->
      <el-col :span="8">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>选择生成类型</span>
            </div>
          </template>

          <el-form :model="form" label-width="80px">
            <el-form-item label="行业">
              <el-input
                v-model="form.industry"
                placeholder="请输入行业，如：汽车、医美、教育等"
                clearable
              />
            </el-form-item>

            <el-form-item label="选题类型">
              <el-select v-model="form.selectedType" placeholder="请选择选题类型" style="width: 100%">
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
                :loading="loading"
                :disabled="!form.industry || !form.selectedType"
                style="width: 100%"
                size="large"
              >
                <el-icon><Magic /></el-icon>
                一键生成选题
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
              <el-tag v-if="currentResult.industry" type="success">
                {{ currentResult.industry }} - {{ getTypeName(currentResult.type) }}
              </el-tag>
            </div>
          </template>

          <div v-if="!currentResult.topics || currentResult.topics.length === 0" class="empty-result">
            <el-empty description="请选择行业和类型，然后点击生成选题" />
          </div>

          <div v-else class="topics-container">
            <div
              v-for="(topic, index) in currentResult.topics"
              :key="index"
              class="topic-item"
            >
              <div class="topic-content">
                <span class="topic-number">{{ index + 1 }}.</span>
                <span class="topic-text">{{ topic }}</span>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="copyTopic(topic)"
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'Home',
  setup() {
    const loading = ref(false)

    const form = reactive({
      industry: '',
      selectedType: ''
    })

    const currentResult = reactive({
      topics: [],
      industry: '',
      type: ''
    })

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

    const getTypeName = (type) => {
      const typeObj = topicTypes.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    }

    const generateTopics = async () => {
      if (!form.industry || !form.selectedType) {
        ElMessage.warning('请填写行业并选择选题类型')
        return
      }

      loading.value = true

      try {
        const response = await axios.post('http://localhost:5001/api/generate', {
          type: form.selectedType,
          industry: form.industry
        })

        if (response.data.success) {
          currentResult.topics = response.data.topics
          currentResult.industry = response.data.industry
          currentResult.type = response.data.type

          ElMessage.success(`成功生成 ${response.data.topics.length} 条选题`)
        } else {
          ElMessage.error(response.data.error || '生成失败')
        }
      } catch (error) {
        console.error('生成选题失败:', error)
        ElMessage.error('生成选题失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }

    const copyTopic = async (topic) => {
      try {
        await navigator.clipboard.writeText(topic)
        ElMessage.success('已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = topic
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
      topicTypes,
      getTypeName,
      generateTopics,
      copyTopic,
      DocumentCopy
    }
  }
}
</script>

<style scoped>
.home {
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

.topics-container {
  max-height: 600px;
  overflow-y: auto;
}

.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.topic-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.topic-number {
  font-weight: bold;
  color: #409eff;
  margin-right: 10px;
  min-width: 30px;
}

.topic-text {
  line-height: 1.5;
  color: #333;
}

.topic-item:hover {
  background-color: #f0f9ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>