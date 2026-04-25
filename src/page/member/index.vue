<template>
  <div class="member-page">
    <div class="member-header">
      <div class="member-info">
        <div class="member-avatar">
          <img :src="userInfo.avatar" :alt="userInfo.name" />
        </div>
        <div class="member-detail">
          <div class="member-name">{{ userInfo.name }}</div>
          <div class="member-level">
            <span class="level-badge" :class="userInfo.level">
              {{ levelInfo.name }}
            </span>
            <span class="level-progress">
              距离下一等级还需 {{ nextLevelPoints }} 积分
            </span>
          </div>
        </div>
      </div>
      <div class="points-card">
        <div class="points-info">
          <div class="points-label">当前积分</div>
          <div class="points-value">{{ userInfo.points }}</div>
        </div>
        <div class="points-info">
          <div class="points-label">累计积分</div>
          <div class="points-value">{{ userInfo.totalPoints }}</div>
        </div>
        <div class="points-info">
          <div class="points-label">今日获得</div>
          <div class="points-value">+{{ userInfo.todayPoints }}</div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">会员等级</span>
      </div>
      <div class="levels-container">
        <div 
          v-for="level in levels" 
          :key="level.id"
          class="level-card"
          :class="{ active: userInfo.level === level.id, locked: isLevelLocked(level.id) }"
        >
          <div class="level-icon">
            <span class="icon-text">{{ level.icon }}</span>
          </div>
          <div class="level-name">{{ level.name }}</div>
          <div class="level-requirement">
            需 {{ level.minPoints }} 积分
          </div>
          <div class="level-benefits-count">
            {{ level.benefits.length }} 项特权
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">我的特权</span>
        <span class="section-more" @click="showAllBenefits = !showAllBenefits">
          {{ showAllBenefits ? '收起' : '查看全部' }}
        </span>
      </div>
      <div class="benefits-container">
        <div 
          v-for="(benefit, index) in displayBenefits" 
          :key="index"
          class="benefit-card"
          :class="{ available: benefit.available }"
        >
          <div class="benefit-icon">
            <span class="icon-text">{{ benefit.icon }}</span>
          </div>
          <div class="benefit-content">
            <div class="benefit-name">{{ benefit.name }}</div>
            <div class="benefit-desc">{{ benefit.description }}</div>
            <div v-if="benefit.usage" class="benefit-usage">
              剩余 {{ benefit.usage.remaining }}/{{ benefit.usage.total }} 次
            </div>
          </div>
          <div class="benefit-action">
            <button 
              v-if="benefit.available && benefit.canUsed" 
              class="use-btn"
              @click="useBenefit(benefit)"
            >
              立即使用
            </button>
            <button 
              v-else-if="benefit.available && !benefit.canUsed" 
              class="used-btn"
              disabled
            >
              已用完
            </button>
            <button 
              v-else 
              class="locked-btn"
              disabled
            >
              升级解锁
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">会员等级特权对比</span>
      </div>
      <div class="benefits-comparison">
        <div class="comparison-header">
          <div class="comparison-item">特权</div>
          <div 
            v-for="level in levels" 
            :key="level.id"
            class="comparison-item level-col"
            :class="{ active: userInfo.level === level.id }"
          >
            {{ level.name }}
          </div>
        </div>
        <div 
          v-for="(group, groupIndex) in benefitGroups" 
          :key="groupIndex"
          class="comparison-group"
        >
          <div class="group-title">{{ group.name }}</div>
          <div 
            v-for="(benefit, benefitIndex) in group.benefits" 
            :key="benefitIndex"
            class="comparison-row"
          >
            <div class="comparison-item benefit-name">{{ benefit.name }}</div>
            <div 
              v-for="level in levels" 
              :key="level.id"
              class="comparison-item"
            >
              <span v-if="hasBenefit(level.id, benefit.id)" class="has-benefit">✓</span>
              <span v-else class="no-benefit">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">积分规则</span>
      </div>
      <div class="rules-container">
        <div class="rule-item">
          <div class="rule-icon">💰</div>
          <div class="rule-content">
            <div class="rule-title">消费积分</div>
            <div class="rule-desc">每消费1元获得1积分，积分可用于升级会员等级</div>
          </div>
        </div>
        <div class="rule-item">
          <div class="rule-icon">📅</div>
          <div class="rule-content">
            <div class="rule-title">每日签到</div>
            <div class="rule-desc">每日签到可获得10积分，连续签到额外奖励</div>
          </div>
        </div>
        <div class="rule-item">
          <div class="rule-icon">⭐</div>
          <div class="rule-content">
            <div class="rule-title">评价奖励</div>
            <div class="rule-desc">完成订单评价可获得20积分奖励</div>
          </div>
        </div>
        <div class="rule-item">
          <div class="rule-icon">🎁</div>
          <div class="rule-content">
            <div class="rule-title">生日礼遇</div>
            <div class="rule-desc">生日当月消费积分双倍，黄金及以上会员可领取生日特权</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberPage',
  data () {
    return {
      showAllBenefits: false,
      userInfo: {
        name: '张三',
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20professional%20headshot&image_size=square',
        level: 'gold',
        points: 8500,
        totalPoints: 12500,
        todayPoints: 50,
        birthday: '1990-05-15'
      },
      levels: [
        {
          id: 'regular',
          name: '普通会员',
          icon: '🎫',
          minPoints: 0,
          maxPoints: 999,
          color: '#999',
          benefits: [
            { id: 'basic-discount', name: '基础折扣', description: '享9.5折优惠', icon: '💰' },
            { id: 'points-earn', name: '积分累积', description: '消费1元累积1积分', icon: '⭐' },
            { id: 'basic-service', name: '基础服务', description: '免费WiFi、24小时前台', icon: '🛎️' }
          ]
        },
        {
          id: 'silver',
          name: '银卡会员',
          icon: '🥈',
          minPoints: 1000,
          maxPoints: 4999,
          color: '#c0c0c0',
          benefits: [
            { id: 'silver-discount', name: '银卡折扣', description: '享9折优惠', icon: '💰' },
            { id: 'silver-points', name: '积分加速', description: '消费1元累积1.2积分', icon: '⭐' },
            { id: 'late-checkout-1', name: '延迟退房', description: '可延迟至13:00退房', icon: '⏰' },
            { id: 'room-upgrade-1', name: '房型升级', description: '季度1次免费升级房型', icon: '🏨' },
            { id: 'welcome-gift', name: '欢迎礼品', description: '入住赠送欢迎小礼品', icon: '🎁' }
          ]
        },
        {
          id: 'gold',
          name: '黄金会员',
          icon: '🥇',
          minPoints: 5000,
          maxPoints: 19999,
          color: '#ffd700',
          benefits: [
            { id: 'gold-discount', name: '黄金折扣', description: '享8.5折优惠', icon: '💰' },
            { id: 'gold-points', name: '积分加速', description: '消费1元累积1.5积分', icon: '⭐' },
            { id: 'late-checkout-2', name: '延迟退房', description: '季度3次延迟至14:00退房', icon: '⏰', usage: { total: 3, remaining: 2 } },
            { id: 'room-upgrade-2', name: '房型升级', description: '季度2次免费升级房型', icon: '🏨', usage: { total: 2, remaining: 1 } },
            { id: 'birthday-gift', name: '生日特权', description: '生日当天可领取500以下房型免费住1天', icon: '🎂' },
            { id: 'executive-lounge', name: '行政酒廊', description: '可使用酒店行政酒廊', icon: '🍸' },
            { id: 'free-breakfast', name: '免费早餐', description: '每次入住赠送双人早餐', icon: '🍳' },
            { id: 'priority-checkin', name: '优先入住', description: '专属快速入住通道', icon: '🚀' }
          ]
        },
        {
          id: 'platinum',
          name: '白金会员',
          icon: '💎',
          minPoints: 20000,
          maxPoints: 49999,
          color: '#e5e4e2',
          benefits: [
            { id: 'platinum-discount', name: '白金折扣', description: '享8折优惠', icon: '💰' },
            { id: 'platinum-points', name: '积分加速', description: '消费1元累积2积分', icon: '⭐' },
            { id: 'late-checkout-3', name: '延迟退房', description: '季度5次延迟至15:00退房', icon: '⏰', usage: { total: 5, remaining: 5 } },
            { id: 'room-upgrade-3', name: '房型升级', description: '季度4次免费升级房型', icon: '🏨', usage: { total: 4, remaining: 4 } },
            { id: 'birthday-gift-2', name: '生日特权', description: '生日当天可领取800以下房型免费住1天', icon: '🎂' },
            { id: 'executive-lounge-2', name: '行政酒廊', description: '可携带1位客人使用行政酒廊', icon: '🍸' },
            { id: 'free-breakfast-2', name: '免费早餐', description: '每次入住赠送双人早餐+下午茶', icon: '🍳' },
            { id: 'priority-checkin-2', name: '优先入住', description: '专属快速入住+退房通道', icon: '🚀' },
            { id: 'free-minibar', name: '免费迷你吧', description: '入住期间迷你吧免费使用', icon: '🍾' },
            { id: 'airport-transfer', name: '机场接送', description: '每年4次免费机场接送服务', icon: '✈️' }
          ]
        },
        {
          id: 'diamond',
          name: '钻石会员',
          icon: '💠',
          minPoints: 50000,
          maxPoints: 999999,
          color: '#00a9ff',
          benefits: [
            { id: 'diamond-discount', name: '钻石折扣', description: '享7.5折优惠', icon: '💰' },
            { id: 'diamond-points', name: '积分加速', description: '消费1元累积2.5积分', icon: '⭐' },
            { id: 'late-checkout-4', name: '延迟退房', description: '季度无限次延迟至16:00退房', icon: '⏰' },
            { id: 'room-upgrade-4', name: '房型升级', description: '季度6次免费升级房型', icon: '🏨', usage: { total: 6, remaining: 6 } },
            { id: 'birthday-gift-3', name: '生日特权', description: '生日当天可领取1000以下房型免费住1天', icon: '🎂' },
            { id: 'executive-lounge-3', name: '行政酒廊', description: '可携带2位客人使用行政酒廊', icon: '🍸' },
            { id: 'free-breakfast-3', name: '免费早餐', description: '每次入住赠送双人早餐+下午茶+晚餐', icon: '🍳' },
            { id: 'priority-checkin-3', name: '优先入住', description: '专属管家24小时服务', icon: '🚀' },
            { id: 'free-minibar-2', name: '免费迷你吧', description: '入住期间迷你吧+洗衣服务免费', icon: '🍾' },
            { id: 'airport-transfer-2', name: '机场接送', description: '每年8次免费机场接送服务', icon: '✈️' },
            { id: 'private-butler', name: '私人管家', description: '专属私人管家服务', icon: '👨‍💼' },
            { id: 'vip-invitation', name: 'VIP邀请', description: '每年受邀参加VIP专属活动', icon: '🎉' }
          ]
        }
      ]
    }
  },
  computed: {
    levelInfo () {
      return this.levels.find(level => level.id === this.userInfo.level) || this.levels[0]
    },
    nextLevelPoints () {
      const currentLevel = this.levelInfo
      if (currentLevel.id === 'diamond') {
        return 0
      }
      return currentLevel.maxPoints - this.userInfo.points + 1
    },
    userBenefits () {
      const currentLevelIndex = this.levels.findIndex(level => level.id === this.userInfo.level)
      const benefits = []

      for (let i = 0; i <= currentLevelIndex; i++) {
        const level = this.levels[i]
        level.benefits.forEach(benefit => {
          const exists = benefits.some(b => b.id === benefit.id)
          if (!exists) {
            benefits.push({
              ...benefit,
              levelId: level.id,
              available: true,
              canUsed: !benefit.usage || benefit.usage.remaining > 0
            })
          }
        })
      }

      return benefits
    },
    lockedBenefits () {
      const currentLevelIndex = this.levels.findIndex(level => level.id === this.userInfo.level)
      const benefits = []

      for (let i = currentLevelIndex + 1; i < this.levels.length; i++) {
        const level = this.levels[i]
        level.benefits.forEach(benefit => {
          const exists = benefits.some(b => b.id === benefit.id)
          const alreadyHave = this.userBenefits.some(b => b.id === benefit.id)
          if (!exists && !alreadyHave) {
            benefits.push({
              ...benefit,
              levelId: level.id,
              available: false,
              canUsed: false
            })
          }
        })
      }

      return benefits
    },
    allBenefits () {
      return [...this.userBenefits, ...this.lockedBenefits]
    },
    displayBenefits () {
      if (this.showAllBenefits) {
        return this.allBenefits
      }
      return this.userBenefits.slice(0, 4)
    },
    benefitGroups () {
      return [
        {
          name: '预订优惠',
          benefits: [
            { id: 'basic-discount', name: '基础折扣' },
            { id: 'silver-discount', name: '银卡折扣' },
            { id: 'gold-discount', name: '黄金折扣' },
            { id: 'platinum-discount', name: '白金折扣' },
            { id: 'diamond-discount', name: '钻石折扣' },
            { id: 'points-earn', name: '积分累积' },
            { id: 'silver-points', name: '积分加速(1.2倍)' },
            { id: 'gold-points', name: '积分加速(1.5倍)' },
            { id: 'platinum-points', name: '积分加速(2倍)' },
            { id: 'diamond-points', name: '积分加速(2.5倍)' }
          ]
        },
        {
          name: '入住权益',
          benefits: [
            { id: 'late-checkout-1', name: '延迟退房(13:00)' },
            { id: 'late-checkout-2', name: '延迟退房(14:00)' },
            { id: 'late-checkout-3', name: '延迟退房(15:00)' },
            { id: 'late-checkout-4', name: '延迟退房(16:00)' },
            { id: 'room-upgrade-1', name: '房型升级(1次/季度)' },
            { id: 'room-upgrade-2', name: '房型升级(2次/季度)' },
            { id: 'room-upgrade-3', name: '房型升级(4次/季度)' },
            { id: 'room-upgrade-4', name: '房型升级(6次/季度)' },
            { id: 'welcome-gift', name: '欢迎礼品' },
            { id: 'free-minibar', name: '免费迷你吧' },
            { id: 'free-minibar-2', name: '免费迷你吧+洗衣' }
          ]
        },
        {
          name: '餐饮权益',
          benefits: [
            { id: 'executive-lounge', name: '行政酒廊' },
            { id: 'executive-lounge-2', name: '行政酒廊(+1人)' },
            { id: 'executive-lounge-3', name: '行政酒廊(+2人)' },
            { id: 'free-breakfast', name: '免费早餐' },
            { id: 'free-breakfast-2', name: '免费早餐+下午茶' },
            { id: 'free-breakfast-3', name: '免费早餐+下午茶+晚餐' }
          ]
        },
        {
          name: '专属服务',
          benefits: [
            { id: 'priority-checkin', name: '优先入住' },
            { id: 'priority-checkin-2', name: '优先入住+退房' },
            { id: 'priority-checkin-3', name: '24小时管家服务' },
            { id: 'airport-transfer', name: '机场接送(4次/年)' },
            { id: 'airport-transfer-2', name: '机场接送(8次/年)' },
            { id: 'private-butler', name: '私人管家' },
            { id: 'vip-invitation', name: 'VIP活动邀请' }
          ]
        },
        {
          name: '生日特权',
          benefits: [
            { id: 'birthday-gift', name: '生日免费房(500以下)' },
            { id: 'birthday-gift-2', name: '生日免费房(800以下)' },
            { id: 'birthday-gift-3', name: '生日免费房(1000以下)' }
          ]
        }
      ]
    }
  },
  methods: {
    isLevelLocked (levelId) {
      const currentLevelIndex = this.levels.findIndex(level => level.id === this.userInfo.level)
      const targetLevelIndex = this.levels.findIndex(level => level.id === levelId)
      return targetLevelIndex > currentLevelIndex
    },
    hasBenefit (levelId, benefitId) {
      const level = this.levels.find(l => l.id === levelId)
      if (!level) return false

      const levelIndex = this.levels.findIndex(l => l.id === levelId)
      for (let i = 0; i <= levelIndex; i++) {
        const l = this.levels[i]
        if (l.benefits.some(b => b.id === benefitId)) {
          return true
        }
      }
      return false
    },
    useBenefit (benefit) {
      console.log('使用权益:', benefit)
      alert(`您已成功使用 ${benefit.name} 权益！`)
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.member-page
  background-color: #f5f5f5
  padding-bottom: px2rem(40px)

.member-header
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  padding: px2rem(40px) px2rem(30px)
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

.member-info
  display: flex
  align-items: center
  margin-bottom: px2rem(30px)
  position: relative
  z-index: 1

.member-avatar
  width: px2rem(120px)
  height: px2rem(120px)
  border-radius: 50%
  overflow: hidden
  border: px2rem(6px) solid rgba(255, 255, 255, 0.3)
  margin-right: px2rem(30px)
  flex-shrink: 0

  img
    width: 100%
    height: 100%
    object-fit: cover

.member-detail
  flex: 1
  min-width: 0

.member-name
  font-size: px2rem(40px)
  font-weight: bold
  color: #fff
  margin-bottom: px2rem(15px)

.member-level
  display: flex
  flex-direction: column
  gap: px2rem(10px)

.level-badge
  display: inline-block
  padding: px2rem(8px) px2rem(24px)
  border-radius: px2rem(20px)
  font-size: px2rem(26px)
  font-weight: bold
  background-color: rgba(255, 255, 255, 0.2)
  color: #fff
  width: fit-content

  &.gold
    background: linear-gradient(135deg, #ffd700, #ffb700)
    color: #fff
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2)

  &.silver
    background: linear-gradient(135deg, #c0c0c0, #a8a8a8)
    color: #fff

  &.platinum
    background: linear-gradient(135deg, #e5e4e2, #d4d3d1)
    color: #333

  &.diamond
    background: linear-gradient(135deg, #00a9ff, #0088cc)
    color: #fff

  &.regular
    background-color: rgba(255, 255, 255, 0.3)
    color: #fff

.level-progress
  font-size: px2rem(24px)
  color: rgba(255, 255, 255, 0.8)

.points-card
  display: flex
  justify-content: space-around
  background-color: rgba(255, 255, 255, 0.15)
  border-radius: px2rem(16px)
  padding: px2rem(30px)
  position: relative
  z-index: 1
  backdrop-filter: blur(10px)

.points-info
  text-align: center

.points-label
  font-size: px2rem(24px)
  color: rgba(255, 255, 255, 0.8)
  margin-bottom: px2rem(10px)

.points-value
  font-size: px2rem(48px)
  font-weight: bold
  color: #fff

.section-container
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

.section-more
  font-size: px2rem(28px)
  color: #06c1ae
  cursor: pointer

.levels-container
  display: flex
  overflow-x: auto
  padding-bottom: px2rem(10px)
  gap: px2rem(20px)
  scrollbar-width: none
  -ms-overflow-style: none

  &::-webkit-scrollbar
    display: none

.level-card
  flex-shrink: 0
  width: px2rem(200px)
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  padding: px2rem(30px) px2rem(20px)
  text-align: center
  cursor: pointer
  transition: all 0.3s
  border: px2rem(4px) solid transparent

  &:hover
    transform: translateY(-4px)
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12)

  &.active
    background: linear-gradient(135deg, rgba(6, 193, 174, 0.1), rgba(6, 193, 174, 0.05))
    border-color: #06c1ae

  &.locked
    opacity: 0.6

.level-icon
  width: px2rem(80px)
  height: px2rem(80px)
  margin: 0 auto px2rem(20px)
  display: flex
  align-items: center
  justify-content: center
  background-color: #fff
  border-radius: 50%
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

  .icon-text
    font-size: px2rem(48px)

.level-name
  font-size: px2rem(30px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(10px)

.level-requirement
  font-size: px2rem(24px)
  color: #999
  margin-bottom: px2rem(10px)

.level-benefits-count
  font-size: px2rem(24px)
  color: #06c1ae
  font-weight: 500

.benefits-container
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: px2rem(20px)

.benefit-card
  display: flex
  align-items: center
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  padding: px2rem(24px)
  border: px2rem(2px) solid transparent
  transition: all 0.3s

  &:hover
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)

  &.available
    background: linear-gradient(135deg, rgba(6, 193, 174, 0.05), #fff)
    border-color: rgba(6, 193, 174, 0.2)

.benefit-icon
  width: px2rem(80px)
  height: px2rem(80px)
  display: flex
  align-items: center
  justify-content: center
  background-color: #fff
  border-radius: px2rem(12px)
  margin-right: px2rem(20px)
  flex-shrink: 0
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)

  .icon-text
    font-size: px2rem(40px)

.benefit-content
  flex: 1
  min-width: 0

.benefit-name
  font-size: px2rem(28px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(8px)

.benefit-desc
  font-size: px2rem(24px)
  color: #666
  margin-bottom: px2rem(8px)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.benefit-usage
  font-size: px2rem(22px)
  color: #06c1ae
  font-weight: 500

.benefit-action
  margin-left: px2rem(10px)

.use-btn
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  color: #fff
  border: none
  padding: px2rem(12px) px2rem(24px)
  border-radius: px2rem(20px)
  font-size: px2rem(24px)
  cursor: pointer
  transition: all 0.3s

  &:hover
    transform: scale(1.05)
    box-shadow: 0 4px 12px rgba(6, 193, 174, 0.3)

.used-btn,
.locked-btn
  background-color: #e0e0e0
  color: #999
  border: none
  padding: px2rem(12px) px2rem(24px)
  border-radius: px2rem(20px)
  font-size: px2rem(24px)
  cursor: not-allowed

.benefits-comparison
  border: px2rem(1px) solid #f0f0f0
  border-radius: px2rem(12px)
  overflow: hidden

.comparison-header
  display: flex
  background-color: #f8f8f8
  border-bottom: px2rem(1px) solid #f0f0f0

.comparison-item
  flex: 1
  padding: px2rem(12px) px2rem(8px)
  text-align: center
  font-size: px2rem(20px)
  color: #666
  border-right: px2rem(1px) solid #f0f0f0

  &:last-child
    border-right: none

  &.level-col
    font-weight: bold
    color: #333

    &.active
      background-color: rgba(6, 193, 174, 0.1)
      color: #06c1ae

.comparison-group
  border-bottom: px2rem(1px) solid #f0f0f0

  &:last-child
    border-bottom: none

.group-title
  background-color: #fafafa
  padding: px2rem(10px) px2rem(16px)
  font-size: px2rem(22px)
  font-weight: bold
  color: #333
  border-bottom: px2rem(1px) solid #f0f0f0

.comparison-row
  display: flex
  border-bottom: px2rem(1px) solid #f0f0f0

  &:last-child
    border-bottom: none

  .comparison-item
    font-size: px2rem(18px)
    padding: px2rem(8px) px2rem(6px)
    display: flex
    align-items: center
    justify-content: center

    &.benefit-name
      justify-content: flex-start
      padding-left: px2rem(20px)
      color: #333

.has-benefit
  color: #06c1ae
  font-size: px2rem(24px)
  font-weight: bold

.no-benefit
  color: #ccc
  font-size: px2rem(24px)

.rules-container
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: px2rem(20px)

.rule-item
  display: flex
  background-color: #f8f8f8
  border-radius: px2rem(16px)
  padding: px2rem(24px)
  transition: all 0.3s

  &:hover
    background-color: #f0f9f8

.rule-icon
  font-size: px2rem(48px)
  margin-right: px2rem(20px)
  flex-shrink: 0

.rule-content
  flex: 1

.rule-title
  font-size: px2rem(28px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(10px)

.rule-desc
  font-size: px2rem(24px)
  color: #666
  line-height: 1.5
</style>
