<template>
  <el-dialog
    v-model="dialogVisible"
    title="关于萌太奇"
    width="90%"
    :max-width="600"
    center
    :close-on-click-modal="false"
    class="about-dialog"
  >
    <div class="about-content">
      <div class="company-logo">
        <el-icon class="logo-icon" :size="48">
          <OfficeBuilding />
        </el-icon>
        <h3 class="company-name">广西蒙太奇影视传媒有限公司</h3>
      </div>

      <div class="content-text">
        <p>{{ content }}</p>
      </div>

      <div class="contact-info">
        <el-divider />
        <div class="contact-item">
          <el-icon class="contact-icon"><Phone /></el-icon>
          <span class="contact-text">联系电话：13978445003</span>
          <el-button
            type="primary"
            size="small"
            @click="copyPhone"
            class="copy-btn"
          >
            复制
          </el-button>
        </div>
        <div class="contact-item">
          <el-icon class="contact-icon"><ChatDotRound /></el-icon>
          <span class="contact-text">微信号：13978445003</span>
          <el-button
            type="success"
            size="small"
            @click="copyWechat"
            class="copy-btn"
          >
            复制
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, Phone, ChatDotRound } from '@element-plus/icons-vue'

export default {
  name: 'AboutDialog',
  components: {
    OfficeBuilding,
    Phone,
    ChatDotRound
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dialogVisible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const copyPhone = async () => {
      try {
        await navigator.clipboard.writeText('13978445003')
        ElMessage.success('电话号码已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = '13978445003'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('电话号码已复制到剪贴板')
      }
    }

    const copyWechat = async () => {
      try {
        await navigator.clipboard.writeText('13978445003')
        ElMessage.success('微信号已复制到剪贴板')
      } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = '13978445003'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('微信号已复制到剪贴板')
      }
    }

    return {
      dialogVisible,
      copyPhone,
      copyWechat
    }
  }
}
</script>

<style scoped>
.about-dialog {
  border-radius: var(--radius-lg);
}

.about-content {
  padding: 20px 0;
}

.company-logo {
  text-align: center;
  margin-bottom: 25px;
}

.logo-icon {
  color: var(--color-accent-primary);
  margin-bottom: 15px;
}

.company-name {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: 600;
}

.content-text {
  margin-bottom: 25px;
  line-height: 1.8;
  color: var(--color-text-primary);
  font-size: 15px;
  text-align: justify;
  padding: 0 10px;
}

.contact-info {
  margin-top: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 12px 15px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.contact-icon {
  font-size: 18px;
  color: var(--color-accent-primary);
  margin-right: 12px;
  flex-shrink: 0;
}

.contact-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.copy-btn {
  margin-left: 10px;
  font-size: 12px;
  padding: 4px 12px;
}

.dialog-footer {
  text-align: center;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .about-content {
    padding: 15px 0;
  }

  .company-name {
    font-size: 18px;
  }

  .content-text {
    font-size: 14px;
    padding: 0 5px;
  }

  .contact-item {
    padding: 10px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .contact-text {
    font-size: 13px;
  }

  .copy-btn {
    align-self: flex-end;
    font-size: 11px;
    padding: 3px 10px;
  }
}
</style>