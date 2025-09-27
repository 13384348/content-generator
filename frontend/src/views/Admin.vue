<template>
  <div class="admin">

    <!-- 管理面板 -->
    <div v-if="authenticated">
      <!-- 顶部导航 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <el-card>
            <div class="main-nav">
              <el-button-group>
                <el-button
                  :type="currentPage === 'prompts' ? 'primary' : 'default'"
                  @click="switchPage('prompts')"
                >
                  <el-icon><Edit /></el-icon>
                  提示词管理
                </el-button>
                <el-button
                  :type="currentPage === 'users' ? 'primary' : 'default'"
                  @click="switchPage('users')"
                >
                  <el-icon><User /></el-icon>
                  用户管理
                </el-button>
                <el-button
                  :type="currentPage === 'statistics' ? 'primary' : 'default'"
                  @click="switchPage('statistics')"
                >
                  <el-icon><DataAnalysis /></el-icon>
                  访问统计
                </el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 提示词管理 -->
        <el-col v-if="currentPage === 'prompts'" :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>提示词管理</span>
                <div>
                  <el-select
                    v-model="managementMode"
                    @change="switchManagementMode"
                    style="margin-right: 10px; width: 140px"
                  >
                    <el-option label="选题" value="topics" />
                    <el-option label="钩子" value="hooks" />
                    <el-option label="文案" value="contents" />
                    <el-option label="爆款文案二创" value="explosive_recreation" />
                    <el-option label="分镜脚本" value="storyboards" />
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
                        <el-icon><Refresh /></el-icon>
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
                        <el-icon><Refresh /></el-icon>
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
                        <el-icon><Refresh /></el-icon>
                        重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 分镜脚本提示词管理 -->
            <el-tabs v-if="managementMode === 'storyboards'" v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane
                v-for="storyboardPrompt in storyboardPrompts"
                :key="storyboardPrompt.type"
                :label="storyboardPrompt.name"
                :name="storyboardPrompt.type"
              >
                <div class="prompt-editor">
                  <el-form>
                    <el-form-item label="分镜脚本提示词内容">
                      <el-input
                        v-model="editingStoryboardPrompts[storyboardPrompt.type]"
                        type="textarea"
                        :rows="15"
                        placeholder="请输入分镜脚本提示词内容"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click.stop="saveStoryboardPrompt(storyboardPrompt.type)"
                        :loading="savingStoryboards[storyboardPrompt.type]"
                        :disabled="savingStoryboards[storyboardPrompt.type]"
                      >
                        <el-icon><Check /></el-icon>
                        保存修改
                      </el-button>
                      <el-button @click="resetStoryboardPrompt(storyboardPrompt.type)">
                        <el-icon><Refresh /></el-icon>
                        重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 爆款文案二创提示词管理 -->
            <div v-if="managementMode === 'explosive_recreation'" class="single-prompt-editor">
              <el-form>
                <el-form-item label="爆款文案二创提示词内容">
                  <el-input
                    v-model="editingExplosiveRecreationPrompt"
                    type="textarea"
                    :rows="15"
                    placeholder="请输入爆款文案二创提示词内容"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="saveExplosiveRecreationPrompt"
                    :loading="savingExplosiveRecreation"
                    :disabled="savingExplosiveRecreation"
                  >
                    <el-icon><Check /></el-icon>
                    保存修改
                  </el-button>
                  <el-button @click="resetExplosiveRecreationPrompt">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-form>

              <el-divider />

              <div class="help-text">
                <h4>提示词变量说明：</h4>
                <ul>
                  <li><code>{originalContent}</code> - 用户输入的原始文案</li>
                  <li><code>{recreationType}</code> - 用户选择的二创类型</li>
                  <li><code>{targetPlatforms}</code> - 用户选择的目标平台</li>
                  <li><code>{creativityLevel}</code> - 用户设置的创意程度</li>
                </ul>
                <p><strong>注意：</strong>如果不使用变量，系统会自动在提示词后追加原始文案内容。</p>
              </div>
            </div>

          </el-card>
        </el-col>

        <!-- 用户管理页面 -->
        <el-col v-if="currentPage === 'users'" :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>用户管理</span>
                <el-button type="primary" @click="loadUsers" :loading="loadingUsers">
                  <el-icon><Refresh /></el-icon>
                  刷新用户列表
                </el-button>
              </div>
            </template>

            <div class="user-management">
              <el-table
                :data="users"
                style="width: 100%"
                v-loading="loadingUsers"
                class="user-table"
              >
                <el-table-column prop="id" label="用户ID" width="80" />
                <el-table-column prop="email" label="邮箱" min-width="200" />
                <el-table-column label="注册时间" min-width="150">
                  <template #default="scope">
                    {{ formatDate(scope.row.created_at) }}
                  </template>
                </el-table-column>
                <el-table-column label="推荐码" width="120">
                  <template #default="scope">
                    {{ scope.row.referral_code || '无' }}
                  </template>
                </el-table-column>
                <el-table-column label="免费使用次数" width="120">
                  <template #default="scope">
                    {{ scope.row.free_usage_count || 0 }} / {{ scope.row.free_usage_limit || 10 }}
                  </template>
                </el-table-column>
                <el-table-column label="付费使用次数" width="120">
                  <template #default="scope">
                    {{ scope.row.paid_usage_count || 0 }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      size="small"
                      @click="editUserLimits(scope.row)"
                    >
                      编辑次数
                    </el-button>
                    <el-button
                      type="info"
                      size="small"
                      @click="viewUserDetails(scope.row)"
                    >
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <el-pagination
                v-model:current-page="userPagination.currentPage"
                v-model:page-size="userPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="userPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleUserPageSizeChange"
                @current-change="handleUserPageChange"
                class="user-pagination"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 访问统计页面 -->
        <el-col v-if="currentPage === 'statistics'" :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>访问统计</span>
                <el-button type="primary" @click="loadAccessStatistics" :loading="loadingStatistics">
                  <el-icon><Refresh /></el-icon>
                  刷新统计数据
                </el-button>
              </div>
            </template>

            <div class="access-statistics" v-loading="loadingStatistics">
              <!-- 概览统计卡片 -->
              <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="6">
                  <el-card class="stat-card">
                    <el-statistic title="今日访问量" :value="accessStats.today || 0" />
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <el-statistic title="本周访问量" :value="accessStats.week || 0" />
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <el-statistic title="本月访问量" :value="accessStats.month || 0" />
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <el-statistic title="总访问量" :value="accessStats.total || 0" />
                  </el-card>
                </el-col>
              </el-row>

              <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="6">
                  <el-card class="stat-card">
                    <el-statistic title="今日独立访客" :value="accessStats.unique_today || 0" />
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card">
                    <el-statistic title="本周独立访客" :value="accessStats.unique_week || 0" />
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card class="stat-card">
                    <div class="trend-info">
                      <h4>访问趋势</h4>
                      <p>最近7天每日访问量变化</p>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 每日访问趋势图表 -->
              <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="16">
                  <el-card>
                    <template #header>
                      <span>最近7天访问趋势</span>
                    </template>
                    <div class="trend-chart">
                      <div v-if="accessStats.daily_trend && accessStats.daily_trend.length > 0">
                        <div v-for="(day, index) in accessStats.daily_trend" :key="index" class="trend-day">
                          <span class="trend-date">{{ formatTrendDate(day.date) }}</span>
                          <div class="trend-bar">
                            <div
                              class="trend-fill"
                              :style="{
                                width: (day.count / Math.max(...accessStats.daily_trend.map(d => d.count)) * 100) + '%'
                              }"
                            ></div>
                            <span class="trend-count">{{ day.count }}</span>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无趋势数据" />
                    </div>
                  </el-card>
                </el-col>

                <!-- 热门页面访问 -->
                <el-col :span="8">
                  <el-card>
                    <template #header>
                      <span>热门页面</span>
                    </template>
                    <div class="popular-pages">
                      <div v-if="accessStats.popular_pages && accessStats.popular_pages.length > 0">
                        <div
                          v-for="(page, index) in accessStats.popular_pages.slice(0, 10)"
                          :key="index"
                          class="page-item"
                        >
                          <div class="page-url">{{ page.page_url }}</div>
                          <div class="page-count">{{ page.count }} 次访问</div>
                        </div>
                      </div>
                      <el-empty v-else description="暂无页面访问数据" />
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>

        <!-- 统计信息和历史记录 -->
        <el-col v-if="currentPage === 'prompts'" :span="8">
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
            <div v-else-if="managementMode === 'storyboards'">
              <el-statistic title="分镜脚本总生成次数" :value="statistics.totalStoryboardGenerations" />
              <el-divider />
              <el-statistic title="分镜脚本今日生成" :value="statistics.todayStoryboardGenerations" />
            </div>
            <div v-else-if="managementMode === 'explosive_recreation'">
              <el-statistic title="二创总生成次数" :value="statistics.totalExplosiveRecreationGenerations" />
              <el-divider />
              <el-statistic title="二创今日生成" :value="statistics.todayExplosiveRecreationGenerations" />
            </div>
            <div v-else-if="managementMode === 'users'">
              <el-statistic title="总用户数" :value="statistics.totalUsers" />
              <el-divider />
              <el-statistic title="今日新注册" :value="statistics.todayNewUsers" />
              <el-divider />
              <el-statistic title="活跃用户数" :value="statistics.activeUsers" />
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

            <!-- 分镜脚本生成历史 -->
            <div v-else-if="managementMode === 'storyboards'" class="history-list">
              <div v-if="storyboardHistory.length > 0">
                <div
                  v-for="record in storyboardHistory.slice(0, 10)"
                  :key="record.id"
                  class="history-item"
                >
                  <div class="history-info">
                    <div class="history-title">{{ record.input_content.substring(0, 30) }}...</div>
                    <div class="history-meta">
                      {{ getStoryboardTypeName(record.storyboard_type) }} •
                      {{ formatDate(record.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无分镜脚本生成记录" />
            </div>

            <!-- 爆款文案二创生成历史 -->
            <div v-else-if="managementMode === 'explosive_recreation'" class="history-list">
              <div v-if="explosiveRecreationHistory.length > 0">
                <div
                  v-for="record in explosiveRecreationHistory.slice(0, 10)"
                  :key="record.id"
                  class="history-item"
                >
                  <div class="history-info">
                    <div class="history-title">{{ record.original_content.substring(0, 30) }}...</div>
                    <div class="history-meta">
                      {{ getRecreationTypeName(record.recreation_type) }} •
                      {{ formatDate(record.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无二创生成记录" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 编辑用户使用次数对话框 -->
    <el-dialog
      v-model="editUserDialog.visible"
      title="编辑用户使用次数"
      width="500px"
    >
      <el-form :model="editUserDialog.form" label-width="120px">
        <el-form-item label="用户邮箱：">
          <span>{{ editUserDialog.form.email }}</span>
        </el-form-item>
        <el-form-item label="免费使用限制">
          <el-input-number
            v-model="editUserDialog.form.freeUsageLimit"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="免费已使用">
          <el-input-number
            v-model="editUserDialog.form.freeUsageCount"
            :min="0"
            :max="editUserDialog.form.freeUsageLimit"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="付费已使用">
          <el-input-number
            v-model="editUserDialog.form.paidUsageCount"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editUserDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveUserLimits" :loading="savingUserLimits">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看用户详情对话框 -->
    <el-dialog
      v-model="userDetailsDialog.visible"
      title="用户详情"
      width="600px"
    >
      <div v-if="userDetailsDialog.user">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ userDetailsDialog.user.id }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userDetailsDialog.user.email }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(userDetailsDialog.user.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="推荐码">{{ userDetailsDialog.user.referral_code || '无' }}</el-descriptions-item>
          <el-descriptions-item label="免费使用次数">{{ userDetailsDialog.user.free_usage_count || 0 }} / {{ userDetailsDialog.user.free_usage_limit || 10 }}</el-descriptions-item>
          <el-descriptions-item label="付费使用次数">{{ userDetailsDialog.user.paid_usage_count || 0 }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 20px;">使用历史</h3>
        <el-table :data="userDetailsDialog.history" style="width: 100%" max-height="300">
          <el-table-column prop="feature_type" label="功能类型" width="120" />
          <el-table-column prop="created_at" label="使用时间" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                {{ scope.row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="userDetailsDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
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
    const currentPage = ref('prompts') // 'prompts': 提示词管理, 'users': 用户管理
    const managementMode = ref('topics') // 'topics': 选题管理, 'hooks': 钩子管理, 'contents': 文案管理, 'storyboards': 分镜脚本管理

    const prompts = ref([])
    const hookPrompts = ref([])
    const contentPrompts = ref([])
    const storyboardPrompts = ref([])
    const explosiveRecreationPrompt = ref({})
    const editingPrompts = reactive({})
    const editingHookPrompts = reactive({})
    const editingContentPrompts = reactive({})
    const editingStoryboardPrompts = reactive({})
    const editingExplosiveRecreationPrompt = ref('')
    const saving = reactive({})
    const savingHooks = reactive({})
    const savingContents = reactive({})
    const savingStoryboards = reactive({})
    const savingExplosiveRecreation = ref(false)
    const history = ref([])
    const hookHistory = ref([])
    const contentHistory = ref([])
    const storyboardHistory = ref([])
    const explosiveRecreationHistory = ref([])
    const statistics = reactive({
      totalGenerations: 0,
      todayGenerations: 0,
      totalHookGenerations: 0,
      todayHookGenerations: 0,
      totalContentGenerations: 0,
      todayContentGenerations: 0,
      totalStoryboardGenerations: 0,
      todayStoryboardGenerations: 0,
      totalExplosiveRecreationGenerations: 0,
      todayExplosiveRecreationGenerations: 0,
      totalUsers: 0,
      todayNewUsers: 0,
      activeUsers: 0
    })

    // 用户管理相关状态
    const users = ref([])
    const loadingUsers = ref(false)
    const savingUserLimits = ref(false)
    const userPagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 0
    })

    // 编辑用户对话框
    const editUserDialog = reactive({
      visible: false,
      form: {
        userId: null,
        email: '',
        freeUsageLimit: 0,
        freeUsageCount: 0,
        paidUsageCount: 0
      }
    })

    // 用户详情对话框
    const userDetailsDialog = reactive({
      visible: false,
      user: null,
      history: []
    })

    // 访问统计相关状态
    const accessStats = ref({})
    const loadingStatistics = ref(false)

    const loadPrompts = async () => {
      try {
        const response = await axios.get('/api/prompts')
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
        const response = await axios.put(`/api/admin/prompts/${type}`, {
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
        const response = await axios.get('/api/admin/history')
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
    // 切换主页面
    const switchPage = (page) => {
      currentPage.value = page
      if (page === 'users') {
        loadUsers()
        loadUserStatistics()
      } else if (page === 'prompts') {
        // 重新加载提示词相关内容
        switchManagementMode()
      } else if (page === 'statistics') {
        loadAccessStatistics()
      }
    }

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
      } else if (managementMode.value === 'explosive_recreation') {
        loadExplosiveRecreationPrompt()
        loadExplosiveRecreationHistory()
      } else if (managementMode.value === 'storyboards') {
        loadStoryboardPrompts()
        loadStoryboardHistory()
      } else if (managementMode.value === 'users') {
        loadUsers()
        loadUserStatistics()
      }
    }

    const refreshCurrentMode = () => {
      if (managementMode.value === 'topics') {
        loadPrompts()
      } else if (managementMode.value === 'hooks') {
        loadHookPrompts()
      } else if (managementMode.value === 'contents') {
        loadContentPrompts()
      } else if (managementMode.value === 'explosive_recreation') {
        loadExplosiveRecreationPrompt()
      } else if (managementMode.value === 'storyboards') {
        loadStoryboardPrompts()
      } else if (managementMode.value === 'users') {
        loadUsers()
      }
    }

    const refreshCurrentHistory = () => {
      if (managementMode.value === 'topics') {
        loadHistory()
      } else if (managementMode.value === 'hooks') {
        loadHookHistory()
      } else if (managementMode.value === 'contents') {
        loadContentHistory()
      } else if (managementMode.value === 'explosive_recreation') {
        loadExplosiveRecreationHistory()
      } else if (managementMode.value === 'storyboards') {
        loadStoryboardHistory()
      }
    }

    const loadHookPrompts = async () => {
      try {
        const response = await axios.get('/api/hooks')
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
        const response = await axios.put(`/api/admin/hooks/${type}`, {
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
        const response = await axios.get('/api/admin/hook-history')
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
        const response = await axios.get('/api/contents')
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
        const response = await axios.put(`/api/admin/contents/${type}`, {
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
        const response = await axios.get('/api/admin/content-history')
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

    // 分镜脚本管理相关方法
    const loadStoryboardPrompts = async () => {
      try {
        const response = await axios.get('/api/storyboards')
        storyboardPrompts.value = response.data

        // 初始化编辑状态
        response.data.forEach(prompt => {
          editingStoryboardPrompts[prompt.type] = prompt.content
          savingStoryboards[prompt.type] = false
        })

        if (response.data.length > 0 && !activeTab.value) {
          activeTab.value = response.data[0].type
        }
      } catch (error) {
        showMessage('error', '加载分镜脚本提示词失败')
      }
    }

    const saveStoryboardPrompt = async (type) => {
      if (savingStoryboards[type]) return

      savingStoryboards[type] = true

      try {
        const response = await axios.put(`/api/admin/storyboards/${type}`, {
          content: editingStoryboardPrompts[type]
        })

        if (response.data.success) {
          // 更新原始数据
          const prompt = storyboardPrompts.value.find(p => p.type === type)
          if (prompt) {
            prompt.content = editingStoryboardPrompts[type]
          }
          showMessage('success', '保存成功')
        } else {
          showMessage('error', response.data.error || '保存失败')
        }
      } catch (error) {
        console.error('保存分镜脚本提示词失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '保存失败'
        showMessage('error', `保存失败: ${errorMsg}`)
      }

      savingStoryboards[type] = false
    }

    const resetStoryboardPrompt = (type) => {
      const prompt = storyboardPrompts.value.find(p => p.type === type)
      if (prompt) {
        editingStoryboardPrompts[type] = prompt.content
        showMessage('info', '已重置为原始内容')
      }
    }

    const loadStoryboardHistory = async () => {
      try {
        const response = await axios.get('/api/admin/storyboard-history')
        storyboardHistory.value = response.data

        // 计算统计信息
        statistics.totalStoryboardGenerations = response.data.length

        const today = new Date().toISOString().split('T')[0]
        statistics.todayStoryboardGenerations = response.data.filter(record =>
          record.created_at.startsWith(today)
        ).length
      } catch (error) {
        showMessage('error', '加载分镜脚本历史记录失败')
      }
    }

    const getStoryboardTypeName = (type) => {
      const typeMap = {
        short_video: '短视频分镜脚本',
        live_stream: '直播分镜脚本'
      }
      return typeMap[type] || type
    }

    const getRecreationTypeName = (type) => {
      const typeMap = {
        'style_change': '风格转换',
        'angle_shift': '角度转换',
        'platform_adapt': '平台适配',
        'tone_adjust': '语调调整',
        'structure_reorg': '结构重组'
      }
      return typeMap[type] || type
    }

    // 爆款文案二创相关函数
    const loadExplosiveRecreationPrompt = async () => {
      try {
        const response = await axios.get('/api/explosive-recreation/settings')
        editingExplosiveRecreationPrompt.value = response.data.content || ''
      } catch (error) {
        showMessage('error', '加载爆款文案二创提示词失败')
      }
    }

    const saveExplosiveRecreationPrompt = async () => {
      if (savingExplosiveRecreation.value) return

      savingExplosiveRecreation.value = true

      try {
        const response = await axios.put('/api/admin/explosive-recreation', {
          prompt: editingExplosiveRecreationPrompt.value
        })

        if (response.data.success) {
          showMessage('success', '爆款文案二创提示词保存成功')
        } else {
          showMessage('error', response.data.error || '保存失败')
        }
      } catch (error) {
        showMessage('error', '保存失败')
      } finally {
        savingExplosiveRecreation.value = false
      }
    }

    const resetExplosiveRecreationPrompt = () => {
      loadExplosiveRecreationPrompt()
    }

    const loadExplosiveRecreationHistory = async () => {
      try {
        const response = await axios.get('/api/admin/explosive-recreation/history')
        explosiveRecreationHistory.value = response.data
      } catch (error) {
        showMessage('error', '加载爆款文案二创历史失败')
      }
    }

    // 用户管理功能
    const loadUsers = async () => {
      loadingUsers.value = true
      try {
        const response = await axios.get('/api/admin/users', {
          params: {
            page: userPagination.currentPage,
            limit: userPagination.pageSize
          }
        })

        if (response.data.success) {
          users.value = response.data.data.users
          userPagination.total = response.data.data.total
        } else {
          showMessage('error', '加载用户列表失败')
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        showMessage('error', '加载用户列表失败')
      } finally {
        loadingUsers.value = false
      }
    }

    const loadUserStatistics = async () => {
      try {
        const response = await axios.get('/api/admin/user-statistics')

        if (response.data.success) {
          const data = response.data.data
          statistics.totalUsers = data.totalUsers
          statistics.todayNewUsers = data.todayNewUsers
          statistics.activeUsers = data.activeUsers
        }
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
    }

    const editUserLimits = (user) => {
      editUserDialog.form.userId = user.id
      editUserDialog.form.email = user.email
      editUserDialog.form.freeUsageLimit = user.free_usage_limit || 10
      editUserDialog.form.freeUsageCount = user.free_usage_count || 0
      editUserDialog.form.paidUsageCount = user.paid_usage_count || 0
      editUserDialog.visible = true
    }

    const saveUserLimits = async () => {
      savingUserLimits.value = true
      try {
        const response = await axios.put(`/api/admin/users/${editUserDialog.form.userId}/limits`, {
          freeUsageLimit: editUserDialog.form.freeUsageLimit,
          freeUsageCount: editUserDialog.form.freeUsageCount,
          paidUsageCount: editUserDialog.form.paidUsageCount
        })

        if (response.data.success) {
          showMessage('success', '用户使用次数更新成功')
          editUserDialog.visible = false
          loadUsers() // 重新加载用户列表
        } else {
          showMessage('error', response.data.error || '更新失败')
        }
      } catch (error) {
        console.error('更新用户使用次数失败:', error)
        showMessage('error', '更新失败')
      } finally {
        savingUserLimits.value = false
      }
    }

    const viewUserDetails = async (user) => {
      userDetailsDialog.user = user
      userDetailsDialog.visible = true

      // 加载用户使用历史
      try {
        const response = await axios.get(`/api/admin/users/${user.id}/history`)
        if (response.data.success) {
          userDetailsDialog.history = response.data.data
        }
      } catch (error) {
        console.error('加载用户历史失败:', error)
        userDetailsDialog.history = []
      }
    }

    const handleUserPageSizeChange = (val) => {
      userPagination.pageSize = val
      userPagination.currentPage = 1
      loadUsers()
    }

    const handleUserPageChange = (val) => {
      userPagination.currentPage = val
      loadUsers()
    }

    // 访问统计功能
    const loadAccessStatistics = async () => {
      loadingStatistics.value = true
      try {
        const response = await axios.get('/api/admin/access-statistics')
        if (response.data.success) {
          accessStats.value = response.data.data
        } else {
          showMessage('error', '加载访问统计失败')
        }
      } catch (error) {
        console.error('加载访问统计失败:', error)
        showMessage('error', '加载访问统计失败: ' + (error.response?.data?.error || error.message))
      } finally {
        loadingStatistics.value = false
      }
    }

    // 格式化趋势日期
    const formatTrendDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
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
      storyboardPrompts,
      editingPrompts,
      editingHookPrompts,
      editingContentPrompts,
      editingStoryboardPrompts,
      saving,
      savingHooks,
      savingContents,
      savingStoryboards,
      history,
      hookHistory,
      contentHistory,
      storyboardHistory,
      statistics,
      loadPrompts,
      loadHookPrompts,
      loadContentPrompts,
      loadStoryboardPrompts,
      handleTabChange,
      savePrompt,
      saveHookPrompt,
      saveContentPrompt,
      saveStoryboardPrompt,
      resetPrompt,
      resetHookPrompt,
      resetContentPrompt,
      resetStoryboardPrompt,
      loadHistory,
      loadHookHistory,
      loadContentHistory,
      loadStoryboardHistory,
      explosiveRecreationPrompt,
      editingExplosiveRecreationPrompt,
      savingExplosiveRecreation,
      explosiveRecreationHistory,
      loadExplosiveRecreationPrompt,
      saveExplosiveRecreationPrompt,
      resetExplosiveRecreationPrompt,
      loadExplosiveRecreationHistory,
      switchManagementMode,
      switchPage,
      currentPage,
      refreshCurrentMode,
      refreshCurrentHistory,
      getPromptName,
      getHookTypeName,
      getContentTypeName,
      getStoryboardTypeName,
      getRecreationTypeName,
      formatDate,

      // 用户管理
      users,
      loadingUsers,
      savingUserLimits,
      userPagination,
      editUserDialog,
      userDetailsDialog,
      loadUsers,
      loadUserStatistics,
      editUserLimits,
      saveUserLimits,
      viewUserDetails,
      handleUserPageSizeChange,
      handleUserPageChange,
      // 访问统计
      accessStats,
      loadingStatistics,
      loadAccessStatistics,
      formatTrendDate
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

/* 爆款文案二创相关样式 */
.help-text {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
}

.help-text h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #212529;
  font-weight: 600;
}

.help-text ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-text li {
  margin-bottom: 4px;
}

.help-text code {
  background-color: #e9ecef;
  color: #d73a49;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
}

.single-prompt-editor {
  margin-bottom: 20px;
}

.single-prompt-editor .el-form-item {
  margin-bottom: 16px;
}

/* 用户管理样式 */
.user-management {
  padding: 20px 0;
}

.user-controls {
  margin-bottom: 20px;
  text-align: left;
}

.user-table {
  margin-bottom: 20px;
}

.user-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 竖屏优化 - 针对手机竖屏模式 */
@media (orientation: portrait) and (max-aspect-ratio: 4/5) {
  .admin {
    padding: 10px;
    max-width: 100%;
  }

  /* 改为单列布局 */
  .el-row {
    flex-direction: column !important;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 15px;
  }

  .el-col:first-child {
    order: 1;
  }

  .el-col:last-child {
    order: 2;
  }

  /* 卡片优化 */
  .el-card {
    border-radius: 12px;
    margin-bottom: 15px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .card-header > div {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .el-select {
    min-width: 100px !important;
    width: auto !important;
  }

  /* 表单优化 */
  .prompt-editor {
    padding: 10px 0;
  }

  .el-form-item__label {
    font-size: 14px;
  }

  .el-textarea__inner {
    font-size: 14px;
    min-height: 300px;
  }

  /* 按钮优化 */
  .el-form-item .el-button {
    font-size: 14px;
    padding: 8px 16px;
  }

  /* 历史记录优化 */
  .history-list {
    max-height: 250px;
  }

  .history-item {
    padding: 8px 0;
  }

  .history-title {
    font-size: 14px;
  }

  .history-meta {
    font-size: 11px;
  }

  /* 统计信息优化 */
  .el-statistic {
    font-size: 14px;
  }

  /* Tab优化 */
  .el-tabs__nav-scroll {
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .el-tabs__nav {
    white-space: nowrap;
  }

  .el-tabs__item {
    font-size: 13px;
    padding: 0 15px;
  }

  /* 帮助文字优化 */
  .help-text {
    font-size: 13px;
    padding: 12px;
  }

  .help-text h4 {
    font-size: 14px;
  }

  .help-text code {
    font-size: 12px;
  }
}

/* 访问统计样式 */
.access-statistics {
  padding: 20px 0;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card :deep(.el-statistic__number) {
  color: white;
  font-weight: bold;
  font-size: 24px;
}

.stat-card :deep(.el-statistic__title) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 8px;
}

.trend-info {
  text-align: center;
  padding: 30px 20px;
}

.trend-info h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.trend-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.trend-chart {
  padding: 15px;
}

.trend-day {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.trend-date {
  width: 60px;
  font-size: 13px;
  color: #666;
  text-align: right;
  margin-right: 15px;
}

.trend-bar {
  flex: 1;
  position: relative;
  height: 24px;
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.trend-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 12px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.trend-count {
  position: absolute;
  right: 8px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  z-index: 2;
}

.popular-pages {
  padding: 15px;
}

.page-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.page-item:last-child {
  border-bottom: none;
}

.page-url {
  font-size: 14px;
  color: #333;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-count {
  font-size: 13px;
  color: #666;
  font-weight: bold;
  background-color: #f0f2f5;
  padding: 4px 8px;
  border-radius: 12px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .access-statistics {
    padding: 10px 0;
  }

  .stat-card {
    margin-bottom: 10px;
  }

  .trend-day {
    margin-bottom: 8px;
  }

  .trend-date {
    width: 50px;
    margin-right: 10px;
  }

  .page-item {
    padding: 8px 0;
  }
}
</style>