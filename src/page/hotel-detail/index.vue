<template>
  <div class="hotel-detail-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="header-title">{{ hotelName }}</div>
      <div class="share-btn">
        <span>⋮</span>
      </div>
    </div>

    <div class="hotel-banner">
      <img :src="hotelImage" :alt="hotelName" class="hotel-image" />
      <div class="hotel-info-overlay">
        <div class="hotel-name">{{ hotelName }}</div>
        <div class="hotel-tags">
          <span v-for="tag in hotelTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="score-section">
      <div class="score-info">
        <div class="score-value">{{ hotelScore }}</div>
        <div class="score-text">
          <div class="score-label">综合评分</div>
          <div class="comment-count">{{ hotelCommentCount }}条点评</div>
        </div>
      </div>
      <div class="score-breakdown">
        <div class="score-item">
          <span class="score-dimension">卫生</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(4.7) + '%' }"></div>
          </div>
          <span class="score-number">4.7</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">环境</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(4.8) + '%' }"></div>
          </div>
          <span class="score-number">4.8</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">服务</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(4.6) + '%' }"></div>
          </div>
          <span class="score-number">4.6</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">设施</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(4.5) + '%' }"></div>
          </div>
          <span class="score-number">4.5</span>
        </div>
      </div>
    </div>

    <div class="location-section">
      <div class="location-header">
        <div class="location-icon">📍</div>
        <div class="location-info">
          <div class="location-title">{{ hotelLocation }}</div>
          <div class="location-distance">距您约 5.2 公里</div>
        </div>
      </div>
      <div class="map-placeholder" @click="openMapNavigation">
        <div class="map-overlay">
          <div class="map-icon">🗺️</div>
          <div class="map-text">点击查看地图导航</div>
        </div>
      </div>
      <div class="navigation-btns">
        <button class="nav-btn" @click="openMapNavigation">
          <span class="nav-icon">🚗</span>
          <span class="nav-text">导航</span>
        </button>
        <button class="nav-btn" @click="callHotel">
          <span class="nav-icon">📞</span>
          <span class="nav-text">电话</span>
        </button>
      </div>
    </div>

    <div class="room-types-section">
      <div class="section-title">
        <span class="title-text">房型</span>
        <span class="room-count">共 {{ roomTypes.length }} 种房型</span>
      </div>
      <div class="room-list">
        <div 
          v-for="room in roomTypes" 
          :key="room.id" 
          class="room-item"
        >
          <div class="room-image">
            <img :src="room.image" :alt="room.name" />
          </div>
          <div class="room-info">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-size">{{ room.size }} | {{ room.bedType }}</div>
            <div class="room-facilities">
              <span v-for="facility in room.facilities" :key="facility" class="facility-tag">{{ facility }}</span>
            </div>
            <div class="room-bottom">
              <div class="room-price-info">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ room.price }}</span>
                <span class="price-unit">/晚</span>
              </div>
              <button class="book-btn" @click="bookRoom(room)">预订</button>
            </div>
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
          <div v-if="comment.reply" class="hotel-reply">
            <div class="reply-label">酒店回复：</div>
            <div class="reply-content">{{ comment.reply }}</div>
          </div>
        </div>
      </div>
      <div v-if="filteredComments.length === 0" class="no-comments">
        暂无符合条件的评价
      </div>
    </div>

    <div class="facilities-section">
      <div class="section-title">
        <span class="title-text">酒店设施</span>
      </div>
      <div class="facilities-grid">
        <div v-for="facility in hotelFacilities" :key="facility.name" class="facility-item">
          <div class="facility-icon">{{ facility.icon }}</div>
          <div class="facility-name">{{ facility.name }}</div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-price">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ hotelPrice }}</span>
        <span class="price-unit">起/晚</span>
      </div>
      <button class="bottom-book-btn" @click="bookHotel">立即预订</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HotelDetail',
  data () {
    return {
      currentFilter: 'all',
      commentFilters: [
        { label: '全部', value: 'all' },
        { label: '好评', value: 'good' },
        { label: '中评', value: 'medium' },
        { label: '差评', value: 'bad' },
        { label: '有图', value: 'withImage' }
      ],
      roomTypes: [
        {
          id: 1,
          name: '豪华大床房',
          size: '35㎡',
          bedType: '1.8米大床',
          facilities: ['免费WiFi', '空调', '迷你吧', '保险箱'],
          price: 899,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20room%20king%20bed%20elegant%20interior&image_size=square'
        },
        {
          id: 2,
          name: '标准双床房',
          size: '30㎡',
          bedType: '1.2米双床',
          facilities: ['免费WiFi', '空调', '电视', '吹风机'],
          price: 688,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=standard%20hotel%20room%20twin%20beds%20clean%20modern&image_size=square'
        },
        {
          id: 3,
          name: '行政套房',
          size: '60㎡',
          bedType: '2米特大床',
          facilities: ['免费WiFi', '空调', '客厅', '浴缸', '行政酒廊'],
          price: 1599,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=executive%20suite%20hotel%20room%20luxury%20living%20area&image_size=square'
        }
      ],
      comments: [
        {
          id: 1,
          userName: '张先生',
          date: '2026-04-20',
          score: 5,
          content: '酒店位置很好，房间干净整洁，服务态度也很棒。早餐很丰富，种类很多。下次还会再来！',
          tags: ['位置好', '服务好', '早餐棒'],
          images: [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20photo&image_size=square'
          ],
          reply: '感谢您的好评！我们会继续努力为您提供优质服务，期待您的再次光临！'
        },
        {
          id: 2,
          userName: '李女士',
          date: '2026-04-18',
          score: 4,
          content: '整体还不错，就是房间有点小，其他都很满意。游泳池水质很好，人也不多。',
          tags: ['设施全', '环境好'],
          images: [],
          reply: null
        },
        {
          id: 3,
          userName: '王先生',
          date: '2026-04-15',
          score: 5,
          content: '出差住的，位置方便，离地铁站很近。房间隔音效果好，晚上睡得很安静。前台服务很专业。',
          tags: ['位置好', '服务好', '安静'],
          images: [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20lobby%20modern%20design&image_size=square',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20bedroom%20cozy%20comfortable&image_size=square'
          ],
          reply: '感谢您的认可！我们酒店位于市中心，交通便利，是商务出行的理想选择。期待您的再次光临！'
        },
        {
          id: 4,
          userName: '赵女士',
          date: '2026-04-10',
          score: 3,
          content: '价格有点贵，性价比一般。房间设施有点旧了，不过卫生情况还可以。',
          tags: ['卫生好'],
          images: [],
          reply: null
        }
      ],
      hotelFacilities: [
        { name: '免费WiFi', icon: '📶' },
        { name: '停车场', icon: '🅿️' },
        { name: '游泳池', icon: '🏊' },
        { name: '健身房', icon: '🏋️' },
        { name: '餐厅', icon: '🍽️' },
        { name: '酒吧', icon: '🍸' },
        { name: 'SPA', icon: '💆' },
        { name: '会议室', icon: '🗣️' },
        { name: '24小时前台', icon: '⏰' },
        { name: '行李寄存', icon: '🧳' },
        { name: '洗衣服务', icon: '🧺' },
        { name: '叫醒服务', icon: '🔔' }
      ]
    }
  },
  computed: {
    hotelId () {
      return this.$route.params.hotelId
    },
    hotelName () {
      return this.$route.query.hotelName || '酒店名称'
    },
    hotelImage () {
      return this.$route.query.hotelImage || ''
    },
    hotelScore () {
      return this.$route.query.hotelScore || 4.5
    },
    hotelLocation () {
      return this.$route.query.hotelLocation || '酒店位置'
    },
    hotelTags () {
      const tags = this.$route.query.hotelTags
      return tags ? tags.split(',') : []
    },
    hotelPrice () {
      return this.$route.query.hotelPrice || 500
    },
    hotelCommentCount () {
      return this.$route.query.hotelCommentCount || 100
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
      alert('正在打开地图导航...')
    },
    callHotel () {
      alert('正在拨打酒店电话...')
    },
    selectCommentFilter (filterValue) {
      this.currentFilter = filterValue
    },
    bookRoom (room) {
      alert(`预订 ${room.name}，价格 ¥${room.price}/晚`)
    },
    bookHotel () {
      alert('正在跳转到预订页面...')
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.hotel-detail-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(120px)

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

  .hotel-banner
    position: relative
    margin-top: px2rem(120px)
    height: px2rem(400px)
    overflow: hidden

    .hotel-image
      width: 100%
      height: 100%
      object-fit: cover

    .hotel-info-overlay
      position: absolute
      bottom: 0
      left: 0
      right: 0
      padding: px2rem(30px) px2rem(20px)
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7))

      .hotel-name
        font-size: px2rem(40px)
        font-weight: bold
        color: #fff
        margin-bottom: px2rem(10px)

      .hotel-tags
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

  .location-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

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

    .map-placeholder
      height: px2rem(200px)
      background-color: #e8f5e9
      border-radius: px2rem(10px)
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer
      position: relative
      overflow: hidden

      .map-overlay
        display: flex
        flex-direction: column
        align-items: center

        .map-icon
          font-size: px2rem(60px)
          margin-bottom: px2rem(10px)

        .map-text
          font-size: px2rem(26px)
          color: #666

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

        .nav-icon
          font-size: px2rem(36px)
          margin-right: px2rem(10px)

        &:first-child
          margin-left: 0

        &:last-child
          margin-right: 0

  .room-types-section
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

      .room-count
        font-size: px2rem(24px)
        color: #999

    .room-list
      .room-item
        display: flex
        padding: px2rem(20px)
        border: 1px solid #eee
        border-radius: px2rem(10px)
        margin-bottom: px2rem(20px)
        cursor: pointer

        .room-image
          width: px2rem(200px)
          height: px2rem(150px)
          border-radius: px2rem(8px)
          overflow: hidden
          margin-right: px2rem(20px)

          img
            width: 100%
            height: 100%
            object-fit: cover

        .room-info
          flex: 1
          display: flex
          flex-direction: column

          .room-name
            font-size: px2rem(30px)
            font-weight: bold
            color: #333
            margin-bottom: px2rem(8px)

          .room-size
            font-size: px2rem(24px)
            color: #666
            margin-bottom: px2rem(10px)

          .room-facilities
            display: flex
            flex-wrap: wrap
            margin-bottom: px2rem(15px)

            .facility-tag
              font-size: px2rem(20px)
              color: #666
              background-color: #f0f0f0
              padding: px2rem(4px) px2rem(12px)
              border-radius: px2rem(4px)
              margin-right: px2rem(8px)
              margin-bottom: px2rem(6px)

          .room-bottom
            display: flex
            justify-content: space-between
            align-items: center
            margin-top: auto

            .room-price-info
              .price-symbol
                font-size: px2rem(24px)
                color: #ff6b00

              .price-value
                font-size: px2rem(40px)
                font-weight: bold
                color: #ff6b00

              .price-unit
                font-size: px2rem(24px)
                color: #666

            .book-btn
              padding: px2rem(12px) px2rem(30px)
              background-color: #ff6b00
              color: #fff
              border: none
              border-radius: px2rem(6px)
              font-size: px2rem(26px)
              cursor: pointer

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

        .hotel-reply
          background-color: #f9f9f9
          padding: px2rem(15px)
          border-radius: px2rem(8px)

          .reply-label
            font-size: px2rem(24px)
            color: #06c1ae
            font-weight: bold
            margin-bottom: px2rem(8px)

          .reply-content
            font-size: px2rem(24px)
            color: #666
            line-height: 1.5

    .no-comments
      text-align: center
      padding: px2rem(50px) 0
      font-size: px2rem(28px)
      color: #999

  .facilities-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      margin-bottom: px2rem(20px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

    .facilities-grid
      display: grid
      grid-template-columns: repeat(4, 1fr)
      gap: px2rem(20px)

      .facility-item
        display: flex
        flex-direction: column
        align-items: center
        padding: px2rem(20px)

        .facility-icon
          font-size: px2rem(50px)
          margin-bottom: px2rem(10px)

        .facility-name
          font-size: px2rem(24px)
          color: #333
          text-align: center

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

    .bottom-book-btn
      padding: px2rem(20px) px2rem(60px)
      background-color: #ff6b00
      color: #fff
      border: none
      border-radius: px2rem(10px)
      font-size: px2rem(30px)
      font-weight: bold
      cursor: pointer
</style>
