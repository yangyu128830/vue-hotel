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
        <div class="form-group">
          <span class="form-label">原密码</span>
          <div class="input-wrapper">
            <input 
              :type="showOldPassword ? 'text' : 'password'" 
              v-model="passwordForm.oldPassword" 
              class="form-input"
              placeholder="请输入原密码"
            />
            <span class="password-toggle" @click="showOldPassword = !showOldPassword">
              {{ showOldPassword ? '🙈' : '👁️' }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <span class="form-label">新密码</span>
          <div class="input-wrapper">
            <input 
              :type="showNewPassword ? 'text' : 'password'" 
              v-model="passwordForm.newPassword" 
              class="form-input"
              placeholder="请输入新密码"
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

        <button class="submit-btn" @click="handleChangePassword">
          确认修改
        </button>
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
    handleChangePassword () {
      if (!this.passwordForm.oldPassword.trim()) {
        this.showToast('❌', '请输入原密码')
        return
      }
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
        if (this.passwordForm.oldPassword !== this.currentUser.password) {
          this.showToast('❌', '原密码错误')
          return
        }

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
