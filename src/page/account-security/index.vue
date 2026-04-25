<template>
  <div class="account-security-page">
    <div class="page-header">
      <span class="back-btn" @click="goBack">←</span>
      <span class="page-title">账号安全</span>
      <span class="placeholder"></span>
    </div>

    <div class="security-section">
      <div class="section-header">
        <span class="section-title">修改密码</span>
      </div>

      <div class="password-form">
        <div class="step-indicator">
          <div class="step-item" :class="{ active: step === 1, completed: step > 1 }">
            <span class="step-number">{{ step > 1 ? '✓' : '1' }}</span>
            <span class="step-text">验证原密码</span>
          </div>
          <div class="step-line" :class="{ active: step > 1 }"></div>
          <div class="step-item" :class="{ active: step === 2, completed: step > 2 }">
            <span class="step-number">{{ step > 2 ? '✓' : '2' }}</span>
            <span class="step-text">设置新密码</span>
          </div>
        </div>

        <div v-if="step === 1" class="step-content">
          <div class="step-desc">请先输入您的原密码进行身份验证</div>
          
          <div class="form-group">
            <span class="form-label">原密码</span>
            <div class="input-wrapper">
              <input 
                :type="showOldPassword ? 'text' : 'password'" 
                v-model="passwordForm.oldPassword" 
                class="form-input"
                placeholder="请输入原密码"
                @keyup.enter="verifyOldPassword"
              />
              <span class="password-toggle" @click="showOldPassword = !showOldPassword">
                {{ showOldPassword ? '🙈' : '👁️' }}
              </span>
            </div>
          </div>

          <button class="submit-btn" @click="verifyOldPassword">
            下一步
          </button>
        </div>

        <div v-if="step === 2" class="step-content">
          <div class="step-desc">请设置您的新密码</div>
          
          <div class="form-group">
            <span class="form-label">新密码</span>
            <div class="input-wrapper">
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                v-model="passwordForm.newPassword" 
                class="form-input"
                placeholder="请输入新密码"
                @keyup.enter="handleChangePassword"
              />
              <span class="password-toggle" @click="showNewPassword = !showNewPassword">
                {{ showNewPassword ? '🙈' : '👁️' }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <span class="form-label">确认新密码</span>
            <div class="input-wrapper">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="passwordForm.confirmPassword" 
                class="form-input"
                placeholder="请再次输入新密码"
                @keyup.enter="handleChangePassword"
              />
              <span class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </span>
            </div>
          </div>

          <div class="password-tips">
            <span class="tips-icon">💡</span>
            <span class="tips-text">密码长度至少6位，建议包含字母、数字和特殊字符</span>
          </div>

          <div class="button-group">
            <button class="back-btn" @click="goBackStep">
              上一步
            </button>
            <button class="submit-btn" @click="handleChangePassword">
              确认修改
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="security-section">
      <div class="section-header">
        <span class="section-title">其他安全设置</span>
      </div>

      <div class="settings-list">
        <div class="settings-item" @click="showToast('📱', '绑定手机号功能开发中...')">
          <span class="settings-icon">📱</span>
          <span class="settings-label">绑定手机号</span>
          <span class="settings-value">已绑定</span>
          <span class="settings-arrow">›</span>
        </div>

        <div class="settings-item" @click="showToast('📧', '绑定邮箱功能开发中...')">
          <span class="settings-icon">📧</span>
          <span class="settings-label">绑定邮箱</span>
          <span class="settings-value">未绑定</span>
          <span class="settings-arrow">›</span>
        </div>

        <div class="settings-item" @click="showToast('🔑', '实名认证功能开发中...')">
          <span class="settings-icon">🔑</span>
          <span class="settings-label">实名认证</span>
          <span class="settings-value">未认证</span>
          <span class="settings-arrow">›</span>
        </div>

        <div class="settings-item last-item" @click="showToast('🔒', '登录保护功能开发中...')">
          <span class="settings-icon">🔒</span>
          <span class="settings-label">登录保护</span>
          <span class="settings-value">已开启</span>
          <span class="settings-arrow">›</span>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'AccountSecurityPage',
  data () {
    return {
      step: 1,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅'
    }
  },
  computed: {
    ...mapState({
      currentUser: 'currentUser',
      loggedAccounts: 'loggedAccounts'
    })
  },
  methods: {
    goBack () {
      this.$router.back()
    },
    verifyOldPassword () {
      if (!this.passwordForm.oldPassword.trim()) {
        this.showToast('❌', '请输入原密码')
        return
      }

      if (this.currentUser) {
        if (this.passwordForm.oldPassword !== this.currentUser.password) {
          this.showToast('❌', '原密码错误')
          return
        }

        this.step = 2
        this.showToast('✅', '验证成功，请设置新密码')
      } else {
        this.showToast('❌', '请先登录')
      }
    },
    goBackStep () {
      this.step = 1
      this.passwordForm.newPassword = ''
      this.passwordForm.confirmPassword = ''
    },
    handleChangePassword () {
      if (!this.passwordForm.newPassword.trim()) {
        this.showToast('❌', '请输入新密码')
        return
      }
      if (this.passwordForm.newPassword.length < 6) {
        this.showToast('❌', '新密码长度至少6位')
        return
      }
      if (!this.passwordForm.confirmPassword.trim()) {
        this.showToast('❌', '请确认新密码')
        return
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.showToast('❌', '两次输入的新密码不一致')
        return
      }

      if (this.currentUser) {
        const updatedUser = {
          ...this.currentUser,
          password: this.passwordForm.newPassword
        }

        this.$store.commit('SET_CURRENT_USER', updatedUser)

        const loggedAccounts = [...this.loggedAccounts]
        const userIndex = loggedAccounts.findIndex(
          acc => acc.id === this.currentUser.id
        )
        if (userIndex > -1) {
          loggedAccounts[userIndex] = updatedUser
          this.$store.commit('SET_LOGGED_ACCOUNTS', loggedAccounts)
        }

        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        this.step = 1

        this.showToast('✅', '密码修改成功')
      } else {
        this.showToast('❌', '请先登录')
      }
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

.account-security-page
  min-height: 100vh
  background-color: #f5f5f5

.page-header
  display: flex
  align-items: center
  justify-content: space-between
  padding: px2rem(30px)
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  position: sticky
  top: 0
  z-index: 100

.back-btn
  font-size: px2rem(48px)
  color: #fff
  cursor: pointer
  padding: px2rem(10px)

.page-title
  font-size: px2rem(36px)
  font-weight: bold
  color: #fff

.placeholder
  width: px2rem(68px)

.security-section
  background-color: #fff
  margin-top: px2rem(20px)
  padding: px2rem(30px)

.section-header
  margin-bottom: px2rem(30px)

.section-title
  font-size: px2rem(36px)
  font-weight: bold
  color: #333
  position: relative
  padding-left: px2rem(16px)

  &::before
    content: ''
    position: absolute
    left: 0
    top: 50%
    transform: translateY(-50%)
    width: px2rem(8px)
    height: px2rem(32px)
    background-color: #06c1ae
    border-radius: px2rem(4px)

.password-form
  border: px2rem(1px) solid #f0f0f0
  border-radius: px2rem(12px)
  padding: px2rem(30px)

.step-indicator
  display: flex
  align-items: center
  justify-content: center
  margin-bottom: px2rem(40px)
  padding: px2rem(20px)

.step-item
  display: flex
  flex-direction: column
  align-items: center
  position: relative

  &.active
    .step-number
      background: linear-gradient(135deg, #06c1ae, #0a9d8c)
      color: #fff
      box-shadow: 0 4px 12px rgba(6, 193, 174, 0.4)

    .step-text
      color: #06c1ae
      font-weight: bold

  &.completed
    .step-number
      background: linear-gradient(135deg, #4caf50, #388e3c)
      color: #fff

    .step-text
      color: #4caf50

.step-number
  width: px2rem(80px)
  height: px2rem(80px)
  border-radius: 50%
  background-color: #f0f0f0
  color: #999
  font-size: px2rem(36px)
  font-weight: bold
  display: flex
  align-items: center
  justify-content: center
  margin-bottom: px2rem(12px)
  transition: all 0.3s

.step-text
  font-size: px2rem(24px)
  color: #999
  transition: color 0.3s

.step-line
  width: px2rem(120px)
  height: px2rem(4px)
  background-color: #f0f0f0
  margin: 0 px2rem(20px)
  margin-bottom: px2rem(40px)
  transition: background-color 0.3s

  &.active
    background: linear-gradient(90deg, #4caf50, #06c1ae)

.step-content
  animation: fadeIn 0.3s ease-in-out

.step-desc
  text-align: center
  font-size: px2rem(28px)
  color: #666
  margin-bottom: px2rem(40px)
  padding: px2rem(20px)
  background-color: #f8f9fa
  border-radius: px2rem(12px)

.button-group
  display: flex
  gap: px2rem(30px)

  .back-btn
    flex: 1
    padding: px2rem(36px)
    background-color: #f5f5f5
    color: #666
    font-size: px2rem(32px)
    font-weight: bold
    border: none
    border-radius: px2rem(16px)
    cursor: pointer
    transition: all 0.3s

    &:active
      transform: scale(0.98)
      background-color: #e0e0e0

  .submit-btn
    flex: 2

@keyframes fadeIn
  from
    opacity: 0
    transform: translateY(10px)
  to
    opacity: 1
    transform: translateY(0)

.form-group
  margin-bottom: px2rem(40px)

.form-label
  display: block
  font-size: px2rem(28px)
  color: #666
  margin-bottom: px2rem(16px)

.input-wrapper
  position: relative
  display: flex
  align-items: center
  border: px2rem(2px) solid #f0f0f0
  border-radius: px2rem(12px)
  padding: 0 px2rem(20px)
  transition: border-color 0.3s

  &:focus-within
    border-color: #06c1ae

.form-input
  flex: 1
  font-size: px2rem(32px)
  color: #333
  border: none
  outline: none
  background: transparent
  padding: px2rem(24px) 0

  &::placeholder
    color: #999

.password-toggle
  font-size: px2rem(36px)
  cursor: pointer
  padding: px2rem(10px)

.password-tips
  display: flex
  align-items: flex-start
  margin-bottom: px2rem(40px)
  padding: px2rem(20px)
  background-color: #f8f9fa
  border-radius: px2rem(8px)

.tips-icon
  font-size: px2rem(32px)
  margin-right: px2rem(12px)
  margin-top: px2rem(4px)

.tips-text
  font-size: px2rem(24px)
  color: #666
  line-height: 1.5

.submit-btn
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

.settings-list
  border: px2rem(1px) solid #f0f0f0
  border-radius: px2rem(12px)
  overflow: hidden

.settings-item
  display: flex
  align-items: center
  padding: px2rem(30px)
  border-bottom: px2rem(1px) solid #f0f0f0
  cursor: pointer
  transition: background-color 0.2s

  &:active
    background-color: #f8f8f8

  &.last-item
    border-bottom: none

.settings-icon
  font-size: px2rem(40px)
  margin-right: px2rem(20px)
  width: px2rem(60px)
  text-align: center

.settings-label
  flex: 1
  font-size: px2rem(28px)
  color: #333

.settings-value
  font-size: px2rem(26px)
  color: #999
  margin-right: px2rem(16px)

.settings-arrow
  font-size: px2rem(32px)
  color: #ccc

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
