<template>
  <div class="history-records">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">我的历史</h1>
      <p class="page-desc">查看您的内容生成历史记录</p>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <div class="filter-item">
        <label>功能类型：</label>
        <el-select
          v-model="filters.featureType"
          placeholder="全部类型"
          clearable
          @change="handleFilterChange"
          class="filter-select"
        >
          <el-option label="全部类型" value="" />
          <el-option label="选题生成" value="topic" />
          <el-option label="钩子生成" value="hook" />
          <el-option label="内容生成" value="content" />
          <el-option label="分镜脚本" value="storyboard" />
          <el-option label="爆款内容" value="explosive" />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button
          v-if="selectedItems.length > 0"
          type="danger"
          @click="handleBatchDelete"
          :disabled="deleting"
        >
          删除选中 ({{ selectedItems.length }})
        </el-button>
        <el-button @click="refreshList" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list" v-loading="loading">
      <el-empty v-if="!loading && historyList.length === 0" description="暂无历史记录" />

      <div v-else class="history-grid">
        <div
          v-for="item in historyList"
          :key="item.id"
          :class="['history-card', { 'selected': selectedItems.includes(item.id) }]"
          @click="handleCardClick(item)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="card-meta">
              <span class="feature-tag" :class="`tag-${item.feature_type}`">
                {{ getFeatureTypeName(item.feature_type) }}
              </span>
              <span class="create-time">{{ formatTime(item.created_at) }}</span>
            </div>
            <div class="card-actions">
              <el-checkbox
                :model-value="selectedItems.includes(item.id)"
                @change="handleSelectItem(item.id, $event)"
                @click.stop
              />
            </div>
          </div>

          <!-- 卡片内容 -->
          <div class="card-content">
            <div class="input-summary" v-if="item.input_data">
              <div class="summary-label">输入：</div>
              <div class="summary-text">{{ getInputSummary(item.input_data) }}</div>
            </div>

            <div class="output-preview">
              <div class="preview-label">生成内容：</div>
              <div class="preview-text">{{ getOutputPreview(item.output_data) }}</div>
            </div>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <div class="usage-info">
              <span class="usage-type" :class="`usage-${item.usage_type}`">
                {{ getUsageTypeName(item.usage_type) }}
              </span>
            </div>
            <div class="card-buttons">
              <el-button
                size="small"
                type="text"
                @click.stop="viewDetail(item)"
              >
                查看详情
              </el-button>
              <el-button
                size="small"
                type="text"
                @click.stop="reuseContent(item)"
              >
                重新使用
              </el-button>
              <el-button
                size="small"
                type="text"
                class="delete-btn"
                @click.stop="deleteItem(item)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="pagination.total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="detailItem?.feature_type ? getFeatureTypeName(detailItem.feature_type) : '详情'"
      width="80%"
      class="detail-dialog"
    >
      <div v-if="detailItem" class="detail-content">
        <div class="detail-section">
          <h3>输入信息</h3>
          <el-card class="info-card">
            <pre>{{ JSON.stringify(detailItem.input_data, null, 2) }}</pre>
          </el-card>
        </div>

        <div class="detail-section">
          <h3>生成结果</h3>
          <el-card class="info-card">
            <pre>{{ JSON.stringify(detailItem.output_data, null, 2) }}</pre>
          </el-card>
        </div>

        <div class="detail-section">
          <h3>记录信息</h3>
          <el-card class="info-card">
            <div class="record-info">
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ formatTime(detailItem.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="label">使用类型：</span>
                <span class="value">{{ getUsageTypeName(detailItem.usage_type) }}</span>
              </div>
              <div class="info-item" v-if="detailItem.content_type">
                <span class="label">内容类型：</span>
                <span class="value">{{ detailItem.content_type }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

// 数据
const userStore = useUserStore()
const loading = ref(false)
const deleting = ref(false)
const historyList = ref([])
const selectedItems = ref([])
const showDetailDialog = ref(false)
const detailItem = ref(null)

// 筛选器
const filters = reactive({
  featureType: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 生命周期
onMounted(() => {
  loadHistoryList()
})

// 方法
const loadHistoryList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }

    if (filters.featureType) {
      params.feature_type = filters.featureType
    }

    const response = await axios.get('/api/history/list', { params })

    if (response.data.success) {
      historyList.value = response.data.data.records
      pagination.total = response.data.data.total
      pagination.totalPages = response.data.data.totalPages
    } else {
      ElMessage.error(response.data.error || '获取历史记录失败')
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  pagination.page = 1
  selectedItems.value = []
  loadHistoryList()
}

const handleFilterChange = () => {
  pagination.page = 1
  selectedItems.value = []
  loadHistoryList()
}

const handlePageChange = (page) => {
  pagination.page = page
  selectedItems.value = []
  loadHistoryList()
}

const handlePageSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  selectedItems.value = []
  loadHistoryList()
}

const handleCardClick = (item) => {
  // 可以添加卡片点击逻辑，比如快速预览
}

const handleSelectItem = (id, checked) => {
  if (checked) {
    if (!selectedItems.value.includes(id)) {
      selectedItems.value.push(id)
    }
  } else {
    selectedItems.value = selectedItems.value.filter(item => item !== id)
  }
}

const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) return

  try {
    const confirmed = await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 条记录吗？`,
      '批量删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (confirmed) {
      deleting.value = true
      const ids = selectedItems.value.join(',')
      const response = await axios.delete(`/api/history/batch/${ids}`)

      if (response.data.success) {
        ElMessage.success(response.data.message)
        selectedItems.value = []
        loadHistoryList()
      } else {
        ElMessage.error(response.data.error || '删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    deleting.value = false
  }
}

const viewDetail = (item) => {
  detailItem.value = item
  showDetailDialog.value = true
}

const reuseContent = (item) => {
  // 这里可以实现重新使用历史内容的逻辑
  // 比如跳转到对应的生成页面并填充历史数据
  ElMessage.info('重新使用功能正在开发中')
}

const deleteItem = async (item) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      '确定要删除这条记录吗？',
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (confirmed) {
      const response = await axios.delete(`/api/history/${item.id}`)

      if (response.data.success) {
        ElMessage.success('删除成功')
        loadHistoryList()
      } else {
        ElMessage.error(response.data.error || '删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 工具函数
const getFeatureTypeName = (type) => {
  const typeNames = {
    topic: '选题生成',
    hook: '钩子生成',
    content: '内容生成',
    storyboard: '分镜脚本',
    explosive: '爆款内容'
  }
  return typeNames[type] || type
}

const getUsageTypeName = (type) => {
  const typeNames = {
    free: '免费',
    paid: '付费',
    subscription: '订阅'
  }
  return typeNames[type] || type
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getInputSummary = (inputData) => {
  if (typeof inputData === 'string') {
    return inputData.slice(0, 100) + (inputData.length > 100 ? '...' : '')
  }
  if (inputData?.industry) {
    return `行业：${inputData.industry}`
  }
  if (inputData?.topic) {
    return `主题：${inputData.topic}`
  }
  return JSON.stringify(inputData).slice(0, 100) + '...'
}

const getOutputPreview = (outputData) => {
  if (typeof outputData === 'string') {
    return outputData.slice(0, 200) + (outputData.length > 200 ? '...' : '')
  }
  if (outputData?.topics && Array.isArray(outputData.topics)) {
    return outputData.topics.slice(0, 3).join('；') + (outputData.topics.length > 3 ? '...' : '')
  }
  if (outputData?.hooks && Array.isArray(outputData.hooks)) {
    return outputData.hooks.slice(0, 2).join('；') + (outputData.hooks.length > 2 ? '...' : '')
  }
  return JSON.stringify(outputData).slice(0, 200) + '...'
}
</script>

<style scoped>
.history-records {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.page-desc {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* 筛选器 */
.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.filter-select {
  width: 200px;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

/* 历史记录网格 */
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.history-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
  transition: all 0.3s ease;
  cursor: pointer;
}

.history-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.history-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.tag-topic { background: var(--el-color-primary); }
.tag-hook { background: var(--el-color-success); }
.tag-content { background: var(--el-color-warning); }
.tag-storyboard { background: var(--el-color-info); }
.tag-explosive { background: var(--el-color-danger); }

.create-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 卡片内容 */
.card-content {
  margin-bottom: 12px;
}

.input-summary,
.output-preview {
  margin-bottom: 8px;
}

.summary-label,
.preview-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.summary-text,
.preview-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  word-break: break-all;
}

.preview-text {
  font-weight: 500;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.usage-type {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: white;
}

.usage-free { background: var(--el-color-info); }
.usage-paid { background: var(--el-color-warning); }
.usage-subscription { background: var(--el-color-success); }

.card-buttons {
  display: flex;
  gap: 8px;
}

.delete-btn {
  color: var(--el-color-danger) !important;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情对话框 */
.detail-dialog {
  --el-dialog-border-radius: 12px;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.info-card {
  margin-bottom: 10px;
}

.info-card pre {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  font-weight: 600;
  color: var(--el-text-color-regular);
  min-width: 80px;
}

.info-item .value {
  color: var(--el-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-records {
    padding: 10px;
  }

  .filters {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .filter-actions {
    justify-content: center;
  }

  .history-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .card-buttons {
    justify-content: center;
  }
}
</style>