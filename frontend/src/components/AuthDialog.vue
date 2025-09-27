<template>
  <el-dialog
    v-model="visible"
    :title="isLogin ? '登录账户' : '注册账户'"
    width="400px"
    :before-close="handleClose"
    class="auth-dialog"
  >
    <div class="auth-container">
      <!-- 登录表单 -->
      <el-form
        v-if="isLogin"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-position="top"
        class="auth-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="loginForm.email"
            type="email"
            placeholder="请输入邮箱地址"
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

      <!-- 注册表单 -->
      <el-form
        v-else
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        label-position="top"
        class="auth-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item label="推荐码（可选）" prop="referralCode">
          <el-input
            v-model="registerForm.referralCode"
            placeholder="请输入推荐码"
            size="large"
            :prefix-icon="Present"
          >
            <template #suffix>
              <el-button
                v-if="registerForm.referralCode"
                type="text"
                size="small"
                :loading="validatingReferral"
                @click="validateReferral"
              >
                验证
              </el-button>
            </template>
          </el-input>
          <div v-if="referralValidation.message" :class="referralValidation.valid ? 'referral-success' : 'referral-error'">
            {{ referralValidation.message }}
          </div>
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          style="width: 100%"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form>

      <!-- 切换登录/注册 -->
      <div class="auth-switch">
        <span v-if="isLogin">
          还没有账户？
          <el-button type="text" @click="switchToRegister">立即注册</el-button>
        </span>
        <span v-else>
          已有账户？
          <el-button type="text" @click="switchToLogin">立即登录</el-button>
        </span>
      </div>

      <!-- 用户福利提示 -->
      <div class="benefits-info">
        <el-alert
          title="用户福利"
          type="success"
          :closable="false"
          show-icon
          class="benefits-alert"
        >
          <template #default>
            <div class="benefits-content">
              <p>注册用户可获得 <strong>10次</strong> 免费使用机会</p>
              <p>更多精彩功能等您体验！</p>
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
import { User, Lock, Present } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  defaultMode: {
    type: String,
    default: 'login' // 'login' or 'register'
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

const isLogin = ref(props.defaultMode === 'login')
const loading = ref(false)
const validatingReferral = ref(false)

// 表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  referralCode: ''
})

// 推荐码验证
const referralValidation = reactive({
  valid: null,
  message: ''
})

// 表单引用
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true

    const result = await userStore.login(loginForm.email, loginForm.password)
    if (result.success) {
      ElMessage.success('登录成功！')
      visible.value = false
      emit('success', 'login')
      resetForms()
    } else {
      ElMessage.error(result.error)
    }
  } catch (error) {
    console.error('登录验证失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true

    const result = await userStore.register(
      registerForm.email,
      registerForm.password,
      registerForm.referralCode || null
    )

    if (result.success) {
      ElMessage.success('注册成功！')
      visible.value = false
      emit('success', 'register')
      resetForms()
    } else {
      ElMessage.error(result.error)
    }
  } catch (error) {
    console.error('注册验证失败:', error)
  } finally {
    loading.value = false
  }
}

const validateReferral = async () => {
  if (!registerForm.referralCode) {
    referralValidation.valid = null
    referralValidation.message = ''
    return
  }

  validatingReferral.value = true
  try {
    const result = await userStore.validateReferralCode(registerForm.referralCode)
    if (result.success && result.data.valid) {
      referralValidation.valid = true
      referralValidation.message = `推荐码有效，推荐人: ${result.data.referrerEmail}`
    } else {
      referralValidation.valid = false
      referralValidation.message = '推荐码无效'
    }
  } catch (error) {
    referralValidation.valid = false
    referralValidation.message = '验证推荐码失败'
  } finally {
    validatingReferral.value = false
  }
}

const switchToLogin = () => {
  isLogin.value = true
  resetForms()
}

const switchToRegister = () => {
  isLogin.value = false
  resetForms()
}

const resetForms = () => {
  loginForm.email = ''
  loginForm.password = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.referralCode = ''
  referralValidation.valid = null
  referralValidation.message = ''

  // 清除表单验证
  setTimeout(() => {
    loginFormRef.value?.clearValidate()
    registerFormRef.value?.clearValidate()
  }, 100)
}

const handleClose = (done) => {
  resetForms()
  done()
}
</script>

<style scoped>
.auth-dialog {
  --el-dialog-border-radius: 12px;
}

.auth-container {
  padding: 20px 0;
}

.auth-form {
  margin-bottom: 20px;
}

.auth-form .el-form-item {
  margin-bottom: 20px;
}

.auth-switch {
  text-align: center;
  margin: 20px 0;
  color: var(--el-text-color-regular);
}

.benefits-info {
  margin-top: 30px;
}

.benefits-alert {
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-7);
}

.benefits-content p {
  margin: 5px 0;
  font-size: 13px;
}

.benefits-content strong {
  color: var(--el-color-primary);
  font-weight: 600;
}

.referral-success {
  color: var(--el-color-success);
  font-size: 12px;
  margin-top: 5px;
}

.referral-error {
  color: var(--el-color-error);
  font-size: 12px;
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-dialog {
    --el-dialog-width: 90vw !important;
  }

  .auth-container {
    padding: 10px 0;
  }
}
</style>