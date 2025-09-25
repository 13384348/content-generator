/**
 * 个人前端美化AGENT配置文件
 * 基于用户明确偏好和已验证成功案例的标准化配置
 *
 * 用户设计哲学：
 * - 简洁明了，避免过度装饰
 * - 高科技AI智能感
 * - 移动端优先体验
 * - 4色限制的和谐配色
 */

class PersonalUIAgentConfig {
  constructor() {
    this.userProfile = this.initializeUserProfile();
    this.designSystem = this.initializeDesignSystem();
    this.technicalStack = this.initializeTechnicalStack();
    this.analysisTemplates = this.initializeAnalysisTemplates();
  }

  /**
   * 用户个人偏好配置
   */
  initializeUserProfile() {
    return {
      // 设计原则偏好
      designPrinciples: {
        simplicity: {
          priority: 'highest',
          description: '简洁明了，避免过多装饰和复杂布局',
          manifestations: [
            '保持简洁，让用户快速找到信息',
            '避免不必要的视觉元素',
            '优先功能性而非装饰性'
          ]
        },
        responsiveDesign: {
          priority: 'highest',
          description: '移动端优先的响应式设计',
          approach: 'mobile-first',
          requirements: [
            '使用媒体查询和弹性布局',
            '确保不同设备良好显示',
            '移动端体验很重要'
          ]
        },
        consistency: {
          priority: 'high',
          description: '保持整体风格统一',
          elements: ['颜色', '字体', '按钮样式', '间距系统', '圆角半径']
        },
        interactivity: {
          priority: 'high',
          description: '现代化的交互反馈',
          features: [
            '悬停效果',
            '页面过渡动画',
            'AI科技感交互',
            '提高参与感和体验'
          ]
        },
        performance: {
          priority: 'high',
          description: '优化加载速度',
          requirements: [
            '减少不必要资源',
            '使用压缩和缓存',
            '优先用户体验流畅度'
          ]
        }
      },

      // 色彩方案偏好（严格4色限制）
      colorScheme: {
        maxColors: 4,
        distribution: {
          primary: {
            color: 'white',
            percentage: 70,
            description: '主色调，占主导地位'
          },
          secondary: {
            color: 'black',
            percentage: 20,
            description: '辅色，用于文字和边框'
          },
          accent1: {
            color: null, // 动态确定
            percentage: 7,
            description: '强调色1，用于关键交互元素'
          },
          accent2: {
            color: null, // 动态确定
            percentage: 3,
            description: '强调色2，用于特殊状态提示'
          }
        },
        principles: [
          '总色彩不超过4个颜色',
          '白色为主色调（70%）',
          '黑色为辅色（20%）',
          '两个强调色分别占7%和3%'
        ]
      },

      // 动画风格偏好
      animationStyle: {
        overallTheme: 'high-tech-ai',
        characteristics: [
          '高科技风格：AI智能对话的感觉',
          '简洁为主：不要过度装饰',
          '科技感交互：现代化的交互反馈'
        ],
        preferredEffects: [
          'aiGlow', // AI光效动画
          'aiScan', // 扫描线动画
          'gridFadeIn', // 网格淡入效果
          'backdrop-filter blur' // 玻璃态效果
        ],
        avoidEffects: [
          '过度装饰动画',
          '花哨的3D效果',
          '过长的动画持续时间'
        ]
      },

      // 目标用户群体
      targetUsers: {
        primary: 'AI智能工具用户',
        characteristics: [
          '熟悉科技产品',
          '重视效率和功能性',
          '喜欢现代化界面',
          '移动端使用频繁'
        ],
        expectations: [
          '快速响应',
          '直观操作',
          '专业感',
          '智能感知'
        ]
      }
    };
  }

  /**
   * 设计系统配置
   */
  initializeDesignSystem() {
    return {
      // CSS变量系统（基于成功案例）
      cssVariables: {
        colors: {
          primary: 'var(--color-bg-primary)', // 主背景 - 白色系
          secondary: 'var(--color-bg-secondary)', // 次背景
          accent1: 'var(--color-accent-primary)', // 主强调色
          accent2: 'var(--color-accent-secondary)', // 次强调色
          text: {
            primary: 'var(--color-text-primary)', // 主文字色
            secondary: 'var(--color-text-secondary)', // 次文字色
            inverse: 'var(--color-text-inverse)' // 反色文字
          },
          border: 'var(--color-border)',
          shadow: 'var(--color-shadow)'
        },
        effects: {
          glassEffect: 'backdrop-filter: blur(20px)',
          aiGlow: `
            background: linear-gradient(45deg, transparent 30%, rgba(120, 119, 198, 0.3) 50%, transparent 70%);
            background-size: 200% 200%;
            animation: aiGlow 3s infinite;
          `,
          shadowSystem: {
            subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
            medium: '0 4px 15px rgba(0, 0, 0, 0.1)',
            strong: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
          xxl: '48px'
        },
        borderRadius: {
          sm: '8px',
          md: '12px',
          lg: '16px',
          full: '50%'
        },
        transitions: {
          fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          base: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      },

      // 典型组件样式模式
      componentPatterns: {
        card: {
          base: `
            background: var(--color-bg-primary);
            backdrop-filter: blur(20px);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-medium);
            transition: var(--transition-base);
          `,
          hover: `
            transform: translateY(-2px);
            box-shadow: var(--shadow-strong);
          `
        },
        button: {
          primary: `
            background: var(--color-accent-primary);
            color: var(--color-text-inverse);
            border: none;
            border-radius: var(--radius-md);
            padding: 12px 24px;
            transition: var(--transition-base);
            position: relative;
            overflow: hidden;
          `,
          hover: `
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(var(--color-accent-primary-rgb), 0.3);
          `
        },
        input: {
          base: `
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            padding: 12px 16px;
            transition: var(--transition-base);
          `,
          focus: `
            border-color: var(--color-accent-primary);
            box-shadow: 0 0 0 3px rgba(var(--color-accent-primary-rgb), 0.1);
          `
        }
      }
    };
  }

  /**
   * 技术栈配置
   */
  initializeTechnicalStack() {
    return {
      framework: 'Vue 3',
      uiLibrary: 'Element Plus',
      buildTool: 'Vite',
      styling: 'CSS-in-JS + SCSS',
      responsiveStrategy: 'mobile-first',

      // 技术实现偏好
      preferences: {
        componentApproach: 'Composition API',
        stateManagement: 'Pinia (if complex)',
        styling: 'CSS Variables + Deep Styling',
        animations: 'CSS Animations + Transitions',
        optimization: [
          'Lazy Loading',
          'Code Splitting',
          'Image Optimization',
          'Bundle Size Optimization'
        ]
      },

      // Element Plus 深度定制策略
      elementPlusCustomization: {
        approach: 'deep-style-override',
        targetComponents: [
          'el-button',
          'el-input',
          'el-card',
          'el-form',
          'el-dialog',
          'el-table'
        ],
        customizationPatterns: [
          'CSS变量覆盖',
          ':deep() 样式穿透',
          '自定义主题变量',
          '组件wrapper增强'
        ]
      }
    };
  }

  /**
   * 分析模板配置
   */
  initializeAnalysisTemplates() {
    return {
      // 主要分析模式
      personalizedAnalysis: {
        name: '个人偏好分析模式',
        description: '基于用户明确偏好进行的定制化分析',
        focusAreas: [
          {
            area: 'simplicity_compliance',
            weight: 0.25,
            criteria: [
              '是否避免了过多装饰',
              '信息层级是否清晰简洁',
              '是否快速可理解'
            ]
          },
          {
            area: 'color_scheme_adherence',
            weight: 0.20,
            criteria: [
              '是否严格遵守4色限制',
              '颜色比例是否符合70/20/7/3分配',
              '白色主色调是否占主导'
            ]
          },
          {
            area: 'mobile_first_design',
            weight: 0.25,
            criteria: [
              '移动端体验是否优先考虑',
              '响应式断点是否合理',
              '触控区域是否足够大'
            ]
          },
          {
            area: 'ai_tech_aesthetics',
            weight: 0.15,
            criteria: [
              '是否体现AI科技感',
              '动画是否具备智能感知特征',
              '交互是否现代化'
            ]
          },
          {
            area: 'performance_optimization',
            weight: 0.15,
            criteria: [
              '加载速度是否优化',
              '动画是否流畅',
              '资源使用是否高效'
            ]
          }
        ]
      },

      // 快速评估模式
      quickAssessment: {
        name: '快速偏好匹配评估',
        checkpoints: [
          {
            question: '界面是否过于复杂？',
            goodAnswer: '界面简洁，信息层级清晰',
            weight: 'high'
          },
          {
            question: '是否使用超过4种颜色？',
            goodAnswer: '严格控制在4色以内',
            weight: 'high'
          },
          {
            question: '移动端体验如何？',
            goodAnswer: '移动端体验优先，适配完善',
            weight: 'high'
          },
          {
            question: '是否具备科技感？',
            goodAnswer: '动效现代，有AI智能感',
            weight: 'medium'
          },
          {
            question: '性能表现如何？',
            goodAnswer: '加载快速，交互流畅',
            weight: 'medium'
          }
        ]
      }
    };
  }

  /**
   * 生成个性化分析Prompt
   */
  generatePersonalizedPrompt(analysisType = 'comprehensive') {
    const basePrompt = `
# 个人定制UI美化分析AGENT

您是我的专属前端界面美化专家，完全了解我的设计偏好和审美要求。

## 我的核心设计偏好（请严格遵循）

### 设计原则
- **极简主义**: 简洁明了，避免过多装饰，让用户快速找到信息
- **响应式优先**: 移动端优先设计，确保各设备完美显示
- **一致性**: 统一的颜色、字体、按钮、间距系统
- **科技交互**: AI智能感的现代化交互反馈
- **高性能**: 优化加载速度，流畅的用户体验

### 严格的色彩限制
- **总色彩**: 绝对不超过4个颜色
- **主色调**: 白色（占70%比例）
- **辅色**: 黑色（占20%比例）
- **强调色1**: （占7%比例）
- **强调色2**: （占3%比例）

### 动画风格偏好
- **高科技风格**: AI智能对话的感觉
- **简洁为主**: 不要过度装饰
- **科技感交互**: 现代化的交互反馈
- **推荐效果**: aiGlow、aiScan、gridFadeIn、玻璃态效果

### 技术栈要求
- **框架**: Vue 3 + Element Plus + Vite
- **目标用户**: 使用AI智能工具的用户群体
- **优先级**: 移动端体验 > 桌面端体验

### 已验证成功案例
刚刚完成的MyFavorites.vue美化使用了：
- CSS变量系统定义4色方案
- 玻璃态效果(backdrop-filter blur)
- AI科技感动画(aiGlow, aiScan, gridFadeIn)
- 移动端优先响应式设计
- Element Plus组件深度样式定制

## 分析任务要求

请基于我的偏好对界面进行分析，重点关注：

1. **简洁度检查**: 是否有多余装饰？信息密度是否合理？
2. **4色合规性**: 是否严格遵守颜色限制？比例分配是否正确？
3. **移动端优先**: 移动端体验是否充分考虑？
4. **科技感评估**: 是否体现AI智能感？动效是否现代？
5. **性能影响**: 美化是否影响加载性能？

## 输出格式要求

### 个人偏好符合度评分
- **简洁性**: X/10 分
- **色彩合规性**: X/10 分
- **移动端适配**: X/10 分
- **科技感**: X/10 分
- **性能表现**: X/10 分

### 改进建议
请提供具体的、符合我偏好的改进方案，包括：
- 具体的CSS代码示例
- Element Plus组件定制方案
- 响应式断点建议
- 动画效果实现代码

### 实施优先级
根据我的偏好，按重要性排序改进建议。

现在请开始分析我提供的界面...
`;

    return basePrompt;
  }

  /**
   * 获取代码模板
   */
  getCodeTemplates() {
    return {
      // 4色方案CSS变量模板
      colorSystemTemplate: `
/* 个人偏好4色系统 */
:root {
  /* 主色调 - 白色系 (70%) */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafbfc;

  /* 辅色 - 黑色系 (20%) */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: rgba(0, 0, 0, 0.1);

  /* 强调色1 (7%) - 科技蓝 */
  --color-accent-primary: #667eea;
  --color-accent-primary-rgb: 102, 126, 234;

  /* 强调色2 (3%) - 智能紫 */
  --color-accent-secondary: #764ba2;
  --color-accent-secondary-rgb: 118, 75, 162;

  /* 功能色彩（基于4色方案衍生） */
  --color-success: var(--color-accent-primary);
  --color-warning: rgba(var(--color-accent-secondary-rgb), 0.8);
  --color-danger: rgba(var(--color-accent-secondary-rgb), 0.9);
  --color-info: rgba(var(--color-accent-primary-rgb), 0.6);

  /* 阴影系统 */
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.12);

  /* 玻璃态效果 */
  --glass-bg: rgba(255, 255, 255, 0.9);
  --glass-blur: blur(20px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 暗色模式适配（保持4色限制） */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0f0f0f;
    --color-bg-secondary: #1a1a1a;
    --color-text-primary: #ffffff;
    --color-text-secondary: #cccccc;
    --glass-bg: rgba(26, 26, 26, 0.9);
  }
}
      `,

      // AI科技感动画模板
      aiAnimationsTemplate: `
/* AI科技感动画效果 */

/* AI扫描光效 */
@keyframes aiGlow {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.ai-glow-effect {
  position: relative;
  overflow: hidden;
}

.ai-glow-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--color-accent-primary-rgb), 0.4),
    transparent
  );
  transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-glow-effect:hover::before {
  left: 100%;
}

/* AI扫描线动画 */
@keyframes aiScan {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(300px) rotate(45deg); }
}

.ai-scan-line {
  position: relative;
  overflow: hidden;
}

.ai-scan-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: var(--color-accent-primary);
  box-shadow: 0 0 10px var(--color-accent-primary);
  animation: aiScan 2s ease-in-out infinite;
}

/* 网格渐现效果 */
@keyframes gridFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.grid-fade-in {
  animation: gridFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 玻璃态卡片 */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-strong);
}

/* 智能脉冲效果 */
@keyframes aiPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--color-accent-primary-rgb), 0.4);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(var(--color-accent-primary-rgb), 0);
  }
}

.ai-pulse {
  animation: aiPulse 2s ease-in-out infinite;
}
      `,

      // 移动端优先响应式模板
      mobileFirstTemplate: `
/* 移动端优先响应式系统 */

/* 基础移动端样式（320px+） */
.responsive-container {
  padding: 16px;
  margin: 0 auto;
  max-width: 100%;
}

/* 小屏手机（360px+） */
@media (min-width: 360px) {
  .responsive-container {
    padding: 20px;
  }
}

/* 大屏手机（414px+） */
@media (min-width: 414px) {
  .responsive-container {
    padding: 24px;
  }
}

/* 平板竖屏（768px+） */
@media (min-width: 768px) {
  .responsive-container {
    padding: 32px;
    max-width: 750px;
  }

  /* 双列布局 */
  .grid-mobile-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

/* 平板横屏/小桌面（1024px+） */
@media (min-width: 1024px) {
  .responsive-container {
    padding: 48px;
    max-width: 1200px;
  }

  /* 三列布局 */
  .grid-desktop-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

/* 大桌面（1440px+） */
@media (min-width: 1440px) {
  .responsive-container {
    max-width: 1400px;
  }
}

/* 触控友好设计 */
@media (hover: none) and (pointer: coarse) {
  /* 增大触控区域 */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: 12px;
  }

  /* 防止iOS缩放 */
  input, textarea, select {
    font-size: 16px !important;
  }

  /* 移除悬停效果 */
  .hover-effect:hover {
    transform: none;
  }
}

/* 高分辨率屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .sharp-image {
    image-rendering: -webkit-optimize-contrast;
  }
}
      `,

      // Element Plus 深度定制模板
      elementPlusCustomTemplate: `
/* Element Plus 个人偏好定制 */

/* 按钮组件定制 */
:deep(.el-button) {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:deep(.el-button--primary) {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  box-shadow: 0 4px 15px rgba(var(--color-accent-primary-rgb), 0.2);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--color-accent-primary-rgb), 0.3);
}

/* 输入框组件定制 */
:deep(.el-input__inner) {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-input__inner:focus) {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-primary-rgb), 0.1);
}

/* 卡片组件定制 */
:deep(.el-card) {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
}

/* 对话框组件定制 */
:deep(.el-dialog) {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-radius: 20px;
  border: var(--glass-border);
}

:deep(.el-dialog__header) {
  background: transparent;
  border-bottom: 1px solid var(--color-border);
}

/* 表格组件定制 */
:deep(.el-table) {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

:deep(.el-table tr:hover) {
  background: rgba(var(--color-accent-primary-rgb), 0.05);
}

/* 表单组件定制 */
:deep(.el-form-item__label) {
  color: var(--color-text-primary);
  font-weight: 500;
}

:deep(.el-form-item.is-error .el-input__inner) {
  border-color: var(--color-accent-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-secondary-rgb), 0.1);
}

/* 加载动画定制 */
:deep(.el-loading-mask) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

:deep(.el-loading-spinner .circular) {
  color: var(--color-accent-primary);
}
      `
    };
  }

  /**
   * 获取个性化建议模板
   */
  getRecommendationTemplates() {
    return {
      simplicity: {
        title: '简洁性优化',
        template: `
### 简洁性问题检查
- [ ] 移除不必要的装饰元素
- [ ] 简化信息层级结构
- [ ] 优化视觉噪音
- [ ] 提高信息获取效率

### 建议实施方案
\`\`\`css
/* 减少视觉干扰 */
.clean-interface {
  /* 更多留白 */
  padding: 32px;
  /* 减少边框装饰 */
  border: 1px solid var(--color-border);
  /* 统一圆角 */
  border-radius: 12px;
}
\`\`\`
        `
      },

      colorCompliance: {
        title: '4色方案合规性',
        template: `
### 色彩使用检查
- [ ] 确认只使用4种颜色
- [ ] 白色占比70%检查
- [ ] 黑色占比20%检查
- [ ] 强调色比例7%+3%检查

### 色彩优化方案
\`\`\`css
/* 严格4色方案 */
:root {
  --color-1: #ffffff; /* 70% - 主背景色 */
  --color-2: #1a1a1a; /* 20% - 文字边框色 */
  --color-3: #667eea; /* 7% - 主要强调色 */
  --color-4: #764ba2; /* 3% - 次要强调色 */
}
\`\`\`
        `
      },

      mobileFirst: {
        title: '移动端优先优化',
        template: `
### 移动端体验检查
- [ ] 触控区域是否≥44px
- [ ] 字体大小是否≥16px
- [ ] 是否适配各种屏幕尺寸
- [ ] 横屏模式是否正常

### 移动端优化方案
\`\`\`css
/* 移动端优先样式 */
.mobile-optimized {
  /* 基础移动端样式 */
  min-height: 44px;
  font-size: 16px;
  touch-action: manipulation;
}

@media (min-width: 768px) {
  .mobile-optimized {
    /* 平板及以上优化 */
  }
}
\`\`\`
        `
      }
    };
  }
}

// 导出配置实例
const personalConfig = new PersonalUIAgentConfig();

// 使用示例
export const createPersonalizedAnalysisAgent = (interfaceData) => {
  const config = personalConfig;
  const prompt = config.generatePersonalizedPrompt();
  const templates = config.getCodeTemplates();

  return {
    config,
    prompt,
    templates,
    analyze: () => {
      console.log('🤖 启动个人定制UI分析AGENT...');
      console.log('📋 用户偏好配置已加载');
      console.log('🎨 分析模式: 个人偏好匹配');
      console.log('🔍 开始分析界面...');

      // 在这里可以整合实际的分析逻辑
      return {
        userPreferenceCompliance: '基于个人偏好的符合度评估',
        recommendations: '个性化改进建议',
        codeExamples: '符合偏好的代码示例'
      };
    }
  };
};

export default PersonalUIAgentConfig;