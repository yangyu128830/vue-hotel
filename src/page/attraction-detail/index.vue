<template>
  <div class="attraction-detail-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="header-title">{{ attractionName }}</div>
      <div class="share-btn">
        <span>⋮</span>
      </div>
    </div>

    <div class="attraction-banner">
      <img :src="attractionImage" :alt="attractionName" class="attraction-image" />
      <div class="attraction-info-overlay">
        <div class="attraction-name">{{ attractionName }}</div>
        <div class="attraction-tags">
          <span v-for="tag in attractionTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="score-section">
      <div class="score-info">
        <div class="score-value">{{ attractionScore }}</div>
        <div class="score-text">
          <div class="score-label">综合评分</div>
          <div class="comment-count">{{ attractionCommentCount }}条点评</div>
        </div>
      </div>
      <div class="score-breakdown">
        <div class="score-item">
          <span class="score-dimension">景观</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.scenery) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.scenery }}</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">服务</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.service) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.service }}</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">性价比</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.value) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.value }}</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">设施</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.facility) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.facility }}</span>
        </div>
      </div>
    </div>

    <div class="intro-section">
      <div class="section-title">
        <span class="title-text">景点介绍</span>
      </div>
      <div class="intro-content">
        <p>{{ attractionDescription }}</p>
      </div>
    </div>

    <div class="location-section">
      <div class="section-title">
        <span class="title-text">位置与导航</span>
      </div>
      <div class="location-header">
        <div class="location-icon">📍</div>
        <div class="location-info">
          <div class="location-title">{{ attractionLocation }}</div>
          <div class="location-distance">距您约 {{ attractionDistance }} 公里</div>
        </div>
      </div>
      <div class="map-container" @click="openMapNavigation">
        <div class="map-placeholder">
          <div class="map-pin">📍</div>
          <div class="map-road">
            <div class="road-line"></div>
            <div class="road-dot"></div>
          </div>
          <div class="map-overlay">
            <div class="map-text">点击查看地图导航</div>
          </div>
        </div>
      </div>
      <div class="navigation-btns">
        <button class="nav-btn primary" @click="openMapNavigation">
          <span class="nav-icon">🚗</span>
          <span class="nav-text">导航前往</span>
        </button>
        <button class="nav-btn" @click="copyAddress">
          <span class="nav-icon">📋</span>
          <span class="nav-text">复制地址</span>
        </button>
      </div>
    </div>

    <div class="ticket-section">
      <div class="section-title">
        <span class="title-text">门票套餐</span>
        <span class="ticket-count">共 {{ ticketPackages.length }} 种套餐</span>
      </div>
      <div class="ticket-list">
        <div 
          v-for="ticket in ticketPackages" 
          :key="ticket.id" 
          class="ticket-item"
          :class="{ selected: selectedTicket && selectedTicket.id === ticket.id }"
          @click="selectTicket(ticket)"
        >
          <div class="ticket-info">
            <div class="ticket-name">
              {{ ticket.name }}
              <span v-for="badge in ticket.badges" :key="badge" class="ticket-badge">{{ badge }}</span>
            </div>
            <div class="ticket-desc">{{ ticket.description }}</div>
            <div class="ticket-includes">
              <span class="includes-label">包含：</span>
              <span v-for="item in ticket.includes" :key="item" class="include-item">{{ item }}</span>
            </div>
            <div class="ticket-notice" v-if="ticket.notice">
              <span class="notice-icon">⚠️</span>
              {{ ticket.notice }}
            </div>
          </div>
          <div class="ticket-price-section">
            <div class="ticket-price">
              <span class="original-price" v-if="ticket.originalPrice">¥{{ ticket.originalPrice }}</span>
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ ticket.price }}</span>
            </div>
            <div class="ticket-sold" v-if="ticket.soldCount">已售{{ ticket.soldCount }}+</div>
            <button 
              class="book-btn" 
              :class="{ selected: selectedTicket && selectedTicket.id === ticket.id }"
              @click.stop="toggleTicketSelection(ticket)"
            >
              {{ selectedTicket && selectedTicket.id === ticket.id ? '已选择' : '选择' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-section">
      <div class="section-title">
        <span class="title-text">用户点评</span>
        <span class="comment-count-header">{{ comments.length }}条点评</span>
      </div>
      <div class="comment-filter">
        <button 
          v-for="filter in commentFilters" 
          :key="filter.value"
          :class="['filter-btn', { active: currentFilter === filter.value }]"
          @click="selectCommentFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
      <div class="comment-list">
        <div v-for="comment in filteredComments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="user-avatar">{{ comment.userName.charAt(0) }}</div>
            <div class="user-info">
              <div class="user-name">{{ comment.userName }}</div>
              <div class="comment-date">{{ comment.date }}</div>
            </div>
            <div class="comment-score">
              <span class="score">{{ comment.score }}</span>
              <span class="score-unit">分</span>
            </div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-tags">
            <span v-for="tag in comment.tags" :key="tag" class="comment-tag">{{ tag }}</span>
          </div>
          <div v-if="comment.images && comment.images.length > 0" class="comment-images">
            <img 
              v-for="(img, index) in comment.images.slice(0, 3)" 
              :key="index" 
              :src="img" 
              class="comment-image"
            />
          </div>
        </div>
      </div>
      <div v-if="filteredComments.length === 0" class="no-comments">
        暂无符合条件的评价
      </div>
    </div>

    <div class="tips-section">
      <div class="section-title">
        <span class="title-text">景点须知</span>
      </div>
      <div class="tips-list">
        <div class="tip-group">
          <div class="tip-group-title">
            <span class="tip-icon">⏰</span>
            开放时间
          </div>
          <div class="tip-group-content">
            <p v-for="(time, index) in openingTimes" :key="index">{{ time }}</p>
          </div>
        </div>
        <div class="tip-group">
          <div class="tip-group-title">
            <span class="tip-icon">🎫</span>
            入园须知
          </div>
          <div class="tip-group-content">
            <ul>
              <li v-for="(item, index) in admissionTips" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>
        <div class="tip-group">
          <div class="tip-group-title">
            <span class="tip-icon">⚠️</span>
            温馨提示
          </div>
          <div class="tip-group-content">
            <ul>
              <li v-for="(tip, index) in warmTips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </div>
        <div class="tip-group">
          <div class="tip-group-title">
            <span class="tip-icon">🚫</span>
            禁止事项
          </div>
          <div class="tip-group-content">
            <ul>
              <li v-for="(item, index) in forbiddenItems" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTicket" class="bottom-bar">
      <div class="bottom-price">
        <div class="selected-ticket-name">{{ selectedTicket.name }}</div>
        <div class="selected-ticket-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ selectedTicket.price }}</span>
          <span class="price-unit">/人</span>
        </div>
      </div>
      <div class="ticket-quantity">
        <button class="qty-btn" @click="decreaseQuantity" :disabled="ticketQuantity <= 1">-</button>
        <span class="qty-value">{{ ticketQuantity }}</span>
        <button class="qty-btn" @click="increaseQuantity">+</button>
      </div>
      <button class="bottom-book-btn" @click="bookSelectedTicket">立即预订</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttractionDetail',
  data () {
    return {
      selectedTicket: null,
      ticketQuantity: 1,
      currentFilter: 'all',
      commentFilters: [
        { label: '全部', value: 'all' },
        { label: '好评', value: 'good' },
        { label: '中评', value: 'medium' },
        { label: '差评', value: 'bad' },
        { label: '有图', value: 'withImage' }
      ],
      scoreBreakdown: {
        scenery: 4.8,
        service: 4.6,
        value: 4.5,
        facility: 4.4
      },
      ticketPackages: [
        {
          id: 1,
          name: '成人票',
          description: '包含景区大门票，成人使用',
          badges: ['无需换票', '随时退'],
          includes: ['大门票', '免费讲解器'],
          notice: '请在有效期内使用',
          price: 60,
          originalPrice: 80,
          soldCount: 23456
        },
        {
          id: 2,
          name: '学生票',
          description: '全日制本科及以下学历学生使用，请携带有效学生证',
          badges: ['学生优惠', '随时退'],
          includes: ['大门票'],
          notice: '需出示有效学生证',
          price: 30,
          originalPrice: 40,
          soldCount: 12345
        },
        {
          id: 3,
          name: '亲子套票（1大1小）',
          description: '包含1张成人票+1张儿童票（儿童身高1.2米以下）',
          badges: ['推荐', '超值套餐'],
          includes: ['成人票×1', '儿童票×1', '亲子导览图'],
          notice: '儿童身高限1.2米以下',
          price: 80,
          originalPrice: 110,
          soldCount: 8765
        },
        {
          id: 4,
          name: '家庭套票（2大1小）',
          description: '包含2张成人票+1张儿童票',
          badges: ['家庭推荐', '最划算'],
          includes: ['成人票×2', '儿童票×1', '景区地图×2', '免费停车券'],
          notice: '儿童身高限1.2米以下',
          price: 130,
          originalPrice: 180,
          soldCount: 6543
        },
        {
          id: 5,
          name: 'VIP尊享套票',
          description: '包含大门票+VIP通道+专业导游讲解+观光车',
          badges: ['VIP服务', '免排队'],
          includes: ['大门票', 'VIP通道', '专业导游', '观光车', '专属休息区'],
          notice: 'VIP通道可免排队入园',
          price: 199,
          originalPrice: 299,
          soldCount: 3456
        }
      ],
      comments: [
        {
          id: 1,
          userName: '张先生',
          date: '2026-04-20',
          score: 5,
          content: '景点非常棒，景色优美，历史底蕴深厚。工作人员服务态度很好，讲解很专业。强烈推荐！',
          tags: ['景色优美', '服务好', '讲解专业'],
          images: [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20tourist%20attraction%20scenery%20photo&image_size=square'
          ]
        },
        {
          id: 2,
          userName: '李女士',
          date: '2026-04-18',
          score: 4,
          content: '整体还不错，就是节假日人太多了，建议错峰出行。景区设施完善，卫生也很好。',
          tags: ['设施完善', '卫生好'],
          images: []
        },
        {
          id: 3,
          userName: '王先生',
          date: '2026-04-15',
          score: 5,
          content: '带孩子来的，孩子玩得很开心，学到了很多历史知识。导游讲解生动有趣，非常推荐亲子游！',
          tags: ['适合亲子', '讲解好', '有教育意义'],
          images: [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20tour%20travel%20photo&image_size=square',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historical%20site%20tourist%20photo&image_size=square'
          ]
        },
        {
          id: 4,
          userName: '赵女士',
          date: '2026-04-10',
          score: 3,
          content: '门票价格有点贵，性价比一般。景区里面消费也偏高，建议自带水和零食。',
          tags: ['价格偏高'],
          images: []
        }
      ],
      openingTimes: [
        '旺季（4月1日-10月31日）：08:30-17:00',
        '淡季（11月1日-3月31日）：09:00-16:30',
        '最晚入园时间：闭园前1小时',
        '每周一闭馆（法定节假日除外）'
      ],
      admissionTips: [
        '请凭购票二维码入园，无需换票',
        '学生票、老年票需出示有效证件',
        '门票当日有效，出园后再入园需重新购票',
        '团队票请提前1天预约'
      ],
      warmTips: [
        '建议游览时间：3-4小时',
        '景区内有免费讲解器，可在入口处领取',
        '夏季炎热，建议做好防晒措施',
        '景区内有多处休息区，可随时休息',
        '建议穿舒适的鞋子，景区较大需要步行'
      ],
      forbiddenItems: [
        '禁止携带易燃易爆物品入园',
        '禁止携带宠物入园（导盲犬除外）',
        '禁止在景区内吸烟',
        '禁止攀爬文物古迹',
        '禁止在景区内乱涂乱画'
      ]
    }
  },
  computed: {
    attractionId () {
      return this.$route.params.attractionId
    },
    attractionName () {
      return this.$route.query.name || '景点名称'
    },
    attractionImage () {
      return this.$route.query.image || ''
    },
    attractionScore () {
      return this.$route.query.score || 4.5
    },
    attractionLocation () {
      return this.$route.query.location || '景点位置'
    },
    attractionDistance () {
      return this.$route.query.distance || '5.0'
    },
    attractionTags () {
      const tags = this.$route.query.tags
      return tags ? tags.split(',') : []
    },
    attractionPrice () {
      return this.$route.query.price || 0
    },
    attractionCommentCount () {
      return this.$route.query.commentCount || 0
    },
    attractionDescription () {
      return this.$route.query.description || '这是一处风景优美的旅游景点，拥有悠久的历史和独特的自然风光。景区内设施完善，服务周到，是休闲度假的绝佳选择。'
    },
    filteredComments () {
      if (this.currentFilter === 'all') {
        return this.comments
      } else if (this.currentFilter === 'good') {
        return this.comments.filter(c => c.score >= 4)
      } else if (this.currentFilter === 'medium') {
        return this.comments.filter(c => c.score === 3)
      } else if (this.currentFilter === 'bad') {
        return this.comments.filter(c => c.score <= 2)
      } else if (this.currentFilter === 'withImage') {
        return this.comments.filter(c => c.images && c.images.length > 0)
      }
      return this.comments
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    getScorePercent (score) {
      return (score / 5) * 100
    },
    openMapNavigation () {
      alert('正在打开地图导航...\n位置：' + this.attractionLocation)
    },
    copyAddress () {
      const address = this.attractionLocation
      alert('地址已复制到剪贴板：\n' + address)
    },
    selectCommentFilter (filterValue) {
      this.currentFilter = filterValue
    },
    selectTicket (ticket) {
      if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
        this.selectedTicket = null
      } else {
        this.selectedTicket = ticket
      }
    },
    toggleTicketSelection (ticket) {
      this.selectTicket(ticket)
    },
    decreaseQuantity () {
      if (this.ticketQuantity > 1) {
        this.ticketQuantity--
      }
    },
    increaseQuantity () {
      this.ticketQuantity++
    },
    bookSelectedTicket () {
      if (this.selectedTicket) {
        const totalPrice = this.selectedTicket.price * this.ticketQuantity
        alert(`预订 ${this.selectedTicket.name} × ${this.ticketQuantity} 张\n总价：¥${totalPrice}`)
      }
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.attraction-detail-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(140px)

  .header
    display: flex
    align-items: center
    justify-content: space-between
    padding: px2rem(20px)
    background-color: #fff
    position: fixed
    top: 0
    left: 0
    right: 0
    z-index: 100
    border-bottom: 1px solid #eee

    .back-btn, .share-btn
      width: px2rem(80px)
      height: px2rem(80px)
      display: flex
      align-items: center
      justify-content: center
      font-size: px2rem(40px)
      color: #333
      cursor: pointer

    .header-title
      font-size: px2rem(32px)
      font-weight: bold
      color: #333
      max-width: 60%
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap

  .attraction-banner
    position: relative
    margin-top: px2rem(120px)
    height: px2rem(400px)
    overflow: hidden

    .attraction-image
      width: 100%
      height: 100%
      object-fit: cover

    .attraction-info-overlay
      position: absolute
      bottom: 0
      left: 0
      right: 0
      padding: px2rem(30px) px2rem(20px)
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7))

      .attraction-name
        font-size: px2rem(40px)
        font-weight: bold
        color: #fff
        margin-bottom: px2rem(10px)

      .attraction-tags
        display: flex
        flex-wrap: wrap

        .tag
          font-size: px2rem(22px)
          color: #fff
          background-color: rgba(255, 255, 255, 0.3)
          padding: px2rem(6px) px2rem(16px)
          border-radius: px2rem(4px)
          margin-right: px2rem(10px)
          margin-bottom: px2rem(8px)

  .score-section
    background-color: #fff
    padding: px2rem(30px) px2rem(20px)
    margin-top: px2rem(20px)

    .score-info
      display: flex
      align-items: center
      margin-bottom: px2rem(30px)

      .score-value
        font-size: px2rem(60px)
        font-weight: bold
        color: #ff9800
        margin-right: px2rem(20px)

      .score-text
        .score-label
          font-size: px2rem(28px)
          color: #333
          font-weight: bold
          margin-bottom: px2rem(5px)

        .comment-count
          font-size: px2rem(24px)
          color: #999

    .score-breakdown
      .score-item
        display: flex
        align-items: center
        margin-bottom: px2rem(15px)

        .score-dimension
          width: px2rem(80px)
          font-size: px2rem(24px)
          color: #666

        .score-bar
          flex: 1
          height: px2rem(12px)
          background-color: #f0f0f0
          border-radius: px2rem(6px)
          margin: 0 px2rem(15px)
          overflow: hidden

          .score-fill
            height: 100%
            background-color: #ff9800
            border-radius: px2rem(6px)
            transition: width 0.3s

        .score-number
          width: px2rem(60px)
          font-size: px2rem(24px)
          color: #ff9800
          font-weight: bold

  .intro-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      margin-bottom: px2rem(15px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

    .intro-content
      font-size: px2rem(26px)
      color: #666
      line-height: 1.8

  .location-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      margin-bottom: px2rem(15px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

    .location-header
      display: flex
      align-items: center
      margin-bottom: px2rem(15px)

      .location-icon
        font-size: px2rem(40px)
        margin-right: px2rem(15px)

      .location-info
        .location-title
          font-size: px2rem(28px)
          color: #333
          font-weight: bold
          margin-bottom: px2rem(5px)

        .location-distance
          font-size: px2rem(24px)
          color: #999

    .map-container
      height: px2rem(240px)
      background-color: #e8f5e9
      border-radius: px2rem(10px)
      cursor: pointer
      position: relative
      overflow: hidden

      .map-placeholder
        width: 100%
        height: 100%
        position: relative
        background: linear-gradient(180deg, #c8e6c9 0%, #a5d6a7 100%)

        .map-pin
          position: absolute
          top: 30%
          left: 50%
          transform: translateX(-50%)
          font-size: px2rem(80px)

        .map-road
          position: absolute
          bottom: 20%
          left: 0
          right: 0
          display: flex
          align-items: center
          justify-content: center

          .road-line
            width: 80%
            height: px2rem(8px)
            background-color: rgba(255, 255, 255, 0.6)
            border-radius: px2rem(4px)

          .road-dot
            width: px2rem(16px)
            height: px2rem(16px)
            background-color: #ff6b00
            border-radius: 50%
            margin-left: -px2rem(30%)

        .map-overlay
          position: absolute
          bottom: 0
          left: 0
          right: 0
          padding: px2rem(20px)
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.3))
          text-align: center

          .map-text
            font-size: px2rem(26px)
            color: #fff

    .navigation-btns
      display: flex
      margin-top: px2rem(20px)

      .nav-btn
        flex: 1
        display: flex
        align-items: center
        justify-content: center
        padding: px2rem(20px)
        background-color: #f5f5f5
        border: none
        border-radius: px2rem(10px)
        font-size: px2rem(28px)
        color: #333
        cursor: pointer
        margin: 0 px2rem(10px)
        transition: all 0.3s

        &.primary
          background-color: #06c1ae
          color: #fff

        .nav-icon
          font-size: px2rem(36px)
          margin-right: px2rem(10px)

        &:first-child
          margin-left: 0

        &:last-child
          margin-right: 0

  .ticket-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: px2rem(20px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

      .ticket-count
        font-size: px2rem(24px)
        color: #999

    .ticket-list
      .ticket-item
        display: flex
        justify-content: space-between
        padding: px2rem(20px)
        border: 2px solid #eee
        border-radius: px2rem(12px)
        margin-bottom: px2rem(20px)
        cursor: pointer
        transition: all 0.3s

        &.selected
          border-color: #ff6b00
          background-color: rgba(255, 107, 0, 0.03)

        .ticket-info
          flex: 1
          margin-right: px2rem(20px)

          .ticket-name
            font-size: px2rem(30px)
            font-weight: bold
            color: #333
            margin-bottom: px2rem(10px)
            display: flex
            align-items: center
            flex-wrap: wrap

            .ticket-badge
              font-size: px2rem(20px)
              color: #ff6b00
              background-color: rgba(255, 107, 0, 0.1)
              padding: px2rem(4px) px2rem(12px)
              border-radius: px2rem(4px)
              margin-left: px2rem(10px)
              margin-bottom: px2rem(4px)
              font-weight: normal

          .ticket-desc
            font-size: px2rem(24px)
            color: #666
            margin-bottom: px2rem(12px)

          .ticket-includes
            font-size: px2rem(24px)
            color: #666
            margin-bottom: px2rem(10px)
            display: flex
            flex-wrap: wrap

            .includes-label
              color: #999

            .include-item
              color: #06c1ae
              margin-right: px2rem(10px)

              &:after
                content: '、'
                color: #666

              &:last-child:after
                content: ''

          .ticket-notice
            font-size: px2rem(22px)
            color: #ff6b00
            display: flex
            align-items: center

            .notice-icon
              margin-right: px2rem(5px)

        .ticket-price-section
          display: flex
          flex-direction: column
          align-items: flex-end
          justify-content: space-between
          min-width: px2rem(160px)

          .ticket-price
            display: flex
            align-items: baseline

            .original-price
              font-size: px2rem(24px)
              color: #999
              text-decoration: line-through
              margin-right: px2rem(10px)

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00

            .price-value
              font-size: px2rem(44px)
              font-weight: bold
              color: #ff6b00

          .ticket-sold
            font-size: px2rem(22px)
            color: #ff6b00
            margin-top: px2rem(5px)

          .book-btn
            padding: px2rem(12px) px2rem(30px)
            background-color: #ff6b00
            color: #fff
            border: none
            border-radius: px2rem(6px)
            font-size: px2rem(26px)
            cursor: pointer
            transition: all 0.3s
            margin-top: px2rem(10px)

            &.selected
              background-color: #e55a00

  .comments-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: px2rem(20px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

      .comment-count-header
        font-size: px2rem(24px)
        color: #999

    .comment-filter
      display: flex
      margin-bottom: px2rem(20px)
      overflow-x: auto

      .filter-btn
        padding: px2rem(10px) px2rem(20px)
        background-color: #f5f5f5
        border: none
        border-radius: px2rem(20px)
        font-size: px2rem(24px)
        color: #666
        cursor: pointer
        margin-right: px2rem(15px)
        white-space: nowrap

        &.active
          background-color: #06c1ae
          color: #fff

    .comment-list
      .comment-item
        padding: px2rem(20px) 0
        border-bottom: 1px solid #f0f0f0

        &:last-child
          border-bottom: none

        .comment-header
          display: flex
          align-items: center
          margin-bottom: px2rem(15px)

          .user-avatar
            width: px2rem(80px)
            height: px2rem(80px)
            background-color: #06c1ae
            border-radius: 50%
            display: flex
            align-items: center
            justify-content: center
            font-size: px2rem(36px)
            color: #fff
            margin-right: px2rem(15px)

          .user-info
            flex: 1

            .user-name
              font-size: px2rem(28px)
              color: #333
              font-weight: bold
              margin-bottom: px2rem(5px)

            .comment-date
              font-size: px2rem(22px)
              color: #999

          .comment-score
            .score
              font-size: px2rem(32px)
              color: #ff9800
              font-weight: bold

            .score-unit
              font-size: px2rem(22px)
              color: #999

        .comment-content
          font-size: px2rem(26px)
          color: #333
          line-height: 1.6
          margin-bottom: px2rem(15px)

        .comment-tags
          display: flex
          flex-wrap: wrap
          margin-bottom: px2rem(15px)

          .comment-tag
            font-size: px2rem(22px)
            color: #06c1ae
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(4px) px2rem(12px)
            border-radius: px2rem(4px)
            margin-right: px2rem(10px)
            margin-bottom: px2rem(8px)

        .comment-images
          display: flex
          margin-bottom: px2rem(15px)

          .comment-image
            width: px2rem(150px)
            height: px2rem(150px)
            border-radius: px2rem(8px)
            margin-right: px2rem(10px)
            object-fit: cover

    .no-comments
      text-align: center
      padding: px2rem(50px) 0
      font-size: px2rem(28px)
      color: #999

  .tips-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      margin-bottom: px2rem(20px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

    .tips-list
      .tip-group
        margin-bottom: px2rem(30px)

        &:last-child
          margin-bottom: 0

        .tip-group-title
          font-size: px2rem(28px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(15px)
          display: flex
          align-items: center

          .tip-icon
            font-size: px2rem(36px)
            margin-right: px2rem(10px)

        .tip-group-content
          font-size: px2rem(26px)
          color: #666
          line-height: 1.8

          p
            margin-bottom: px2rem(8px)

            &:last-child
              margin-bottom: 0

          ul
            padding-left: px2rem(30px)
            list-style: disc

            li
              margin-bottom: px2rem(8px)

              &:last-child
                margin-bottom: 0

  .bottom-bar
    position: fixed
    bottom: 0
    left: 0
    right: 0
    background-color: #fff
    padding: px2rem(15px) px2rem(20px)
    display: flex
    justify-content: space-between
    align-items: center
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1)
    z-index: 100

    .bottom-price
      .selected-ticket-name
        font-size: px2rem(24px)
        color: #333
        font-weight: bold
        margin-bottom: px2rem(5px)

      .selected-ticket-price
        display: flex
        align-items: baseline

        .price-symbol
          font-size: px2rem(24px)
          color: #ff6b00

        .price-value
          font-size: px2rem(44px)
          font-weight: bold
          color: #ff6b00

        .price-unit
          font-size: px2rem(24px)
          color: #666

    .ticket-quantity
      display: flex
      align-items: center
      margin: 0 px2rem(20px)

      .qty-btn
        width: px2rem(56px)
        height: px2rem(56px)
        border: 1px solid #ddd
        background-color: #fff
        border-radius: px2rem(8px)
        font-size: px2rem(32px)
        color: #333
        cursor: pointer
        display: flex
        align-items: center
        justify-content: center

        &:disabled
          color: #ccc
          cursor: not-allowed

      .qty-value
        font-size: px2rem(32px)
        font-weight: bold
        color: #333
        margin: 0 px2rem(20px)
        min-width: px2rem(60px)
        text-align: center

    .bottom-book-btn
      padding: px2rem(20px) px2rem(50px)
      background-color: #ff6b00
      color: #fff
      border: none
      border-radius: px2rem(10px)
      font-size: px2rem(30px)
      font-weight: bold
      cursor: pointer
</style>
