<template>
  <div class="step-wizard-generator">
    <el-card class="wizard-card">
      <template #header>
        <div class="wizard-header">
          <h2>小萌爆款文案大师</h2>
          <p>选题+钩子+文案+分镜一键生成</p>
          <div class="auto-save-indicator">
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
          title="生成选题"
          description="明确内容方向，锁定受众需求"
          @click="goToStep(0)"
          :class="{ 'clickable': true }"
        />
        <el-step
          title="生成钩子"
          description="抓住用户注意力，提升点击率"
          @click="goToStep(1)"
          :class="{ 'clickable': canAccessStep(1) }"
        />
        <el-step
          title="生成文案"
          description="创造爆款内容，引发情感共鸣"
          @click="goToStep(2)"
          :class="{ 'clickable': canAccessStep(2) }"
        />
        <el-step
          title="生成分镜"
          description="规划视频结构，提升观看体验"
          @click="goToStep(3)"
          :class="{ 'clickable': canAccessStep(3) }"
        />
      </el-steps>

      <div class="step-content">
        <!-- 步骤1：选题设置与生成 -->
        <div v-if="currentStep === 0" class="step-panel">
          <div class="step-title">
            <el-icon><Setting /></el-icon>
            <span>第一步：生成选题</span>
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
                popper-class="topic-select-dropdown"
              >
                <el-option
                  v-for="type in topicTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                >
                  <span class="topic-option-content">
                    <span class="topic-title">{{ type.label }}</span>
                    <span class="topic-desc">{{ type.description }}</span>
                  </span>
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
            </div>
            <div class="compact-action-buttons">
              <el-button
                type="text"
                size="small"
                @click="showTopicFavoritesDialog"
                class="favorite-btn-compact"
                title="从收藏选择选题"
              >
                <el-icon><Star /></el-icon>
              </el-button>
              <el-tooltip content="从收藏的内容中选择选题" placement="top">
                <el-icon class="info-icon"><QuestionFilled /></el-icon>
              </el-tooltip>

              <el-button
                size="small"
                @click="showManualTopicDialog"
                class="compact-btn"
              >
                <el-icon><Edit /></el-icon>
                手动输入
              </el-button>
              <el-tooltip content="手动输入自定义选题内容" placement="top">
                <el-icon class="info-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
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
                <el-button
                  size="small"
                  type="text"
                  @click.stop="addToFavorites('topics', topic)"
                  class="favorite-btn-compact"
                  title="添加到收藏"
                >
                  <el-icon><Star /></el-icon>
                </el-button>
                <div class="topic-text" @click="selectTopic(topic)">{{ topic }}</div>
                <el-icon v-if="stepData.step2.selectedTopic === topic" class="check-icon-compact">
                  <Check />
                </el-icon>
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

        <!-- Step 2 placeholder for testing -->
        <!-- 步骤2：钩子设置与生成 -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="step-title">
            <el-icon><Star /></el-icon>
            <span>第二步：生成钩子</span>
          </div>

          <div class="step-info">
            <el-tag type="info">行业：{{ stepData.step1.industry }}</el-tag>
            <el-tag type="success">已选选题：{{ stepData.step2.selectedTopic ? stepData.step2.selectedTopic.substring(0, 30) + '...' : '' }}</el-tag>
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
                popper-class="hook-select-dropdown"
              >
                <el-option
                  v-for="type in hookTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                >
                  <span class="hook-option-content">
                    <span class="hook-title">{{ type.label }}</span>
                    <span class="hook-desc">{{ type.description }}</span>
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <div class="generation-section">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                @click="generateHooks"
                :loading="loading.hooks"
                :disabled="!stepData.step3.hookType"
                style="width: 200px;"
              >
                <el-icon><Plus /></el-icon>
                {{ loading.hooks ? '正在生成钩子...' : '生成钩子' }}
              </el-button>
            </div>
            <div class="sub-action-buttons">
              <el-button
                type="warning"
                size="large"
                class="half-width-btn"
                @click="showHookFavoritesDialog"
              >
                <el-icon><Star /></el-icon>
                从收藏选择钩子
              </el-button>
              <el-button
                size="large"
                class="half-width-btn"
                @click="showManualHookDialog"
              >
                <el-icon><Edit /></el-icon>
                手动输入钩子
              </el-button>
            </div>
          </div>

          <div v-if="stepData.step3.hooks.length > 0" class="results-section">
            <h4>请选择一个钩子：</h4>
            <div class="hooks-grid">
              <div
                v-for="(hook, index) in stepData.step3.hooks"
                :key="index"
                class="hook-card"
                :class="{ 'selected': stepData.step3.selectedHook === hook }"
                @click="selectHook(hook)"
              >
                <div class="hook-number">{{ index + 1 }}</div>
                <el-button
                  size="small"
                  type="text"
                  class="favorite-btn-compact"
                  title="添加到收藏"
                  @click.stop="addToFavorites('hooks', hook)"
                >
                  <el-icon><Star /></el-icon>
                </el-button>
                <div class="hook-text">{{ hook }}</div>
                <el-icon v-if="stepData.step3.selectedHook === hook" class="check-icon-compact">
                  <Check />
                </el-icon>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <el-button
              type="default"
              size="large"
              @click="currentStep = 0"
            >
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

        <!-- 步骤3：文案生成 -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="step-title">
            <el-icon><Document /></el-icon>
            <span>第三步：生成文案</span>
          </div>

          <div class="step-info">
            <el-tag type="info">行业：{{ stepData.step1.industry }}</el-tag>
            <el-tag type="success">选题：{{ stepData.step2.selectedTopic.substring(0, 20) }}...</el-tag>
            <el-tag type="warning">钩子：{{ stepData.step3.selectedHook.substring(0, 20) }}...</el-tag>
          </div>

          <el-form :model="stepData.step1" label-width="120px" class="step-form">
            <el-form-item label="文案类型" required>
              <el-select
                v-model="stepData.step1.contentType"
                placeholder="请选择文案类型"
                style="width: 100%"
                size="large"
                popper-class="content-select-dropdown"
              >
                <el-option
                  v-for="type in contentTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                >
                  <span class="content-option-content">
                    <span class="content-title">{{ type.label }}</span>
                    <span class="content-desc">{{ type.description }}</span>
                  </span>
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
      </div>

      <!-- 步骤4：生成分镜 -->
      <div v-if="currentStep === 3" class="step-panel">
        <div class="step-title">
          <el-icon><VideoCamera /></el-icon>
          <span>第四步：生成分镜脚本</span>
        </div>

        <div class="step-info">
          <el-tag type="info">行业：{{ stepData.step1.industry }}</el-tag>
          <el-tag type="success">选题：{{ stepData.step2.selectedTopic?.substring(0, 20) }}...</el-tag>
          <el-tag type="warning">钩子：{{ stepData.step3.selectedHook?.substring(0, 20) }}...</el-tag>
          <el-tag type="primary">文案：已生成</el-tag>
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
            <span>{{ topic.contentType }} · {{ topic.industry }}</span>
            <span>{{ new Date(topic.createdAt).toLocaleDateString() }}</span>
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
            <span>{{ hook.contentType }} · {{ hook.industry }}</span>
            <span>{{ new Date(hook.createdAt).toLocaleDateString() }}</span>
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
          <div class="favorite-content">{{ content.content }}</div>
          <div class="favorite-meta">
            <span>{{ content.contentType }} · {{ content.industry }}</span>
            <span>{{ new Date(content.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="contentFavoritesDialog = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 手动输入选题对话框 -->
    <el-dialog v-model="manualTopicDialog" title="手动输入" width="60%">
      <el-form>
        <el-form-item label="选题内容">
          <el-input
            v-model="manualTopicInput"
            type="textarea"
            :rows="4"
            placeholder="请输入您的选题内容..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualTopicDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmManualTopic">确认</el-button>
      </template>
    </el-dialog>

    <!-- 手动输入钩子对话框 -->
    <el-dialog v-model="manualHookDialog" title="手动输入钩子" width="60%">
      <el-form>
        <el-form-item label="钩子内容">
          <el-input
            v-model="manualHookInput"
            type="textarea"
            :rows="4"
            placeholder="请输入您的钩子内容..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualHookDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmManualHook">确认</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'
import { useUserStore } from '@/stores/user'
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

export default {
  name: 'StepWizardGenerator',
  setup() {
    const userStore = useUserStore()
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
        storyboardTable: [],
        originalContent: ''
      }
    })

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
      { value: 'target_audience', label: '圈定人群', description: '3秒内让用户觉得视频和自己有关，触发身份认同感' },
      { value: 'direct_question', label: '直接提问', description: '用提问强迫用户思考，制造悬念和信息差' },
      { value: 'self_denial', label: '自我否定', description: '先打脸自己再引爆好奇，制造反转悬念' },
      { value: 'counter_cognition', label: '反认知', description: '颠覆常识认知，制造认知冲突强制暂停' },
      { value: 'high_value', label: '高价值展示', description: '展示极端成果和价值，触发损失厌恶和成果诱惑' },
      { value: 'hit_pain_point', label: '直击痛点', description: '精准戳中用户痛处，产生强烈情绪共鸣' },
      { value: 'loss_aversion', label: '损失厌恶', description: '利用人性对失去的恐惧，制造紧迫感' },
      { value: 'contrast_opposition', label: '对比对立', description: '制造冲突引发关注，突出极端差异' },
      { value: 'celebrity_trend', label: '头牌借势', description: '借用明星大咖流量，利用权威效应和关注度' },
      { value: 'warning_pitfall', label: '警告避坑', description: '利用规避损失心理，分享教训和经验价值' }
    ]

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

    const storyboardTypes = ref([
      { value: 'short_video', label: '短视频分镜脚本' },
      { value: 'live_stream', label: '直播带货分镜脚本' }
    ])

    const advancedConfig = reactive({
      platformStyle: [],
      toneStyle: [],
      videoDuration: [],
      wordCount: [],
      customDuration: '',
      customWordCount: ''
    })

    const advancedOptionsOpen = ref([])
    const collapseActive = ref([])

    // Dialog states
    const topicFavoritesDialog = ref(false)
    const hookFavoritesDialog = ref(false)
    const contentFavoritesDialog = ref(false)
    const manualTopicDialog = ref(false)
    const manualHookDialog = ref(false)

    // Manual input data
    const manualTopicInput = ref('')
    const manualHookInput = ref('')

    // Favorites data
    const favoriteTopics = ref([])
    const favoriteHooks = ref([])
    const favoriteContents = ref([])


    // 数据持久化相关
    const STORAGE_KEY = 'contentGeneratorState'
    const AUTO_SAVE_DELAY = 1000 // 1秒延时保存
    let saveTimeout = null

    const canGenerateTopics = computed(() => {
      return stepData.step1.industry && stepData.step1.topicType
    })

    const canAccessStep = (step) => {
      if (step === 1) return stepData.step2.selectedTopic
      if (step === 2) return stepData.step2.selectedTopic && stepData.step3.selectedHook
      if (step === 3) return stepData.step2.selectedTopic && stepData.step3.selectedHook && stepData.step4.content
      return false
    }

    const goToStep = (step) => {
      if (step === 0 || canAccessStep(step)) {
        currentStep.value = step
      }
    }

    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }

    const generateTopics = async () => {
      loading.topics = true
      try {
        const requestData = {
          type: stepData.step1.topicType,
          industry: stepData.step1.industry
        }

        const response = await axios.post('/api/generate', requestData, {
          timeout: 120000 // 设置为2分钟超时
        })

        if (response.data.success) {
          stepData.step2.topics = response.data.topics
          ElMessage.success(`成功生成 ${response.data.topics.length} 条选题`)
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
          type: stepData.step3.hookType,
          topic: stepData.step2.selectedTopic
        }

        const response = await axios.post('/api/generate-hooks', requestData, {
          timeout: 120000 // 设置为2分钟超时
        })

        if (response.data.success) {
          stepData.step3.hooks = response.data.hooks
          ElMessage.success(`成功生成 ${response.data.hooks.length} 条钩子`)
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

    // 辅助方法
    const getContentTypeName = (value) => {
      const type = contentTypes.find(t => t.value === value)
      return type ? type.label : value
    }

    const getStoryboardTypeName = (type) => {
      const typeObj = storyboardTypes.value.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    }

    const getTopicTypeName = (value) => {
      const type = topicTypes.find(t => t.value === value)
      return type ? type.label : value
    }

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

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                break
              }

              // 跳过空数据
              if (!data) continue

              try {
                const jsonData = JSON.parse(data)
                if (jsonData.type === 'chunk' && jsonData.content) {
                  stepData.step4.content += jsonData.content
                }
              } catch (e) {
                // 如果解析失败，检查是否是纯文本内容
                console.warn('JSON解析失败，数据:', data)
                // 不再自动添加到内容中，避免显示原始JSON
              }
            } else if (line.trim() && !line.includes('{') && !line.includes('}')) {
              // 如果是纯文本行且不包含JSON标记，则直接添加
              stepData.step4.content += line.trim()
            }
          }
        }

        ElMessage.success('文案生成完成')
      } catch (error) {
        console.error('生成文案失败:', error)
        ElMessage.error('生成文案失败，请检查网络连接')
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
                    if (data && data.content) {
                      stepData.step5.storyboard += data.content
                    }
                  } catch (e) {
                    // 如果解析失败，检查是否是纯文本内容
                    console.warn('分镜脚本JSON解析失败，数据:', dataStr)
                    // 只有在不包含JSON标记时才添加纯文本
                    if (dataStr.trim() && !dataStr.includes('{') && !dataStr.includes('}') && !dataStr.includes('"type"')) {
                      stepData.step5.storyboard += dataStr.trim()
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('流处理错误:', error)
            loading.storyboard = false
            ElMessage.error('生成过程中发生错误')
          }
        }

        await processStream()

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

    const parseTableData = (content) => {
      const lines = content.split('\n')
      const tableData = []
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

          let transformedCells = cells.map(cell =>
            cell.replace(/\*+/g, '').replace(/#+/g, '').trim()
          )

          if (isHeader) {
            // 转换表头为新格式
            transformedCells = ['时间轴 (秒)', '文案 (配音)', '画面分镜描述', '景别', '镜头运动/特效', '备注/道具']
            headerProcessed = true
          } else {
            // 转换数据行为新格式
            // 原始格式：[镜头号, 场景描述, 镜头类型/运镜, 画面内容/动作, 台词/音效, 时间（秒）]
            // 新格式：[时间轴 (秒), 文案 (配音), 画面分镜描述, 景别, 镜头运动/特效, 备注/道具]

            // 确保有足够的列，不足的用空字符串填充
            while (transformedCells.length < 6) {
              transformedCells.push('')
            }

            const timeValue = transformedCells[5] ? `${transformedCells[5]}` : '' // 时间（秒）
            const scriptValue = transformedCells[4] ? transformedCells[4].replace(/<br>/g, ' ').replace(/\*\*/g, '') : '' // 台词/音效，清理HTML标签
            const sceneDescription = `${transformedCells[1] || ''} - ${transformedCells[3] || ''}`.trim() // 场景描述 + 画面内容/动作
            const shotType = extractShotType(transformedCells[2] || '') // 从镜头类型/运镜中提取景别
            const cameraMovement = extractCameraMovement(transformedCells[2] || '') // 从镜头类型/运镜中提取镜头运动
            const notes = transformedCells[1] || '' // 场景描述作为备注

            transformedCells = [
              timeValue,
              scriptValue,
              sceneDescription,
              shotType,
              cameraMovement,
              notes
            ]
          }

          tableData.push(transformedCells)
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

          let transformedCells = cells

          if (isHeader) {
            // 转换表头为新格式
            transformedCells = ['时间轴 (秒)', '文案 (配音)', '画面分镜描述', '景别', '镜头运动/特效', '备注/道具']
            tableHtml += '<tr class="table-header">'
            headerProcessed = true
          } else {
            // 转换数据行为新格式
            // 原始格式：[镜头号, 场景描述, 镜头类型/运镜, 画面内容/动作, 台词/音效, 时间（秒）]
            // 新格式：[时间轴 (秒), 文案 (配音), 画面分镜描述, 景别, 镜头运动/特效, 备注/道具]

            // 确保有足够的列，不足的用空字符串填充
            while (cells.length < 6) {
              cells.push('')
            }

            const timeValue = cells[5] ? `${cells[5]}` : '' // 时间（秒）
            const scriptValue = cells[4] ? cells[4].replace(/<br>/g, ' ').replace(/\*\*/g, '') : '' // 台词/音效，清理HTML标签
            const sceneDescription = `${cells[1] || ''} - ${cells[3] || ''}`.trim() // 场景描述 + 画面内容/动作
            const shotType = extractShotType(cells[2] || '') // 从镜头类型/运镜中提取景别
            const cameraMovement = extractCameraMovement(cells[2] || '') // 从镜头类型/运镜中提取镜头运动
            const notes = cells[1] || '' // 场景描述作为备注

            transformedCells = [
              timeValue,
              scriptValue,
              sceneDescription,
              shotType,
              cameraMovement,
              notes
            ]

            tableHtml += '<tr>'
          }

          transformedCells.forEach(cell => {
            const cleanCell = cell.replace(/\*+/g, '').trim()
            const tag = isHeader ? 'th' : 'td'
            const cellStyle = isHeader
              ? 'style="border: 1px solid #000; padding: 12px 8px; background: repeating-linear-gradient(45deg, #000 0px, #000 10px, #fff 10px, #fff 20px) !important; color: #000 !important; font-weight: bold; text-align: center; text-shadow: 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff;"'
              : 'style="border: 1px solid #ddd; padding: 12px 8px; background: white; color: #303133;"'
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

    // 提取景别信息
    const extractShotType = (cameraInfo) => {
      // 清理HTML标签和Markdown格式
      const cleanInfo = cameraInfo.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim()
      const shotTypes = ['大远景', '远景', '全景', '中景', '近景', '特写', '大特写']

      for (let type of shotTypes) {
        if (cleanInfo.includes(type)) {
          return type
        }
      }

      // 如果没有找到具体景别，尝试从描述中提取第一个词
      const parts = cleanInfo.split(/[，,、]/)[0]
      return parts || '中景'
    }

    // 提取镜头运动信息
    const extractCameraMovement = (cameraInfo) => {
      // 清理HTML标签和Markdown格式
      const cleanInfo = cameraInfo.replace(/\*\*/g, '').replace(/<[^>]*>/g, '').trim()
      const movements = ['快速推进', '推进', '拉开', '摇移', '跟拍', '跟随', '环绕', '升降', '快速切镜', '切换', '淡入', '淡出', '手持晃动', '固定镜头', '慢动作']

      for (let movement of movements) {
        if (cleanInfo.includes(movement)) {
          return movement
        }
      }

      // 如果包含逗号，取后面的部分作为运动信息
      if (cleanInfo.includes('，')) {
        const parts = cleanInfo.split('，')
        if (parts.length > 1) {
          return parts.slice(1).join('，').trim()
        }
      } else if (cleanInfo.includes(',')) {
        const parts = cleanInfo.split(',')
        if (parts.length > 1) {
          return parts.slice(1).join(',').trim()
        }
      }

      return cleanInfo
    }

    // 普通文本渲染函数
    const renderAsText = (content) => {
      return content.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
          if (line.includes('分镜') || line.includes('脚本') || line.startsWith('#')) {
            return `<h3 class="storyboard-heading">${line.replace(/^#+\s*/, '')}</h3>`
          } else if (line.includes('【镜头') || line.includes('Scene') || line.includes('镜头')) {
            return `<h4 class="scene-title">${line}</h4>`
          } else {
            return `<p class="scene-content">${line}</p>`
          }
        })
        .join('')
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
            ws['!autofilter'] = { ref: ws['!ref'] }

            XLSX.utils.book_append_sheet(wb, ws, '分镜脚本')
            const fileName = `分镜脚本_${getStoryboardTypeName(stepData.step5.storyboardType)}_${new Date().toISOString().slice(0, 10)}.xlsx`
            XLSX.writeFile(wb, fileName)

            ElMessage.success('Excel文件下载成功！')
            return
          }
        } catch (error) {
          console.error('Excel生成失败:', error)
          ElMessage.error('Excel生成失败，改为下载文本文件')
        }
      }

      // 降级方案：下载为文本文件
      const blob = new Blob([storyboardContent], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `分镜脚本_${getStoryboardTypeName(stepData.step5.storyboardType)}_${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('文本文件下载成功！')
    }


    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    const startOver = () => {
      currentStep.value = 0
      // 清空数据
      stepData.step1.industry = ''
      stepData.step1.topicType = ''
      stepData.step1.contentType = ''
      stepData.step2.topics = []
      stepData.step2.selectedTopic = ''
      stepData.step3.hooks = []
      stepData.step3.selectedHook = ''
      stepData.step3.hookType = ''
      stepData.step4.content = ''
      stepData.step4.contents = []
      stepData.step4.selectedContent = ''
      stepData.step5.storyboard = ''
      stepData.step5.storyboardType = ''
      stepData.step5.originalContent = ''
      ElMessage.success('已重新开始')
    }

    const completeGeneration = () => {
      ElMessage.success('恭喜！内容生成流程全部完成')
      // 可以在这里添加其他完成逻辑，比如跳转到总结页面
    }

    // 数据持久化功能
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
            currentStep.value = state.currentStep || 0
            // 恢复数据
            Object.assign(stepData, state.stepData)
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

    const autoSave = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      saveTimeout = setTimeout(() => {
        saveState()
      }, AUTO_SAVE_DELAY)
    }

    const clearSavedState = () => {
      try {
        localStorage.removeItem(STORAGE_KEY)
        ElMessage.success('已清除保存的进度数据')
      } catch (error) {
        console.error('清除状态失败:', error)
        ElMessage.error('清除进度失败')
      }
    }

    // 收藏功能
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

    const selectFavoriteTopic = (topic) => {
      stepData.step2.selectedTopic = topic.content
      stepData.step2.topics = [topic.content]
      topicFavoritesDialog.value = false
      ElMessage.success('已选择收藏的选题')
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    const selectFavoriteHook = (hook) => {
      stepData.step3.selectedHook = hook.content
      stepData.step3.hooks = [hook.content]
      hookFavoritesDialog.value = false
      ElMessage.success('已选择收藏的钩子')
      setTimeout(() => {
        nextStep()
      }, 500)
    }

    const selectFavoriteContent = (content) => {
      stepData.step4.content = content.content
      stepData.step4.selectedContent = content.content
      contentFavoritesDialog.value = false
      ElMessage.success('已选择收藏的文案')
    }

    // 手动输入功能
    const showManualTopicDialog = () => {
      manualTopicInput.value = ''
      manualTopicDialog.value = true
    }

    const showManualHookDialog = () => {
      manualHookInput.value = ''
      manualHookDialog.value = true
    }

    const confirmManualTopic = () => {
      if (manualTopicInput.value.trim()) {
        stepData.step2.selectedTopic = manualTopicInput.value.trim()
        stepData.step2.topics = [manualTopicInput.value.trim()]
        manualTopicDialog.value = false
        ElMessage.success('已设置手动输入的选题')
        setTimeout(() => {
          nextStep()
        }, 500)
      } else {
        ElMessage.warning('请输入选题内容')
      }
    }

    const confirmManualHook = () => {
      if (manualHookInput.value.trim()) {
        stepData.step3.selectedHook = manualHookInput.value.trim()
        stepData.step3.hooks = [manualHookInput.value.trim()]
        manualHookDialog.value = false
        ElMessage.success('已设置手动输入的钩子')
        setTimeout(() => {
          nextStep()
        }, 500)
      } else {
        ElMessage.warning('请输入钩子内容')
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

    // 组件挂载时恢复状态和加载数据
    onMounted(() => {
      restoreState()
      loadFavorites()
    })

    return {
      currentStep,
      loading,
      stepData,
      topicTypes,
      hookTypes,
      contentTypes,
      storyboardTypes,
      advancedConfig,
      advancedOptionsOpen,
      collapseActive,
      canGenerateTopics,
      canAccessStep,
      goToStep,
      nextStep,
      generateTopics,
      generateHooks,
      generateContent,
      regenerateContent,
      copyContent,
      generateStoryboard,
      regenerateStoryboard,
      copyStoryboard,
      downloadStoryboard,
      parseTableData,
      formatStoryboardContent,
      renderAsTable,
      renderAsText,
      getStoryboardTypeName,
      prevStep,
      startOver,
      completeGeneration,
      selectTopic,
      selectHook,
      showTopicFavoritesDialog,
      showManualTopicDialog,
      showHookFavoritesDialog,
      showManualHookDialog,
      showContentFavoritesDialog,
      addToFavorites,
      // Dialog states
      topicFavoritesDialog,
      hookFavoritesDialog,
      contentFavoritesDialog,
      manualTopicDialog,
      manualHookDialog,
      // Manual input data
      manualTopicInput,
      manualHookInput,
      // Favorites data
      favoriteTopics,
      favoriteHooks,
      favoriteContents,
      // Favorites functions
      selectFavoriteTopic,
      selectFavoriteHook,
      selectFavoriteContent,
      // Manual input functions
      confirmManualTopic,
      confirmManualHook,
      // Data persistence
      saveState,
      restoreState,
      clearSavedState,
      // Helper functions
      getContentTypeName,
      getTopicTypeName
    }
  }
}
</script>

<style>
.step-wizard-generator {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.wizard-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.wizard-header {
  text-align: center;
  position: relative;
}

.wizard-header h2 {
  margin: 0 0 8px 0;
  color: #409EFF;
  font-size: 28px;
  font-weight: bold;
}

.wizard-header p {
  margin: 0;
  color: #606266 !important;
  font-size: 16px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  line-height: 1.4;
  background: rgba(255, 255, 255, 0.9) !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
}

.auto-save-indicator {
  position: absolute;
  top: 0;
  right: 0;
}

.steps-indicator {
  margin: 30px 0;
}

.step-content {
  margin-top: 30px;
}

.step-panel {
  padding: 30px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.step-form {
  margin-bottom: 30px;
}

.collapse-title-with-tip {
  display: flex;
  align-items: center;
  gap: 6px;
}

.help-icon-small {
  color: #909399;
  cursor: help;
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

/* 全局样式，不使用scoped */
.topic-select-dropdown .el-select-dropdown__item {
  height: auto !important;
  line-height: normal !important;
  padding: 12px 20px !important;
}

.topic-select-dropdown .topic-option-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.topic-select-dropdown .topic-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 4px;
}

.topic-select-dropdown .topic-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
  white-space: normal;
  word-wrap: break-word;
}

/* 钩子下拉框样式 */
.hook-select-dropdown .el-select-dropdown__item {
  height: auto !important;
  line-height: normal !important;
  padding: 12px 20px !important;
}

.hook-select-dropdown .hook-option-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.hook-select-dropdown .hook-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 4px;
}

.hook-select-dropdown .hook-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
  white-space: normal;
  word-wrap: break-word;
}

/* 文案类型下拉框样式 */
.content-select-dropdown .el-select-dropdown__item {
  height: auto !important;
  line-height: normal !important;
  padding: 12px 20px !important;
}

.content-select-dropdown .content-option-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.content-select-dropdown .content-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 4px;
}

.content-select-dropdown .content-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
  white-space: normal;
  word-wrap: break-word;
}

/* 组件内部样式 */
.topic-option-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.topic-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.topic-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
  margin-top: 4px;
}

.hook-option-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.hook-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.hook-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
  margin-top: 4px;
}

/* 文案类型下拉框组件内部样式 */
.content-option-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.content-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.content-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
  margin-top: 4px;
}

.step-info {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.hook-card {
  position: relative;
  padding: 12px 35px 12px 15px;
  background: white;
  border: 2px solid #E4E7ED;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 45px;
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.3;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateZ(0);
}

.hook-card:hover {
  background: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-3px) translateZ(0);
  box-shadow: 0 8px 28px rgba(64, 158, 255, 0.2), 0 12px 36px rgba(0, 0, 0, 0.12);
}

.hook-card.selected {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.hook-number {
  background: #409eff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.hook-card.selected .hook-number {
  background: white;
  color: #409eff;
}

.hook-text {
  flex: 1;
  line-height: 1.4;
  font-size: 14px;
  padding-right: 8px;
}

.hook-card.selected .check-icon {
  color: white;
}

.generation-section {
  margin: 30px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.sub-action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.compact-action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.compact-btn {
  border-radius: 8px;
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
}


.info-icon {
  color: #909399;
  font-size: 14px;
  cursor: help;
  margin-left: 4px;
  margin-right: 8px;
}

.info-icon:hover {
  color: #409EFF;
}

.half-width-btn {
  flex: 1;
  max-width: 200px;
  min-width: 140px;
}

.results-section {
  margin-top: 30px;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.topic-card {
  position: relative;
  padding: 15px 40px 15px 20px;
  border: 2px solid #E4E7ED;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateZ(0);
  min-height: 60px;
  display: flex;
  align-items: center;
}

.topic-card:hover {
  border-color: #409EFF;
  transform: translateY(-6px) translateZ(0);
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.25), 0 16px 48px rgba(0, 0, 0, 0.15);
}

.topic-card.selected {
  border-color: #409EFF;
  background: #ecf5ff;
}

.topic-number {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #409EFF;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.topic-text {
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  flex: 1;
  padding-right: 8px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}


.check-icon {
  color: #67C23A;
  font-size: 18px;
}

.favorite-btn-compact {
  position: absolute !important;
  bottom: 4px !important;
  right: 4px !important;
  color: #F56C6C !important;
  font-size: 10px !important;
  padding: 0px !important;
  min-height: auto !important;
  width: 10px !important;
  height: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  background: rgba(245, 108, 108, 0.15) !important;
  z-index: 2 !important;
  border: none !important;
  box-shadow: none !important;
}

.favorite-btn-compact .el-icon {
  font-size: 10px !important;
  width: 10px !important;
  height: 10px !important;
}

.favorite-btn-compact:hover {
  background: rgba(245, 108, 108, 0.2) !important;
  transform: scale(1.1) !important;
}

.check-icon-compact {
  position: absolute;
  bottom: 4px;
  left: 4px;
  color: #67C23A;
  font-size: 12px;
  z-index: 2;
}

.option-content {
  padding: 8px 0;
}

.option-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #E4E7ED;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .step-wizard-generator {
    padding: 10px;
  }

  .wizard-card {
    margin: 0;
    border-radius: 8px;
  }

  .wizard-header h2 {
    font-size: 24px;
  }

  .wizard-header p {
    font-size: 15px !important;
    display: block !important;
    line-height: 1.5 !important;
    color: #303133 !important;
    visibility: visible !important;
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.95) !important;
    padding: 4px 6px !important;
    border-radius: 4px !important;
    margin: 8px 0 !important;
  }

  .step-panel {
    padding: 20px 15px;
  }

  .step-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .topics-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .topic-card {
    padding: 12px 32px 12px 15px;
    min-height: 50px;
  }

  .favorite-btn-compact {
    position: absolute !important;
    bottom: 2px !important;
    right: 2px !important;
    width: 6px !important;
    height: 6px !important;
    min-width: 6px !important;
    min-height: 6px !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    font-size: 10px !important;
    line-height: 1 !important;
    color: #F56C6C !important;
  }

  .favorite-btn-compact .el-icon {
    font-size: 10px !important;
    line-height: 1 !important;
    transform: none !important;
    color: #F56C6C !important;
  }

  .check-icon-compact {
    font-size: 10px;
    bottom: 3px;
    left: 3px;
  }

  .sub-action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .compact-action-buttons {
    gap: 6px;
    margin-top: 12px;
  }

  .compact-btn {
    font-size: 11px;
    padding: 4px 8px;
    min-height: 28px;
  }


  .info-icon {
    font-size: 12px;
    margin-left: 2px;
    margin-right: 4px;
  }

  .half-width-btn {
    width: 100%;
    max-width: none;
  }

  .action-buttons {
    margin-bottom: 20px;
  }

  .step-actions {
    margin-top: 20px;
    padding-top: 15px;
  }

  .steps-indicator {
    margin: 20px 0;
  }

  .auto-save-indicator {
    position: static;
    margin-top: 10px;
  }

  .wizard-header {
    position: relative;
  }
}

@media (max-width: 480px) {
  .wizard-header h2 {
    font-size: 20px;
  }

  .wizard-header p {
    font-size: 16px !important;
    display: block !important;
    line-height: 1.6 !important;
    color: #303133 !important;
    visibility: visible !important;
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.95) !important;
    padding: 6px 8px !important;
    border-radius: 6px !important;
    margin: 10px 0 !important;
    font-weight: 500 !important;
  }

  .step-panel {
    padding: 15px 10px;
  }

  .topics-grid {
    gap: 8px;
  }

  .topic-card {
    padding: 10px 30px 10px 12px;
    min-height: 45px;
  }

  .hook-card {
    padding: 10px 30px 10px 12px;
    min-height: 40px;
  }

  .favorite-btn-compact {
    width: 6px !important;
    height: 6px !important;
    font-size: 10px !important;
    bottom: 2px !important;
    right: 2px !important;
    padding: 0px !important;
    background: rgba(245, 108, 108, 0.2) !important;
    color: #F56C6C !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
    position: absolute !important;
    z-index: 10 !important;
    overflow: visible !important;
  }

  .favorite-btn-compact .el-icon {
    font-size: 10px !important;
    width: 10px !important;
    height: 10px !important;
    display: block !important;
    color: #F56C6C !important;
  }

  .check-icon-compact {
    font-size: 8px;
    bottom: 2px;
    left: 2px;
  }

  .topic-text {
    font-size: 14px;
  }

  .sub-action-buttons {
    gap: 8px;
  }

  .compact-action-buttons {
    gap: 4px;
    margin-top: 8px;
  }

  .compact-btn {
    font-size: 12px;
    padding: 4px 8px;
    min-height: 28px;
  }


  .info-icon {
    font-size: 14px;
    margin: 0 4px;
  }

  .compact-action-buttons {
    margin-top: 12px;
    gap: 6px;
  }
}

/* Advanced options styles */
.advanced-options {
  margin-top: 20px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.option-group {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.option-group h4 {
  margin: 0 0 12px 0;
  color: #409EFF;
  font-size: 14px;
  font-weight: 600;
}

.option-group .el-checkbox {
  margin-bottom: 8px;
  display: block;
}

/* Content preview styles */
.content-preview {
  margin-top: 20px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 2px solid #E4E7ED;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 12px 32px rgba(0, 0, 0, 0.08);
  transform: translateZ(0);
  transition: all 0.3s ease;
}

.content-preview:hover {
  transform: translateY(-4px) translateZ(0);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15), 0 16px 40px rgba(0, 0, 0, 0.12);
  border-color: #409EFF;
}

.content-preview h4 {
  margin: 0 0 15px 0;
  color: #409EFF;
  font-size: 16px;
}

.content-display {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.content-display pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.6;
  color: #303133;
}

.content-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
    padding: 15px;
  }

  .content-actions {
    flex-direction: column;
  }

  .content-actions .el-button {
    width: 100%;
  }
}

/* Dialog styles */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.favorite-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.favorite-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.favorite-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 8px;
}

.favorite-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.content-item .favorite-content {
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.no-favorites {
  text-align: center;
  padding: 40px 20px;
}



@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

}

/* 分镜脚本样式 */
.storyboard-preview {
  margin-top: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
}

.storyboard-container {
  padding: 20px;
}

.storyboard-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
}

.storyboard-content {
  line-height: 1.6;
  color: #303133;
}

.storyboard-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.storyboard-heading {
  font-weight: bold;
  color: #409eff;
  margin: 20px 0 10px 0;
  font-size: 16px;
}

.scene-title {
  font-weight: bold;
  color: #606266;
  margin: 15px 0 8px 0;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.scene-content {
  margin-left: 20px;
  margin-bottom: 15px;
}

.text-line {
  margin: 5px 0;
  padding: 3px 0;
}

.storyboard-actions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .step-wizard-generator {
    padding: 5px !important;
    min-height: 100vh;
    width: 100vw !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
  }

  .wizard-card {
    margin: 0 !important;
    padding: 0 !important;
    border-radius: 8px;
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  .wizard-card .el-card__body {
    padding: 8px !important;
    box-sizing: border-box !important;
  }

  .wizard-header h2 {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .wizard-header p {
    font-size: 15px !important;
    margin-bottom: 15px;
    color: #303133 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  .steps-indicator {
    margin: 20px 0;
  }

  .el-steps {
    font-size: 12px;
  }

  .el-step__title {
    font-size: 12px !important;
  }

  .el-step__description {
    font-size: 8px !important;
    line-height: 1.2 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    color: #606266 !important;
  }

  .step-content {
    padding: 8px 5px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .step-panel {
    padding: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .step-title {
    font-size: 14px !important;
    margin-bottom: 10px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .form-group {
    margin-bottom: 10px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .form-group label {
    font-size: 12px !important;
    margin-bottom: 5px !important;
    display: block !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .el-input, .el-textarea, .el-select {
    font-size: 12px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .el-input__inner, .el-textarea__inner, .el-select__inner {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 6px 8px !important;
  }

  .el-textarea__inner {
    min-height: 60px !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .tone-selection {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 5px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .tone-button {
    padding: 6px 8px !important;
    font-size: 10px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .generate-section {
    margin-top: 20px;
    text-align: center;
  }

  .el-button {
    min-width: auto;
    padding: 10px 15px;
    font-size: 14px;
  }

  .content-display {
    margin-top: 15px;
  }

  .content-preview {
    padding: 15px;
    font-size: 14px;
    line-height: 1.5;
  }

  .storyboard-preview {
    width: 100% !important;
    overflow-x: auto !important;
    box-sizing: border-box !important;
  }

  .storyboard-preview table {
    font-size: 10px !important;
    width: 100% !important;
    min-width: 300px !important;
    overflow-x: auto !important;
    display: table !important;
    table-layout: fixed !important;
    white-space: normal !important;
  }

  .storyboard-preview table th,
  .storyboard-preview table td {
    padding: 4px 2px !important;
    min-width: 50px !important;
    max-width: 80px !important;
    word-break: break-word !important;
    white-space: normal !important;
    font-size: 9px !important;
    line-height: 1.2 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
    margin-top: 15px;
  }

  .action-buttons .el-button {
    width: 100%;
    margin: 0;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .favorite-item {
    padding: 12px;
  }

  .favorite-content {
    font-size: 13px;
    line-height: 1.5;
  }


  .el-dialog {
    width: 95% !important;
    margin: 5vh auto !important;
  }

  .el-dialog__body {
    padding: 15px;
  }

  .storyboard-container {
    padding: 15px;
  }

  .storyboard-info {
    padding: 12px;
    margin-bottom: 15px;
    font-size: 14px;
  }

  .scene-content {
    margin-left: 10px;
  }

  .storyboard-actions {
    flex-direction: column;
    gap: 8px;
  }

  .storyboard-actions .el-button {
    width: 100%;
  }
}

/* Extra small mobile devices (max-width: 480px) */
@media (max-width: 480px) {
  .step-wizard-generator {
    padding: 3px !important;
    width: 100vw !important;
    max-width: 100vw !important;
  }

  .wizard-card {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .wizard-card .el-card__body {
    padding: 5px !important;
  }

  .wizard-header h2 {
    font-size: 16px !important;
    margin-bottom: 5px !important;
  }

  .wizard-header p {
    font-size: 14px !important;
    margin-bottom: 8px !important;
    display: block !important;
    line-height: 1.4 !important;
  }

  .el-steps {
    font-size: 10px !important;
  }

  .el-step__title {
    font-size: 10px !important;
  }

  .el-step__description {
    font-size: 7px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    line-height: 1.2 !important;
    color: #606266 !important;
  }

  .step-content {
    padding: 5px 3px !important;
  }

  .step-title {
    font-size: 12px !important;
    margin-bottom: 8px !important;
  }

  .form-group {
    margin-bottom: 8px !important;
  }

  .form-group label {
    font-size: 10px !important;
    margin-bottom: 3px !important;
  }

  .el-input, .el-textarea, .el-select {
    font-size: 11px !important;
  }

  .el-input__inner, .el-textarea__inner {
    padding: 5px 6px !important;
    font-size: 11px !important;
  }

  .el-textarea__inner {
    min-height: 50px !important;
  }

  .tone-selection {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 3px !important;
  }

  .tone-button {
    padding: 4px 6px !important;
    font-size: 9px !important;
  }

  .el-button {
    padding: 6px 10px !important;
    font-size: 11px !important;
    min-height: 32px !important;
  }

  .content-preview {
    padding: 8px !important;
    font-size: 11px !important;
  }

  .storyboard-preview table {
    font-size: 8px !important;
    min-width: 280px !important;
  }

  .storyboard-preview table th,
  .storyboard-preview table td {
    padding: 2px 1px !important;
    font-size: 8px !important;
    min-width: 40px !important;
    max-width: 60px !important;
  }

  /* 手机端收藏按钮样式 */
  .favorite-btn-compact {
    position: absolute !important;
    bottom: 2px !important;
    right: 2px !important;
    width: 6px !important;
    height: 6px !important;
    min-width: 6px !important;
    min-height: 6px !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    font-size: 10px !important;
    line-height: 1 !important;
    color: #F56C6C !important;
  }

  .favorite-btn-compact .el-icon {
    font-size: 10px !important;
    line-height: 1 !important;
    transform: none !important;
    color: #F56C6C !important;
  }
}

</style>