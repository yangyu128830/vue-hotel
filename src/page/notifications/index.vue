<template>
  <div class="notifications-page">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <span class="back-icon">‹</span>
      </div>
      <div class="header-title">消息通知</div>
      <div class="header-right" @click="toggleManageMode">
        <span class="manage-text">{{ isManageMode ? '完成' : '管理' }}</span>
      </div>
    </div>

    <div class="category-tabs">
      <div 
        v-for="(tab, index) in categoryTabs" 
        :key="tab.id"
        class="category-tab"
        :class="{ active: activeCategoryTab === index }"
        @click="switchCategoryTab(index)"
      >
        <span class="tab-name">{{ tab.name }}</span>
        <span class="tab-badge" v-if="getUnreadCount(tab.id) > 0">
          {{ getUnreadCount(tab.id) }}
        </span>
      </div>
    </div>

    <div class="action-bar" v-show="filteredNotifications.length > 0">
      <div class="action-left" @click="toggleSelectAll">
        <span class="checkbox" :class="{ checked: isAllSelected }">
          <span v-show="isAllSelected" class="checkmark">✓</span>
        </span>
        <span class="select-text">{{ isAllSelected ? '取消全选' : '全选' }}</span>
      </div>
      <div class="action-right">
        <span class="action-btn" @click="markAsReadSelected" v-show="selectedIds.length > 0">
          已读({{ selectedIds.length }})
        </span>
        <span class="action-btn" @click="deleteSelected" v-show="selectedIds.length > 0">
          删除({{ selectedIds.length }})
        </span>
        <span class="action-btn mark-all-read" @click="markAllAsRead">
          一键已读
        </span>
      </div>
    </div>

    <div class="notifications-list" v-show="filteredNotifications.length > 0">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 
          unread: !notification.isRead, 
          important: notification.isImportant,
          selected: selectedIds.includes(notification.id),
          'manage-mode': isManageMode
        }"
        @click="handleNotificationClick(notification)"
      >
        <div class="item-checkbox" v-show="isManageMode" @click.stop="toggleSelect(notification.id)">
          <span class="checkbox" :class="{ checked: selectedIds.includes(notification.id) }">
            <span v-show="selectedIds.includes(notification.id)" class="checkmark">✓</span>
          </span>
        </div>
        
        <div class="item-icon">
          <span class="icon-text">{{ getCategoryIcon(notification.category) }}</span>
          <span class="unread-dot" v-show="!notification.isRead && !isManageMode"></span>
        </div>
        
        <div class="item-content">
          <div class="item-header">
            <span class="item-title">{{ notification.title }}</span>
            <span class="important-badge" v-show="notification.isImportant">★ 重点</span>
          </div>
          <div class="item-desc">{{ notification.content }}</div>
          <div class="item-meta">
            <span class="item-time">{{ formatTime(notification.time) }}</span>
            <span class="item-category">{{ getCategoryLabel(notification.category) }}</span>
          </div>
        </div>
        
        <div class="item-arrow" v-show="!isManageMode">›</div>
      </div>
    </div>

    <div class="empty-state" v-show="filteredNotifications.length === 0">
      <div class="empty-icon">🔔</div>
      <div class="empty-text">暂无{{ currentCategoryLabel }}消息</div>
      <div class="empty-tip">有新消息时会在这里显示</div>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>

    <div class="action-sheet-overlay" v-show="showActionSheet" @click="hideActionSheet">
      <div class="action-sheet" @click.stop>
        <div class="action-sheet-title">消息操作</div>
        <div class="action-sheet-item" @click="toggleImportant">
          <span class="action-icon">{{ currentNotification?.isImportant ? '☆' : '★' }}</span>
          <span class="action-text">{{ currentNotification?.isImportant ? '取消重点' : '标记为重点' }}</span>
        </div>
        <div class="action-sheet-item" @click="markAsRead">
          <span class="action-icon">✓</span>
          <span class="action-text">{{ currentNotification?.isRead ? '标记为未读' : '标记为已读' }}</span>
        </div>
        <div class="action-sheet-item delete" @click="deleteNotification">
          <span class="action-icon">🗑️</span>
          <span class="action-text">删除消息</span>
        </div>
        <div class="action-sheet-cancel" @click="hideActionSheet">取消</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationsPage',
  data () {
    return {
      isManageMode: false,
      activeCategoryTab: 0,
      selectedIds: [],
      isAllSelected: false,
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅',
      showActionSheet: false,
      currentNotification: null,
      categoryTabs: [
        { id: 'all', name: '全部' },
        { id: 'payment', name: '支付信息' },
        { id: 'activity', name: '活动信息' },
        { id: 'booking', name: '预订信息' },
        { id: 'expiry', name: '过期提醒' }
      ],
      notifications: [
        {
          id: 101,
          category: 'payment',
          title: '支付成功',
          content: '您的订单 #20240425001 支付成功，金额 ¥588.00。',
          time: '2024-04-25 14:30:00',
          isRead: false,
          isImportant: false,
          orderId: '20240425001'
        },
        {
          id: 102,
          category: 'payment',
          title: '退款到账',
          content: '您的订单 #20240420003 已成功退款 ¥299.00 至原支付账户。',
          time: '2024-04-24 10:15:00',
          isRead: false,
          isImportant: true,
          orderId: '20240420003'
        },
        {
          id: 103,
          category: 'activity',
          title: '限时特惠活动',
          content: '五一黄金周特惠来袭！全场酒店低至5折起，点击查看详情。',
          time: '2024-04-24 09:00:00',
          isRead: true,
          isImportant: false,
          activityId: 'ACT20240501'
        },
        {
          id: 104,
          category: 'activity',
          title: '会员专属活动',
          content: '亲爱的黄金会员，您有一张专属优惠券即将过期，快来使用吧！',
          time: '2024-04-23 16:45:00',
          isRead: true,
          isImportant: false,
          couponId: 'CPN20240430'
        },
        {
          id: 105,
          category: 'booking',
          title: '酒店预订成功',
          content: '您已成功预订「北京王府半岛酒店」豪华大床房，入住时间：2024-04-28 至 2024-04-30。',
          time: '2024-04-23 15:20:00',
          isRead: false,
          isImportant: true,
          bookingId: 'BK20240423001',
          hotelName: '北京王府半岛酒店'
        },
        {
          id: 106,
          category: 'booking',
          title: '景点门票预订确认',
          content: '您已成功预订「故宫博物院」门票2张，参观日期：2024-04-29，请携带身份证入园。',
          time: '2024-04-22 11:30:00',
          isRead: true,
          isImportant: false,
          bookingId: 'BK20240422002',
          attractionName: '故宫博物院'
        },
        {
          id: 107,
          category: 'expiry',
          title: '团购券即将过期',
          content: '您购买的「海底捞火锅」双人套餐团购券即将在3天后过期，请尽快使用。',
          time: '2024-04-22 10:00:00',
          isRead: false,
          isImportant: true,
          voucherId: 'VOU20240425',
          merchantName: '海底捞火锅',
          expiryDate: '2024-04-28'
        },
        {
          id: 108,
          category: 'expiry',
          title: '积分即将过期提醒',
          content: '您有200积分将在2024-05-01过期，快去积分商城兑换礼品吧！',
          time: '2024-04-20 09:30:00',
          isRead: true,
          isImportant: false,
          pointsAmount: 200,
          expiryDate: '2024-05-01'
        },
        {
          id: 109,
          category: 'booking',
          title: '预订即将开始',
          content: '您预订的「三亚亚龙湾万豪度假酒店」将于明天入住，请提前做好准备。',
          time: '2024-04-19 14:00:00',
          isRead: true,
          isImportant: false,
          bookingId: 'BK20240419001',
          hotelName: '三亚亚龙湾万豪度假酒店'
        },
        {
          id: 110,
          category: 'payment',
          title: '支付失败通知',
          content: '您的订单 #20240418005 支付失败，请重新尝试支付。',
          time: '2024-04-18 18:45:00',
          isRead: true,
          isImportant: false,
          orderId: '20240418005'
        }
      ]
    }
  },
  computed: {
    currentCategoryLabel () {
      const tab = this.categoryTabs[this.activeCategoryTab]
      return tab.id === 'all' ? '' : tab.name
    },
    filteredNotifications () {
      let result = [...this.notifications]
      const activeTab = this.categoryTabs[this.activeCategoryTab]

      if (activeTab.id !== 'all') {
        result = result.filter(item => item.category === activeTab.id)
      }

      result.sort((a, b) => {
        if (!a.isRead && b.isRead) return -1
        if (a.isRead && !b.isRead) return 1
        return new Date(b.time) - new Date(a.time)
      })

      return result
    }
  },
  methods: {
    goBack () {
      this.$router.back()
    },
    toggleManageMode () {
      this.isManageMode = !this.isManageMode
      this.selectedIds = []
      this.isAllSelected = false
    },
    switchCategoryTab (index) {
      this.activeCategoryTab = index
      this.selectedIds = []
      this.isAllSelected = false
    },
    getUnreadCount (categoryId) {
      if (categoryId === 'all') {
        return this.notifications.filter(n => !n.isRead).length
      }
      return this.notifications.filter(n => n.category === categoryId && !n.isRead).length
    },
    getCategoryIcon (category) {
      const icons = {
        payment: '💰',
        activity: '🎉',
        booking: '📅',
        expiry: '⏰'
      }
      return icons[category] || '🔔'
    },
    getCategoryLabel (category) {
      const labels = {
        payment: '支付信息',
        activity: '活动信息',
        booking: '预订信息',
        expiry: '过期提醒'
      }
      return labels[category] || '系统消息'
    },
    formatTime (timeStr) {
      const now = new Date()
      const time = new Date(timeStr)
      const diffMs = now - time
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return time.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      }
    },
    handleNotificationClick (notification) {
      if (this.isManageMode) {
        this.toggleSelect(notification.id)
        return
      }

      if (!notification.isRead) {
        notification.isRead = true
      }

      this.currentNotification = notification
      this.showActionSheet = true
    },
    toggleSelect (id) {
      const index = this.selectedIds.indexOf(id)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(id)
      }

      this.isAllSelected = this.filteredNotifications.every(n =>
        this.selectedIds.includes(n.id)
      )
    },
    toggleSelectAll () {
      if (this.isAllSelected) {
        this.selectedIds = []
        this.isAllSelected = false
      } else {
        this.selectedIds = this.filteredNotifications.map(n => n.id)
        this.isAllSelected = true
      }
    },
    markAsReadSelected () {
      if (this.selectedIds.length === 0) {
        this.showToast('⚠️', '请先选择要标记的消息')
        return
      }

      this.notifications.forEach(notification => {
        if (this.selectedIds.includes(notification.id)) {
          notification.isRead = true
        }
      })

      const count = this.selectedIds.length
      this.selectedIds = []
      this.isAllSelected = false
      this.showToast('✅', `已将 ${count} 条消息标记为已读`)
    },
    deleteSelected () {
      if (this.selectedIds.length === 0) {
        this.showToast('⚠️', '请先选择要删除的消息')
        return
      }

      const count = this.selectedIds.length
      this.notifications = this.notifications.filter(n =>
        !this.selectedIds.includes(n.id)
      )

      this.selectedIds = []
      this.isAllSelected = false
      this.showToast('🗑️', `已删除 ${count} 条消息`)
    },
    markAllAsRead () {
      const activeTab = this.categoryTabs[this.activeCategoryTab]
      let count = 0

      this.notifications.forEach(notification => {
        if (activeTab.id === 'all' || notification.category === activeTab.id) {
          if (!notification.isRead) {
            notification.isRead = true
            count++
          }
        }
      })

      if (count === 0) {
        this.showToast('ℹ️', '当前分类没有未读消息')
      } else {
        this.showToast('✅', `已将 ${count} 条消息标记为已读`)
      }
    },
    hideActionSheet () {
      this.showActionSheet = false
      this.currentNotification = null
    },
    toggleImportant () {
      if (!this.currentNotification) return

      this.currentNotification.isImportant = !this.currentNotification.isImportant
      this.showToast(
        this.currentNotification.isImportant ? '⭐' : '☆',
        this.currentNotification.isImportant ? '已标记为重点' : '已取消重点标记'
      )
      this.hideActionSheet()
    },
    markAsRead () {
      if (!this.currentNotification) return

      this.currentNotification.isRead = !this.currentNotification.isRead
      this.showToast(
        '✓',
        this.currentNotification.isRead ? '已标记为已读' : '已标记为未读'
      )
      this.hideActionSheet()
    },
    deleteNotification () {
      if (!this.currentNotification) return

      const index = this.notifications.findIndex(n => n.id === this.currentNotification.id)
      if (index > -1) {
        this.notifications.splice(index, 1)
        this.showToast('🗑️', '消息已删除')
      }
      this.hideActionSheet()
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

.notifications-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(40px)

.page-header
  display: flex
  align-items: center
  justify-content: space-between
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  padding: px2rem(30px) px2rem(20px)
  position: relative

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

.manage-text
  font-size: px2rem(28px)
  color: #fff
  font-weight: 500

.category-tabs
  display: flex
  background-color: #fff
  padding: px2rem(20px)
  gap: px2rem(12px)
  overflow-x: auto
  border-bottom: 1px solid #eee

.category-tab
  flex-shrink: 0
  display: flex
  align-items: center
  justify-content: center
  padding: px2rem(16px) px2rem(32px)
  background-color: #f8f8f8
  border-radius: px2rem(30px)
  cursor: pointer
  transition: all 0.3s
  position: relative

  &:active
    transform: scale(0.98)

  &.active
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)

    .tab-name
      color: #fff

.tab-name
  font-size: px2rem(26px)
  color: #333
  font-weight: 500

.tab-badge
  position: absolute
  top: px2rem(-8px)
  right: px2rem(-8px)
  min-width: px2rem(40px)
  height: px2rem(40px)
  background-color: #ff6b6b
  color: #fff
  font-size: px2rem(20px)
  font-weight: bold
  border-radius: px2rem(20px)
  display: flex
  align-items: center
  justify-content: center
  padding: 0 px2rem(10px)

.action-bar
  display: flex
  justify-content: space-between
  align-items: center
  background-color: #fff
  padding: px2rem(20px) px2rem(30px)
  border-bottom: 1px solid #eee

.action-left
  display: flex
  align-items: center
  gap: px2rem(16px)
  cursor: pointer

.checkbox
  width: px2rem(44px)
  height: px2rem(44px)
  border: 2px solid #ccc
  border-radius: px2rem(8px)
  display: flex
  align-items: center
  justify-content: center
  transition: all 0.2s

  &.checked
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)
    border-color: #06c1ae

.checkmark
  font-size: px2rem(28px)
  color: #fff
  font-weight: bold

.select-text
  font-size: px2rem(26px)
  color: #333

.action-right
  display: flex
  align-items: center
  gap: px2rem(24px)

.action-btn
  font-size: px2rem(26px)
  color: #06c1ae
  cursor: pointer
  padding: px2rem(12px) px2rem(20px)
  border-radius: px2rem(8px)
  transition: all 0.2s

  &:active
    background-color: #f0f9f8

  &.mark-all-read
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)
    color: #fff
    padding: px2rem(12px) px2rem(32px)
    border-radius: px2rem(30px)

    &:active
      opacity: 0.9

.notifications-list
  padding: px2rem(20px)

.notification-item
  display: flex
  align-items: center
  background-color: #fff
  border-radius: px2rem(16px)
  padding: px2rem(24px)
  margin-bottom: px2rem(20px)
  cursor: pointer
  transition: all 0.2s
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)
  position: relative

  &:active
    transform: scale(0.99)

  &.unread:not(.manage-mode)
    background-color: #f0f9f8
    border-left: 4px solid #06c1ae

  &.important
    &::before
      content: ''
      position: absolute
      top: 0
      right: 0
      width: 0
      height: 0
      border-left: px2rem(50px) solid transparent
      border-top: px2rem(50px) solid #ff9500

  &.selected
    background-color: #e8f8f6

.item-checkbox
  margin-right: px2rem(20px)
  flex-shrink: 0

.item-icon
  width: px2rem(96px)
  height: px2rem(96px)
  background-color: #f5f5f5
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  margin-right: px2rem(24px)
  position: relative
  flex-shrink: 0

.icon-text
  font-size: px2rem(44px)

.unread-dot
  position: absolute
  top: px2rem(4px)
  right: px2rem(4px)
  width: px2rem(24px)
  height: px2rem(24px)
  background-color: #ff6b6b
  border-radius: 50%
  border: 2px solid #fff

.item-content
  flex: 1
  min-width: 0

.item-header
  display: flex
  align-items: center
  margin-bottom: px2rem(12px)

.item-title
  font-size: px2rem(30px)
  font-weight: bold
  color: #333
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  flex: 1

.important-badge
  font-size: px2rem(20px)
  color: #ff9500
  background-color: #fff3e0
  padding: px2rem(4px) px2rem(12px)
  border-radius: px2rem(20px)
  margin-left: px2rem(12px)
  flex-shrink: 0

.item-desc
  font-size: px2rem(26px)
  color: #666
  line-height: 1.5
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden
  margin-bottom: px2rem(12px)

.item-meta
  display: flex
  align-items: center
  gap: px2rem(20px)

.item-time
  font-size: px2rem(22px)
  color: #999

.item-category
  font-size: px2rem(22px)
  color: #06c1ae
  background-color: #f0f9f8
  padding: px2rem(4px) px2rem(12px)
  border-radius: px2rem(16px)

.item-arrow
  font-size: px2rem(40px)
  color: #ccc
  margin-left: px2rem(20px)
  flex-shrink: 0

.empty-state
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: px2rem(160px) px2rem(40px)

.empty-icon
  font-size: px2rem(160px)
  margin-bottom: px2rem(40px)
  opacity: 0.6

.empty-text
  font-size: px2rem(36px)
  color: #333
  font-weight: bold
  margin-bottom: px2rem(16px)

.empty-tip
  font-size: px2rem(28px)
  color: #999

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

.action-sheet-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 9998
  display: flex
  align-items: flex-end

.action-sheet
  width: 100%
  background-color: #fff
  border-radius: px2rem(32px) px2rem(32px) 0 0
  padding: px2rem(20px)
  animation: slideUp 0.3s ease-out

@keyframes slideUp
  from
    transform: translateY(100%)
  to
    transform: translateY(0)

.action-sheet-title
  text-align: center
  font-size: px2rem(28px)
  color: #999
  padding: px2rem(20px) 0
  border-bottom: 1px solid #eee

.action-sheet-item
  display: flex
  align-items: center
  padding: px2rem(32px)
  border-bottom: 1px solid #f5f5f5
  cursor: pointer
  transition: background-color 0.2s

  &:active
    background-color: #f5f5f5

  &.delete
    .action-icon,
    .action-text
      color: #ff6b6b

.action-icon
  font-size: px2rem(40px)
  margin-right: px2rem(24px)

.action-text
  font-size: px2rem(32px)
  color: #333

.action-sheet-cancel
  text-align: center
  font-size: px2rem(32px)
  color: #06c1ae
  padding: px2rem(32px)
  margin-top: px2rem(20px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  cursor: pointer
  font-weight: 500

  &:active
    background-color: #eee
</style>
