<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar-container">
          <img :src="userInfo.avatar" :alt="userInfo.name" class="avatar" />
          <div class="avatar-edit" @click="showAvatarEdit = true">
            <span>📷</span>
          </div>
        </div>
        <div class="user-basic-info">
          <div class="user-name">{{ userInfo.name }}</div>
          <div class="user-id">ID: {{ userInfo.id }}</div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="section-header">
        <span class="section-title">基本信息</span>
        <span class="edit-btn" @click="toggleEditMode">
          {{ isEditMode ? '取消' : '编辑' }}
        </span>
      </div>
      
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">昵称</span>
          <div class="info-value" v-if="!isEditMode">{{ userInfo.name }}</div>
          <input 
            v-else 
            type="text" 
            v-model="editForm.name" 
            class="info-input"
          />
        </div>
        
        <div class="info-item">
          <span class="info-label">手机号</span>
          <div class="info-value" v-if="!isEditMode">{{ maskPhone(userInfo.phone) }}</div>
          <input 
            v-else 
            type="tel" 
            v-model="editForm.phone" 
            class="info-input"
          />
        </div>
        
        <div class="info-item">
          <span class="info-label">性别</span>
          <div class="info-value" v-if="!isEditMode">{{ getGenderLabel(userInfo.gender) }}</div>
          <div v-else class="gender-select">
            <span 
              v-for="g in genderOptions" 
              :key="g.value"
              class="gender-option"
              :class="{ active: editForm.gender === g.value }"
              @click="editForm.gender = g.value"
            >
              {{ g.label }}
            </span>
          </div>
        </div>
        
        <div class="info-item">
          <span class="info-label">生日</span>
          <div class="info-value" v-if="!isEditMode">{{ userInfo.birthday || '未设置' }}</div>
          <input 
            v-else 
            type="date" 
            v-model="editForm.birthday" 
            class="info-input date-input"
          />
        </div>
        
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <div class="info-value" v-if="!isEditMode">{{ userInfo.email || '未设置' }}</div>
          <input 
            v-else 
            type="email" 
            v-model="editForm.email" 
            class="info-input"
            placeholder="请输入邮箱"
          />
        </div>
        
        <div class="info-item">
          <span class="info-label">所在城市</span>
          <div class="info-value" v-if="!isEditMode">{{ userInfo.city || '未设置' }}</div>
          <input 
            v-else 
            type="text" 
            v-model="editForm.city" 
            class="info-input"
            placeholder="请输入城市"
          />
        </div>
        
        <div class="info-item last-item">
          <span class="info-label">个人简介</span>
          <div class="info-value" v-if="!isEditMode">{{ userInfo.bio || '这个人很懒，什么都没写...' }}</div>
          <textarea 
            v-else 
            v-model="editForm.bio" 
            class="info-textarea"
            placeholder="介绍一下自己吧..."
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="save-section" v-show="isEditMode">
        <button class="save-btn" @click="saveProfile">保存修改</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="section-header">
        <span class="section-title">设置</span>
      </div>
      
      <div class="settings-list">
        <div class="settings-item" @click="goToNotifications">
          <span class="settings-icon">🔔</span>
          <span class="settings-label">消息通知</span>
          <span class="settings-badge" v-show="unreadCount > 0">{{ unreadCount }}</span>
          <span class="settings-arrow">›</span>
        </div>
        
        <div class="settings-item" @click="showToast('🔒', '隐私设置功能开发中...')">
          <span class="settings-icon">🔒</span>
          <span class="settings-label">隐私设置</span>
          <span class="settings-arrow">›</span>
        </div>
        
        <div class="settings-item" @click="goToAccountSecurity">
          <span class="settings-icon">🔐</span>
          <span class="settings-label">账号安全</span>
          <span class="settings-arrow">›</span>
        </div>
        
        <div class="settings-item" @click="goToCustomerService">
          <span class="settings-icon">📞</span>
          <span class="settings-label">联系客服</span>
          <span class="settings-arrow">›</span>
        </div>
        
        <div class="settings-item last-item" @click="showToast('❓', '帮助中心功能开发中...')">
          <span class="settings-icon">❓</span>
          <span class="settings-label">帮助中心</span>
          <span class="settings-arrow">›</span>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>

    <div class="action-buttons">
      <button class="switch-account-btn" @click="showSwitchAccountModal">
        切换账号
      </button>
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </div>

    <div class="avatar-modal-overlay" v-show="showAvatarEdit" @click="hideAvatarModal">
      <div class="avatar-modal" @click.stop>
        <div class="modal-title">更换头像</div>
        <div class="avatar-options">
          <div class="avatar-option" @click="selectAvatar('camera')">
            <span class="option-icon">📷</span>
            <span class="option-text">拍照</span>
          </div>
          <div class="avatar-option" @click="selectAvatar('album')">
            <span class="option-icon">🖼️</span>
            <span class="option-text">相册选择</span>
          </div>
        </div>
        <div class="cancel-btn" @click="hideAvatarModal">取消</div>
      </div>
    </div>

    <div class="switch-account-overlay" v-show="showSwitchAccount" @click="hideSwitchAccountModal">
      <div class="switch-account-modal" @click.stop>
        <div class="modal-title">切换账号</div>
        <div class="account-list">
          <div 
            v-for="account in loggedAccounts" 
            :key="account.id"
            class="account-item"
            :class="{ active: currentUser && currentUser.id === account.id }"
            @click="switchToAccount(account)"
          >
            <img :src="account.avatar" :alt="account.name" class="account-avatar" />
            <div class="account-info">
              <div class="account-name">{{ account.name }}</div>
              <div class="account-username">账号：{{ account.username }}</div>
            </div>
            <span v-if="currentUser && currentUser.id === account.id" class="current-tag">当前</span>
          </div>
        </div>
        <div class="add-account-btn" @click="goToLogin">
          <span class="add-icon">➕</span>
          <span class="add-text">添加新账号</span>
        </div>
        <div class="cancel-btn" @click="hideSwitchAccountModal">取消</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ProfilePage',
  data () {
    return {
      isEditMode: false,
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅',
      showAvatarEdit: false,
      showSwitchAccount: false,
      userInfo: {
        id: '10086',
        name: '张三',
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20professional%20headshot%20friendly&image_size=square',
        phone: '13800138000',
        gender: 'male',
        birthday: '1990-05-15',
        email: 'zhangsan@example.com',
        city: '北京',
        bio: '热爱旅行，喜欢美食，探索美好生活的每一天。'
      },
      editForm: {
        name: '',
        phone: '',
        gender: '',
        birthday: '',
        email: '',
        city: '',
        bio: ''
      },
      genderOptions: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'secret', label: '保密' }
      ]
    }
  },
  computed: {
    ...mapState({
      currentUser: 'currentUser',
      loggedAccounts: 'loggedAccounts'
    }),
    unreadCount () {
      return 5
    }
  },
  methods: {
    toggleEditMode () {
      if (this.isEditMode) {
        this.isEditMode = false
        this.resetEditForm()
      } else {
        this.isEditMode = true
        this.initEditForm()
      }
    },
    initEditForm () {
      this.editForm = {
        name: this.userInfo.name,
        phone: this.userInfo.phone,
        gender: this.userInfo.gender,
        birthday: this.userInfo.birthday || '',
        email: this.userInfo.email || '',
        city: this.userInfo.city || '',
        bio: this.userInfo.bio || ''
      }
    },
    resetEditForm () {
      this.editForm = {
        name: '',
        phone: '',
        gender: '',
        birthday: '',
        email: '',
        city: '',
        bio: ''
      }
    },
    saveProfile () {
      if (!this.editForm.name.trim()) {
        this.showToast('❌', '昵称不能为空')
        return
      }
      if (this.editForm.phone && !this.isValidPhone(this.editForm.phone)) {
        this.showToast('❌', '请输入正确的手机号')
        return
      }
      if (this.editForm.email && !this.isValidEmail(this.editForm.email)) {
        this.showToast('❌', '请输入正确的邮箱格式')
        return
      }

      this.userInfo = {
        ...this.userInfo,
        ...this.editForm
      }
      this.isEditMode = false
      this.showToast('✅', '修改成功')
    },
    isValidPhone (phone) {
      return /^1[3-9]\d{9}$/.test(phone)
    },
    isValidEmail (email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },
    maskPhone (phone) {
      if (!phone) return ''
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    getGenderLabel (gender) {
      const option = this.genderOptions.find(o => o.value === gender)
      return option ? option.label : '未设置'
    },
    hideAvatarModal () {
      this.showAvatarEdit = false
    },
    selectAvatar (type) {
      this.showToast('📷', type === 'camera' ? '拍照功能开发中...' : '相册选择功能开发中...')
      this.hideAvatarModal()
    },
    showToast (icon, message) {
      this.toastIcon = icon
      this.toastMessage = message
      this.showToastVisible = true

      setTimeout(() => {
        this.showToastVisible = false
      }, 2000)
    },
    goToNotifications () {
      this.$router.push('/notifications')
    },
    goToCustomerService () {
      this.$router.push('/customer-service')
    },
    goToAccountSecurity () {
      this.$router.push('/account-security')
    },
    showSwitchAccountModal () {
      this.showSwitchAccount = true
    },
    hideSwitchAccountModal () {
      this.showSwitchAccount = false
    },
    handleLogout () {
      this.$store.commit('LOGOUT')
      this.showToast('👋', '已退出登录')
      setTimeout(() => {
        this.$router.push('/login')
      }, 1000)
    },
    switchToAccount (account) {
      if (this.currentUser && this.currentUser.id === account.id) {
        this.showToast('ℹ️', '当前已是该账号')
        return
      }

      this.$store.commit('SET_CURRENT_USER', account)
      this.hideSwitchAccountModal()
      this.showToast('✅', '切换成功')
    },
    goToLogin () {
      this.hideSwitchAccountModal()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.profile-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(40px)

.profile-header
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  padding: px2rem(50px) px2rem(30px)
  position: relative
  overflow: hidden

  &::before
    content: ''
    position: absolute
    top: -50%
    right: -20%
    width: 100%
    height: 200%
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)
    border-radius: 50%

.avatar-section
  display: flex
  align-items: center
  position: relative
  z-index: 1

.avatar-container
  position: relative
  margin-right: px2rem(30px)

.avatar
  width: px2rem(160px)
  height: px2rem(160px)
  border-radius: 50%
  object-fit: cover
  border: px2rem(6px) solid rgba(255, 255, 255, 0.3)

.avatar-edit
  position: absolute
  bottom: px2rem(5px)
  right: px2rem(5px)
  width: px2rem(50px)
  height: px2rem(50px)
  background-color: rgba(0, 0, 0, 0.6)
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  border: px2rem(3px) solid #fff

  span
    font-size: px2rem(24px)

.user-basic-info
  flex: 1

.user-name
  font-size: px2rem(44px)
  font-weight: bold
  color: #fff
  margin-bottom: px2rem(10px)

.user-id
  font-size: px2rem(24px)
  color: rgba(255, 255, 255, 0.8)

.info-section,
.settings-section
  background-color: #fff
  margin-top: px2rem(20px)
  padding: px2rem(30px)

.section-header
  display: flex
  justify-content: space-between
  align-items: center
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

.edit-btn
  font-size: px2rem(28px)
  color: #06c1ae
  cursor: pointer
  padding: px2rem(10px) px2rem(20px)

.info-list
  border: px2rem(1px) solid #f0f0f0
  border-radius: px2rem(12px)
  overflow: hidden

.info-item
  display: flex
  align-items: center
  padding: px2rem(30px)
  border-bottom: px2rem(1px) solid #f0f0f0

  &.last-item
    border-bottom: none
    align-items: flex-start

    .info-value
      padding-top: px2rem(8px)

.info-label
  width: px2rem(160px)
  font-size: px2rem(28px)
  color: #666
  flex-shrink: 0

.info-value
  flex: 1
  font-size: px2rem(28px)
  color: #333
  text-align: right

.info-input,
.date-input
  flex: 1
  font-size: px2rem(28px)
  color: #333
  border: px2rem(1px) solid #e0e0e0
  border-radius: px2rem(8px)
  padding: px2rem(16px) px2rem(20px)
  text-align: right
  outline: none

  &:focus
    border-color: #06c1ae

.info-textarea
  flex: 1
  font-size: px2rem(28px)
  color: #333
  border: px2rem(1px) solid #e0e0e0
  border-radius: px2rem(8px)
  padding: px2rem(16px) px2rem(20px)
  outline: none
  resize: none
  text-align: left

  &:focus
    border-color: #06c1ae

.gender-select
  display: flex
  gap: px2rem(20px)
  justify-content: flex-end
  flex: 1

.gender-option
  padding: px2rem(12px) px2rem(36px)
  border: px2rem(1px) solid #e0e0e0
  border-radius: px2rem(30px)
  font-size: px2rem(26px)
  color: #666
  cursor: pointer
  transition: all 0.3s

  &.active
    background-color: #06c1ae
    border-color: #06c1ae
    color: #fff

.save-section
  margin-top: px2rem(40px)

.save-btn
  width: 100%
  padding: px2rem(30px)
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  color: #fff
  font-size: px2rem(32px)
  font-weight: bold
  border: none
  border-radius: px2rem(12px)
  cursor: pointer
  transition: all 0.3s

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

.settings-badge
  min-width: px2rem(40px)
  height: px2rem(40px)
  background-color: #ff6b6b
  color: #fff
  font-size: px2rem(22px)
  font-weight: bold
  border-radius: px2rem(20px)
  display: flex
  align-items: center
  justify-content: center
  padding: 0 px2rem(12px)
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

.avatar-modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 1000
  display: flex
  align-items: flex-end

.avatar-modal
  width: 100%
  background-color: #fff
  border-top-left-radius: px2rem(24px)
  border-top-right-radius: px2rem(24px)
  padding: px2rem(40px)

.modal-title
  font-size: px2rem(32px)
  font-weight: bold
  color: #333
  text-align: center
  margin-bottom: px2rem(40px)

.avatar-options
  display: flex
  gap: px2rem(30px)
  margin-bottom: px2rem(30px)

.avatar-option
  flex: 1
  display: flex
  flex-direction: column
  align-items: center
  padding: px2rem(40px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  cursor: pointer
  transition: all 0.2s

  &:active
    background-color: #f0f9f8

.option-icon
  font-size: px2rem(64px)
  margin-bottom: px2rem(16px)

.option-text
  font-size: px2rem(26px)
  color: #333

.cancel-btn
  text-align: center
  padding: px2rem(30px)
  font-size: px2rem(30px)
  color: #666
  background-color: #f5f5f5
  border-radius: px2rem(12px)
  cursor: pointer

.action-buttons
  display: flex
  gap: px2rem(30px)
  padding: px2rem(40px) px2rem(30px)
  margin-top: px2rem(20px)

.switch-account-btn
  flex: 1
  padding: px2rem(30px)
  background: linear-gradient(135deg, #2196f3, #1976d2)
  color: #fff
  font-size: px2rem(32px)
  font-weight: bold
  border: none
  border-radius: px2rem(12px)
  cursor: pointer
  transition: all 0.3s
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4)

  &:active
    transform: scale(0.98)

.logout-btn
  flex: 1
  padding: px2rem(30px)
  background: linear-gradient(135deg, #f44336, #d32f2f)
  color: #fff
  font-size: px2rem(32px)
  font-weight: bold
  border: none
  border-radius: px2rem(12px)
  cursor: pointer
  transition: all 0.3s
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.4)

  &:active
    transform: scale(0.98)

.switch-account-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 1000
  display: flex
  align-items: flex-end

.switch-account-modal
  width: 100%
  background-color: #fff
  border-top-left-radius: px2rem(24px)
  border-top-right-radius: px2rem(24px)
  padding: px2rem(40px)
  max-height: 80vh
  overflow-y: auto

.account-list
  margin-bottom: px2rem(30px)

.account-item
  display: flex
  align-items: center
  padding: px2rem(30px)
  margin-bottom: px2rem(20px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  cursor: pointer
  transition: all 0.2s

  &:active
    background-color: #f0f9f8

  &.active
    background-color: rgba(6, 193, 174, 0.1)
    border: px2rem(2px) solid #06c1ae

.account-avatar
  width: px2rem(100px)
  height: px2rem(100px)
  border-radius: 50%
  object-fit: cover
  margin-right: px2rem(30px)

.account-info
  flex: 1

.account-name
  font-size: px2rem(32px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(8px)

.account-username
  font-size: px2rem(24px)
  color: #999

.current-tag
  padding: px2rem(8px) px2rem(20px)
  background-color: #06c1ae
  color: #fff
  font-size: px2rem(24px)
  border-radius: px2rem(20px)

.add-account-btn
  display: flex
  align-items: center
  justify-content: center
  padding: px2rem(30px)
  margin-bottom: px2rem(30px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  cursor: pointer
  transition: all 0.2s

  &:active
    background-color: #f0f9f8

.add-icon
  font-size: px2rem(40px)
  margin-right: px2rem(16px)

.add-text
  font-size: px2rem(30px)
  color: #06c1ae
  font-weight: bold
</style>
