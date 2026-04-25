<template>
  <div class="consumption-page">
    <div class="summary-card">
      <div class="summary-header">
        <span class="summary-title">本月消费</span>
        <span class="summary-month">{{ currentMonth }}</span>
      </div>
      <div class="summary-amount">
        <span class="currency">¥</span>
        <span class="amount">{{ monthlyTotal }}</span>
      </div>
      <div class="summary-comparison">
        <span class="comparison-text" :class="comparisonType">
          较上月{{ comparisonType === 'up' ? '↑' : '↓' }}{{ comparisonAmount }}元
        </span>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-header">
        <span class="filter-label">时间筛选</span>
        <span class="filter-clear" @click="clearFilter">清除筛选</span>
      </div>
      <div class="filter-quick">
        <div
          v-for="(option, index) in quickOptions"
          :key="option.value"
          class="quick-option"
          :class="{ active: activeQuickOption === index }"
          @click="selectQuickOption(index)"
        >
          {{ option.label }}
        </div>
      </div>
      <div class="filter-custom">
        <div class="date-range">
          <div class="date-item">
            <span class="date-label">开始日期</span>
            <input
              type="date"
              v-model="startDate"
              class="date-input"
              @change="onDateChange"
            />
          </div>
          <div class="date-separator">至</div>
          <div class="date-item">
            <span class="date-label">结束日期</span>
            <input
              type="date"
              v-model="endDate"
              class="date-input"
              @change="onDateChange"
            />
          </div>
        </div>
      </div>
      <div class="filter-category">
        <span class="category-label">消费类型：</span>
        <div class="category-options">
          <div
            v-for="(cat, index) in categoryOptions"
            :key="cat.value"
            class="category-option"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectCategory(cat.value)"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-name">{{ cat.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="records-section">
      <div class="records-header">
        <span class="records-title">消费记录</span>
        <span class="records-count">共 {{ filteredRecords.length }} 笔</span>
      </div>
      <div class="records-total" v-show="activeQuickOption !== -1 || startDate || selectedCategory !== 'all'">
        <span class="total-label">筛选后金额：</span>
        <span class="total-amount">¥{{ filteredTotal }}</span>
      </div>

      <div class="records-group" v-for="(group, groupIndex) in groupedRecords" :key="groupIndex">
        <div class="group-header">
          <span class="group-date">{{ group.date }}</span>
          <span class="group-amount">¥{{ group.totalAmount }}</span>
        </div>
        <div class="group-records">
          <div
            v-for="(record, recordIndex) in group.records"
            :key="recordIndex"
            class="record-item"
            @click="showRecordDetail(record)"
          >
            <div class="record-icon" :class="record.type">
              <span>{{ getCategoryIcon(record.type) }}</span>
            </div>
            <div class="record-info">
              <div class="record-title">{{ record.title }}</div>
              <div class="record-subtitle">
                <span class="record-time">{{ record.time }}</span>
                <span class="record-location" v-if="record.location">{{ record.location }}</span>
              </div>
              <div class="record-tags" v-if="record.tags">
                <span v-for="tag in record.tags.slice(0, 2)" :key="tag" class="record-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="record-amount">
              <span class="amount-prefix">-¥</span>
              <span class="amount-value">{{ record.amount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-show="filteredRecords.length === 0">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无消费记录</div>
        <div class="empty-tip">换个时间范围试试</div>
      </div>
    </div>

    <div class="detail-modal-overlay" v-show="showDetailModal" @click="hideDetailModal">
      <div class="detail-modal" @click.stop>
        <div class="detail-header">
          <span class="detail-title">订单详情</span>
          <span class="detail-close" @click="hideDetailModal">✕</span>
        </div>
        <div class="detail-content" v-if="selectedRecord">
          <div class="detail-status">
            <span class="status-icon">✅</span>
            <span class="status-text">已完成</span>
          </div>
          <div class="detail-summary">
            <div class="detail-icon-large" :class="selectedRecord.type">
              <span>{{ getCategoryIcon(selectedRecord.type) }}</span>
            </div>
            <div class="detail-info">
              <div class="detail-name">{{ selectedRecord.title }}</div>
              <div class="detail-amount-large">
                <span class="prefix">-¥</span>
                <span class="value">{{ selectedRecord.amount }}</span>
              </div>
            </div>
          </div>
          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-item-label">订单编号</span>
              <span class="detail-item-value">{{ selectedRecord.orderNo }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-item-label">支付方式</span>
              <span class="detail-item-value">{{ selectedRecord.paymentMethod || '微信支付' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-item-label">消费时间</span>
              <span class="detail-item-value">{{ selectedRecord.date }} {{ selectedRecord.time }}</span>
            </div>
            <div class="detail-item" v-if="selectedRecord.location">
              <span class="detail-item-label">消费地点</span>
              <span class="detail-item-value">{{ selectedRecord.location }}</span>
            </div>
            <div class="detail-item" v-if="selectedRecord.people">
              <span class="detail-item-label">消费人数</span>
              <span class="detail-item-value">{{ selectedRecord.people }}人</span>
            </div>
            <div class="detail-item" v-if="selectedRecord.checkinDate">
              <span class="detail-item-label">入住日期</span>
              <span class="detail-item-value">{{ selectedRecord.checkinDate }}</span>
            </div>
            <div class="detail-item" v-if="selectedRecord.checkoutDate">
              <span class="detail-item-label">退房日期</span>
              <span class="detail-item-value">{{ selectedRecord.checkoutDate }}</span>
            </div>
            <div class="detail-item" v-if="selectedRecord.rooms">
              <span class="detail-item-label">房间数量</span>
              <span class="detail-item-value">{{ selectedRecord.rooms }}间</span>
            </div>
            <div class="detail-item" v-if="selectedRecord.nights">
              <span class="detail-item-label">入住晚数</span>
              <span class="detail-item-value">{{ selectedRecord.nights }}晚</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsumptionPage',
  data () {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      activeQuickOption: 0,
      startDate: this.formatDate(firstDayOfMonth),
      endDate: this.formatDate(today),
      selectedCategory: 'all',
      showDetailModal: false,
      selectedRecord: null,
      quickOptions: [
        { value: 'today', label: '今天' },
        { value: 'week', label: '本周' },
        { value: 'month', label: '本月' },
        { value: 'quarter', label: '本季度' },
        { value: 'year', label: '今年' }
      ],
      categoryOptions: [
        { value: 'all', label: '全部', icon: '📊' },
        { value: 'hotel', label: '酒店', icon: '🏨' },
        { value: 'food', label: '美食', icon: '🍽️' },
        { value: 'attraction', label: '景点', icon: '🎢' }
      ],
      records: [
        {
          id: 1,
          orderNo: 'ORD202404250001',
          title: '北京王府半岛酒店',
          type: 'hotel',
          amount: 1288,
          date: '2024-04-25',
          time: '14:30',
          location: '东城区王府井',
          tags: ['五星级', '豪华'],
          checkinDate: '2024-04-25',
          checkoutDate: '2024-04-27',
          rooms: 1,
          nights: 2,
          people: 2,
          paymentMethod: '微信支付'
        },
        {
          id: 2,
          orderNo: 'ORD202404250002',
          title: '老北京火锅',
          type: 'food',
          amount: 356,
          date: '2024-04-25',
          time: '18:45',
          location: '朝阳区三里屯',
          tags: ['火锅', '老北京'],
          people: 4,
          paymentMethod: '支付宝'
        },
        {
          id: 3,
          orderNo: 'ORD202404240001',
          title: '喜茶 HEYTEA',
          type: 'food',
          amount: 58,
          date: '2024-04-24',
          time: '15:20',
          location: '朝阳区太古里',
          tags: ['奶茶', '下午茶'],
          people: 2,
          paymentMethod: '微信支付'
        },
        {
          id: 4,
          orderNo: 'ORD202404230001',
          title: '洲际酒店',
          type: 'hotel',
          amount: 888,
          date: '2024-04-23',
          time: '12:00',
          location: '朝阳区CBD',
          tags: ['商务', '会议'],
          checkinDate: '2024-04-23',
          checkoutDate: '2024-04-24',
          rooms: 1,
          nights: 1,
          people: 1,
          paymentMethod: '信用卡'
        },
        {
          id: 5,
          orderNo: 'ORD202404200001',
          title: '故宫博物院',
          type: 'attraction',
          amount: 120,
          date: '2024-04-20',
          time: '09:30',
          location: '东城区景山前街',
          tags: ['历史文化', '5A景区'],
          people: 3,
          paymentMethod: '微信支付'
        },
        {
          id: 6,
          orderNo: 'ORD202404200002',
          title: '海底捞火锅',
          type: 'food',
          amount: 486,
          date: '2024-04-20',
          time: '19:00',
          location: '朝阳区西单',
          tags: ['火锅', '服务好'],
          people: 5,
          paymentMethod: '微信支付'
        },
        {
          id: 7,
          orderNo: 'ORD202404150001',
          title: '希尔顿酒店',
          type: 'hotel',
          amount: 688,
          date: '2024-04-15',
          time: '14:00',
          location: '海淀区中关村',
          tags: ['舒适', '性价比高'],
          checkinDate: '2024-04-15',
          checkoutDate: '2024-04-17',
          rooms: 1,
          nights: 2,
          people: 2,
          paymentMethod: '支付宝'
        },
        {
          id: 8,
          orderNo: 'ORD202404100001',
          title: '一点点奶茶',
          type: 'food',
          amount: 36,
          date: '2024-04-10',
          time: '14:00',
          location: '朝阳区工体',
          tags: ['奶茶', '饮品'],
          people: 2,
          paymentMethod: '微信支付'
        },
        {
          id: 9,
          orderNo: 'ORD202404050001',
          title: '八达岭长城',
          type: 'attraction',
          amount: 80,
          date: '2024-04-05',
          time: '08:00',
          location: '延庆区八达岭',
          tags: ['世界遗产', '5A景区'],
          people: 2,
          paymentMethod: '微信支付'
        },
        {
          id: 10,
          orderNo: 'ORD202403250001',
          title: '北京王府半岛酒店',
          type: 'hotel',
          amount: 1288,
          date: '2024-03-25',
          time: '14:30',
          location: '东城区王府井',
          tags: ['五星级', '豪华'],
          checkinDate: '2024-03-25',
          checkoutDate: '2024-03-27',
          rooms: 1,
          nights: 2,
          people: 2,
          paymentMethod: '微信支付'
        }
      ]
    }
  },
  computed: {
    currentMonth () {
      const now = new Date()
      return `${now.getFullYear()}年${now.getMonth() + 1}月`
    },
    monthlyTotal () {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return this.records
        .filter(r => {
          const date = new Date(r.date)
          return date >= monthStart && date <= monthEnd
        })
        .reduce((sum, r) => sum + r.amount, 0)
    },
    comparisonType () {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      const thisMonthTotal = this.records
        .filter(r => {
          const date = new Date(r.date)
          return date >= thisMonthStart && date <= thisMonthEnd
        })
        .reduce((sum, r) => sum + r.amount, 0)
      const lastMonthTotal = this.records
        .filter(r => {
          const date = new Date(r.date)
          return date >= lastMonthStart && date <= lastMonthEnd
        })
        .reduce((sum, r) => sum + r.amount, 0)
      return thisMonthTotal >= lastMonthTotal ? 'up' : 'down'
    },
    comparisonAmount () {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      const thisMonthTotal = this.records
        .filter(r => {
          const date = new Date(r.date)
          return date >= thisMonthStart && date <= thisMonthEnd
        })
        .reduce((sum, r) => sum + r.amount, 0)
      const lastMonthTotal = this.records
        .filter(r => {
          const date = new Date(r.date)
          return date >= lastMonthStart && date <= lastMonthEnd
        })
        .reduce((sum, r) => sum + r.amount, 0)
      return Math.abs(thisMonthTotal - lastMonthTotal)
    },
    filteredRecords () {
      let result = [...this.records]
      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate)
        const end = new Date(this.endDate)
        end.setHours(23, 59, 59, 999)
        result = result.filter(r => {
          const date = new Date(r.date)
          return date >= start && date <= end
        })
      }
      if (this.selectedCategory !== 'all') {
        result = result.filter(r => r.type === this.selectedCategory)
      }
      return result.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    filteredTotal () {
      return this.filteredRecords.reduce((sum, r) => sum + r.amount, 0)
    },
    groupedRecords () {
      const groups = {}
      this.filteredRecords.forEach(record => {
        const dateStr = this.formatDisplayDate(record.date)
        if (!groups[dateStr]) {
          groups[dateStr] = {
            date: dateStr,
            totalAmount: 0,
            records: []
          }
        }
        groups[dateStr].totalAmount += record.amount
        groups[dateStr].records.push(record)
      })
      return Object.values(groups).sort((a, b) => {
        const dateA = new Date(a.records[0].date)
        const dateB = new Date(b.records[0].date)
        return dateB - dateA
      })
    }
  },
  methods: {
    formatDate (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDisplayDate (dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      if (dateOnly.getTime() === todayOnly.getTime()) {
        return '今天'
      } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return '昨天'
      } else {
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`
      }
    },
    selectQuickOption (index) {
      this.activeQuickOption = index
      const now = new Date()
      let startDate, endDate
      switch (index) {
        case 0:
          startDate = this.formatDate(now)
          endDate = this.formatDate(now)
          break
        case 1:
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          startDate = this.formatDate(weekStart)
          endDate = this.formatDate(now)
          break
        case 2:
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          startDate = this.formatDate(monthStart)
          endDate = this.formatDate(now)
          break
        case 3:
          const quarterMonth = Math.floor(now.getMonth() / 3) * 3
          const quarterStart = new Date(now.getFullYear(), quarterMonth, 1)
          startDate = this.formatDate(quarterStart)
          endDate = this.formatDate(now)
          break
        case 4:
          const yearStart = new Date(now.getFullYear(), 0, 1)
          startDate = this.formatDate(yearStart)
          endDate = this.formatDate(now)
          break
      }
      this.startDate = startDate
      this.endDate = endDate
    },
    onDateChange () {
      this.activeQuickOption = -1
    },
    selectCategory (value) {
      this.selectedCategory = value
    },
    clearFilter () {
      this.activeQuickOption = 0
      this.selectedCategory = 'all'
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      this.startDate = this.formatDate(firstDayOfMonth)
      this.endDate = this.formatDate(now)
    },
    getCategoryIcon (type) {
      const icons = {
        hotel: '🏨',
        food: '🍽️',
        attraction: '🎢'
      }
      return icons[type] || '💰'
    },
    showRecordDetail (record) {
      this.selectedRecord = record
      this.showDetailModal = true
    },
    hideDetailModal () {
      this.showDetailModal = false
      setTimeout(() => {
        this.selectedRecord = null
      }, 300)
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.consumption-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(40px)

.summary-card
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  margin: px2rem(20px)
  padding: px2rem(40px)
  border-radius: px2rem(20px)
  position: relative
  overflow: hidden

  &::before
    content: ''
    position: absolute
    top: -30%
    right: -20%
    width: 60%
    height: 150%
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)
    border-radius: 50%

.summary-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: px2rem(20px)
  position: relative
  z-index: 1

.summary-title
  font-size: px2rem(28px)
  color: rgba(255, 255, 255, 0.8)

.summary-month
  font-size: px2rem(24px)
  color: rgba(255, 255, 255, 0.7)

.summary-amount
  display: flex
  align-items: baseline
  margin-bottom: px2rem(10px)
  position: relative
  z-index: 1

.currency
  font-size: px2rem(36px)
  color: #fff
  font-weight: bold

.amount
  font-size: px2rem(80px)
  color: #fff
  font-weight: bold

.summary-comparison
  position: relative
  z-index: 1

.comparison-text
  font-size: px2rem(26px)
  padding: px2rem(8px) px2rem(20px)
  background-color: rgba(255, 255, 255, 0.15)
  border-radius: px2rem(20px)
  display: inline-block

  &.up
    color: #ffeb3b

  &.down
    color: #c8e6c9

.filter-section
  background-color: #fff
  margin: px2rem(20px)
  padding: px2rem(30px)
  border-radius: px2rem(16px)

.filter-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: px2rem(24px)

.filter-label
  font-size: px2rem(32px)
  font-weight: bold
  color: #333

.filter-clear
  font-size: px2rem(26px)
  color: #06c1ae
  cursor: pointer

.filter-quick
  display: flex
  gap: px2rem(16px)
  margin-bottom: px2rem(24px)
  flex-wrap: wrap

.quick-option
  flex: 1
  min-width: px2rem(100px)
  padding: px2rem(20px)
  background-color: #f8f8f8
  border-radius: px2rem(12px)
  text-align: center
  font-size: px2rem(26px)
  color: #666
  cursor: pointer
  transition: all 0.3s

  &.active
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)
    color: #fff

.filter-custom
  margin-bottom: px2rem(24px)

.date-range
  display: flex
  align-items: center
  gap: px2rem(16px)

.date-item
  flex: 1

.date-label
  font-size: px2rem(24px)
  color: #999
  margin-bottom: px2rem(8px)
  display: block

.date-input
  width: 100%
  padding: px2rem(20px)
  font-size: px2rem(28px)
  color: #333
  border: px2rem(1px) solid #e0e0e0
  border-radius: px2rem(12px)
  outline: none

  &:focus
    border-color: #06c1ae

.date-separator
  font-size: px2rem(28px)
  color: #999
  padding: px2rem(20px)

.filter-category
  margin-top: px2rem(24px)
  padding-top: px2rem(24px)
  border-top: px2rem(1px) solid #f0f0f0

.category-label
  font-size: px2rem(26px)
  color: #666
  margin-bottom: px2rem(16px)
  display: block

.category-options
  display: flex
  gap: px2rem(16px)
  flex-wrap: wrap

.category-option
  display: flex
  align-items: center
  gap: px2rem(8px)
  padding: px2rem(16px) px2rem(24px)
  background-color: #f8f8f8
  border-radius: px2rem(30px)
  cursor: pointer
  transition: all 0.3s

  &.active
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)

    .category-name
      color: #fff

.category-icon
  font-size: px2rem(28px)

.category-name
  font-size: px2rem(26px)
  color: #333

.records-section
  background-color: #fff
  margin: px2rem(20px)
  padding: px2rem(30px)
  border-radius: px2rem(16px)

.records-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: px2rem(24px)

.records-title
  font-size: px2rem(32px)
  font-weight: bold
  color: #333

.records-count
  font-size: px2rem(24px)
  color: #999

.records-total
  display: flex
  justify-content: flex-end
  align-items: center
  padding: px2rem(20px)
  background-color: #f0f9f8
  border-radius: px2rem(12px)
  margin-bottom: px2rem(24px)

.total-label
  font-size: px2rem(26px)
  color: #666

.total-amount
  font-size: px2rem(36px)
  font-weight: bold
  color: #06c1ae
  margin-left: px2rem(12px)

.records-group
  margin-bottom: px2rem(30px)

  &:last-child
    margin-bottom: 0

.group-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: px2rem(16px) px2rem(20px)
  background-color: #f8f8f8
  border-radius: px2rem(12px)
  margin-bottom: px2rem(16px)

.group-date
  font-size: px2rem(26px)
  color: #666
  font-weight: 500

.group-amount
  font-size: px2rem(28px)
  color: #333
  font-weight: bold

.group-records
  border: px2rem(1px) solid #f0f0f0
  border-radius: px2rem(12px)
  overflow: hidden

.record-item
  display: flex
  align-items: center
  padding: px2rem(24px)
  border-bottom: px2rem(1px) solid #f0f0f0
  cursor: pointer
  transition: background-color 0.2s

  &:active
    background-color: #f8f8f8

  &:last-child
    border-bottom: none

.record-icon
  width: px2rem(90px)
  height: px2rem(90px)
  border-radius: px2rem(16px)
  display: flex
  align-items: center
  justify-content: center
  margin-right: px2rem(24px)
  flex-shrink: 0

  span
    font-size: px2rem(44px)

  &.hotel
    background: linear-gradient(135deg, #e3f2fd, #bbdefb)

  &.food
    background: linear-gradient(135deg, #fff3e0, #ffe0b2)

  &.attraction
    background: linear-gradient(135deg, #f3e5f5, #e1bee7)

.record-info
  flex: 1
  min-width: 0

.record-title
  font-size: px2rem(30px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(8px)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.record-subtitle
  display: flex
  align-items: center
  gap: px2rem(16px)
  margin-bottom: px2rem(8px)

.record-time
  font-size: px2rem(24px)
  color: #999

.record-location
  font-size: px2rem(24px)
  color: #666

.record-tags
  display: flex
  gap: px2rem(10px)

.record-tag
  padding: px2rem(4px) px2rem(12px)
  background-color: #f0f0f0
  color: #666
  font-size: px2rem(22px)
  border-radius: px2rem(20px)

.record-amount
  display: flex
  align-items: baseline
  margin-left: px2rem(20px)
  flex-shrink: 0

.amount-prefix
  font-size: px2rem(26px)
  color: #ff6b6b

.amount-value
  font-size: px2rem(36px)
  font-weight: bold
  color: #ff6b6b

.empty-state
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: px2rem(80px)

.empty-icon
  font-size: px2rem(100px)
  margin-bottom: px2rem(20px)

.empty-text
  font-size: px2rem(32px)
  color: #333
  font-weight: bold
  margin-bottom: px2rem(12px)

.empty-tip
  font-size: px2rem(26px)
  color: #999

.detail-modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 1000
  display: flex
  align-items: flex-end

.detail-modal
  width: 100%
  max-height: 85vh
  background-color: #fff
  border-top-left-radius: px2rem(32px)
  border-top-right-radius: px2rem(32px)
  overflow: hidden

.detail-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: px2rem(30px)
  border-bottom: px2rem(1px) solid #f0f0f0

.detail-title
  font-size: px2rem(32px)
  font-weight: bold
  color: #333

.detail-close
  font-size: px2rem(36px)
  color: #999
  cursor: pointer
  padding: px2rem(10px)

.detail-content
  padding: px2rem(30px)
  max-height: calc(85vh - px2rem(120px))
  overflow-y: auto

.detail-status
  display: flex
  align-items: center
  justify-content: center
  margin-bottom: px2rem(30px)

.status-icon
  font-size: px2rem(40px)
  margin-right: px2rem(12px)

.status-text
  font-size: px2rem(28px)
  color: #06c1ae
  font-weight: bold

.detail-summary
  display: flex
  align-items: center
  padding: px2rem(30px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  margin-bottom: px2rem(30px)

.detail-icon-large
  width: px2rem(120px)
  height: px2rem(120px)
  border-radius: px2rem(20px)
  display: flex
  align-items: center
  justify-content: center
  margin-right: px2rem(30px)
  flex-shrink: 0

  span
    font-size: px2rem(60px)

  &.hotel
    background: linear-gradient(135deg, #e3f2fd, #bbdefb)

  &.food
    background: linear-gradient(135deg, #fff3e0, #ffe0b2)

  &.attraction
    background: linear-gradient(135deg, #f3e5f5, #e1bee7)

.detail-info
  flex: 1

.detail-name
  font-size: px2rem(34px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(16px)

.detail-amount-large
  display: flex
  align-items: baseline

.detail-amount-large .prefix
  font-size: px2rem(30px)
  color: #ff6b6b

.detail-amount-large .value
  font-size: px2rem(48px)
  font-weight: bold
  color: #ff6b6b

.detail-list
  border: px2rem(1px) solid #f0f0f0
  border-radius: px2rem(16px)
  overflow: hidden

.detail-item
  display: flex
  justify-content: space-between
  align-items: center
  padding: px2rem(24px)
  border-bottom: px2rem(1px) solid #f0f0f0

  &:last-child
    border-bottom: none

.detail-item-label
  font-size: px2rem(28px)
  color: #666

.detail-item-value
  font-size: px2rem(28px)
  color: #333
  font-weight: 500
</style>
