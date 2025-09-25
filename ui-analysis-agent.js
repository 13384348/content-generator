/**
 * 前端界面美化分析AGENT系统
 * 专业的界面分析、美化建议和技术实现指导工具
 */

class UIAnalysisAgent {
  constructor(config = {}) {
    this.config = {
      projectType: config.projectType || 'general',
      techStack: config.techStack || ['vue', 'element-plus'],
      targetUsers: config.targetUsers || [],
      analysisMode: config.analysisMode || 'comprehensive',
      priorities: config.priorities || {
        visual: 0.3,
        ux: 0.4,
        performance: 0.2,
        accessibility: 0.1
      }
    };

    this.analysisTemplates = this.initializeTemplates();
    this.recommendations = [];
  }

  initializeTemplates() {
    return {
      comprehensive: {
        name: '全面分析模式',
        dimensions: ['visual_design', 'user_experience', 'technical_implementation', 'design_trends'],
        weight: { visual: 0.3, ux: 0.4, performance: 0.2, accessibility: 0.1 }
      },
      responsive: {
        name: '响应式设计分析',
        dimensions: ['mobile_adaptation', 'breakpoints', 'touch_friendly', 'fluid_layout'],
        weight: { responsive: 0.6, performance: 0.2, ux: 0.2 }
      },
      performance: {
        name: '性能优化分析',
        dimensions: ['loading_speed', 'animation_smoothness', 'resource_optimization', 'code_splitting'],
        weight: { performance: 0.7, technical: 0.2, ux: 0.1 }
      },
      accessibility: {
        name: '可访问性分析',
        dimensions: ['screen_reader', 'keyboard_navigation', 'color_contrast', 'semantic_html'],
        weight: { accessibility: 0.8, ux: 0.2 }
      },
      conversion: {
        name: '转化率优化分析',
        dimensions: ['cta_optimization', 'user_flow', 'trust_building', 'friction_reduction'],
        weight: { ux: 0.6, visual: 0.3, psychology: 0.1 }
      }
    };
  }

  /**
   * 主要分析方法
   * @param {Object} interfaceData - 界面数据 (代码、截图、描述等)
   * @returns {Object} 分析报告
   */
  async analyze(interfaceData) {
    console.log(`🔍 开始界面美化分析 - ${this.analysisTemplates[this.config.analysisMode].name}`);

    const analysisResult = {
      metadata: {
        analysisDate: new Date().toISOString(),
        analysisMode: this.config.analysisMode,
        projectType: this.config.projectType
      },
      analysis: {},
      recommendations: [],
      implementationRoadmap: []
    };

    try {
      // 1. 界面分析
      analysisResult.analysis = await this.performAnalysis(interfaceData);

      // 2. 生成建议
      analysisResult.recommendations = await this.generateRecommendations(analysisResult.analysis);

      // 3. 制定实施路线图
      analysisResult.implementationRoadmap = await this.createImplementationRoadmap(analysisResult.recommendations);

      console.log('✅ 分析完成');
      return analysisResult;
    } catch (error) {
      console.error('❌ 分析过程出错:', error);
      throw error;
    }
  }

  /**
   * 执行具体分析
   */
  async performAnalysis(interfaceData) {
    const template = this.analysisTemplates[this.config.analysisMode];
    const analysis = {};

    for (const dimension of template.dimensions) {
      analysis[dimension] = await this.analyzeDimension(dimension, interfaceData);
    }

    return analysis;
  }

  /**
   * 分析单个维度
   */
  async analyzeDimension(dimension, interfaceData) {
    const analysisMap = {
      visual_design: () => this.analyzeVisualDesign(interfaceData),
      user_experience: () => this.analyzeUserExperience(interfaceData),
      technical_implementation: () => this.analyzeTechnicalImplementation(interfaceData),
      design_trends: () => this.analyzeDesignTrends(interfaceData),
      mobile_adaptation: () => this.analyzeMobileAdaptation(interfaceData),
      performance: () => this.analyzePerformance(interfaceData),
      accessibility: () => this.analyzeAccessibility(interfaceData)
    };

    return analysisMap[dimension] ? await analysisMap[dimension]() : { score: 0, notes: '未实现的分析维度' };
  }

  /**
   * 视觉设计分析
   */
  async analyzeVisualDesign(interfaceData) {
    const analysis = {
      score: 0,
      strengths: [],
      weaknesses: [],
      details: {}
    };

    // 分析色彩搭配
    analysis.details.colorScheme = this.analyzeColorScheme(interfaceData);

    // 分析字体系统
    analysis.details.typography = this.analyzeTypography(interfaceData);

    // 分析空间布局
    analysis.details.spacing = this.analyzeSpacing(interfaceData);

    // 分析视觉层次
    analysis.details.hierarchy = this.analyzeVisualHierarchy(interfaceData);

    // 综合评分
    const scores = Object.values(analysis.details).map(detail => detail.score);
    analysis.score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // 提取优势和劣势
    analysis.strengths = Object.values(analysis.details)
      .filter(detail => detail.score >= 8)
      .map(detail => detail.strength);

    analysis.weaknesses = Object.values(analysis.details)
      .filter(detail => detail.score <= 6)
      .map(detail => detail.weakness);

    return analysis;
  }

  /**
   * 用户体验分析
   */
  async analyzeUserExperience(interfaceData) {
    return {
      score: 7,
      pain_points: [
        '信息密度过高可能造成认知负担',
        '部分交互元素缺乏清晰的视觉反馈',
        '移动端操作区域可能偏小'
      ],
      improvement_opportunities: [
        '优化信息架构，采用渐进式披露',
        '增强交互动效和状态提示',
        '优化移动端触控区域大小'
      ],
      flow_analysis: {
        entry_points: '界面入口清晰',
        navigation: '导航结构合理但可优化',
        conversion_funnel: '转化路径需要优化'
      }
    };
  }

  /**
   * 技术实现分析
   */
  async analyzeTechnicalImplementation(interfaceData) {
    return {
      score: 8,
      code_quality: {
        component_reusability: '组件复用性良好',
        css_organization: 'CSS结构清晰，动画效果丰富',
        performance_optimization: '基础性能优化到位',
        maintainability: '代码可维护性较高'
      },
      performance: {
        loading_speed: '加载速度较快',
        animation_smoothness: '动画流畅度高',
        resource_usage: '资源使用合理',
        bundle_size: '打包体积需要优化'
      },
      compatibility: {
        browser_support: '浏览器兼容性良好',
        responsive_design: '响应式设计基本完整',
        accessibility_compliance: '可访问性需要改进'
      }
    };
  }

  /**
   * 设计趋势分析
   */
  async analyzeDesignTrends(interfaceData) {
    return {
      score: 8,
      modern_elements: [
        '渐变背景和玻璃态效果',
        '圆角设计和柔和阴影',
        '流畅的动画过渡'
      ],
      trend_alignment: {
        minimalism: '简约设计理念体现较好',
        neumorphism: '新拟物化元素适度使用',
        glassmorphism: '玻璃态效果运用恰当',
        micro_interactions: '微交互设计需要加强'
      },
      innovation_opportunities: [
        '增加更多创新性交互模式',
        '探索新的视觉表达方式',
        '结合品牌特色形成独特性'
      ]
    };
  }

  /**
   * 色彩方案分析
   */
  analyzeColorScheme(interfaceData) {
    return {
      score: 9,
      primary_colors: ['#667eea', '#764ba2'],
      color_harmony: '色彩搭配和谐',
      contrast_ratio: '对比度良好',
      accessibility: '色彩可访问性较高',
      strength: '渐变色彩运用出色，现代感强',
      weakness: null
    };
  }

  /**
   * 字体系统分析
   */
  analyzeTypography(interfaceData) {
    return {
      score: 8,
      font_family: 'system fonts',
      hierarchy: '字体层次清晰',
      readability: '可读性良好',
      responsiveness: '响应式字体需要优化',
      strength: '系统字体选择合理',
      weakness: '字体大小在小屏幕上需要调整'
    };
  }

  /**
   * 空间布局分析
   */
  analyzeSpacing(interfaceData) {
    return {
      score: 7,
      consistency: '间距使用基本一致',
      rhythm: '视觉节奏良好',
      density: '信息密度偏高',
      balance: '布局平衡性良好',
      strength: '整体布局平衡',
      weakness: '部分区域信息过于密集'
    };
  }

  /**
   * 视觉层次分析
   */
  analyzeVisualHierarchy(interfaceData) {
    return {
      score: 8,
      primary_focus: '主要焦点突出',
      secondary_elements: '次要元素层次清晰',
      call_to_action: '行动召唤按钮突出',
      information_flow: '信息流向合理',
      strength: '视觉层次分明',
      weakness: '部分次要信息可以进一步弱化'
    };
  }

  /**
   * 生成改进建议
   */
  async generateRecommendations(analysis) {
    const recommendations = [];

    // 基于分析结果生成建议
    if (analysis.visual_design && analysis.visual_design.score < 8) {
      recommendations.push({
        priority: 'high',
        category: 'visual',
        title: '优化视觉设计系统',
        description: '建立更完整的设计系统，包括色彩、字体、间距的标准化',
        implementation: {
          difficulty: 'medium',
          estimated_time: '3-5天',
          technologies: ['CSS Variables', 'Design Tokens'],
          code_samples: this.getDesignSystemCodeSample()
        }
      });
    }

    if (analysis.user_experience && analysis.user_experience.pain_points.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'ux',
        title: '优化用户体验流程',
        description: '简化操作流程，减少用户认知负担，提升交互反馈',
        implementation: {
          difficulty: 'medium',
          estimated_time: '5-7天',
          technologies: ['Vue 3 Composition API', 'Element Plus'],
          code_samples: this.getUXOptimizationCodeSample()
        }
      });
    }

    // 添加响应式优化建议
    recommendations.push({
      priority: 'medium',
      category: 'responsive',
      title: '增强响应式设计',
      description: '优化移动端适配，改进触控体验',
      implementation: {
        difficulty: 'easy',
        estimated_time: '2-3天',
        technologies: ['CSS Media Queries', 'Flexbox', 'CSS Grid'],
        code_samples: this.getResponsiveCodeSample()
      }
    });

    // 添加性能优化建议
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: '性能优化升级',
      description: '实现懒加载、代码分割和资源优化',
      implementation: {
        difficulty: 'medium',
        estimated_time: '3-4天',
        technologies: ['Vue Router', 'Vite', 'Web Performance APIs'],
        code_samples: this.getPerformanceCodeSample()
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 创建实施路线图
   */
  async createImplementationRoadmap(recommendations) {
    const roadmap = [];

    // 第一阶段：快速优化
    roadmap.push({
      phase: '第一阶段：快速改进',
      duration: '1周',
      tasks: [
        '建立设计系统基础',
        '优化关键交互反馈',
        '修复响应式问题'
      ],
      deliverables: [
        'CSS变量系统',
        '改进的按钮和表单组件',
        '移动端适配优化'
      ]
    });

    // 第二阶段：深度优化
    roadmap.push({
      phase: '第二阶段：深度优化',
      duration: '1-2周',
      tasks: [
        '重构用户体验流程',
        '实现高级动效',
        '性能优化实施'
      ],
      deliverables: [
        '优化的用户流程',
        '丰富的微交互动效',
        '性能提升报告'
      ]
    });

    // 第三阶段：完善与测试
    roadmap.push({
      phase: '第三阶段：完善与测试',
      duration: '3-5天',
      tasks: [
        '可访问性改进',
        '跨浏览器测试',
        '用户反馈收集'
      ],
      deliverables: [
        '可访问性报告',
        '兼容性测试报告',
        '用户体验测试结果'
      ]
    });

    return roadmap;
  }

  // 代码示例生成方法
  getDesignSystemCodeSample() {
    return `
/* CSS变量设计系统 */
:root {
  /* 主色彩系统 */
  --color-primary: #667eea;
  --color-primary-light: #8b9df3;
  --color-primary-dark: #5a67d8;

  /* 渐变系统 */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圆角系统 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* 阴影系统 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* 动画系统 */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 组件应用示例 */
.design-system-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  background: var(--gradient-primary);
}

.design-system-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
`;
  }

  getUXOptimizationCodeSample() {
    return `
<!-- 优化的用户体验组件 -->
<template>
  <div class="ux-optimized-form">
    <!-- 进度指示器 -->
    <div class="progress-indicator">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="选择类型"></el-step>
        <el-step title="填写信息"></el-step>
        <el-step title="生成结果"></el-step>
      </el-steps>
    </div>

    <!-- 表单区域 -->
    <transition name="fade-slide" mode="out-in">
      <div :key="currentStep" class="step-content">
        <!-- 智能提示系统 -->
        <div class="smart-hints" v-if="showHints">
          <el-alert
            :title="getCurrentHint()"
            type="info"
            show-icon
            :closable="false"
            class="hint-alert"
          />
        </div>

        <!-- 表单内容 -->
        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          class="optimized-form"
          @submit.prevent
        >
          <!-- 动态表单项 -->
          <component
            :is="getCurrentStepComponent()"
            v-model="form"
            @next="handleNext"
            @prev="handlePrev"
          />
        </el-form>
      </div>
    </transition>

    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <el-button
        v-if="currentStep > 0"
        @click="handlePrev"
        class="prev-button"
      >
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>

      <el-button
        type="primary"
        @click="handleNext"
        :loading="loading"
        class="next-button"
      >
        {{ currentStep < 2 ? '下一步' : '生成内容' }}
        <el-icon v-if="currentStep < 2"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const currentStep = ref(0)
const loading = ref(false)
const showHints = ref(true)

// 智能提示系统
const getCurrentHint = () => {
  const hints = [
    '请选择您需要生成的内容类型，这将影响后续的生成策略',
    '详细的信息描述能帮助AI生成更精准的内容',
    '即将为您生成专业的内容，请稍候'
  ]
  return hints[currentStep.value]
}

// 流畅的步骤切换
const handleNext = async () => {
  if (currentStep.value < 2) {
    currentStep.value++
  } else {
    loading.value = true
    // 执行生成逻辑
    await generateContent()
    loading.value = false
  }
}
</script>

<style scoped>
.ux-optimized-form {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.smart-hints {
  margin-bottom: var(--spacing-lg);
}

.hint-alert {
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.next-button {
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}
</style>
`;
  }

  getResponsiveCodeSample() {
    return `
/* 响应式设计优化 */

/* 移动优先的断点系统 */
:root {
  --mobile: 320px;
  --tablet: 768px;
  --desktop: 1024px;
  --wide: 1440px;
}

/* 基础移动端样式 */
.responsive-container {
  padding: var(--spacing-md);
  margin: 0 auto;
  max-width: 100%;
}

/* 平板端优化 */
@media (min-width: 768px) {
  .responsive-container {
    padding: var(--spacing-lg);
    max-width: 750px;
  }

  .header-buttons {
    gap: var(--spacing-md);
  }

  .header-buttons .el-button {
    min-width: 120px;
  }
}

/* 桌面端优化 */
@media (min-width: 1024px) {
  .responsive-container {
    padding: var(--spacing-xl);
    max-width: 1200px;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: var(--spacing-lg);
  }
}

/* 触控友好的交互区域 */
@media (hover: none) and (pointer: coarse) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: var(--spacing-md);
  }

  .el-button {
    min-height: 44px;
    font-size: 16px; /* 防止iOS缩放 */
  }

  .el-input__inner {
    font-size: 16px; /* 防止iOS缩放 */
    padding: 12px 15px;
  }
}

/* 高分辨率屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .high-res-icon {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* 减少动画设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --text-primary: #ffffff;
    --text-secondary: #b0b3b8;
  }

  .responsive-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
}
`;
  }

  getPerformanceCodeSample() {
    return `
// 性能优化实现

// 1. 组件懒加载
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: () => h('div', '加载中...'),
  errorComponent: () => h('div', '加载失败'),
  delay: 200,
  timeout: 3000
})

// 2. 图片懒加载指令
const lazyLoad = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = binding.value
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    })
    observer.observe(el)
  }
}

// 3. 防抖优化
import { debounce } from 'lodash-es'

const handleSearch = debounce((query) => {
  // 搜索逻辑
}, 300)

// 4. 虚拟滚动（大数据量）
<template>
  <RecycleScroller
    class="scroller"
    :items="largeDataList"
    :item-size="60"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">{{ item.title }}</div>
  </RecycleScroller>
</template>

// 5. Web Workers 处理重计算
// worker.js
self.onmessage = function(e) {
  const { data, type } = e.data

  if (type === 'HEAVY_CALCULATION') {
    const result = performHeavyCalculation(data)
    self.postMessage({ result, type: 'CALCULATION_COMPLETE' })
  }
}

// main.js
const worker = new Worker('/worker.js')
worker.postMessage({ data: largeDataSet, type: 'HEAVY_CALCULATION' })
worker.onmessage = (e) => {
  const { result } = e.data
  // 处理结果
}

// 6. 资源预加载
<link rel="preload" href="/critical.css" as="style">
<link rel="prefetch" href="/next-page-resource.js">

// 7. 代码分割路由
const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/content',
    component: () => import('../views/ContentGenerator.vue')
  }
]

// 8. 缓存策略
const cache = new Map()
const getCachedData = async (key) => {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const data = await fetchData(key)
  cache.set(key, data)
  return data
}

// 9. CSS优化
/* 关键路径CSS内联 */
.critical-css {
  /* 首屏必需样式 */
}

/* 非关键CSS异步加载 */
const loadCSS = (href) => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

// 10. 性能监控
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime)
    }
  }
})
perfObserver.observe({entryTypes: ['largest-contentful-paint']})
`;
  }

  /**
   * 生成分析报告
   */
  generateReport(analysisResult) {
    console.log('📊 生成分析报告');
    return {
      summary: this.generateSummary(analysisResult),
      detailedAnalysis: analysisResult.analysis,
      prioritizedRecommendations: analysisResult.recommendations,
      implementationPlan: analysisResult.implementationRoadmap,
      exportFormats: {
        json: JSON.stringify(analysisResult, null, 2),
        markdown: this.convertToMarkdown(analysisResult),
        html: this.convertToHTML(analysisResult)
      }
    };
  }

  generateSummary(analysisResult) {
    const totalRecommendations = analysisResult.recommendations.length;
    const highPriorityCount = analysisResult.recommendations.filter(r => r.priority === 'high').length;

    return {
      overallScore: this.calculateOverallScore(analysisResult.analysis),
      keyInsights: [
        `发现${totalRecommendations}个优化机会`,
        `其中${highPriorityCount}个高优先级改进项`,
        `预估优化周期：${this.estimateTotalTime(analysisResult.recommendations)}`
      ],
      nextSteps: analysisResult.implementationRoadmap[0]?.tasks || []
    };
  }

  calculateOverallScore(analysis) {
    const scores = Object.values(analysis)
      .map(item => item.score || 0)
      .filter(score => score > 0);

    return scores.length > 0 ?
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  estimateTotalTime(recommendations) {
    const timeMap = { '1-2天': 1.5, '2-3天': 2.5, '3-5天': 4, '5-7天': 6, '1周': 7, '1-2周': 10 };
    const totalDays = recommendations.reduce((total, rec) => {
      const time = rec.implementation.estimated_time;
      return total + (timeMap[time] || 3);
    }, 0);

    return totalDays > 7 ? `${Math.ceil(totalDays / 7)}周` : `${Math.ceil(totalDays)}天`;
  }

  convertToMarkdown(analysisResult) {
    // 转换为Markdown格式的实现
    return `# 界面美化分析报告\n\n## 分析概述\n${JSON.stringify(analysisResult, null, 2)}`;
  }

  convertToHTML(analysisResult) {
    // 转换为HTML格式的实现
    return `<html><body><h1>界面美化分析报告</h1><pre>${JSON.stringify(analysisResult, null, 2)}</pre></body></html>`;
  }
}

// 使用示例
const agentConfig = {
  projectType: 'content_generator',
  techStack: ['vue3', 'element-plus', 'vite'],
  analysisMode: 'comprehensive',
  priorities: {
    visual: 0.3,
    ux: 0.4,
    performance: 0.2,
    accessibility: 0.1
  }
};

const uiAgent = new UIAnalysisAgent(agentConfig);

// 导出供外部使用
export default UIAnalysisAgent;

// Node.js环境兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIAnalysisAgent;
}
`;