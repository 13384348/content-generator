<template>
  <el-dialog
    v-model="visible"
    title="购买使用次数包"
    width="500px"
    :before-close="handleClose"
    class="purchase-dialog"
  >
    <div class="purchase-container">
      <!-- 套餐选择 -->
      <div class="package-selection">
        <h3 class="section-title">选择套餐包</h3>
        <div class="packages-grid">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            :class="['package-card', { 'selected': selectedPackage?.id === pkg.id, 'recommended': pkg.recommended }]"
            @click="selectPackage(pkg)"
          >
            <div class="package-badge" v-if="pkg.recommended">推荐</div>
            <div class="package-header">
              <div class="package-name">{{ pkg.name }}</div>
              <div class="package-price">¥{{ pkg.price }}</div>
            </div>
            <div class="package-details">
              <div class="package-count">{{ pkg.count }}次</div>
              <div class="package-unit">¥{{ (pkg.price / pkg.count).toFixed(2) }}/次</div>
            </div>
            <div class="package-desc" v-if="pkg.desc">{{ pkg.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-methods" v-if="selectedPackage">
        <h3 class="section-title">支付方式</h3>
        <div class="payment-options">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            :class="['payment-card', { 'selected': selectedPayment?.id === method.id }]"
            @click="selectPayment(method)"
          >
            <div class="payment-icon">{{ method.icon }}</div>
            <div class="payment-name">{{ method.name }}</div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-summary" v-if="selectedPackage">
        <h3 class="section-title">订单信息</h3>
        <div class="summary-card">
          <div class="summary-item">
            <span class="summary-label">商品名称</span>
            <span class="summary-value">{{ selectedPackage.name }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">使用次数</span>
            <span class="summary-value">{{ selectedPackage.count }}次</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">支付方式</span>
            <span class="summary-value">{{ selectedPayment?.name || '请选择' }}</span>
          </div>
          <div class="summary-item total">
            <span class="summary-label">应付金额</span>
            <span class="summary-value">¥{{ selectedPackage.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handlePurchase"
          size="large"
          :disabled="!canPurchase"
          :loading="processing"
        >
          确认支付
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

const selectedPackage = ref(null)
const selectedPayment = ref(null)
const processing = ref(false)

// 套餐配置
const packages = [
  {
    id: 'basic',
    name: '基础包',
    count: 100,
    price: 19,
    desc: '适合轻度使用'
  },
  {
    id: 'value',
    name: '超值包',
    count: 300,
    price: 49,
    desc: '最受欢迎的选择',
    recommended: true
  },
  {
    id: 'premium',
    name: '专业包',
    count: 600,
    price: 89,
    desc: '适合重度使用'
  },
  {
    id: 'enterprise',
    name: '企业包',
    count: 1500,
    price: 199,
    desc: '适合团队使用'
  }
]

// 支付方式
const paymentMethods = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: '💰'
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: '💳'
  }
]

// 计算属性
const canPurchase = computed(() => {
  return selectedPackage.value && selectedPayment.value && !processing.value
})

// 方法
const selectPackage = (pkg) => {
  selectedPackage.value = pkg
}

const selectPayment = (method) => {
  selectedPayment.value = method
}

const handlePurchase = async () => {
  if (!canPurchase.value) return

  try {
    const confirmed = await ElMessageBox.confirm(
      `确认购买${selectedPackage.value.name}（${selectedPackage.value.count}次，¥${selectedPackage.value.price}）吗？`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (confirmed) {
      processing.value = true

      const orderData = {
        packageId: selectedPackage.value.id,
        paymentMethod: selectedPayment.value.id,
        amount: selectedPackage.value.price,
        count: selectedPackage.value.count
      }

      const result = await userStore.createOrder(orderData)

      if (result.success) {
        // 模拟跳转到支付页面
        await simulatePayment(result.data.orderId)
      } else {
        ElMessage.error(result.error || '创建订单失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('支付过程中出现错误')
      console.error('Payment error:', error)
    }
  } finally {
    processing.value = false
  }
}

const simulatePayment = async (orderId) => {
  // 模拟支付过程
  ElMessage.info('正在跳转到支付页面...')

  // 模拟支付延迟
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 模拟支付结果（实际应用中这里会是真实的支付回调）
  const paymentSuccess = Math.random() > 0.1 // 90% 成功率

  if (paymentSuccess) {
    const result = await userStore.confirmPayment(orderId)
    if (result.success) {
      ElMessage.success('支付成功！使用次数已到账')
      emit('success')
      handleClose()
    } else {
      ElMessage.error('支付确认失败，请联系客服')
    }
  } else {
    ElMessage.error('支付失败，请重试')
  }
}

const handleClose = () => {
  selectedPackage.value = null
  selectedPayment.value = null
  processing.value = false
  visible.value = false
}
</script>

<style scoped>
.purchase-dialog {
  --el-dialog-border-radius: 12px;
}

.purchase-container {
  padding: 20px 0;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 套餐选择 */
.package-selection {
  margin-bottom: 30px;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.package-card {
  position: relative;
  padding: 20px 15px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.package-card:hover {
  border-color: var(--el-color-primary-light-5);
}

.package-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.package-card.recommended {
  border-color: var(--el-color-warning);
}

.package-badge {
  position: absolute;
  top: -8px;
  right: 10px;
  background: var(--el-color-warning);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}

.package-header {
  margin-bottom: 10px;
}

.package-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 5px;
}

.package-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.package-details {
  margin-bottom: 10px;
}

.package-count {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 3px;
}

.package-unit {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.package-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 8px;
}

/* 支付方式 */
.payment-methods {
  margin-bottom: 30px;
}

.payment-options {
  display: flex;
  gap: 15px;
}

.payment-card {
  flex: 1;
  padding: 15px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.payment-card:hover {
  border-color: var(--el-color-primary-light-5);
}

.payment-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.payment-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.payment-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

/* 订单信息 */
.order-summary {
  margin-bottom: 20px;
}

.summary-card {
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item.total {
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 12px;
  margin-top: 12px;
}

.summary-label {
  color: var(--el-text-color-regular);
}

.summary-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.summary-item.total .summary-value {
  font-size: 18px;
  color: var(--el-color-primary);
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  gap: 15px;
}

.dialog-footer .el-button {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 580px) {
  .purchase-dialog {
    --el-dialog-width: 90vw !important;
  }

  .packages-grid {
    grid-template-columns: 1fr;
  }

  .payment-options {
    flex-direction: column;
  }
}
</style>