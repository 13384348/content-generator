<template>
  <div class="step-wizard-generator">
    <el-card class="wizard-card">
      <template #header>
        <div class="wizard-header">
          <h2>🧙‍♂️ 智能文案生成器</h2>
          <p>跟随步骤，轻松生成专业文案</p>
          <div class="auto-save-indicator">
            <el-tag size="small" type="info" class="save-tag">
              <el-icon><Check /></el-icon>
              自动保存进度
            </el-tag>
            <div class="save-actions">
              <el-button size="small" text @click="clearSavedState" title="清除保存的进度">
                <el-icon><Delete /></el-icon>
                清除进度
              </el-button>
              <el-button size="small" text @click="showHistoryDialog" title="查看生成历史">
                <el-icon><Clock /></el-icon>
                历史记录
              </el-button>
            </div>
          </div>
        </div>
      </template>

      <el-steps
        :active="currentStep"
        align-center
        finish-status="success"
        class="steps-indicator clickable-steps"
      >
        <el-step
          title="选题设置与生成"
          description="设置行业领域，生成选题"
          @click="goToStep(0)"
          :class="{ 'clickable': true }"
        />
        <el-step
          title="钩子设置与生成"
          description="设置钩子类型，生成钩子"
          @click="goToStep(1)"
          :class="{ 'clickable': canAccessStep(1) }"
        />
        <el-step
          title="文案类型与生成"
          description="选择文案类型，生成文案"
          @click="goToStep(2)"
          :class="{ 'clickable': canAccessStep(2) }"
        />
        <el-step
          title="分镜脚本生成"
          description="生成视频分镜脚本"
          @click="goToStep(3)"
          :class="{ 'clickable': canAccessStep(3) }"
        />
      </el-steps>

      <div class="step-content">
        <!-- 步骤1：选题设置与生成 -->
        <div v-if="currentStep === 0" class="step-panel">
          <div class="step-title">
            <el-icon><Setting /></el-icon>
            <span>第一步：选题设置与生成</span>
          </div>

          <el-form :model="stepData.step1" label-width="120px" class="step-form">
            <el-form-item required>
              <template #label>
                <div class="collapse-title-with-tip">
                  <span>行业领域</span>
                  <el-tooltip effect="dark" placement="top" raw-content>
                    <template #content>
                      <div class="tooltip-content">
                        <div class="tip-title">行业领域说明：</div>
                        <div class="tip-text">• 准确描述您的业务领域或行业类别</div>
                        <div class="tip-text">• 如：汽车、医美、教育、餐饮、金融等</div>
                        <div class="tip-text">• 系统会根据行业特点生成相应的内容</div>
                        <div class="tip-text">• 越具体越好，有助于提升内容质量</div>
                      </div>
                    </template>
                    <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input
                v-model="stepData.step1.industry"
                placeholder="请输入您的行业，如：汽车、医美、教育、餐饮等"
                size="large"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item required>
              <template #label>
                <div class="collapse-title-with-tip">
                  <span>选题类型</span>
                  <el-tooltip effect="dark" placement="top" raw-content>
                    <template #content>
                      <div class="tooltip-content">
                        <div class="tip-title">选题类型说明：</div>
                        <div class="tip-text">• 不同类型决定了内容的主题方向和受众群体</div>
                        <div class="tip-text">• 根据您的行业特点选择最适合的类型</div>
                        <div class="tip-text">• 选择后系统会生成对应风格的选题内容</div>
                      </div>
                    </template>
                    <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-select
                v-model="stepData.step1.topicType"
                placeholder="请选择选题类型"
                style="width: 100%"
                size="large"
              >
                <el-option
                  v-for="type in topicTypes"
                  :key="type.value"
                  :label="`${type.label} - ${type.description}`"
                  :value="type.value"
                >
                  <div class="topic-option">
                    <div class="topic-title">{{ type.label }}</div>
                    <div class="topic-desc">{{ type.description }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <div class="generation-section">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                @click="generateTopics"
                :loading="loading.topics"
                :disabled="!canGenerateTopics"
                style="width: 200px;"
              >
                <el-icon><Plus /></el-icon>
                {{ loading.topics ? '正在生成选题...' : '生成选题' }}
              </el-button>
              <el-button
                type="warning"
                size="large"
                @click="showTopicFavoritesDialog"
                style="width: 200px;"
              >
                <el-icon><Star /></el-icon>
                从收藏选择选题
              </el-button>
              <el-button
                size="large"
                @click="showManualTopicDialog"
                style="width: 200px;"
              >
                <el-icon><Edit /></el-icon>
                手动输入选题
              </el-button>
            </div>

            <div v-if="stepData.step2.topics.length > 0" class="results-section">
              <h4>请选择一个选题：</h4>
              <div class="topics-grid">
                <div
                  v-for="(topic, index) in stepData.step2.topics"
                  :key="index"
                  class="topic-card"
                  :class="{ 'selected': stepData.step2.selectedTopic === topic }"
                >
                  <div class="topic-number">{{ index + 1 }}</div>
                  <div class="topic-text" @click="selectTopic(topic)">{{ topic }}</div>
                  <div class="card-actions">
                    <el-button
                      size="small"
                      type="text"
                      @click.stop="addToFavorites('topics', topic)"
                      class="favorite-btn"
                      title="添加到收藏"
                    >
                      <el-icon><Star /></el-icon>
                    </el-button>
                    <el-icon v-if="stepData.step2.selectedTopic === topic" class="check-icon">
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button
              type="primary"
              size="large"
              @click="nextStep"
              :disabled="!stepData.step2.selectedTopic"
            >
              下一步：生成钩子
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 步骤2：钩子设置与生成 -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="step-title">
            <el-icon><Star /></el-icon>
            <span>第二步：钩子设置与生成</span>
          </div>

          <div class="step-info">
            <el-tag type="info">行业：{{ stepData.step1.industry }}</el-tag>
            <el-tag type="success">已选选题：{{ stepData.step2.selectedTopic.substring(0, 30) }}...</el-tag>
          </div>

          <el-form :model="stepData.step3" label-width="120px" class="step-form">
            <el-form-item required>
              <template #label>
                <div class="collapse-title-with-tip">
                  <span>钩子类型</span>
                  <el-tooltip effect="dark" placement="top" raw-content>
                    <template #content>
                      <div class="tooltip-content">
                        <div class="tip-title">钩子类型说明：</div>
                        <div class="tip-text">• 钩子是吸引用户注意力的关键开场白</div>
                        <div class="tip-text">• 不同类型对应不同的心理触发机制</div>
                        <div class="tip-text">• 选择与您内容调性匹配的钩子类型</div>
                        <div class="tip-text">• 好的钩子能显著提升内容点击率和完播率</div>
                      </div>
                    </template>
                    <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-select
                v-model="stepData.step3.hookType"
                placeholder="请选择钩子类型"
                style="width: 100%"
                size="large"
              >
                <el-option
                  v-for="type in hookTypes"
                  :key="type.value"
                  :label="`${type.label} - ${type.description}`"
                  :value="type.value"
                >
                  <div class="hook-option">
                    <div class="hook-title">{{ type.label }}</div>
                    <div class="hook-desc">{{ type.description }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <div class="generation-section">
            <div class="action-buttons">
              <el-button
                type="warning"
                size="large"
                @click="generateHooks"
                :loading="loading.hooks"
                :disabled="!stepData.step3.hookType"
                style="width: 200px;"
              >
                <el-icon><Plus /></el-icon>
                {{ loading.hooks ? '正在生成钩子...' : '生成钩子' }}
              </el-button>
              <el-button
                type="primary"
                size="large"
                @click="showHookFavoritesDialog"
                style="width: 200px;"
              >
                <el-icon><Star /></el-icon>
                从收藏选择钩子
              </el-button>
              <el-button
                size="large"
                @click="showManualHookDialog"
                style="width: 200px;"
              >
                <el-icon><Edit /></el-icon>
                手动输入钩子
              </el-button>
            </div>

            <div v-if="stepData.step3.hooks.length > 0" class="results-section">
              <h4>请选择一个钩子：</h4>
              <div class="hooks-grid">
                <div
                  v-for="(hook, index) in stepData.step3.hooks"
                  :key="index"
                  class="hook-card"
                  :class="{ 'selected': stepData.step3.selectedHook === hook }"
                >
                  <div class="hook-number">{{ index + 1 }}</div>
                  <div class="hook-text" @click="selectHook(hook)">{{ hook }}</div>
                  <div class="card-actions">
                    <el-button
                      size="small"
                      type="text"
                      @click.stop="addToFavorites('hooks', hook)"
                      class="favorite-btn"
                      title="添加到收藏"
                    >
                      <el-icon><Star /></el-icon>
                    </el-button>
                    <el-icon v-if="stepData.step3.selectedHook === hook" class="check-icon">
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="nextStep"
              :disabled="!stepData.step3.selectedHook"
            >
              下一步：生成文案
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 步骤3：文案类型与生成 -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="step-title">
            <el-icon><Document /></el-icon>
            <span>第三步：文案类型与生成</span>
          </div>

          <div class="step-info">
            <el-tag type="info">行业：{{ stepData.step1.industry }}</el-tag>
            <el-tag type="success">选题：{{ stepData.step2.selectedTopic.substring(0, 20) }}...</el-tag>
            <el-tag type="warning">钩子：{{ stepData.step3.selectedHook.substring(0, 20) }}...</el-tag>
          </div>

          <el-form :model="stepData.step1" label-width="120px" class="step-form">
            <el-form-item required>
              <template #label>
                <div class="collapse-title-with-tip">
                  <span>文案类型</span>
                  <el-tooltip effect="dark" placement="top" raw-content>
                    <template #content>
                      <div class="tooltip-content">
                        <div class="tip-title">文案类型说明：</div>
                        <div class="tip-text">• 不同类型决定了文案的呈现形式和结构</div>
                        <div class="tip-text">• 视频脚本适合短视频平台，图文适合图文平台</div>
                        <div class="tip-text">• 选择符合您发布平台的文案类型</div>
                      </div>
                    </template>
                    <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-select
                v-model="stepData.step1.contentType"
                placeholder="请选择文案类型"
                style="width: 100%"
                size="large"
              >
                <el-option
                  v-for="type in contentTypes"
                  :key="type.value"
                  :label="`${type.label} - ${type.description}`"
                  :value="type.value"
                >
                  <div class="option-content">
                    <div class="option-title">{{ type.label }}</div>
                    <div class="option-desc">{{ type.description }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 高级文案配置选项 -->
            <div class="advanced-options">
              <el-collapse v-model="advancedOptionsOpen">
                <el-collapse-item name="1">
                  <template #title>
                    <div class="collapse-title-with-tip">
                      <span>高级选项配置（可选）</span>
                      <el-tooltip effect="dark" placement="top" raw-content>
                        <template #content>
                          <div class="tooltip-content">
                            <div class="tip-title">高级选项说明：</div>
                            <div class="tip-text">• 平台风格：针对不同平台优化内容风格</div>
                            <div class="tip-text">• 语调风格：调整文案的语言风格和情绪表达</div>
                            <div class="tip-text">• 视频时长：控制内容长度，适配不同时长需求</div>
                            <div class="tip-text">• 文字字数：精确控制文案字数，满足平台要求</div>
                            <div class="tip-text">• 所有选项都是可选的，不选则使用默认配置</div>
                          </div>
                        </template>
                        <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                  <div class="options-grid">
                    <!-- 平台风格 -->
                    <div class="option-group">
                      <h4>平台风格</h4>
                      <el-checkbox-group v-model="advancedConfig.platformStyle">
                        <el-checkbox value="douyin" label="抖音口播风（情绪冲击强+转化导向）" />
                        <el-checkbox value="xiaohongshu" label="红薯博主风（生活化+共鸣感强）" />
                        <el-checkbox value="bilibili" label="B站记录片风（写实细腻）" />
                      </el-checkbox-group>
                    </div>

                    <!-- 语调风格 -->
                    <div class="option-group">
                      <h4>语调风格</h4>
                      <el-checkbox-group v-model="advancedConfig.toneStyle">
                        <el-checkbox value="professional" label="严肃专业" />
                        <el-checkbox value="humorous" label="幽默风趣" />
                        <el-checkbox value="realistic" label="偏现实直白" />
                        <el-checkbox value="self-deprecating" label="带点自嘲" />
                      </el-checkbox-group>
                    </div>

                    <!-- 视频时长 -->
                    <div class="option-group">
                      <h4>视频时长</h4>
                      <el-checkbox-group v-model="advancedConfig.videoDuration">
                        <el-checkbox value="45" label="45秒" />
                        <el-checkbox value="60" label="60秒" />
                        <el-checkbox value="90" label="90秒" />
                        <el-checkbox value="custom" label="自定义" />
                      </el-checkbox-group>
                      <el-input
                        v-if="advancedConfig.videoDuration.includes('custom')"
                        v-model="advancedConfig.customDuration"
                        placeholder="请输入自定义时长（秒）"
                        type="number"
                        style="width: 200px; margin-top: 8px;"
                      />
                    </div>

                    <!-- 文字字数 -->
                    <div class="option-group">
                      <h4>文字字数</h4>
                      <el-checkbox-group v-model="advancedConfig.wordCount">
                        <el-checkbox value="300" label="300字" />
                        <el-checkbox value="600" label="600字" />
                        <el-checkbox value="900" label="900字" />
                        <el-checkbox value="custom" label="自定义" />
                      </el-checkbox-group>
                      <el-input
                        v-if="advancedConfig.wordCount.includes('custom')"
                        v-model="advancedConfig.customWordCount"
                        placeholder="请输入自定义字数"
                        type="number"
                        style="width: 200px; margin-top: 8px;"
                      />
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-form>

          <div class="generation-section">
            <div class="action-buttons">
              <el-button
                type="success"
                size="large"
                @click="generateContent"
                :loading="loading.content"
                :disabled="!stepData.step1.contentType"
                style="width: 250px;"
              >
                <el-icon><Plus /></el-icon>
                {{ loading.content ? '正在生成文案...' : '一键选题钩子生文案' }}
              </el-button>
              <el-button
                type="primary"
                size="large"
                @click="showContentFavoritesDialog"
                style="width: 200px;"
              >
                <el-icon><Star /></el-icon>
                从收藏选择文案
              </el-button>
            </div>

            <!-- 单个文案显示 -->
            <div v-if="stepData.step4.content" class="content-preview">
              <h4>生成的文案：</h4>
              <div class="content-display">
                <pre>{{ stepData.step4.content }}</pre>
              </div>
              <div class="content-actions">
                <el-button type="primary" @click="copyContent" :icon="CopyDocument">
                  复制文案
                </el-button>
                <el-button @click="regenerateContent" :icon="Refresh">
                  重新生成
                </el-button>
                <el-button type="success" @click="addToFavorites('contents', stepData.step4.content)" :icon="Star">
                  收藏文案
                </el-button>
              </div>
            </div>

          </div>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="nextStep"
              :disabled="!stepData.step4.content && !stepData.step4.selectedContent"
            >
              下一步：生成分镜脚本
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 步骤4：分镜脚本生成 -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="step-title">
            <el-icon><VideoCamera /></el-icon>
            <span>第四步：分镜脚本生成</span>
          </div>

          <div class="step-info">
            <el-tag type="info">行业：{{ stepData.step1.industry }}</el-tag>
            <el-tag type="success">选题：{{ stepData.step2.selectedTopic.substring(0, 20) }}...</el-tag>
            <el-tag type="warning">钩子：{{ stepData.step3.selectedHook.substring(0, 20) }}...</el-tag>
          </div>

          <el-form :model="stepData.step5" label-width="120px" class="step-form">
            <el-form-item required>
              <template #label>
                <span>脚本类型</span>
                <el-tooltip effect="dark" placement="top" raw-content>
                  <template #content>
                    <div class="tooltip-content">
                      <div class="tip-title">脚本类型说明：</div>
                      <div class="tip-text">• 决定分镜脚本的展现形式和详细程度</div>
                      <div class="tip-text">• 简洁版：突出关键场景，适合快节奏内容</div>
                      <div class="tip-text">• 详细版：包含完整描述，适合精细化制作</div>
                      <div class="tip-text">• 根据制作团队需求选择合适版本</div>
                    </div>
                  </template>
                  <el-icon class="help-icon-small"><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-select
                v-model="stepData.step5.storyboardType"
                placeholder="请选择脚本类型"
                style="width: 100%"
                size="large"
              >
                <el-option
                  v-for="type in storyboardTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="文案内容">
              <div class="content-preview-card">
                <div class="content-title">第三步生成的文案：</div>
                <div class="content-text">{{ stepData.step4.content }}</div>
                <div class="content-actions">
                  <el-button size="small" @click="editContent" :icon="Edit">
                    编辑文案
                  </el-button>
                  <el-button size="small" @click="showContentFavoritesDialog" :icon="Star">
                    从收藏选择
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>

          <div class="generation-section">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                @click="generateStoryboard"
                :loading="loading.storyboard"
                :disabled="!stepData.step5.storyboardType || !stepData.step4.content"
                style="width: 250px;"
              >
                <el-icon><VideoCamera /></el-icon>
                {{ loading.storyboard ? '正在生成分镜脚本...' : '生成分镜脚本' }}
              </el-button>
            </div>

            <div v-if="stepData.step5.storyboard" class="storyboard-preview">
              <h4>生成的分镜脚本：</h4>
              <div class="storyboard-container">
                <div class="storyboard-info">
                  <el-tag type="success">{{ getStoryboardTypeName(stepData.step5.storyboardType) }}</el-tag>
                  <span class="content-preview-text">基于文案生成</span>
                  <el-tag v-if="loading.storyboard" type="info" class="generating-tag">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    正在生成...
                  </el-tag>
                </div>
                <div class="storyboard-content">
                  <div class="storyboard-text" v-html="formatStoryboardContent(stepData.step5.storyboard)"></div>
                </div>
              </div>
              <div class="storyboard-actions">
                <el-button type="primary" @click="copyStoryboard" :icon="CopyDocument">
                  复制脚本
                </el-button>
                <el-button @click="downloadStoryboard" :icon="Download">
                  下载脚本
                </el-button>
                <el-button @click="regenerateStoryboard" :icon="Refresh">
                  重新生成
                </el-button>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button
              type="success"
              size="large"
              @click="startOver"
              v-if="stepData.step5.storyboard"
            >
              <el-icon><Refresh /></el-icon>
              重新开始
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 收藏选题对话框 -->
    <el-dialog v-model="topicFavoritesDialog" title="从收藏中选择选题" width="80%">
      <div v-if="favoriteTopics.length === 0" class="no-favorites">
        <el-empty description="暂无收藏的选题" />
      </div>
      <div v-else class="favorites-grid">
        <div
          v-for="topic in favoriteTopics"
          :key="topic.id"
          class="favorite-item"
          @click="selectFavoriteTopic(topic)"
        >
          <div class="favorite-content">{{ topic.content }}</div>
          <div class="favorite-meta">
            <el-tag size="small">{{ topic.contentType }}</el-tag>
            <el-tag size="small" type="info">{{ topic.industry }}</el-tag>
            <span class="favorite-date">{{ formatDate(topic.createdAt) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="topicFavoritesDialog = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 收藏钩子对话框 -->
    <el-dialog v-model="hookFavoritesDialog" title="从收藏中选择钩子" width="80%">
      <div v-if="favoriteHooks.length === 0" class="no-favorites">
        <el-empty description="暂无收藏的钩子" />
      </div>
      <div v-else class="favorites-grid">
        <div
          v-for="hook in favoriteHooks"
          :key="hook.id"
          class="favorite-item"
          @click="selectFavoriteHook(hook)"
        >
          <div class="favorite-content">{{ hook.content }}</div>
          <div class="favorite-meta">
            <el-tag size="small">{{ hook.contentType }}</el-tag>
            <el-tag size="small" type="info">{{ hook.industry }}</el-tag>
            <span class="favorite-date">{{ formatDate(hook.createdAt) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="hookFavoritesDialog = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 收藏文案对话框 -->
    <el-dialog v-model="contentFavoritesDialog" title="从收藏中选择文案" width="80%">
      <div v-if="favoriteContents.length === 0" class="no-favorites">
        <el-empty description="暂无收藏的文案" />
      </div>
      <div v-else class="favorites-grid">
        <div
          v-for="content in favoriteContents"
          :key="content.id"
          class="favorite-item content-item"
          @click="selectFavoriteContent(content)"
        >
          <div class="favorite-content">{{ content.content.substring(0, 200) }}...</div>
          <div class="favorite-meta">
            <el-tag size="small">{{ content.contentType }}</el-tag>
            <el-tag size="small" type="info">{{ content.industry }}</el-tag>
            <span class="favorite-date">{{ formatDate(content.createdAt) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="contentFavoritesDialog = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 手动输入选题对话框 -->
    <el-dialog v-model="manualTopicDialog" title="手动输入选题" width="50%">
      <el-form>
        <el-form-item label="选题内容">
          <el-input
            v-model="manualTopicInput"
            type="textarea"
            :rows="4"
            placeholder="请输入选题内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualTopicDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmManualTopic" :disabled="!manualTopicInput.trim()">确认</el-button>
      </template>
    </el-dialog>

    <!-- 手动输入钩子对话框 -->
    <el-dialog v-model="manualHookDialog" title="手动输入钩子" width="50%">
      <el-form>
        <el-form-item label="钩子内容">
          <el-input
            v-model="manualHookInput"
            type="textarea"
            :rows="4"
            placeholder="请输入钩子内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualHookDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmManualHook" :disabled="!manualHookInput.trim()">确认</el-button>
      </template>
    </el-dialog>

    <!-- 编辑文案对话框 -->
    <el-dialog v-model="editContentDialog" title="编辑文案内容" width="70%">
      <el-form>
        <el-form-item label="文案内容">
          <el-input
            v-model="editContentText"
            type="textarea"
            :rows="8"
            placeholder="请输入文案内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelEditContent">取消</el-button>
        <el-button type="primary" @click="confirmEditContent" :disabled="!editContentText.trim()">确认修改</el-button>
      </template>
    </el-dialog>


    <!-- 历史记录对话框 -->
    <el-dialog v-model="historyDialog" title="🕒 生成历史记录" width="80%" class="history-dialog">
      <div v-if="generationHistory.length === 0" class="no-history">
        <el-empty description="暂无生成历史记录">
          <template #image>
            <el-icon size="100" color="#C0C4CC"><Clock /></el-icon>
          </template>
          <template #description>
            <span>还没有生成过内容哦，快去生成你的第一条内容吧！</span>
          </template>
        </el-empty>
      </div>

      <div v-else class="history-content">
        <div class="history-header">
          <div class="history-stats">
            <el-tag type="info" size="large">
              <el-icon><Check /></el-icon>
              共 {{ generationHistory.length }} 条记录
            </el-tag>
          </div>
          <div class="history-actions">
            <el-popconfirm
              title="确定要清空所有历史记录吗？此操作不可恢复。"
              @confirm="clearAllHistory"
            >
              <template #reference>
                <el-button type="danger" size="small" :icon="Delete">
                  清空历史
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <div class="history-list">
          <div
            v-for="(item, index) in generationHistory"
            :key="item.id"
            class="history-item"
          >
            <div class="history-item-header">
              <div class="history-item-info">
                <el-tag
                  :type="item.generationType === 'random' ? 'success' : 'primary'"
                  size="small"
                >
                  {{ item.generationType === 'random' ? '随机生成' : '手动生成' }}
                </el-tag>
                <span class="history-time">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="history-item-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="replayHistory(item)"
                  :icon="Refresh"
                >
                  恢复记录
                </el-button>
                <el-popconfirm
                  title="确定要删除这条记录吗？"
                  @confirm="deleteHistoryItem(item.id)"
                >
                  <template #reference>
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                    >
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>

            <div class="history-item-content">
              <div class="history-meta">
                <div class="meta-row">
                  <span class="meta-label">行业：</span>
                  <span class="meta-value">{{ item.industry }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">选题类型：</span>
                  <span class="meta-value">{{ getTopicTypeName(item.topicType) }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">钩子类型：</span>
                  <span class="meta-value">{{ hookTypes.find(h => h.value === item.hookType)?.label || item.hookType }}</span>
                </div>
              </div>

              <div class="history-topics">
                <div class="history-section-title">选题：</div>
                <div class="history-section-content topic-content">
                  {{ item.selectedTopic }}
                </div>
              </div>

              <div class="history-hooks">
                <div class="history-section-title">钩子：</div>
                <div class="history-section-content hook-content">
                  {{ item.selectedHook }}
                </div>
              </div>

              <div class="history-final-content">
                <div class="history-section-title">最终文案：</div>
                <div class="history-section-content final-content">
                  {{ item.finalContent }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="historyDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Star,
  Document,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  CopyDocument,
  Refresh,
  Download,
  Edit,
  VideoCamera,
  Loading,
  Delete,
  QuestionFilled,
  Lightning,
  Switch,
  Clock
} from '@element-plus/icons-vue'
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'

export default {
  name: 'StepWizardGenerator',
  setup() {
    const currentStep = ref(0)

    const loading = reactive({
      topics: false,
      hooks: false,
      content: false,
      storyboard: false
    })

    const stepData = reactive({
      step1: {
        contentType: '',
        industry: '',
        topicType: ''
      },
      step2: {
        topics: [],
        selectedTopic: ''
      },
      step3: {
        hookType: '',
        hooks: [],
        selectedHook: ''
      },
      step4: {
        content: '',
        contents: [],
        selectedContent: ''
      },
      step5: {
        storyboard: '',
        storyboardType: '',
        originalContent: ''
      }
    })

    // 高级配置选项
    const advancedOptionsOpen = ref([])
    const advancedConfig = reactive({
      platformStyle: [],
      toneStyle: [],
      videoDuration: [],
      customDuration: '',
      wordCount: [],
      customWordCount: ''
    })

    // Dialog states
    const topicFavoritesDialog = ref(false)
    const hookFavoritesDialog = ref(false)
    const contentFavoritesDialog = ref(false)
    const manualTopicDialog = ref(false)
    const manualHookDialog = ref(false)

    // Manual input states
    const manualTopicInput = ref('')
    const manualHookInput = ref('')
    const editContentDialog = ref(false)
    const editContentText = ref('')

    // Favorites data
    const favoriteTopics = ref([])
    const favoriteHooks = ref([])
    const favoriteContents = ref([])

    // History data
    const generationHistory = ref([])
    const historyDialog = ref(false)

    // 文案类型定义（带描述）
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
      { value: 'headline', label: '头牌选题', description: '关注顶级人物或事物，满足用户对高端生活的好奇和向往' },
      { value: 'nostalgia', label: '怀旧选题', description: '触发回忆和情感共鸣，激发用户对过去美好时光的怀念' },
      { value: 'opposite', label: '对立选题', description: '通过鲜明对比和冲突，制造话题争议和讨论热度' },
      { value: 'worst', label: '最差选题', description: '展示极端负面案例，通过反面教材引发关注和讨论' },
      { value: 'hormone', label: '荷尔蒙选题', description: '激发生理和情感冲动，提升用户参与度和互动性' },
      { value: 'curious', label: '猎奇选题', description: '满足用户对新奇事物的好奇心，提供独特视角和见解' },
      { value: 'target', label: '圈人群选题', description: '精准定位特定群体，增强目标用户的认同感和归属感' },
      { value: 'cost', label: '成本选题', description: '关注价格和性价比，帮助用户做出明智的消费决策' }
    ]

    const hookTypes = [
      { value: 'target_audience', label: '圈定人群', description: '通过精准定位目标受众群体，增强内容针对性和认同感' },
      { value: 'direct_question', label: '直接提问', description: '以疑问句开头，激发用户好奇心和参与欲望' },
      { value: 'self_denial', label: '自我否定', description: '通过自我批评或反思，拉近与用户的距离' },
      { value: 'counter_cognition', label: '反认知', description: '颠覆常识认知，制造认知冲突吸引注意力' },
      { value: 'high_value', label: '高价值展示', description: '展示高价值内容或成果，建立权威性和吸引力' },
      { value: 'hit_pain_point', label: '直击痛点', description: '精准抓住用户痛点，引发强烈情感共鸣' },
      { value: 'loss_aversion', label: '损失厌恶', description: '利用人们害怕失去的心理，促进行动和转化' },
      { value: 'contrast_opposition', label: '对比对立', description: '通过鲜明对比突出差异，增强说服力' },
      { value: 'celebrity_trend', label: '头牌借势', description: '借助名人或热点事件，提升内容传播力' },
      { value: 'warning_pitfall', label: '警告避坑', description: '提醒用户注意风险，建立信任和权威感' },
      { value: 'emotional_resonance', label: '情感共鸣', description: '触动用户内心情感，建立深层次连接' },
      { value: 'curiosity_gap', label: '好奇缺口', description: '制造信息缺口，激发用户强烈好奇心' },
      { value: 'social_proof', label: '社会认同', description: '展示他人行为或选择，利用从众心理' },
      { value: 'urgency_scarcity', label: '紧迫稀缺', description: '营造紧迫感和稀缺性，促进即时行动' },
      { value: 'story_narrative', label: '故事叙述', description: '通过生动故事情节，增强内容吸引力和记忆点' },
      { value: 'data_shock', label: '数据震撼', description: '用惊人数据或统计结果，增强说服力' },
      { value: 'before_after', label: '前后对比', description: '展示改变前后的巨大差异，突出效果' },
      { value: 'insider_secret', label: '内幕揭秘', description: '分享独家信息或内幕，满足用户探秘欲' },
      { value: 'step_by_step', label: '步骤指导', description: '提供具体操作步骤，增加实用性和可执行性' },
      { value: 'mistake_warning', label: '错误警示', description: '指出常见错误，帮助用户避免踩坑' },
      { value: 'trend_analysis', label: '趋势分析', description: '分析行业趋势或未来发展，展现前瞻性' },
      { value: 'personal_experience', label: '个人经历', description: '分享真实个人体验，增强可信度和亲近感' },
      { value: 'expert_opinion', label: '专家观点', description: '引用权威专家意见，提升内容专业性' },
      { value: 'challenge_assumption', label: '挑战假设', description: '质疑固有观念，引发用户深度思考' },
      { value: 'solution_reveal', label: '解决方案', description: '直接提供问题解决方案，满足用户需求' },
      { value: 'behind_scenes', label: '幕后揭秘', description: '展示背后的过程或真相，增加透明度' },
      { value: 'transformation_story', label: '转变故事', description: '讲述成长或改变的故事，激发用户共鸣' },
      { value: 'competitive_analysis', label: '竞品对比', description: '分析竞争对手优劣，帮助用户做出选择' },
      { value: 'resource_sharing', label: '资源分享', description: '提供有价值的资源或工具，增加实用性' },
      { value: 'myth_busting', label: '辟谣澄清', description: '澄清误解或谣言，建立正确认知' },
      { value: 'timeline_review', label: '时间回顾', description: '回顾历史或发展过程，提供全面视角' },
      { value: 'future_prediction', label: '未来预测', description: '预测未来发展或变化，展现洞察力' },
      { value: 'cost_benefit', label: '成本收益', description: '分析投入产出比，帮助用户理性决策' },
      { value: 'quick_win', label: '速效技巧', description: '提供立即见效的方法或技巧' },
      { value: 'deep_dive', label: '深度剖析', description: '深入分析复杂问题，提供专业见解' },
      { value: 'community_voice', label: '社群声音', description: '汇集用户或社群意见，增强集体认同感' }
    ]

    const storyboardTypes = ref([])

    // 计算属性
    const canGenerateTopics = computed(() => {
      return stepData.step1.industry.trim() &&
             stepData.step1.topicType
    })

    const canGenerateContent = computed(() => {
      return stepData.step1.contentType &&
             stepData.step2.selectedTopic &&
             stepData.step3.selectedHook
    })

    // 辅助方法
    const getContentTypeName = (value) => {
      const type = contentTypes.find(t => t.value === value)
      return type ? type.label : value
    }

    const getTopicTypeName = (value) => {
      const type = topicTypes.find(t => t.value === value)
      return type ? type.label : value
    }

    // 步骤导航
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    const goToStep = (step) => {
      if (canAccessStep(step)) {
        currentStep.value = step
      }
    }

    const canAccessStep = (step) => {
      if (step === 0) return true
      if (step === 1) return stepData.step2.selectedTopic // 有选题才能进入第二步
      if (step === 2) return stepData.step2.selectedTopic && stepData.step3.selectedHook // 有选题和钩子才能进入第三步
      if (step === 3) return stepData.step2.selectedTopic && stepData.step3.selectedHook && (stepData.step4.content || stepData.step4.selectedContent) // 有选题、钩子和文案才能进入第四步
      return false
    }

    const skipToStep = (step) => {
      // 跳过步骤时设置默认值
      if (step === 1 && !stepData.step1.contentType) {
        stepData.step1.contentType = 'story'
        stepData.step1.industry = '通用'
        stepData.step1.topicType = 'headline'
      }
      currentStep.value = step
      ElMessage.success('已跳过基础设置，使用默认配置')
    }

    const startOver = () => {
      currentStep.value = 0
      // 重置所有数据
      Object.assign(stepData.step1, { contentType: '', industry: '', topicType: '' })
      Object.assign(stepData.step2, { topics: [], selectedTopic: '' })
      Object.assign(stepData.step3, { hookType: '', hooks: [], selectedHook: '' })
      Object.assign(stepData.step4, { content: '', contents: [], selectedContent: '' })
      Object.assign(stepData.step5, { storyboard: '', storyboardType: '', originalContent: '' })
      // 清除保存的状态
      clearSavedState()
      ElMessage.success('已重置所有数据')
    }


    // 生成选题
    const generateTopics = async () => {
      loading.topics = true
      try {
        const requestData = {
          topicType: stepData.step1.topicType,
          industry: stepData.step1.industry
        }

        const response = await axios.post('/api/generate-topics', requestData)

        if (response.data.success) {
          stepData.step2.topics = response.data.data
          ElMessage.success(`成功生成 ${response.data.data.length} 条选题`)
        } else {
          ElMessage.error(response.data.error || '生成失败')
        }
      } catch (error) {
        console.error('生成选题失败:', error)
        ElMessage.error('生成选题失败，请检查网络连接')
      } finally {
        loading.topics = false
      }
    }

    const selectTopic = (topic) => {
      stepData.step2.selectedTopic = topic
      ElMessage.success('选题已选择')
      // 自动进入下一步
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    // 生成钩子
    const generateHooks = async () => {
      loading.hooks = true
      try {
        const requestData = {
          hookType: stepData.step3.hookType,
          topic: stepData.step2.selectedTopic
        }

        const response = await axios.post('/api/generate-hooks', requestData)

        if (response.data.success) {
          stepData.step3.hooks = response.data.data
          ElMessage.success(`成功生成 ${response.data.data.length} 条钩子`)
        } else {
          ElMessage.error(response.data.error || '生成失败')
        }
      } catch (error) {
        console.error('生成钩子失败:', error)
        ElMessage.error('生成钩子失败，请检查网络连接')
      } finally {
        loading.hooks = false
      }
    }

    const selectHook = (hook) => {
      stepData.step3.selectedHook = hook
      ElMessage.success('钩子已选择')
      // 自动进入下一步
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    // 生成文案
    const generateContent = async () => {
      loading.content = true

      stepData.step4.content = ''

      try {
        // 构建高级配置选项
        const advancedOptions = {}

        if (advancedConfig.platformStyle.length > 0) {
          advancedOptions.platformStyle = advancedConfig.platformStyle
        }

        if (advancedConfig.toneStyle.length > 0) {
          advancedOptions.toneStyle = advancedConfig.toneStyle
        }

        if (advancedConfig.videoDuration.length > 0) {
          const duration = advancedConfig.videoDuration.includes('custom')
            ? advancedConfig.customDuration
            : advancedConfig.videoDuration
          advancedOptions.videoDuration = duration
        }

        if (advancedConfig.wordCount.length > 0) {
          const wordCount = advancedConfig.wordCount.includes('custom')
            ? advancedConfig.customWordCount
            : advancedConfig.wordCount
          advancedOptions.wordCount = wordCount
        }

        const requestBody = {
          type: stepData.step1.contentType,
          topic: stepData.step2.selectedTopic,
          hook: stepData.step3.selectedHook,
          advancedOptions: advancedOptions
        }

        const response = await fetch('/api/generate-content-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
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
                loading.content = false
                return
              }

              try {
                const data = JSON.parse(dataStr)

                {
                  // 单个模式处理
                  if (data.type === 'chunk') {
                    stepData.step4.content = data.fullContent
                  } else if (data.type === 'complete') {
                    stepData.step4.content = data.content
                    ElMessage.success('文案生成完成')

                    // 保存到历史记录
                    saveToHistory({
                      ...stepData,
                      generationType: 'single',
                      generateMode: 'content',
                      timestamp: new Date().toISOString()
                    })
                  } else if (data.type === 'error') {
                    ElMessage.error(data.error)
                  }
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
        loading.content = false
      }
    }

    const regenerateContent = () => {
      generateContent()
    }

    const copyContent = async () => {
      const contentToCopy = stepData.step4.selectedContent || stepData.step4.content
      if (!contentToCopy) return

      try {
        await navigator.clipboard.writeText(contentToCopy)
        ElMessage.success('文案已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = contentToCopy
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('文案已复制到剪贴板')
      }
    }

    const downloadContent = () => {
      if (!stepData.step4.content) return

      const blob = new Blob([stepData.step4.content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `生成文案_${new Date().toLocaleDateString()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      ElMessage.success('文案已下载')
    }

    // 加载分镜脚本类型
    const loadStoryboardTypes = async () => {
      try {
        const response = await axios.get('/api/storyboards')
        storyboardTypes.value = response.data.map(item => ({
          value: item.type,
          label: item.name
        }))
      } catch (error) {
        console.error('加载分镜脚本类型失败:', error)
        ElMessage.error('加载分镜脚本类型失败')
      }
    }

    // 获取分镜脚本类型名称
    const getStoryboardTypeName = (type) => {
      const typeObj = storyboardTypes.value.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    }

    // 生成分镜脚本
    const generateStoryboard = async () => {
      if (!stepData.step5.storyboardType || !stepData.step4.content) {
        ElMessage.warning('请选择脚本类型并确认文案内容')
        return
      }

      loading.storyboard = true
      stepData.step5.storyboard = ''
      stepData.step5.originalContent = stepData.step4.content

      try {
        const response = await fetch('/api/generate-storyboard-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: stepData.step5.storyboardType,
            content: stepData.step4.content
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()

              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                  const dataStr = line.slice(6)

                  if (dataStr.trim() === '[DONE]') {
                    loading.storyboard = false
                    ElMessage.success('分镜脚本生成完成！')
                    return
                  }

                  try {
                    const data = JSON.parse(dataStr)

                    if (data.type === 'chunk') {
                      stepData.step5.storyboard += data.content
                    } else if (data.type === 'complete') {
                      loading.storyboard = false
                      ElMessage.success('分镜脚本生成完成！')
                      return
                    } else if (data.type === 'error') {
                      loading.storyboard = false
                      ElMessage.error(data.error || '生成失败')
                      return
                    }
                  } catch (parseError) {
                    console.error('解析流数据失败:', parseError)
                  }
                }
              }
            }
          } catch (streamError) {
            console.error('读取流数据失败:', streamError)
            loading.storyboard = false
            ElMessage.error('数据流中断，请重试')
          }
        }

        processStream()

        // 120秒超时处理
        setTimeout(() => {
          if (loading.storyboard) {
            loading.storyboard = false
            ElMessage.error('生成超时，请重试')
          }
        }, 120000)

      } catch (error) {
        console.error('生成分镜脚本失败:', error)
        loading.storyboard = false
        ElMessage.error('生成分镜脚本失败，请检查网络连接')
      }
    }

    const regenerateStoryboard = () => {
      generateStoryboard()
    }

    const copyStoryboard = async () => {
      if (!stepData.step5.storyboard) return

      try {
        await navigator.clipboard.writeText(stepData.step5.storyboard)
        ElMessage.success('分镜脚本已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = stepData.step5.storyboard
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('分镜脚本已复制到剪贴板')
      }
    }

    // 下载分镜脚本
    const downloadStoryboard = () => {
      if (!stepData.step5.storyboard) {
        ElMessage.warning('没有可下载的分镜脚本')
        return
      }

      const storyboardContent = stepData.step5.storyboard
      const isTable = storyboardContent.includes('| 镜头号') || storyboardContent.includes('|镜头号') ||
                      storyboardContent.includes('| 第1镜') || storyboardContent.includes('|第1镜') ||
                      (storyboardContent.includes('|') && storyboardContent.includes('镜头') && storyboardContent.includes('场景'))

      if (isTable) {
        try {
          const tableData = parseTableData(storyboardContent)
          if (tableData.length > 0) {
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.aoa_to_sheet(tableData)

            // 设置列宽
            const colWidths = []
            if (tableData[0]) {
              for (let i = 0; i < tableData[0].length; i++) {
                let maxWidth = 12
                if (i === 0) {
                  maxWidth = 8
                } else {
                  maxWidth = 18
                  for (let j = 0; j < tableData.length; j++) {
                    if (tableData[j][i]) {
                      const cellLength = tableData[j][i].toString().length
                      if (cellLength > 30) {
                        maxWidth = Math.min(maxWidth * 1.3, 25)
                      }
                    }
                  }
                }
                colWidths.push({ wch: maxWidth })
              }
            }
            ws['!cols'] = colWidths

            // 设置行高
            const rowHeights = []
            for (let i = 0; i < tableData.length; i++) {
              let height
              if (i === 0) {
                height = 35
              } else {
                let maxContentLength = 0
                for (let j = 0; j < tableData[i].length; j++) {
                  if (tableData[i][j]) {
                    const contentLength = tableData[i][j].toString().length
                    maxContentLength = Math.max(maxContentLength, contentLength)
                  }
                }
                height = maxContentLength > 30 ?
                         Math.min(50 + Math.floor(maxContentLength / 20) * 15, 120) : 50
              }
              rowHeights.push({ hpt: height })
            }
            ws['!rows'] = rowHeights

            // 设置单元格样式
            const range = XLSX.utils.decode_range(ws['!ref'])
            for (let row = range.s.r; row <= range.e.r; row++) {
              for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
                if (!ws[cellAddress]) continue

                let cellStyle = {
                  border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                  },
                  alignment: {
                    vertical: 'center',
                    horizontal: 'left',
                    wrapText: true
                  },
                  font: {
                    name: 'Microsoft YaHei',
                    sz: 11,
                    color: { rgb: '000000' }
                  }
                }

                if (row === 0) {
                  cellStyle = {
                    ...cellStyle,
                    fill: {
                      patternType: 'solid',
                      fgColor: { rgb: '409EFF' },
                      bgColor: { rgb: '409EFF' }
                    },
                    font: {
                      name: 'Microsoft YaHei',
                      sz: 12,
                      bold: true,
                      color: { rgb: 'FFFFFF' }
                    },
                    alignment: {
                      ...cellStyle.alignment,
                      horizontal: 'center'
                    }
                  }
                }

                ws[cellAddress].s = cellStyle
              }
            }

            // 设置打印选项
            ws['!printHeader'] = [tableData[0]]
            ws['!margins'] = {
              left: 0.7,
              right: 0.7,
              top: 0.75,
              bottom: 0.75,
              header: 0.3,
              footer: 0.3
            }

            XLSX.utils.book_append_sheet(wb, ws, '分镜脚本')

            // 设置工作簿属性
            wb.Props = {
              Title: `${getStoryboardTypeName(stepData.step5.storyboardType)}分镜脚本`,
              Subject: '分镜脚本',
              Author: '分镜脚本生成器',
              CreatedDate: new Date()
            }

            const fileName = `${getStoryboardTypeName(stepData.step5.storyboardType)}_分镜脚本_${new Date().toISOString().slice(0, 10)}.xlsx`
            XLSX.writeFile(wb, fileName)
            ElMessage.success('分镜脚本XLSX文件下载成功')
          } else {
            throw new Error('表格数据解析失败')
          }
        } catch (error) {
          console.error('XLSX生成失败:', error)
          downloadAsText()
        }
      } else {
        downloadAsText()
      }
    }

    // 下载为纯文本
    const downloadAsText = () => {
      const content = `${getStoryboardTypeName(stepData.step5.storyboardType)}分镜脚本\n\n原文案：\n${stepData.step5.originalContent}\n\n分镜脚本：\n${stepData.step5.storyboard}`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${getStoryboardTypeName(stepData.step5.storyboardType)}_分镜脚本_${new Date().toISOString().slice(0, 10)}.txt`
      link.click()
      ElMessage.success('分镜脚本TXT文件下载成功')
    }

    // 解析表格数据
    const parseTableData = (content) => {
      const lines = content.split('\n')
      const tableData = []

      for (let line of lines) {
        line = line.trim()

        if (!line || !line.includes('|')) continue
        if (line.includes('---') || line.includes(':---')) continue

        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')

        if (cells.length >= 2) {
          const cleanCells = cells.map(cell =>
            cell.replace(/\*+/g, '').replace(/#+/g, '').trim()
          )
          tableData.push(cleanCells)
        }
      }

      return tableData
    }

    // 格式化分镜脚本内容
    const formatStoryboardContent = (content) => {
      if (!content) return ''

      const hasTable = content.includes('| 镜头号') || content.includes('|镜头号') ||
                       content.includes('| 第1镜') || content.includes('|第1镜') ||
                       (content.includes('|') && content.includes('镜头') && content.includes('场景'))

      if (hasTable) {
        return renderAsTable(content)
      } else {
        return renderAsText(content)
      }
    }

    // 表格渲染函数
    const renderAsTable = (content) => {
      const lines = content.split('\n')
      let tableHtml = '<div class="storyboard-table"><table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 2px solid #409eff; background: white;"><tbody>'
      let headerProcessed = false

      for (let line of lines) {
        line = line.trim()

        if (!line || !line.includes('|')) continue
        if (line.includes('---') || line.includes(':---')) continue

        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')

        if (cells.length >= 2) {
          const isHeader = !headerProcessed && (
            cells.some(cell => cell.includes('镜头') || cell.includes('场景') ||
                              cell.includes('运镜') || cell.includes('画面') ||
                              cell.includes('台词') || cell.includes('时间'))
          )

          if (isHeader) {
            tableHtml += '<tr class="table-header">'
            headerProcessed = true
          } else {
            tableHtml += '<tr>'
          }

          cells.forEach(cell => {
            const cleanCell = cell.replace(/\*+/g, '').trim()
            const tag = isHeader ? 'th' : 'td'
            const cellStyle = isHeader
              ? 'style="border: 1px solid #409eff; padding: 12px 8px; background: linear-gradient(135deg, #409eff 0%, #67c23a 100%); color: white; font-weight: bold;"'
              : 'style="border: 1px solid #409eff; padding: 12px 8px; background: white;"'
            tableHtml += `<${tag} ${cellStyle}>${cleanCell}</${tag}>`
          })

          tableHtml += '</tr>'
        }
      }

      tableHtml += '</tbody></table></div>'

      const otherContent = lines
        .filter(line => line.trim() && !line.includes('|'))
        .map(line => `<div class="text-line">${line.trim()}</div>`)
        .join('')

      return tableHtml + otherContent
    }

    // 普通文本渲染函数
    const renderAsText = (content) => {
      return content.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
          if (line.includes('分镜') || line.includes('脚本') || line.startsWith('#')) {
            return `<h3 class="storyboard-heading">${line.replace(/^#+\s*/, '')}</h3>`
          }
          return `<div class="text-line">${line}</div>`
        })
        .join('')
    }

    // 编辑文案
    const editContent = () => {
      editContentText.value = stepData.step4.content
      editContentDialog.value = true
    }

    const confirmEditContent = () => {
      if (editContentText.value.trim()) {
        stepData.step4.content = editContentText.value.trim()
        editContentDialog.value = false
        ElMessage.success('文案已更新')
      }
    }

    const cancelEditContent = () => {
      editContentDialog.value = false
      editContentText.value = ''
    }

    // 数据持久化相关
    const STORAGE_KEY = 'contentGeneratorState'
    const AUTO_SAVE_DELAY = 1000 // 1秒延时保存
    let saveTimeout = null

    // 保存状态到localStorage
    const saveState = () => {
      try {
        const state = {
          currentStep: currentStep.value,
          stepData: stepData,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('保存状态失败:', error)
      }
    }

    // 从localStorage恢复状态
    const restoreState = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState) {
          const state = JSON.parse(savedState)

          // 检查数据是否为今日内的数据（避免恢复过期数据）
          const saveTime = new Date(state.timestamp)
          const now = new Date()
          const diffHours = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60)

          if (diffHours < 24) { // 24小时内的数据可以恢复
            // 恢复步骤状态
            if (state.currentStep !== undefined && state.currentStep >= 0 && state.currentStep <= 3) {
              currentStep.value = state.currentStep
            }

            // 恢复步骤数据
            if (state.stepData) {
              // 保留现有数据结构，只覆盖有值的字段
              if (state.stepData.step1) {
                Object.assign(stepData.step1, state.stepData.step1)
              }
              if (state.stepData.step2) {
                Object.assign(stepData.step2, state.stepData.step2)
              }
              if (state.stepData.step3) {
                Object.assign(stepData.step3, state.stepData.step3)
              }
              if (state.stepData.step4) {
                Object.assign(stepData.step4, state.stepData.step4)
              }
              if (state.stepData.step5) {
                Object.assign(stepData.step5, state.stepData.step5)
              }
            }

            ElMessage.success('已恢复上次的工作进度')
          } else {
            // 清除过期数据
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error('恢复状态失败:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // 防抖自动保存
    const autoSave = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      saveTimeout = setTimeout(() => {
        saveState()
      }, AUTO_SAVE_DELAY)
    }

    // 清除保存的状态
    const clearSavedState = () => {
      try {
        localStorage.removeItem(STORAGE_KEY)
        ElMessage.success('已清除保存的进度数据')
      } catch (error) {
        console.error('清除状态失败:', error)
        ElMessage.error('清除进度失败')
      }
    }

    // 监听数据变化，自动保存
    watch(
      () => [currentStep.value, stepData],
      () => {
        autoSave()
      },
      { deep: true }
    )


    // 组件加载时初始化
    onMounted(() => {
      loadStoryboardTypes()
      restoreState()

    })

    // 组件卸载时清理
    onUnmounted(() => {

      // 清理定时器
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    })

    // 加载收藏数据
    const loadFavorites = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('myFavorites') || '{ "topics": [], "hooks": [], "contents": [] }')
        favoriteTopics.value = favorites.topics || []
        favoriteHooks.value = favorites.hooks || []
        favoriteContents.value = favorites.contents || []
      } catch (error) {
        console.error('加载收藏数据失败:', error)
      }
    }

    // 显示收藏对话框
    const showTopicFavoritesDialog = () => {
      loadFavorites()
      topicFavoritesDialog.value = true
    }

    const showHookFavoritesDialog = () => {
      loadFavorites()
      hookFavoritesDialog.value = true
    }

    const showContentFavoritesDialog = () => {
      loadFavorites()
      contentFavoritesDialog.value = true
    }

    // 显示手动输入对话框
    const showManualTopicDialog = () => {
      manualTopicInput.value = ''
      manualTopicDialog.value = true
    }

    const showManualHookDialog = () => {
      manualHookInput.value = ''
      manualHookDialog.value = true
    }

    // 选择收藏内容
    const selectFavoriteTopic = (topic) => {
      stepData.step2.selectedTopic = topic.content
      stepData.step2.topics = [topic.content]
      topicFavoritesDialog.value = false
      ElMessage.success('已选择收藏的选题')
      // 自动进入下一步
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    const selectFavoriteHook = (hook) => {
      stepData.step3.selectedHook = hook.content
      stepData.step3.hooks = [hook.content]
      hookFavoritesDialog.value = false
      ElMessage.success('已选择收藏的钩子')
      // 自动进入下一步
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    const selectFavoriteContent = (content) => {
      stepData.step4.content = content.content
      contentFavoritesDialog.value = false
      ElMessage.success('已选择收藏的文案')
      // 自动进入下一步
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    // 确认手动输入
    const confirmManualTopic = () => {
      if (manualTopicInput.value.trim()) {
        stepData.step2.selectedTopic = manualTopicInput.value.trim()
        stepData.step2.topics = [manualTopicInput.value.trim()]
        manualTopicDialog.value = false
        ElMessage.success('已输入自定义选题')
        // 自动进入下一步
        setTimeout(() => {
          nextStep()
        }, 500)
      }
    }

    const confirmManualHook = () => {
      if (manualHookInput.value.trim()) {
        stepData.step3.selectedHook = manualHookInput.value.trim()
        stepData.step3.hooks = [manualHookInput.value.trim()]
        manualHookDialog.value = false
        ElMessage.success('已输入自定义钩子')
        // 自动进入下一步
        setTimeout(() => {
          nextStep()
        }, 500)
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    // 添加到收藏
    const addToFavorites = (type, data) => {
      try {
        // 获取现有收藏数据
        const existingFavorites = JSON.parse(localStorage.getItem('myFavorites') || '{ "topics": [], "hooks": [], "contents": [] }')

        // 创建收藏项
        let favoriteItem = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          contentType: getContentTypeName(stepData.step1.contentType),
          industry: stepData.step1.industry,
          createdAt: new Date().toISOString()
        }

        if (type === 'topics') {
          favoriteItem.content = data
        } else if (type === 'hooks') {
          favoriteItem.content = data
          favoriteItem.topic = stepData.step2.selectedTopic
        } else if (type === 'contents') {
          favoriteItem.content = data
          favoriteItem.topic = stepData.step2.selectedTopic
          favoriteItem.hook = stepData.step3.selectedHook
        }

        // 检查是否已经存在相同内容
        const isAlreadyFavorited = existingFavorites[type].some(item => item.content === data)
        if (isAlreadyFavorited) {
          ElMessage.warning('该内容已经在收藏中')
          return
        }

        // 添加到收藏列表
        existingFavorites[type].push(favoriteItem)

        // 保存到localStorage
        localStorage.setItem('myFavorites', JSON.stringify(existingFavorites))

        ElMessage.success('添加到收藏成功')
      } catch (error) {
        console.error('添加收藏失败:', error)
        ElMessage.error('添加收藏失败')
      }
    }

    // 历史记录管理
    const saveToHistory = (data) => {
      try {
        const historyItem = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          industry: data.industry,
          contentType: data.contentType,
          topicType: data.topicType,
          hookType: data.hookType,
          selectedTopic: data.selectedTopic,
          selectedHook: data.selectedHook,
          finalContent: data.finalContent,
          generationType: data.generationType || 'manual', // manual or random
          createdAt: new Date().toISOString()
        }

        const existingHistory = JSON.parse(localStorage.getItem('generationHistory') || '[]')
        existingHistory.unshift(historyItem) // 添加到开头，保持最新的在前面

        // 限制历史记录数量，最多保存50条
        if (existingHistory.length > 50) {
          existingHistory.splice(50)
        }

        localStorage.setItem('generationHistory', JSON.stringify(existingHistory))
        generationHistory.value = existingHistory
      } catch (error) {
        console.error('保存历史记录失败:', error)
      }
    }

    const loadHistory = () => {
      try {
        const history = JSON.parse(localStorage.getItem('generationHistory') || '[]')
        generationHistory.value = history
      } catch (error) {
        console.error('加载历史记录失败:', error)
        generationHistory.value = []
      }
    }

    const showHistoryDialog = () => {
      loadHistory()
      historyDialog.value = true
    }

    const replayHistory = (historyItem) => {
      try {
        // 恢复历史数据到当前状态
        stepData.step1.industry = historyItem.industry
        stepData.step1.contentType = historyItem.contentType
        stepData.step1.topicType = historyItem.topicType
        stepData.step2.selectedTopic = historyItem.selectedTopic
        stepData.step3.hookType = historyItem.hookType
        stepData.step3.selectedHook = historyItem.selectedHook
        stepData.step4.content = historyItem.finalContent
        stepData.step4.selectedContent = historyItem.finalContent

        // 跳转到结果页面
        currentStep.value = 3
        historyDialog.value = false

        ElMessage.success('已恢复历史记录')
      } catch (error) {
        console.error('恢复历史记录失败:', error)
        ElMessage.error('恢复历史记录失败')
      }
    }

    const deleteHistoryItem = (itemId) => {
      try {
        const existingHistory = JSON.parse(localStorage.getItem('generationHistory') || '[]')
        const updatedHistory = existingHistory.filter(item => item.id !== itemId)

        localStorage.setItem('generationHistory', JSON.stringify(updatedHistory))
        generationHistory.value = updatedHistory

        ElMessage.success('删除历史记录成功')
      } catch (error) {
        console.error('删除历史记录失败:', error)
        ElMessage.error('删除历史记录失败')
      }
    }

    const clearAllHistory = () => {
      try {
        localStorage.removeItem('generationHistory')
        generationHistory.value = []
        ElMessage.success('已清空所有历史记录')
      } catch (error) {
        console.error('清空历史记录失败:', error)
        ElMessage.error('清空历史记录失败')
      }
    }

    // 组件挂载时加载历史记录
    onMounted(() => {
      loadHistory()
    })

    return {
      currentStep,
      loading,
      stepData,
      contentTypes,
      topicTypes,
      hookTypes,
      canGenerateTopics,
      canGenerateContent,
      getContentTypeName,
      getTopicTypeName,
      nextStep,
      prevStep,
      goToStep,
      skipToStep,
      canAccessStep,
      startOver,
      generateTopics,
      selectTopic,
      generateHooks,
      selectHook,
      generateContent,
      regenerateContent,
      copyContent,
      downloadContent,
      generateStoryboard,
      regenerateStoryboard,
      copyStoryboard,
      downloadStoryboard,
      formatStoryboardContent,
      getStoryboardTypeName,
      storyboardTypes,
      editContent,
      confirmEditContent,
      cancelEditContent,
      addToFavorites,
      // History functions
      generationHistory,
      historyDialog,
      showHistoryDialog,
      replayHistory,
      deleteHistoryItem,
      clearAllHistory,
      formatDate,
      saveToHistory,

      // Dialog states
      topicFavoritesDialog,
      hookFavoritesDialog,
      contentFavoritesDialog,
      manualTopicDialog,
      manualHookDialog,
      editContentDialog,
      editContentText,

      // Manual input
      manualTopicInput,
      manualHookInput,

      // Favorites data
      favoriteTopics,
      favoriteHooks,
      favoriteContents,

      // Dialog functions
      showTopicFavoritesDialog,
      showHookFavoritesDialog,
      showContentFavoritesDialog,
      showManualTopicDialog,
      showManualHookDialog,
      selectFavoriteTopic,
      selectFavoriteHook,
      selectFavoriteContent,
      confirmManualTopic,
      confirmManualHook,
      formatDate,

      // Data persistence
      saveState,
      restoreState,
      clearSavedState,

      // Advanced options
      advancedConfig,
      advancedOptionsOpen,

      // Icons
      Setting,
      Star,
      Document,
      Plus,
      ArrowLeft,
      ArrowRight,
      Check,
      CopyDocument,
      Refresh,
      Download,
      Edit,
      VideoCamera,
      Loading,
          Delete,
      QuestionFilled,
      Lightning,
      Switch
    }
  }
}
</script>

<style scoped>
.step-wizard-generator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.wizard-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.wizard-header {
  text-align: center;
}

.wizard-header h2 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-size: 28px;
}

.wizard-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.steps-indicator {
  margin: 40px 0;
  padding: 0 20px;
}

.step-content {
  min-height: 600px;
  padding: 20px;
}

.step-panel {
  animation: fadeIn 0.3s ease-in;
}

.step-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e6f7ff;
}

.step-title .el-icon {
  margin-right: 10px;
  font-size: 24px;
}

.step-form {
  max-width: 600px;
  margin: 0 auto 40px auto;
}

.step-info {
  margin-bottom: 30px;
  text-align: center;
}

.step-info .el-tag {
  margin: 0 8px;
  font-size: 14px;
  padding: 8px 16px;
}

.generation-section {
  text-align: center;
  margin-bottom: 40px;
}

.results-section h4 {
  color: #333;
  margin-bottom: 20px;
  text-align: left;
}

.topics-grid, .hooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.topic-card, .hook-card {
  position: relative;
  padding: 20px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.favorite-btn {
  opacity: 0.6;
  transition: opacity 0.3s ease;
  padding: 4px;
}

.favorite-btn:hover {
  opacity: 1;
  background: rgba(255, 193, 7, 0.1);
}

.topic-card:hover .favorite-btn,
.hook-card:hover .favorite-btn {
  opacity: 1;
}

.topic-card:hover, .hook-card:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.topic-card.selected, .hook-card.selected {
  border-color: #67c23a;
  background: #f0f9ff;
  box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
}

.topic-number, .hook-number {
  width: 30px;
  height: 30px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.topic-text, .hook-text {
  flex: 1;
  line-height: 1.6;
  color: #333;
  font-size: 14px;
  text-align: left;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 20px;
}

.content-preview, .final-content {
  margin-top: 30px;
  text-align: left;
}

.content-preview h4, .final-content h4 {
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

.content-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e6e6e6;
}

.completion-panel .completion-content {
  text-align: center;
}

.completion-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
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

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .step-wizard-generator {
    padding: 10px;
  }

  .topics-grid, .hooks-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
    align-items: center;
  }

  .completion-actions {
    flex-direction: column;
    align-items: center;
  }
}

/* 步骤指示器自定义样式 */
:deep(.el-steps) {
  --el-steps-connection-line-color: #e6f7ff;
}

:deep(.el-step__head.is-finish) {
  border-color: #67c23a;
  color: #67c23a;
}

:deep(.el-step__head.is-process) {
  border-color: #409eff;
  color: #409eff;
}

/* 可点击步骤样式 */
.clickable-steps :deep(.el-step.clickable) {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-steps :deep(.el-step.clickable:hover) {
  transform: translateY(-2px);
}

.clickable-steps :deep(.el-step.clickable:hover .el-step__head) {
  border-color: #409eff;
  background: #f0f9ff;
}

.clickable-steps :deep(.el-step.clickable:hover .el-step__title) {
  color: #409eff;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* 收藏对话框样式 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.favorite-item {
  padding: 15px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.favorite-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.favorite-item.content-item {
  min-height: 120px;
}

.favorite-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 10px;
  word-break: break-word;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.favorite-date {
  color: #999;
  margin-left: auto;
}

.no-favorites {
  text-align: center;
  padding: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .el-button {
    width: 100% !important;
    max-width: 250px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }
}

/* 分镜脚本相关样式 */
.content-preview-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #f9f9f9;
}

.content-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  font-size: 14px;
}

.content-text {
  line-height: 1.6;
  color: #666;
  margin-bottom: 15px;
  max-height: 150px;
  overflow-y: auto;
  font-size: 14px;
}

.content-actions {
  display: flex;
  gap: 10px;
}

.storyboard-container {
  max-height: 600px;
  overflow-y: auto;
}

.storyboard-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.content-preview-text {
  color: #666;
  font-size: 12px;
}

.generating-tag {
  margin-left: 10px;
}

.storyboard-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 200px;
}

.storyboard-text {
  font-family: 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  max-width: 100%;
  overflow-x: auto;
}

.storyboard-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

/* 表格样式 */
.storyboard-table {
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
  border: 1px solid #e1e8ed;
}

.storyboard-text .storyboard-table table {
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 14px !important;
  border: 2px solid #409eff !important;
  background-color: #fff !important;
}

.storyboard-text .storyboard-table th,
.storyboard-text .storyboard-table td {
  padding: 12px 8px !important;
  text-align: left !important;
  border: 1px solid #409eff !important;
  vertical-align: top !important;
  word-wrap: break-word !important;
  background-color: #fff !important;
  box-sizing: border-box !important;
}

.storyboard-text .storyboard-table th {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%) !important;
  color: white !important;
  font-weight: bold !important;
  font-size: 13px !important;
}

.storyboard-table tr:hover {
  background-color: #f5f7fa;
}

.storyboard-table td {
  max-width: 200px;
  min-width: 80px;
}

.storyboard-heading {
  color: #409eff;
  margin: 20px 0 10px 0;
  font-weight: bold;
}

.text-line {
  margin: 8px 0;
  line-height: 1.8;
  padding: 8px 12px;
  background-color: #fafbfc;
  border-left: 3px solid #e1e8ed;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.text-line:hover {
  background-color: #f0f9ff;
  border-left-color: #409eff;
}

/* 自动保存指示器样式 */
.auto-save-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.save-tag {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.save-tag .el-icon {
  font-size: 14px;
}

.save-actions {
  display: flex;
  gap: 8px;
}

.save-actions .el-button {
  color: #666;
  font-size: 12px;
  padding: 4px 8px;
  height: auto;
  min-height: auto;
}

.save-actions .el-button:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .auto-save-indicator {
    flex-direction: column;
    gap: 10px;
  }
}


/* 钩子选项显示样式 */
.hook-option {
  padding: 8px 0;
}

.hook-title {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.hook-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  word-break: break-all;
}

.topic-option {
  padding: 8px 0;
}

.topic-title {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.topic-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  word-break: break-all;
}

/* 历史记录对话框样式 */
.history-dialog .el-dialog__body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.no-history {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.history-stats .el-tag {
  padding: 8px 15px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.history-item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-time {
  color: #909399;
  font-size: 13px;
  font-weight: 500;
}

.history-item-actions {
  display: flex;
  gap: 8px;
}

.history-item-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.meta-row {
  display: flex;
  align-items: center;
}

.meta-label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  font-size: 13px;
}

.meta-value {
  color: #303133;
  font-weight: 500;
  flex: 1;
}

.history-section-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
}

.history-section-content {
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.topic-content {
  border-left: 4px solid #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.hook-content {
  border-left: 4px solid #e6a23c;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.final-content {
  border-left: 4px solid #f56c6c;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .history-item-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .history-item-actions {
    justify-content: center;
  }

  .history-meta {
    grid-template-columns: 1fr;
  }
}

/* 提示工具提示样式 */
.help-icon-small {
  margin-left: 8px;
  color: #909399;
  cursor: help;
  font-size: 14px;
  transition: color 0.3s;
}

.help-icon-small:hover {
  color: #409EFF;
}

.collapse-title-with-tip {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 强制 el-form-item 标签中的图标对齐 */
.el-form-item__label .collapse-title-with-tip {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.el-form-item__label .help-icon-small {
  margin-left: 8px;
  vertical-align: middle;
}

.tooltip-content {
  max-width: 300px;
  line-height: 1.5;
}

.tip-title {
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
  font-size: 14px;
}

.tip-text {
  margin: 4px 0;
  font-size: 13px;
  color: #E4E7ED;
}

/* 高级选项样式 */
.advanced-options {
  margin-top: 20px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.option-group {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.option-group h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.option-group :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group :deep(.el-checkbox) {
  margin-right: 0;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>