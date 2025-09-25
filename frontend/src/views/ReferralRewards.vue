<template>
  <div class="referral-rewards">
    <div class="page-header">
      <h1 class="page-title">推荐奖励</h1>
      <p class="page-desc">邀请好友注册，双方都获得免费使用次数</p>
    </div>

    <!-- 推荐概况卡片 -->
    <div class="referral-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ referralInfo.total_referrals || 0 }}</div>
              <div class="stat-label">成功推荐</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ referralInfo.referral_rewards || 0 }}</div>
              <div class="stat-label">获得奖励</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="referral-code-card">
            <div class="code-section">
              <div class="code-label">您的专属推荐码</div>
              <div class="code-display">
                <span class="code-text">{{ referralInfo.referral_code || '正在生成...' }}</span>
                <el-button type="primary" size="small" @click="copyReferralCode" :icon="CopyDocument">复制</el-button>
              </div>
            </div>
            <el-button type="success" @click="generateNewCode" :loading="generating">重新生成</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 使用推荐码 -->
    <div class="use-referral-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><Present /></el-icon>
            <span>使用推荐码</span>
          </div>
        </template>
        <el-form :model="useForm" label-width="120px" @submit.prevent="useReferralCode">
          <el-form-item label="推荐码">
            <el-input
              v-model="useForm.referralCode"
              placeholder="请输入推荐码"
              maxlength="8"
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="useReferralCode" :loading="using">
              使用推荐码 (+5次免费使用)
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 推荐记录 -->
    <div class="referral-records">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>推荐记录</span>
          </div>
        </template>

        <el-table :data="records" style="width: 100%" v-loading="loading">
          <el-table-column prop="referee_email" label="被推荐人" width="200">
            <template #default="scope">
              <div class="user-info">
                <div class="user-email">{{ scope.row.referee_email || '未知用户' }}</div>
                <div class="user-name">{{ scope.row.referee_username || '' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="referral_code" label="推荐码" width="120" />
          <el-table-column prop="referrer_reward" label="获得奖励" width="100">
            <template #default="scope">
              <el-tag type="success">+{{ scope.row.referrer_reward }}次</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reward_given" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.reward_given ? 'success' : 'warning'">
                {{ scope.row.reward_given ? '已发放' : '待发放' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="推荐时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper" v-if="pagination.total > 0">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :page-sizes="[10, 20, 50]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Trophy, Present, List, CopyDocument } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'ReferralRewards',
  components: {
    UserFilled,
    Trophy,
    Present,
    List,
    CopyDocument
  },
  setup() {
    const loading = ref(false)
    const generating = ref(false)
    const using = ref(false)
    const referralInfo = ref({})
    const records = ref([])
    const useForm = ref({
      referralCode: ''
    })

    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    })

    // 获取推荐信息
    const fetchReferralInfo = async () => {
      try {
        const response = await axios.get('/api/referral/info')
        if (response.data.success) {
          referralInfo.value = response.data.data
        }
      } catch (error) {
        console.error('获取推荐信息失败:', error)
        ElMessage.error('获取推荐信息失败')
      }
    }

    // 获取推荐记录
    const fetchReferralRecords = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/referral/records', {
          params: {
            page: pagination.value.page,
            limit: pagination.value.limit
          }
        })
        if (response.data.success) {
          records.value = response.data.data.records
          pagination.value.total = response.data.data.total
          pagination.value.totalPages = response.data.data.totalPages
        }
      } catch (error) {
        console.error('获取推荐记录失败:', error)
        ElMessage.error('获取推荐记录失败')
      } finally {
        loading.value = false
      }
    }

    // 复制推荐码
    const copyReferralCode = async () => {
      if (!referralInfo.value.referral_code) {
        ElMessage.warning('推荐码还未生成')
        return
      }

      try {
        await navigator.clipboard.writeText(referralInfo.value.referral_code)
        ElMessage.success('推荐码已复制到剪贴板')
      } catch (error) {
        // 降级处理：创建临时文本框复制
        const textArea = document.createElement('textarea')
        textArea.value = referralInfo.value.referral_code
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        ElMessage.success('推荐码已复制到剪贴板')
      }
    }

    // 重新生成推荐码
    const generateNewCode = async () => {
      generating.value = true
      try {
        const response = await axios.post('/api/referral/generate-code')
        if (response.data.success) {
          referralInfo.value.referral_code = response.data.data.referral_code
          ElMessage.success('推荐码生成成功')
        } else {
          ElMessage.warning(response.data.error || '推荐码生成失败')
        }
      } catch (error) {
        console.error('生成推荐码失败:', error)
        ElMessage.error('生成推荐码失败')
      } finally {
        generating.value = false
      }
    }

    // 使用推荐码
    const useReferralCode = async () => {
      if (!useForm.value.referralCode.trim()) {
        ElMessage.warning('请输入推荐码')
        return
      }

      using.value = true
      try {
        const response = await axios.post('/api/referral/use', {
          referral_code: useForm.value.referralCode.trim().toUpperCase()
        })
        if (response.data.success) {
          ElMessage.success(response.data.message)
          useForm.value.referralCode = ''
          // 刷新数据
          await fetchReferralInfo()
        } else {
          ElMessage.error(response.data.error || '使用推荐码失败')
        }
      } catch (error) {
        console.error('使用推荐码失败:', error)
        if (error.response?.data?.error) {
          ElMessage.error(error.response.data.error)
        } else {
          ElMessage.error('使用推荐码失败')
        }
      } finally {
        using.value = false
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }

    // 分页处理
    const handleSizeChange = (newSize) => {
      pagination.value.limit = newSize
      pagination.value.page = 1
      fetchReferralRecords()
    }

    const handleCurrentChange = (newPage) => {
      pagination.value.page = newPage
      fetchReferralRecords()
    }

    onMounted(() => {
      fetchReferralInfo()
      fetchReferralRecords()
    })

    return {
      loading,
      generating,
      using,
      referralInfo,
      records,
      useForm,
      pagination,
      fetchReferralInfo,
      fetchReferralRecords,
      copyReferralCode,
      generateNewCode,
      useReferralCode,
      formatDate,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.referral-rewards {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 10px 0;
}

.page-desc {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.referral-overview {
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  height: 100px;
}

.stat-icon {
  font-size: 36px;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.referral-code-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-section {
  flex: 1;
}

.code-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-text {
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  letter-spacing: 2px;
}

.use-referral-section {
  margin-bottom: 30px;
}

.referral-records {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #303133;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-email {
  font-weight: 500;
  color: #303133;
}

.user-name {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-card {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.el-table {
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .referral-rewards {
    padding: 10px;
  }

  .referral-code-card {
    flex-direction: column;
    height: auto;
    gap: 15px;
  }

  .code-display {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .code-text {
    text-align: center;
  }
}

@media (max-width: 576px) {
  .el-col {
    margin-bottom: 15px;
  }

  .stat-card, .referral-code-card {
    height: auto;
    padding: 15px;
  }

  .stat-value {
    font-size: 24px;
  }

  .code-text {
    font-size: 16px;
  }
}</style>