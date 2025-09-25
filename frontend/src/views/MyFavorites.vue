<template>
  <div class="my-favorites">
    <div class="header-section">
      <h2>我的收藏</h2>
      <p>管理您收藏的选题、钩子和文案，随时快速重用</p>
    </div>

    <el-tabs v-model="activeTab" class="favorites-tabs">
      <!-- 选题收藏 -->
      <el-tab-pane label="选题收藏" name="topics">
        <div v-if="favorites.topics.length === 0" class="empty-state">
          <el-empty description="暂无收藏的选题">
            <el-button type="primary" @click="$router.push('/')">去生成选题</el-button>
          </el-empty>
        </div>
        <div v-else class="favorites-grid">
          <el-card
            v-for="item in favorites.topics"
            :key="item.id"
            class="favorite-item"
            shadow="hover"
          >
            <template #header>
              <div class="item-header">
                <span class="item-type">{{ item.contentType }} - {{ item.industry }}</span>
                <div class="item-actions">
                  <el-button size="small" type="primary" @click="useTopic(item)">
                    <el-icon><DocumentCopy /></el-icon>
                    使用
                  </el-button>
                  <el-button size="small" type="danger" @click="removeFavorite('topics', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="item-content">
              <p>{{ item.content }}</p>
              <div class="item-meta">
                <span>收藏时间：{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 钩子收藏 -->
      <el-tab-pane label="钩子收藏" name="hooks">
        <div v-if="favorites.hooks.length === 0" class="empty-state">
          <el-empty description="暂无收藏的钩子">
            <el-button type="warning" @click="$router.push('/hooks')">去生成钩子</el-button>
          </el-empty>
        </div>
        <div v-else class="favorites-grid">
          <el-card
            v-for="item in favorites.hooks"
            :key="item.id"
            class="favorite-item"
            shadow="hover"
          >
            <template #header>
              <div class="item-header">
                <span class="item-type">{{ item.contentType }} - {{ item.industry }}</span>
                <div class="item-actions">
                  <el-button size="small" type="warning" @click="useHook(item)">
                    <el-icon><DocumentCopy /></el-icon>
                    使用
                  </el-button>
                  <el-button size="small" type="danger" @click="removeFavorite('hooks', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="item-content">
              <p>{{ item.content }}</p>
              <div class="item-meta">
                <span>关联选题：{{ item.topic }}</span>
                <span>收藏时间：{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 文案收藏 -->
      <el-tab-pane label="文案收藏" name="contents">
        <div v-if="favorites.contents.length === 0" class="empty-state">
          <el-empty description="暂无收藏的文案">
            <el-button type="success" @click="$router.push('/content')">去生成文案</el-button>
          </el-empty>
        </div>
        <div v-else class="favorites-grid">
          <el-card
            v-for="item in favorites.contents"
            :key="item.id"
            class="favorite-item"
            shadow="hover"
          >
            <template #header>
              <div class="item-header">
                <span class="item-type">{{ item.contentType }} - {{ item.industry }}</span>
                <div class="item-actions">
                  <el-button size="small" type="success" @click="useContent(item)">
                    <el-icon><DocumentCopy /></el-icon>
                    使用
                  </el-button>
                  <el-button size="small" type="danger" @click="removeFavorite('contents', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="item-content">
              <div class="content-preview">
                {{ item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content }}
              </div>
              <div class="item-meta">
                <span>关联选题：{{ item.topic }}</span>
                <span>关联钩子：{{ item.hook }}</span>
                <span>收藏时间：{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 二创收藏 -->
      <el-tab-pane label="二创收藏" name="recreations">
        <div v-if="favorites.recreations.length === 0" class="empty-state">
          <el-empty description="暂无收藏的二创内容">
            <el-button style="background-color: #E6A23C; border-color: #E6A23C; color: white;" @click="$router.push('/explosive-recreation')">去二创文案</el-button>
          </el-empty>
        </div>
        <div v-else class="favorites-grid">
          <el-card
            v-for="item in favorites.recreations"
            :key="item.id"
            class="favorite-item"
            shadow="hover"
          >
            <template #header>
              <div class="item-header">
                <span class="item-type">{{ item.contentType }}</span>
                <div class="item-actions">
                  <el-button size="small" style="background-color: #E6A23C; border-color: #E6A23C; color: white;" @click="useRecreation(item)">
                    <el-icon><DocumentCopy /></el-icon>
                    使用
                  </el-button>
                  <el-button size="small" type="danger" @click="removeFavorite('recreations', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="item-content">
              <div class="content-preview">
                {{ item.recreatedContent.length > 200 ? item.recreatedContent.substring(0, 200) + '...' : item.recreatedContent }}
              </div>
              <div class="item-meta">
                <span v-if="item.recreationType">二创类型：{{ getRecreationTypeLabel(item.recreationType) }}</span>
                <span v-if="item.targetPlatforms && item.targetPlatforms.length > 0">目标平台：{{ formatPlatforms(item.targetPlatforms) }}</span>
                <span>收藏时间：{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="hasAnyFavorites">
      <el-button type="danger" @click="clearAllFavorites">
        <el-icon><Delete /></el-icon>
        清空所有收藏
      </el-button>
      <el-button type="primary" @click="exportFavorites">
        <el-icon><Download /></el-icon>
        导出收藏
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentCopy, Delete, Download } from '@element-plus/icons-vue'

export default {
  name: 'MyFavorites',
  setup() {
    const activeTab = ref('topics')

    // 收藏数据
    const favorites = ref({
      topics: [],
      hooks: [],
      contents: [],
      recreations: []
    })

    // 计算属性
    const hasAnyFavorites = computed(() => {
      return favorites.value.topics.length > 0 ||
             favorites.value.hooks.length > 0 ||
             favorites.value.contents.length > 0 ||
             favorites.value.recreations.length > 0
    })

    // 加载收藏数据
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('myFavorites')
        if (savedFavorites) {
          favorites.value = JSON.parse(savedFavorites)
        }
      } catch (error) {
        console.error('加载收藏数据失败:', error)
        ElMessage.error('加载收藏数据失败')
      }
    }

    // 保存收藏数据
    const saveFavorites = () => {
      try {
        localStorage.setItem('myFavorites', JSON.stringify(favorites.value))
      } catch (error) {
        console.error('保存收藏数据失败:', error)
        ElMessage.error('保存收藏数据失败')
      }
    }

    // 移除收藏
    const removeFavorite = async (type, id) => {
      try {
        await ElMessageBox.confirm('确定要移除这个收藏吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const index = favorites.value[type].findIndex(item => item.id === id)
        if (index > -1) {
          favorites.value[type].splice(index, 1)
          saveFavorites()
          ElMessage.success('移除成功')
        }
      } catch {
        // 用户取消删除
      }
    }

    // 使用选题
    const useTopic = (item) => {
      // 复制到剪贴板
      navigator.clipboard.writeText(item.content).then(() => {
        ElMessage.success('选题已复制到剪贴板，可以直接使用')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
    }

    // 使用钩子
    const useHook = (item) => {
      navigator.clipboard.writeText(item.content).then(() => {
        ElMessage.success('钩子已复制到剪贴板，可以直接使用')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
    }

    // 使用文案
    const useContent = (item) => {
      navigator.clipboard.writeText(item.content).then(() => {
        ElMessage.success('文案已复制到剪贴板，可以直接使用')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
    }

    // 清空所有收藏
    const clearAllFavorites = async () => {
      try {
        await ElMessageBox.confirm('确定要清空所有收藏吗？此操作不可恢复。', '确认清空', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        favorites.value = {
          topics: [],
          hooks: [],
          contents: [],
          recreations: []
        }
        saveFavorites()
        ElMessage.success('已清空所有收藏')
      } catch {
        // 用户取消清空
      }
    }

    // 导出收藏
    const exportFavorites = () => {
      const data = {
        exportTime: new Date().toISOString(),
        favorites: favorites.value
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json;charset=utf-8'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `我的收藏_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      ElMessage.success('收藏数据已导出')
    }

    // 使用二创
    const useRecreation = (item) => {
      navigator.clipboard.writeText(item.recreatedContent).then(() => {
        ElMessage.success('二创内容已复制到剪贴板，可以直接使用')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
    }

    // 获取二创类型标签
    const getRecreationTypeLabel = (type) => {
      const typeMap = {
        'style_change': '风格转换',
        'angle_shift': '角度转换',
        'platform_adapt': '平台适配',
        'tone_adjust': '语调调整',
        'structure_reorg': '结构重组'
      }
      return typeMap[type] || type
    }

    // 格式化平台列表
    const formatPlatforms = (platforms) => {
      const platformMap = {
        'douyin': '抖音',
        'xiaohongshu': '小红书',
        'weibo': '微博',
        'bilibili': 'B站'
      }
      return platforms.map(p => platformMap[p] || p).join('、')
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

    // 组件挂载时加载数据
    onMounted(() => {
      loadFavorites()
    })

    return {
      activeTab,
      favorites,
      hasAnyFavorites,
      removeFavorite,
      useTopic,
      useHook,
      useContent,
      useRecreation,
      getRecreationTypeLabel,
      formatPlatforms,
      clearAllFavorites,
      exportFavorites,
      formatDate,
      DocumentCopy,
      Delete,
      Download
    }
  }
}
</script>

<style scoped>
/* AI科技感4色方案：白色70% + 黑色20% + 蓝色7% + 紫色3% */
:root {
  --primary-white: rgba(255, 255, 255, 0.95);
  --secondary-black: #2c3e50;
  --accent-blue: #667eea;
  --accent-purple: #764ba2;
}

.my-favorites {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background: transparent;
  animation: fadeInUp 0.8s ease-out;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: var(--primary-white);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: aiGlow 3s ease-in-out infinite alternate;
}

.header-section h2 {
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.2em;
  font-weight: 700;
  margin-bottom: 15px;
  letter-spacing: -0.5px;
}

.header-section p {
  color: var(--secondary-black);
  font-size: 16px;
  opacity: 0.8;
  font-weight: 500;
}

.favorites-tabs {
  margin-bottom: 40px;
  background: var(--primary-white);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 10px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--primary-white);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  animation: aiScan 3s ease-in-out infinite;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
  animation: gridFadeIn 0.6s ease-out;
}

.favorite-item {
  height: fit-content;
  background: var(--primary-white) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.15) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.favorite-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.favorite-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.15) !important;
  border-color: rgba(102, 126, 234, 0.3) !important;
}

.favorite-item:hover::before {
  opacity: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-type {
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-actions .el-button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
}

.item-actions .el-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.item-content {
  margin-top: 15px;
  padding: 10px 0;
}

.item-content p {
  margin: 0 0 15px 0;
  line-height: 1.7;
  color: var(--secondary-black);
  font-weight: 400;
  opacity: 0.9;
}

.content-preview {
  margin-bottom: 15px;
  line-height: 1.7;
  color: var(--secondary-black);
  white-space: pre-line;
  font-weight: 400;
  opacity: 0.9;
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--secondary-black);
  opacity: 0.7;
  font-weight: 500;
}

.item-meta span {
  padding: 4px 0;
  transition: color 0.3s ease;
}

.item-meta span:hover {
  color: var(--accent-blue);
  opacity: 1;
}

.batch-actions {
  text-align: center;
  padding: 30px;
  margin-top: 30px;
  background: var(--primary-white);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.batch-actions .el-button {
  margin: 0 15px;
  border-radius: 12px;
  font-weight: 500;
  padding: 12px 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.batch-actions .el-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* AI科技感动画效果 */
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

@keyframes aiGlow {
  0% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  100% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  }
}

@keyframes aiScan {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes gridFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 - 移动端优先 */
@media (max-width: 768px) {
  .my-favorites {
    padding: 20px 15px;
  }

  .header-section {
    padding: 25px 20px;
    margin-bottom: 30px;
  }

  .header-section h2 {
    font-size: 1.8em;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .item-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .item-actions {
    align-self: stretch;
    justify-content: space-between;
  }

  .batch-actions {
    padding: 20px 15px;
  }

  .batch-actions .el-button {
    margin: 8px;
    width: calc(50% - 16px);
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    gap: 16px;
  }

  .item-actions .el-button {
    flex: 1;
    min-width: 44px;
  }

  .content-preview {
    padding: 12px;
    font-size: 14px;
  }

  .batch-actions .el-button {
    width: 100%;
    margin: 5px 0;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-tabs__header) {
  background: transparent;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

:deep(.el-tabs__nav-wrap) {
  background: transparent;
}

:deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
  height: 3px;
  border-radius: 2px;
}

:deep(.el-tabs__item) {
  color: var(--secondary-black);
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item:hover) {
  color: var(--accent-blue);
}

:deep(.el-tabs__item.is-active) {
  color: var(--accent-blue);
  font-weight: 600;
}

:deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  padding: 18px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-empty) {
  padding: 40px 20px;
}

:deep(.el-empty__description) {
  color: var(--secondary-black);
  opacity: 0.7;
  margin: 20px 0;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
  border: none;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  border: none;
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #E6A23C 0%, #EEBE77 100%);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
  border: none;
}
</style>