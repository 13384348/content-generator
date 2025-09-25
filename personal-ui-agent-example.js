/**
 * 个人UI美化AGENT使用示例
 * 展示如何使用个人偏好配置进行界面分析
 */

import PersonalUIAgentConfig, { createPersonalizedAnalysisAgent } from './personal-ui-agent-config.js';

// ========================================
// 示例1: 快速个性化分析
// ========================================

console.log('=== 示例1: 快速个性化分析 ===');

// 创建个人配置实例
const personalConfig = new PersonalUIAgentConfig();

// 生成个人偏好的分析Prompt
const personalizedPrompt = personalConfig.generatePersonalizedPrompt();

console.log('📝 生成的个人偏好Prompt:');
console.log(personalizedPrompt);

// ========================================
// 示例2: 完整分析流程
// ========================================

console.log('\n=== 示例2: 完整分析流程 ===');

// 模拟界面数据
const interfaceData = {
  type: 'vue_component',
  name: 'UserProfileCard.vue',
  description: '用户资料卡片组件',
  currentIssues: [
    '使用了6种颜色，超出4色限制',
    '移动端按钮过小，不便触控',
    '缺乏AI科技感',
    '信息过于密集'
  ]
};

// 创建个性化分析代理
const analysisAgent = createPersonalizedAnalysisAgent(interfaceData);

// 执行分析
const analysisResult = analysisAgent.analyze();
console.log('🔍 分析结果:', analysisResult);

// ========================================
// 示例3: 获取代码模板
// ========================================

console.log('\n=== 示例3: 获取代码模板 ===');

const codeTemplates = personalConfig.getCodeTemplates();

console.log('🎨 4色系统CSS模板:');
console.log(codeTemplates.colorSystemTemplate);

console.log('\n🚀 AI动画效果模板:');
console.log(codeTemplates.aiAnimationsTemplate);

// ========================================
// 示例4: 检查界面是否符合个人偏好
// ========================================

console.log('\n=== 示例4: 偏好符合度检查 ===');

// 模拟界面分析函数
function checkPersonalPreferenceCompliance(interfaceData) {
  const config = new PersonalUIAgentConfig();
  const preferences = config.userProfile;

  const complianceReport = {
    simplicity: {
      score: 7,
      issues: ['信息密度偏高', '装饰元素较多'],
      suggestions: ['简化信息层级', '移除不必要装饰']
    },
    colorScheme: {
      score: 4,
      issues: ['使用了6种颜色，超出限制'],
      suggestions: ['严格限制在4色以内', '调整颜色比例至70/20/7/3']
    },
    mobileFirst: {
      score: 6,
      issues: ['按钮触控区域小于44px'],
      suggestions: ['增大触控区域', '优化移动端适配']
    },
    techAesthetics: {
      score: 5,
      issues: ['缺乏AI科技感', '动效不够现代'],
      suggestions: ['添加AI光效动画', '使用玻璃态效果']
    },
    performance: {
      score: 8,
      issues: ['动画数量偏多'],
      suggestions: ['优化动画性能', '使用硬件加速']
    }
  };

  return complianceReport;
}

const complianceResult = checkPersonalPreferenceCompliance(interfaceData);
console.log('📊 个人偏好符合度报告:', complianceResult);

// ========================================
// 示例5: 生成个性化改进建议
// ========================================

console.log('\n=== 示例5: 个性化改进建议 ===');

function generatePersonalizedRecommendations(complianceReport) {
  const recommendations = [];

  // 基于符合度生成建议
  if (complianceReport.colorScheme.score < 7) {
    recommendations.push({
      priority: 'high',
      category: 'color_compliance',
      title: '4色方案合规化改造',
      description: '将当前6色方案简化为4色方案，严格遵循70/20/7/3比例分配',
      implementation: {
        difficulty: 'medium',
        estimated_time: '2-3天',
        codeExample: `
/* 个人偏好4色方案 */
:root {
  --color-primary: #ffffff;    /* 70% - 主背景 */
  --color-secondary: #1a1a1a;  /* 20% - 文字边框 */
  --color-accent1: #667eea;    /* 7% - 主强调色 */
  --color-accent2: #764ba2;    /* 3% - 次强调色 */
}
        `
      }
    });
  }

  if (complianceReport.mobileFirst.score < 8) {
    recommendations.push({
      priority: 'high',
      category: 'mobile_optimization',
      title: '移动端优先体验优化',
      description: '按照移动端优先原则重新设计界面，确保触控友好',
      implementation: {
        difficulty: 'easy',
        estimated_time: '1-2天',
        codeExample: `
/* 移动端优先触控优化 */
.touch-friendly-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
  font-size: 16px; /* 防止iOS缩放 */
}

@media (min-width: 768px) {
  .touch-friendly-button {
    min-height: 40px;
    padding: 10px 18px;
  }
}
        `
      }
    });
  }

  if (complianceReport.techAesthetics.score < 7) {
    recommendations.push({
      priority: 'medium',
      category: 'ai_aesthetics',
      title: 'AI科技感界面升级',
      description: '添加现代化AI科技感元素，提升界面的智能感知体验',
      implementation: {
        difficulty: 'medium',
        estimated_time: '2-3天',
        codeExample: `
/* AI科技感效果 */
.ai-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.ai-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
  transition: left 0.8s ease;
}

.ai-card:hover::before {
  left: 100%;
}
        `
      }
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

const personalizedRecommendations = generatePersonalizedRecommendations(complianceResult);
console.log('💡 个性化改进建议:', personalizedRecommendations);

// ========================================
// 示例6: 一键调用个人偏好分析
// ========================================

console.log('\n=== 示例6: 一键调用方式 ===');

/**
 * 一键个人偏好分析函数
 * @param {Object} componentData - 组件数据
 * @returns {Object} 完整分析报告
 */
function analyzeWithPersonalPreference(componentData) {
  console.log('🤖 启动个人定制UI分析AGENT...');

  const config = new PersonalUIAgentConfig();

  // 1. 生成个性化Prompt
  const prompt = config.generatePersonalizedPrompt();

  // 2. 检查偏好符合度
  const compliance = checkPersonalPreferenceCompliance(componentData);

  // 3. 生成个性化建议
  const recommendations = generatePersonalizedRecommendations(compliance);

  // 4. 获取代码模板
  const templates = config.getCodeTemplates();

  return {
    analysisPrompt: prompt,
    complianceReport: compliance,
    recommendations: recommendations,
    codeTemplates: templates,
    summary: {
      overallScore: Math.round(
        Object.values(compliance).reduce((sum, item) => sum + item.score, 0) /
        Object.keys(compliance).length
      ),
      highPriorityIssues: recommendations.filter(r => r.priority === 'high').length,
      estimatedOptimizationTime: '1-2周'
    }
  };
}

// 使用示例
const fullAnalysisResult = analyzeWithPersonalPreference({
  name: 'ProductCard.vue',
  issues: ['颜色过多', '移动端体验差', '缺乏科技感']
});

console.log('📋 完整分析报告:', {
  overallScore: fullAnalysisResult.summary.overallScore,
  highPriorityIssues: fullAnalysisResult.summary.highPriorityIssues,
  recommendations: fullAnalysisResult.recommendations.map(r => r.title)
});

// ========================================
// 导出供外部使用
// ========================================

export {
  analyzeWithPersonalPreference,
  checkPersonalPreferenceCompliance,
  generatePersonalizedRecommendations
};

// ========================================
// 快速调用示例（复制粘贴即用）
// ========================================

console.log(`
========================================
快速调用模板（复制粘贴即用）：
========================================

import { analyzeWithPersonalPreference } from './personal-ui-agent-example.js';

// 一键分析
const result = analyzeWithPersonalPreference({
  name: 'YourComponent.vue',
  issues: ['描述当前界面问题']
});

console.log('分析结果:', result.summary);
console.log('改进建议:', result.recommendations);

========================================
`);