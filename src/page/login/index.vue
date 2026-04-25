<template>
  <div class="login-page">
    <div class="login-header">
      <div class="login-logo">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20logo%20modern%20minimalist%20travel%20accommodation&image_size=square" alt="Hotel Logo" class="logo-image" />
      </div>
      <div class="login-title">欢迎回来</div>
      <div class="login-subtitle">登录您的账号，开始愉快的旅程</div>
    </div>

    <div class="login-form">
      <div class="form-group">
        <span class="form-icon">👤</span>
        <input 
          type="text" 
          v-model="loginForm.username" 
          class="form-input"
          placeholder="请输入账号"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="form-group">
        <span class="form-icon">🔒</span>
        <input 
          :type="showPassword ? 'text' : 'password'" 
          v-model="loginForm.password" 
          class="form-input"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
        <span class="password-toggle" @click="showPassword = !showPassword">
          {{ showPassword ? '🙈' : '👁️' }}
        </span>
      </div>

      <div class="form-tips">
        <span class="tips-text">💡 提示：任意账号密码均可登录测试</span>
      </div>

      <button class="login-btn" @click="handleLogin">
        登录
      </button>

      <div class="login-divider">
        <span class="divider-text">其他方式</span>
      </div>

      <div class="other-login">
        <div class="other-login-item" @click="handleWechatLogin">
          <span class="other-icon">💬</span>
          <span class="other-text">微信登录</span>
        </div>
        <div class="other-login-item" @click="handleQQLogin">
          <span class="other-icon">🐧</span>
          <span class="other-text">QQ登录</span>
        </div>
        <div class="other-login-item" @click="handleWeiboLogin">
          <span class="other-icon">📱</span>
          <span class="other-text">微博登录</span>
        </div>
      </div>
    </div>

    <div class="login-footer">
      <span class="footer-text" @click="goToRegister">还没有账号？立即注册</span>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      showPassword: false,
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅'
    }
  },
  methods: {
    handleLogin () {
      if (!this.loginForm.username.trim()) {
        this.showToast('❌', '请输入账号')
        return
      }
      if (!this.loginForm.password.trim()) {
        this.showToast('❌', '请输入密码')
        return
      }

      const userInfo = {
        id: Date.now().toString(),
        name: this.loginForm.username,
        username: this.loginForm.username,
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20professional%20headshot%20friendly&image_size=square',
        phone: '138****8000',
        gender: 'secret',
        birthday: '',
        email: '',
        city: '',
        bio: '这个人很懒，什么都没写...',
        password: this.loginForm.password
      }

      this.$store.commit('SET_CURRENT_USER', userInfo)

      const loggedAccounts = this.$store.state.loggedAccounts || []
      const existingIndex = loggedAccounts.findIndex(
        acc => acc.username === userInfo.username
      )

      if (existingIndex > -1) {
        loggedAccounts[existingIndex] = userInfo
      } else {
        loggedAccounts.push(userInfo)
      }

      this.$store.commit('SET_LOGGED_ACCOUNTS', loggedAccounts)

      this.showToast('✅', '登录成功')
      setTimeout(() => {
        this.$router.push('/profile')
      }, 1000)
    },
    handleWechatLogin () {
      this.showToast('💬', '微信登录功能开发中...')
    },
    handleQQLogin () {
      this.showToast('🐧', 'QQ登录功能开发中...')
    },
    handleWeiboLogin () {
      this.showToast('📱', '微博登录功能开发中...')
    },
    goToRegister () {
      this.showToast('📝', '注册功能开发中...')
    },
    showToast (icon, message) {
      this.toastIcon = icon
      this.toastMessage = message
      this.showToastVisible = true

      setTimeout(() => {
        this.showToastVisible = false
      }, 2000)
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.login-page
  min-height: 100vh
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  display: flex
  flex-direction: column
  padding: px2rem(80px) px2rem(40px)

.login-header
  text-align: center
  margin-bottom: px2rem(80px)

.login-logo
  margin-bottom: px2rem(40px)

.logo-image
  width: px2rem(160px)
  height: px2rem(160px)
  border-radius: 50%
  object-fit: cover
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2)

.login-title
  font-size: px2rem(56px)
  font-weight: bold
  color: #fff
  margin-bottom: px2rem(16px)

.login-subtitle
  font-size: px2rem(28px)
  color: rgba(255, 255, 255, 0.8)

.login-form
  background-color: #fff
  border-radius: px2rem(24px)
  padding: px2rem(50px)
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)
  flex: 1

.form-group
  position: relative
  margin-bottom: px2rem(40px)
  display: flex
  align-items: center
  border-bottom: px2rem(2px) solid #f0f0f0
  padding-bottom: px2rem(20px)

  &:focus-within
    border-bottom-color: #06c1ae

.form-icon
  font-size: px2rem(40px)
  margin-right: px2rem(20px)

.form-input
  flex: 1
  font-size: px2rem(32px)
  color: #333
  border: none
  outline: none
  background: transparent

  &::placeholder
    color: #999

.password-toggle
  font-size: px2rem(36px)
  cursor: pointer
  padding: px2rem(10px)

.form-tips
  margin-bottom: px2rem(40px)

.tips-text
  font-size: px2rem(24px)
  color: #999

.login-btn
  width: 100%
  padding: px2rem(36px)
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  color: #fff
  font-size: px2rem(36px)
  font-weight: bold
  border: none
  border-radius: px2rem(16px)
  cursor: pointer
  transition: all 0.3s
  box-shadow: 0 4px 16px rgba(6, 193, 174, 0.4)

  &:active
    transform: scale(0.98)

.login-divider
  display: flex
  align-items: center
  margin: px2rem(50px) 0

  &::before,
  &::after
    content: ''
    flex: 1
    height: px2rem(2px)
    background-color: #f0f0f0

.divider-text
  padding: 0 px2rem(30px)
  font-size: px2rem(26px)
  color: #999

.other-login
  display: flex
  justify-content: center
  gap: px2rem(60px)

.other-login-item
  display: flex
  flex-direction: column
  align-items: center
  cursor: pointer
  transition: transform 0.3s

  &:active
    transform: scale(0.95)

.other-icon
  font-size: px2rem(64px)
  margin-bottom: px2rem(12px)

.other-text
  font-size: px2rem(24px)
  color: #666

.login-footer
  text-align: center
  margin-top: px2rem(50px)
  padding: px2rem(20px)

.footer-text
  font-size: px2rem(28px)
  color: #fff
  cursor: pointer
  text-decoration: underline

.toast
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  background-color: rgba(0, 0, 0, 0.8)
  color: #fff
  padding: px2rem(24px) px2rem(40px)
  border-radius: px2rem(16px)
  display: flex
  align-items: center
  gap: px2rem(12px)
  z-index: 9999
  opacity: 0
  visibility: hidden
  transition: all 0.3s

  &.show
    opacity: 1
    visibility: visible

.toast-icon
  font-size: px2rem(36px)

.toast-text
  font-size: px2rem(28px)
</style>
