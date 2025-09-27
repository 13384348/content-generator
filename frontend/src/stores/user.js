import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isGuest = computed(() => false) // 不再支持访客模式

  // 管理员状态 - 基于特定邮箱判断
  const adminEmails = ['ok47584@126.com', '2918707003@qq.com']
  const isAdmin = computed(() => !!user.value && adminEmails.includes(user.value.email))

  // 使用信息
  const usageInfo = ref({
    freeUsageCount: 0,
    freeUsageLimit: 5,
    paidUsageCount: 0,
    totalPurchased: 0,
    canUse: true
  })

  // 计算是否可以使用功能 - 管理员总是可以使用
  const canUseFeatures = computed(() => {
    if (isAdmin.value) {
      return true
    }
    return usageInfo.value.canUse
  })

  // 设置axios默认header
  const setAuthHeader = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      localStorage.setItem('authToken', authToken)
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('authToken')
    }
  }


  // 初始化用户状态
  const initAuth = async () => {
    if (token.value) {
      setAuthHeader(token.value)
      try {
        await getUserProfile()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        logout()
      }
    }

    // 不再创建访客会话，未登录用户无法使用功能
  }


  // 用户注册
  const register = async (email, password, referralCode = null) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        referralCode
      })

      if (response.data.success) {
        const userData = response.data.data
        token.value = userData.token
        user.value = {
          id: userData.userId,
          email: userData.email,
          username: userData.username,
          referralCode: userData.referralCode
        }
        usageInfo.value = {
          freeUsageCount: userData.freeUsageCount,
          freeUsageLimit: userData.freeUsageLimit,
          paidUsageCount: userData.paidUsageCount || 0,
          totalPurchased: 0,
          canUse: true
        }
        setAuthHeader(userData.token)
        return { success: true, data: userData }
      }
    } catch (error) {
      console.error('注册失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '注册失败'
      }
    }
  }

  // 用户登录
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      })

      if (response.data.success) {
        const userData = response.data.data
        token.value = userData.token
        user.value = {
          id: userData.userId,
          email: userData.email,
          username: userData.username,
          referralCode: userData.referralCode
        }
        usageInfo.value = {
          freeUsageCount: userData.freeUsageCount,
          freeUsageLimit: userData.freeUsageLimit,
          paidUsageCount: userData.paidUsageCount || 0,
          totalPurchased: userData.totalPurchased || 0,
          canUse: true
        }
        setAuthHeader(userData.token)
        return { success: true, data: userData }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '登录失败'
      }
    }
  }

  // 退出登录
  const logout = () => {
    user.value = null
    token.value = null
    usageInfo.value = {
      freeUsageCount: 0,
      freeUsageLimit: 10,
      paidUsageCount: 0,
      totalPurchased: 0,
      canUse: false  // 未登录无法使用
    }
    setAuthHeader(null)
    // 不再创建访客会话
  }

  // 获取用户资料
  const getUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile')
      if (response.data.success) {
        const userData = response.data.data
        user.value = userData
        if (userData.type === 'user') {
          usageInfo.value = {
            freeUsageCount: userData.freeUsageCount,
            freeUsageLimit: userData.freeUsageLimit,
            paidUsageCount: userData.paidUsageCount,
            totalPurchased: userData.totalPurchased,
            canUse: true
          }
        } else {
          usageInfo.value = {
            freeUsageCount: userData.freeUsageCount,
            freeUsageLimit: userData.freeUsageLimit,
            paidUsageCount: 0,
            totalPurchased: 0,
            canUse: userData.freeUsageCount < userData.freeUsageLimit
          }
        }
        return userData
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 检查使用限制
  const checkUsageLimit = async () => {
    try {
      const response = await axios.get('/api/auth/usage-limit')
      if (response.data.success) {
        const data = response.data.data
        usageInfo.value = {
          ...usageInfo.value,
          ...data,
          canUse: data.canUse
        }
        return data
      }
    } catch (error) {
      console.error('检查使用限制失败:', error)
      return null
    }
  }

  // 验证推荐码
  const validateReferralCode = async (referralCode) => {
    try {
      const response = await axios.post('/api/auth/validate-referral', {
        referralCode
      })
      return response.data
    } catch (error) {
      console.error('验证推荐码失败:', error)
      return { success: false, error: '验证推荐码失败' }
    }
  }

  // 更新使用次数（在API调用后）
  const updateUsageCount = () => {
    if (user.value?.type === 'guest') {
      usageInfo.value.freeUsageCount += 1
      usageInfo.value.canUse = usageInfo.value.freeUsageCount < usageInfo.value.freeUsageLimit
    } else {
      if (usageInfo.value.freeUsageCount < usageInfo.value.freeUsageLimit) {
        usageInfo.value.freeUsageCount += 1
      } else if (usageInfo.value.paidUsageCount < usageInfo.value.totalPurchased) {
        usageInfo.value.paidUsageCount += 1
      }
    }
  }

  // 计算剩余使用次数 - 只适用于已登录用户
  const getRemainingUsage = computed(() => {
    if (!user.value || user.value.type !== 'user') {
      return 0  // 未登录用户无剩余次数
    }
    // 管理员账户有无限使用次数
    if (isAdmin.value) {
      return 999999
    }
    const freeRemaining = Math.max(0, usageInfo.value.freeUsageLimit - usageInfo.value.freeUsageCount)
    const paidRemaining = Math.max(0, usageInfo.value.totalPurchased - usageInfo.value.paidUsageCount)
    return freeRemaining + paidRemaining
  })

  // 支付和订阅相关方法
  const createOrder = async (orderData) => {
    try {
      const response = await axios.post('/api/payment/create-order', orderData)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '创建订单失败'
      }
    }
  }

  const confirmPayment = async (orderId) => {
    try {
      const response = await axios.post('/api/payment/confirm-payment', { orderId })

      // 支付成功后更新使用信息
      await getUserProfile()

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('确认支付失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '确认支付失败'
      }
    }
  }

  const createSubscription = async (subscriptionData) => {
    try {
      const response = await axios.post('/api/payment/create-subscription', subscriptionData)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('创建订阅失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '创建订阅失败'
      }
    }
  }

  const confirmSubscription = async (subscriptionId) => {
    try {
      const response = await axios.post('/api/payment/confirm-subscription', { subscriptionId })

      // 订阅成功后更新用户信息
      await getUserProfile()

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('确认订阅失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '确认订阅失败'
      }
    }
  }

  const getOrderHistory = async () => {
    try {
      const response = await axios.get('/api/payment/orders')
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('获取订单历史失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '获取订单历史失败'
      }
    }
  }

  const cancelSubscription = async () => {
    try {
      const response = await axios.post('/api/payment/cancel-subscription')

      // 取消订阅后更新用户信息
      await getUserProfile()

      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      console.error('取消订阅失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || '取消订阅失败'
      }
    }
  }


  return {
    // 状态
    user,
    token,
    isLoggedIn,
    isGuest,
    usageInfo,

    // 管理员状态
    isAdmin,

    // 计算属性
    getRemainingUsage,
    canUseFeatures,

    // 方法
    initAuth,
    register,
    login,
    logout,
    getUserProfile,
    checkUsageLimit,
    validateReferralCode,
    updateUsageCount,


    // 支付和订阅方法
    createOrder,
    confirmPayment,
    createSubscription,
    confirmSubscription,
    getOrderHistory,
    cancelSubscription
  }
})