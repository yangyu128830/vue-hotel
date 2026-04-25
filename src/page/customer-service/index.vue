<template>
  <div class="customer-service-page">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <span class="back-icon">‹</span>
      </div>
      <div class="header-title">在线客服</div>
      <div class="header-right" @click="showHistoryRecords">
        <span class="history-text">历史记录</span>
      </div>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div class="chat-messages" ref="chatMessages">
        <div
          v-for="(message, index) in currentMessages"
          :key="message.id"
          class="message-item"
          :class="{
            'user-message': message.sender === 'user',
            'service-message': message.sender === 'service',
            'recalled-message': message.isRecalled
          }"
        >
          <div v-if="message.sender === 'service'" class="message-avatar">
            <img :src="serviceAvatar" alt="客服头像" class="avatar-img" />
          </div>

          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="message-sender">{{ message.sender === 'user' ? '我' : '客服小助手' }}</span>
              <span class="message-time">{{ formatTime(message.time) }}</span>
            </div>

            <div class="message-content" @contextmenu.prevent="showMessageMenu(message, $event)" @click="handleMessageClick(message)">
              <div v-if="message.isRecalled" class="recalled-text">
                {{ message.sender === 'user' ? '你' : '客服' }}撤回了一条消息
              </div>
              <div v-else-if="message.type === 'text'" class="message-text">
                {{ message.content }}
              </div>
              <div v-else-if="message.type === 'image'" class="message-image">
                <img :src="message.content" alt="图片消息" class="chat-image" @click="previewImage(message.content)" />
              </div>
            </div>

            <div v-if="message.sender === 'user' && !message.isRecalled" class="message-actions">
              <span class="action-btn" @click.stop="recallMessage(message)" :class="{ disabled: !canRecall(message) }">
                撤回
              </span>
            </div>
          </div>

          <div v-if="message.sender === 'user'" class="message-avatar">
            <img :src="userAvatar" alt="用户头像" class="avatar-img" />
          </div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-actions">
        <span class="action-icon" @click="toggleEmojiPicker">😊</span>
        <span class="action-icon" @click="selectImage">🖼️</span>
      </div>

      <div class="input-box">
        <textarea
          v-model="inputMessage"
          placeholder="请输入消息..."
          class="message-input"
          @keyup.enter="sendMessage"
          ref="messageInput"
        ></textarea>
      </div>

      <div class="send-btn" @click="sendMessage" :class="{ disabled: !inputMessage.trim() }">
        发送
      </div>
    </div>

    <input
      type="file"
      ref="imageInput"
      accept="image/*"
      style="display: none;"
      @change="handleImageSelect"
    />

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>

    <div class="history-modal-overlay" v-show="showHistory" @click="hideHistory">
      <div class="history-modal" @click.stop>
        <div class="history-header">
          <span class="history-title">历史对话记录</span>
          <span class="close-btn" @click="hideHistory">✕</span>
        </div>

        <div class="history-list">
          <div
            v-for="session in historySessions"
            :key="session.id"
            class="history-session"
            @click="viewHistorySession(session)"
          >
            <div class="session-info">
              <div class="session-title">{{ session.title }}</div>
              <div class="session-preview">{{ session.preview }}</div>
            </div>
            <div class="session-meta">
              <div class="session-date">{{ formatDate(session.date) }}</div>
              <div class="session-count">{{ session.messageCount }}条消息</div>
            </div>
          </div>
        </div>

        <div class="empty-history" v-if="historySessions.length === 0">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无历史对话记录</div>
        </div>
      </div>
    </div>

    <div class="image-preview-overlay" v-show="showImagePreview" @click="hideImagePreview">
      <div class="image-preview-container">
        <img :src="previewImageUrl" alt="图片预览" class="preview-image" />
        <span class="close-preview" @click="hideImagePreview">✕</span>
      </div>
    </div>

    <div class="message-menu-overlay" v-show="showMenu" @click="hideMessageMenu">
      <div class="message-menu" :style="menuStyle">
        <div class="menu-item" @click="recallMessage(currentMenuMessage)" :class="{ disabled: !canRecall(currentMenuMessage) }">
          撤回消息
        </div>
        <div class="menu-item" @click="copyMessage">
          复制消息
        </div>
        <div class="menu-item delete" @click="deleteMessage">
          删除消息
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerServicePage',
  data () {
    return {
      inputMessage: '',
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅',
      showHistory: false,
      showImagePreview: false,
      previewImageUrl: '',
      showMenu: false,
      currentMenuMessage: null,
      menuStyle: { top: '0px', left: '0px' },
      userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20professional%20headshot%20friendly&image_size=square',
      serviceAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=customer%20service%20avatar%20friendly%20assistant%20icon&image_size=square',
      currentMessages: [
        {
          id: 1,
          sender: 'service',
          type: 'text',
          content: '您好，欢迎使用在线客服！我是客服小助手，有什么可以帮助您的吗？',
          time: new Date(Date.now() - 3600000),
          isRecalled: false
        },
        {
          id: 2,
          sender: 'user',
          type: 'text',
          content: '你好，我想咨询一下酒店预订的问题。',
          time: new Date(Date.now() - 3500000),
          isRecalled: false
        },
        {
          id: 3,
          sender: 'service',
          type: 'text',
          content: '好的，请您详细描述一下您遇到的问题，我会尽力为您解答。',
          time: new Date(Date.now() - 3400000),
          isRecalled: false
        },
        {
          id: 4,
          sender: 'user',
          type: 'image',
          content: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20luxury%20modern%20design&image_size=square',
          time: new Date(Date.now() - 3300000),
          isRecalled: false
        },
        {
          id: 5,
          sender: 'service',
          type: 'text',
          content: '收到您的图片了，请问这是您预订的酒店房间吗？有什么问题呢？',
          time: new Date(Date.now() - 3200000),
          isRecalled: false
        }
      ],
      historySessions: [
        {
          id: 'session_001',
          title: '酒店预订问题咨询',
          preview: '您好，我想咨询一下酒店预订的退款政策...',
          date: new Date(Date.now() - 86400000 * 2),
          messageCount: 15
        },
        {
          id: 'session_002',
          title: '会员权益咨询',
          preview: '请问黄金会员有哪些专属权益呢？',
          date: new Date(Date.now() - 86400000 * 5),
          messageCount: 8
        },
        {
          id: 'session_003',
          title: '订单问题反馈',
          preview: '我的订单显示已支付，但状态还是待支付...',
          date: new Date(Date.now() - 86400000 * 10),
          messageCount: 22
        }
      ],
      nextMessageId: 6
    }
  },
  computed: {

  },
  mounted () {
    this.scrollToBottom()
  },
  methods: {
    goBack () {
      this.$router.back()
    },
    showHistoryRecords () {
      this.showHistory = true
    },
    hideHistory () {
      this.showHistory = false
    },
    viewHistorySession (session) {
      this.showToast('📋', `正在加载"${session.title}"的历史记录...`)
      this.hideHistory()
    },
    sendMessage () {
      if (!this.inputMessage.trim()) {
        return
      }

      const message = {
        id: this.nextMessageId++,
        sender: 'user',
        type: 'text',
        content: this.inputMessage.trim(),
        time: new Date(),
        isRecalled: false
      }

      this.currentMessages.push(message)
      this.inputMessage = ''
      this.scrollToBottom()

      setTimeout(() => {
        this.sendServiceReply(message.content)
      }, 1000)
    },
    sendServiceReply (userMessage) {
      const replies = [
        '感谢您的咨询，我正在为您查询相关信息，请稍候...',
        '好的，我理解您的问题。让我为您详细解答一下。',
        '收到您的消息了，请问还有其他需要帮助的吗？',
        '非常感谢您的反馈，我们会尽快处理您的问题。',
        '这是一个很好的问题，让我为您详细说明一下。'
      ]

      const randomReply = replies[Math.floor(Math.random() * replies.length)]

      const reply = {
        id: this.nextMessageId++,
        sender: 'service',
        type: 'text',
        content: randomReply,
        time: new Date(),
        isRecalled: false
      }

      this.currentMessages.push(reply)
      this.scrollToBottom()
    },
    selectImage () {
      this.$refs.imageInput.click()
    },
    handleImageSelect (event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        this.showToast('⚠️', '请选择图片文件')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result

        const message = {
          id: this.nextMessageId++,
          sender: 'user',
          type: 'image',
          content: imageUrl,
          time: new Date(),
          isRecalled: false
        }

        this.currentMessages.push(message)
        this.scrollToBottom()

        setTimeout(() => {
          this.sendServiceReply('图片')
        }, 1000)
      }
      reader.readAsDataURL(file)

      this.$refs.imageInput.value = ''
    },
    previewImage (url) {
      this.previewImageUrl = url
      this.showImagePreview = true
    },
    hideImagePreview () {
      this.showImagePreview = false
      this.previewImageUrl = ''
    },
    showMessageMenu (message, event) {
      if (message.isRecalled) return

      this.currentMenuMessage = message
      this.menuStyle = {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
      }
      this.showMenu = true
    },
    hideMessageMenu () {
      this.showMenu = false
      this.currentMenuMessage = null
    },
    handleMessageClick (message) {
      if (message.type === 'image' && !message.isRecalled) {
        this.previewImage(message.content)
      }
    },
    recallMessage (message) {
      if (!this.canRecall(message)) {
        this.showToast('⚠️', '该消息已超过撤回时间')
        this.hideMessageMenu()
        return
      }

      message.isRecalled = true
      this.showToast('✅', '消息已撤回')
      this.hideMessageMenu()
    },
    canRecall (message) {
      if (!message || message.isRecalled) return false

      const now = new Date()
      const messageTime = new Date(message.time)
      const diffMinutes = (now - messageTime) / (1000 * 60)

      return diffMinutes <= 2
    },
    copyMessage () {
      if (!this.currentMenuMessage || this.currentMenuMessage.type !== 'text') {
        this.showToast('⚠️', '无法复制该消息')
        this.hideMessageMenu()
        return
      }

      const text = this.currentMenuMessage.content
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('✅', '消息已复制')
        }).catch(() => {
          this.showToast('⚠️', '复制失败')
        })
      } else {
        this.showToast('⚠️', '您的浏览器不支持复制功能')
      }

      this.hideMessageMenu()
    },
    deleteMessage () {
      if (!this.currentMenuMessage) return

      const index = this.currentMessages.findIndex(m => m.id === this.currentMenuMessage.id)
      if (index > -1) {
        this.currentMessages.splice(index, 1)
        this.showToast('🗑️', '消息已删除')
      }

      this.hideMessageMenu()
    },
    toggleEmojiPicker () {
      this.showToast('😊', '表情选择功能开发中...')
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const container = this.$refs.chatMessages
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    formatTime (time) {
      const date = new Date(time)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    formatDate (date) {
      const d = new Date(date)
      const now = new Date()
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const day = d.getDate().toString().padStart(2, '0')
        return `${month}-${day}`
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

.customer-service-page
  min-height: 100vh
  display: flex
  flex-direction: column
  background-color: #f5f5f5

.page-header
  display: flex
  align-items: center
  justify-content: space-between
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  padding: px2rem(30px) px2rem(20px)
  position: relative
  flex-shrink: 0

.header-left
  width: px2rem(80px)
  height: px2rem(80px)
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer

.back-icon
  font-size: px2rem(56px)
  color: #fff
  font-weight: 300

.header-title
  font-size: px2rem(36px)
  color: #fff
  font-weight: bold

.header-right
  padding: px2rem(16px) px2rem(24px)
  cursor: pointer

.history-text
  font-size: px2rem(28px)
  color: #fff
  font-weight: 500

.chat-container
  flex: 1
  display: flex
  flex-direction: column
  overflow: hidden
  padding: px2rem(20px)

.chat-messages
  flex: 1
  overflow-y: auto
  padding-bottom: px2rem(20px)

.message-item
  display: flex
  margin-bottom: px2rem(30px)
  position: relative

  &.user-message
    flex-direction: row-reverse

  &.service-message
    flex-direction: row

.message-avatar
  width: px2rem(80px)
  height: px2rem(80px)
  border-radius: 50%
  overflow: hidden
  flex-shrink: 0
  margin: px2rem(10px)

.avatar-img
  width: 100%
  height: 100%
  object-fit: cover

.message-content-wrapper
  max-width: 70%
  display: flex
  flex-direction: column

  .user-message &
    align-items: flex-end

  .service-message &
    align-items: flex-start

.message-header
  display: flex
  align-items: center
  margin-bottom: px2rem(8px)
  gap: px2rem(16px)

.message-sender
  font-size: px2rem(24px)
  color: #999

.message-time
  font-size: px2rem(20px)
  color: #bbb

.message-content
  position: relative
  border-radius: px2rem(16px)
  padding: px2rem(20px)
  max-width: 100%
  cursor: pointer

  .user-message &
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)
    color: #fff
    border-bottom-right-radius: 0

  .service-message &
    background-color: #fff
    color: #333
    border-bottom-left-radius: 0
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)

  .recalled-message &
    background-color: #f0f0f0
    color: #999
    border-radius: px2rem(8px)
    padding: px2rem(12px) px2rem(20px)
    font-style: italic

.recalled-text
  font-size: px2rem(24px)
  text-align: center

.message-text
  font-size: px2rem(28px)
  line-height: 1.6
  word-break: break-word

.message-image
  max-width: px2rem(400px)
  border-radius: px2rem(12px)
  overflow: hidden

.chat-image
  width: 100%
  height: auto
  display: block
  border-radius: px2rem(12px)

.message-actions
  display: flex
  gap: px2rem(10px)
  margin-top: px2rem(8px)

.action-btn
  font-size: px2rem(22px)
  color: #06c1ae
  padding: px2rem(4px) px2rem(12px)
  border-radius: px2rem(4px)
  cursor: pointer
  transition: all 0.2s

  &:hover
    background-color: #f0f9f8

  &.disabled
    color: #ccc
    cursor: not-allowed

    &:hover
      background-color: transparent

.input-container
  display: flex
  align-items: flex-end
  padding: px2rem(20px)
  background-color: #fff
  border-top: 1px solid #eee
  flex-shrink: 0

.input-actions
  display: flex
  gap: px2rem(16px)
  margin-right: px2rem(16px)

.action-icon
  font-size: px2rem(48px)
  cursor: pointer
  transition: transform 0.2s

  &:active
    transform: scale(0.9)

.input-box
  flex: 1
  margin-right: px2rem(16px)

.message-input
  width: 100%
  min-height: px2rem(80px)
  max-height: px2rem(200px)
  font-size: px2rem(28px)
  padding: px2rem(20px)
  border: 1px solid #e0e0e0
  border-radius: px2rem(12px)
  resize: none
  outline: none
  box-sizing: border-box
  line-height: 1.5

  &:focus
    border-color: #06c1ae

.send-btn
  padding: px2rem(20px) px2rem(40px)
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  color: #fff
  font-size: px2rem(28px)
  font-weight: bold
  border-radius: px2rem(12px)
  cursor: pointer
  transition: all 0.2s

  &:active
    transform: scale(0.98)

  &.disabled
    background: #ccc
    cursor: not-allowed

.toast
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  background-color: rgba(0, 0, 0, 0.8)
  color: #fff
  padding: px2rem(28px) px2rem(48px)
  border-radius: px2rem(16px)
  display: flex
  align-items: center
  gap: px2rem(16px)
  z-index: 9999
  opacity: 0
  visibility: hidden
  transition: all 0.3s

  &.show
    opacity: 1
    visibility: visible

.toast-icon
  font-size: px2rem(44px)

.toast-text
  font-size: px2rem(28px)

.history-modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 1000
  display: flex
  align-items: center
  justify-content: center
  padding: px2rem(40px)

.history-modal
  width: 100%
  max-width: px2rem(800px)
  max-height: 80vh
  background-color: #fff
  border-radius: px2rem(24px)
  display: flex
  flex-direction: column
  overflow: hidden

.history-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: px2rem(30px)
  border-bottom: 1px solid #eee

.history-title
  font-size: px2rem(32px)
  font-weight: bold
  color: #333

.close-btn
  font-size: px2rem(36px)
  color: #999
  cursor: pointer
  padding: px2rem(10px)

  &:hover
    color: #333

.history-list
  flex: 1
  overflow-y: auto
  padding: px2rem(20px)

.history-session
  display: flex
  justify-content: space-between
  align-items: flex-start
  padding: px2rem(24px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  margin-bottom: px2rem(20px)
  cursor: pointer
  transition: all 0.2s

  &:active
    background-color: #f0f9f8
    transform: scale(0.99)

.session-info
  flex: 1
  min-width: 0

.session-title
  font-size: px2rem(30px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(12px)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.session-preview
  font-size: px2rem(26px)
  color: #666
  line-height: 1.4
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden

.session-meta
  display: flex
  flex-direction: column
  align-items: flex-end
  margin-left: px2rem(20px)
  flex-shrink: 0

.session-date
  font-size: px2rem(22px)
  color: #999
  margin-bottom: px2rem(8px)

.session-count
  font-size: px2rem(22px)
  color: #06c1ae

.empty-history
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: px2rem(80px)

.empty-icon
  font-size: px2rem(120px)
  margin-bottom: px2rem(30px)
  opacity: 0.6

.empty-text
  font-size: px2rem(28px)
  color: #999

.image-preview-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.9)
  z-index: 1001
  display: flex
  align-items: center
  justify-content: center

.image-preview-container
  position: relative
  max-width: 90vw
  max-height: 90vh

.preview-image
  max-width: 100%
  max-height: 90vh
  object-fit: contain

.close-preview
  position: absolute
  top: px2rem(-60px)
  right: 0
  font-size: px2rem(48px)
  color: #fff
  cursor: pointer
  padding: px2rem(10px)

.message-menu-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: transparent
  z-index: 1002

.message-menu
  position: absolute
  background-color: #fff
  border-radius: px2rem(12px)
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)
  overflow: hidden
  min-width: px2rem(240px)

.menu-item
  padding: px2rem(24px) px2rem(30px)
  font-size: px2rem(28px)
  color: #333
  cursor: pointer
  transition: background-color 0.2s
  border-bottom: 1px solid #f0f0f0

  &:last-child
    border-bottom: none

  &:active
    background-color: #f5f5f5

  &.disabled
    color: #ccc
    cursor: not-allowed

    &:active
      background-color: transparent

  &.delete
    color: #ff6b6b
</style>
