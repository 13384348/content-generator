<template>
  <el-dialog
    v-model="visible"
    title="管理员登录"
    width="400px"
    :before-close="handleClose"
    class="admin-login-dialog"
  >
    <div class="admin-login-container">
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-position="top"
        class="admin-login-form"
      >
        <el-form-item label="管理员账号" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入管理员用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          style="width: 100%"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>

      <!-- 管理员说明 -->
      <div class="admin-info">
        <el-alert
          title="管理员权限"
          type="warning"
          :closable="false"
          show-icon
          class="admin-alert"
        >
          <template #default>
            <div class="admin-info-content">
              <p>管理员拥有最高权限，可以：</p>
              <ul>
                <li>管理所有用户账户</li>
                <li>设置用户使用次数</li>
                <li>查看系统统计信息</li>
                <li>配置系统提示词</li>
              </ul>
            </div>
          </template>
        </el-alert>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Store
const userStore = useUserStore()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单引用
const loginFormRef = ref(null)

// 验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 方法
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true

    const result = await userStore.adminLogin(loginForm.username, loginForm.password)
    if (result.success) {
      ElMessage.success('管理员登录成功！')
      visible.value = false
      emit('success', 'admin-login')
      resetForm()
    } else {
      ElMessage.error(result.error)
    }
  } catch (error) {
    console.error('管理员登录验证失败:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  loginForm.username = ''
  loginForm.password = ''

  // 清除表单验证
  setTimeout(() => {
    loginFormRef.value?.clearValidate()
  }, 100)
}

const handleClose = (done) => {
  resetForm()
  done()
}
</script>

<style scoped>
.admin-login-dialog {
  --el-dialog-border-radius: 12px;
}

.admin-login-container {
  padding: 20px 0;
}

.admin-login-form {
  margin-bottom: 20px;
}

.admin-login-form .el-form-item {
  margin-bottom: 20px;
}

.admin-info {
  margin-top: 30px;
}

.admin-alert {
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
}

.admin-info-content p {
  margin: 5px 0 10px 0;
  font-size: 13px;
  font-weight: 600;
}

.admin-info-content ul {
  margin: 0;
  padding-left: 20px;
}

.admin-info-content li {
  margin: 5px 0;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .admin-login-dialog {
    --el-dialog-width: 90vw !important;
  }

  .admin-login-container {
    padding: 10px 0;
  }
}
</style>