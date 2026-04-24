<template>
  <div class="index">
    <search></search>
    <city :scrollLetter="scrollLetter"></city>
    <datepicker></datepicker>
    <query-selector :scrollLetter="scrollLetter"></query-selector>
    <letter-selector
      :lettersConfig="lettersConfig"
      v-on:itemClick="letterItemClick"
      >
    </letter-selector>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">附近推荐</span>
        <span class="section-more" @click="goToHotelList('nearby')">更多 ></span>
      </div>
      <div class="hotel-grid">
        <div 
          v-for="hotel in nearbyHotels" 
          :key="hotel.id"
          class="hotel-card"
          @click="goToHotelDetail(hotel)"
        >
          <div class="hotel-card-image">
            <img :src="hotel.image" :alt="hotel.name" />
            <div class="hotel-card-tag" v-if="hotel.tag">{{ hotel.tag }}</div>
          </div>
          <div class="hotel-card-info">
            <div class="hotel-card-name">{{ hotel.name }}</div>
            <div class="hotel-card-location">{{ hotel.location }}</div>
            <div class="hotel-card-bottom">
              <div class="hotel-card-score">
                <span class="score-value">{{ hotel.score }}</span>
                <span class="score-text">分</span>
              </div>
              <div class="hotel-card-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ hotel.price }}</span>
                <span class="price-unit">起</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">特价酒店</span>
        <span class="section-more" @click="goToHotelList('special')">更多 ></span>
      </div>
      <div class="hotel-scroll">
        <div 
          v-for="hotel in specialHotels" 
          :key="hotel.id"
          class="special-hotel-card"
          @click="goToHotelDetail(hotel)"
        >
          <div class="special-hotel-image">
            <img :src="hotel.image" :alt="hotel.name" />
            <div class="special-badge">特价</div>
            <div class="discount-badge" v-if="hotel.discount">{{ hotel.discount }}折</div>
          </div>
          <div class="special-hotel-info">
            <div class="special-hotel-name">{{ hotel.name }}</div>
            <div class="special-hotel-location">{{ hotel.location }}</div>
            <div class="special-hotel-price">
              <span class="original-price" v-if="hotel.originalPrice">¥{{ hotel.originalPrice }}</span>
              <span class="current-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ hotel.price }}</span>
                <span class="price-unit">起</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">酒店团购</span>
        <span class="section-more" @click="goToHotelList('groupbuy')">更多 ></span>
      </div>
      <div class="groupbuy-grid">
        <div 
          v-for="item in groupbuyItems" 
          :key="item.id"
          class="groupbuy-card"
          @click="goToHotelDetail(item.hotel)"
        >
          <div class="groupbuy-image">
            <img :src="item.hotel.image" :alt="item.title" />
            <div class="groupbuy-badge">团购</div>
          </div>
          <div class="groupbuy-info">
            <div class="groupbuy-title">{{ item.title }}</div>
            <div class="groupbuy-desc">{{ item.description }}</div>
            <div class="groupbuy-price">
              <span class="groupbuy-current-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.price }}</span>
              </span>
              <span class="groupbuy-original-price" v-if="item.originalPrice">门市价 ¥{{ item.originalPrice }}</span>
              <span class="groupbuy-sold">{{ item.soldCount }}人已购</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <div class="section-header">
        <span class="section-title">酒店榜单</span>
        <span class="section-more" @click="goToHotelList('ranking')">更多 ></span>
      </div>
      <div class="ranking-tabs">
        <div 
          v-for="(tab, index) in rankingTabs" 
          :key="tab"
          class="ranking-tab"
          :class="{ active: activeRankingTab === index }"
          @click="switchRankingTab(index)"
        >
          {{ tab }}
        </div>
      </div>
      <div class="ranking-list">
        <div 
          v-for="(item, index) in currentRankingList" 
          :key="item.hotel.id"
          class="ranking-item"
          @click="goToHotelDetail(item.hotel)"
        >
          <div class="ranking-number" :class="{ top3: index < 3 }">{{ index + 1 }}</div>
          <div class="ranking-hotel-info">
            <div class="ranking-hotel-name">{{ item.hotel.name }}</div>
            <div class="ranking-hotel-desc">{{ item.description }}</div>
            <div class="ranking-hotel-tags">
              <span v-for="tag in item.hotel.tags.slice(0, 2)" :key="tag" class="ranking-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="ranking-score">
            <div class="score-value">{{ item.hotel.score }}</div>
            <div class="score-label">综合评分</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Search from '@/page/index/children/Search'
import City from '@/page/index/children/City/index'
import Datepicker from '@/page/index/children/Datepicker'
import QuerySelector from '@/common/QuerySelector/index'
import LetterSelector from '@/common/letterSelector'
import { mapState } from 'vuex'
export default {
  name: 'index',
  data () {
    return {
      scrollLetter: '',
      activeRankingTab: 0,
      rankingTabs: ['热门推荐', '好评优先', '低价优选', '豪华精选'],
      nearbyHotels: [
        {
          id: 101,
          name: '北京希尔顿酒店',
          location: '市中心 · 距地铁1号线500米',
          score: 4.8,
          price: 899,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20modern%20architecture%20daytime&image_size=square',
          tag: '豪华酒店'
        },
        {
          id: 102,
          name: '北京洲际酒店',
          location: '火车站附近 · 距北京站300米',
          score: 4.6,
          price: 688,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20hotel%20building%20entrance&image_size=square',
          tag: '商务优选'
        },
        {
          id: 103,
          name: '北京万豪酒店',
          location: '商业区 · 国贸CBD商圈',
          score: 4.9,
          price: 1299,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=upscale%20hotel%20lobby%20interior%20elegant&image_size=square',
          tag: '五星推荐'
        },
        {
          id: 104,
          name: '北京如家快捷酒店',
          location: '大学城 · 清华大学附近',
          score: 4.2,
          price: 299,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=budget%20hotel%20exterior%20simple%20clean&image_size=square',
          tag: '经济实惠'
        }
      ],
      specialHotels: [
        {
          id: 201,
          name: '北京香格里拉酒店',
          location: '市中心 · 中关村商圈',
          score: 4.7,
          price: 799,
          originalPrice: 998,
          discount: 8,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=five%20star%20hotel%20exterior%20luxury&image_size=square'
        },
        {
          id: 202,
          name: '北京威斯汀酒店',
          location: '商业区 · 三里屯商圈',
          score: 4.8,
          price: 999,
          originalPrice: 1188,
          discount: 8.5,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20hotel%20modern%20design%20exterior&image_size=square'
        },
        {
          id: 203,
          name: '北京7天连锁酒店',
          location: '机场附近 · 首都机场T3航站楼',
          score: 4.0,
          price: 159,
          originalPrice: 199,
          discount: 8,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=economy%20chain%20hotel%20building&image_size=square'
        },
        {
          id: 204,
          name: '北京汉庭酒店',
          location: '火车站附近 · 北京西站',
          score: 4.1,
          price: 199,
          originalPrice: 258,
          discount: 7.7,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=budget%20friendly%20hotel%20entrance&image_size=square'
        }
      ],
      groupbuyItems: [
        {
          id: 301,
          title: '豪华大床房1晚含双早',
          description: '周末通用 | 免费取消 | 含双人自助早餐',
          price: 599,
          originalPrice: 899,
          soldCount: 1234,
          hotel: {
            id: 101,
            name: '北京希尔顿酒店',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20modern%20architecture%20daytime&image_size=square',
            tags: ['豪华酒店', '含早餐']
          }
        },
        {
          id: 302,
          title: '标准双床房2晚套餐',
          description: '连住优惠 | 延迟退房 | 免费WiFi',
          price: 888,
          originalPrice: 1376,
          soldCount: 856,
          hotel: {
            id: 102,
            name: '北京洲际酒店',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20hotel%20building%20entrance&image_size=square',
            tags: ['商务酒店', '含早餐']
          }
        },
        {
          id: 303,
          title: '行政套房1晚尊享套餐',
          description: '行政酒廊礼遇 | 免费机场接送 | 双人晚餐',
          price: 1999,
          originalPrice: 2999,
          soldCount: 234,
          hotel: {
            id: 103,
            name: '北京万豪酒店',
            image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=upscale%20hotel%20lobby%20interior%20elegant&image_size=square',
            tags: ['豪华酒店', '行政酒廊']
          }
        }
      ],
      rankingData: [
        [
          { hotel: { id: 101, name: '北京希尔顿酒店', score: 4.8, tags: ['豪华酒店', '含早餐', '免费WiFi', '游泳池'] }, description: '市中心黄金地段，出行便利，设施完善' },
          { hotel: { id: 103, name: '北京万豪酒店', score: 4.9, tags: ['豪华酒店', '行政酒廊', '免费WiFi', '会议室'] }, description: '国贸CBD商圈，商务首选，服务一流' },
          { hotel: { id: 105, name: '北京香格里拉酒店', score: 4.7, tags: ['豪华酒店', '含早餐', 'SPA', '游泳池'] }, description: '中关村核心区域，环境优雅，适合商务出行' },
          { hotel: { id: 107, name: '北京威斯汀酒店', score: 4.8, tags: ['豪华酒店', '含早餐', '酒吧', '健身房'] }, description: '三里屯时尚商圈，年轻人喜爱，夜生活丰富' },
          { hotel: { id: 102, name: '北京洲际酒店', score: 4.6, tags: ['商务酒店', '含早餐', '免费停车', '健身房'] }, description: '火车站附近，交通便捷，适合短期出行' }
        ],
        [
          { hotel: { id: 103, name: '北京万豪酒店', score: 4.9, tags: ['豪华酒店', '行政酒廊', '免费WiFi', '会议室'] }, description: '好评如潮，服务贴心，环境优雅' },
          { hotel: { id: 101, name: '北京希尔顿酒店', score: 4.8, tags: ['豪华酒店', '含早餐', '免费WiFi', '游泳池'] }, description: '国际品牌，品质保证，值得信赖' },
          { hotel: { id: 107, name: '北京威斯汀酒店', score: 4.8, tags: ['豪华酒店', '含早餐', '酒吧', '健身房'] }, description: '设施新潮，服务周到，年轻人首选' },
          { hotel: { id: 105, name: '北京香格里拉酒店', score: 4.7, tags: ['豪华酒店', '含早餐', 'SPA', '游泳池'] }, description: '环境静谧，SPA体验一流，放松身心好去处' },
          { hotel: { id: 102, name: '北京洲际酒店', score: 4.6, tags: ['商务酒店', '含早餐', '免费停车', '健身房'] }, description: '商务配套完善，会议室充足，适合会议出差' }
        ],
        [
          { hotel: { id: 106, name: '北京7天连锁酒店', score: 4.0, tags: ['机场接送', '免费WiFi', '经济实惠'] }, description: '价格亲民，干净整洁，经济出行首选' },
          { hotel: { id: 108, name: '北京汉庭酒店', score: 4.1, tags: ['经济实惠', '免费WiFi', '24小时热水'] }, description: '连锁品牌，服务规范，性价比高' },
          { hotel: { id: 104, name: '北京如家快捷酒店', score: 4.2, tags: ['经济实惠', '免费WiFi', '24小时前台'] }, description: '位置优越，交通便利，适合学生党' },
          { hotel: { id: 102, name: '北京洲际酒店', score: 4.6, tags: ['商务酒店', '含早餐', '免费停车', '健身房'] }, description: '中档价位，高档享受，物超所值' },
          { hotel: { id: 105, name: '北京香格里拉酒店', score: 4.7, tags: ['豪华酒店', '含早餐', 'SPA', '游泳池'] }, description: '时常有优惠活动，豪华体验亲民价格' }
        ],
        [
          { hotel: { id: 103, name: '北京万豪酒店', score: 4.9, tags: ['豪华酒店', '行政酒廊', '免费WiFi', '会议室'] }, description: '顶级豪华，至尊体验，成功人士首选' },
          { hotel: { id: 101, name: '北京希尔顿酒店', score: 4.8, tags: ['豪华酒店', '含早餐', '免费WiFi', '游泳池'] }, description: '国际五星，奢华配置，尊享服务' },
          { hotel: { id: 105, name: '北京香格里拉酒店', score: 4.7, tags: ['豪华酒店', '含早餐', 'SPA', '游泳池'] }, description: '东方韵味与现代奢华完美结合' },
          { hotel: { id: 107, name: '北京威斯汀酒店', score: 4.8, tags: ['豪华酒店', '含早餐', '酒吧', '健身房'] }, description: '时尚豪华，活力四射，都市精英聚集地' },
          { hotel: { id: 110, name: '北京丽思卡尔顿酒店', score: 4.9, tags: ['顶级豪华', '私人管家', '米其林餐厅', 'SPA'] }, description: '极致奢华，私人定制，贵族般的体验' }
        ]
      ]
    }
  },
  computed: {
    ...mapState({
      lettersConfig: 'lettersConfig'
    }),
    currentRankingList () {
      return this.rankingData[this.activeRankingTab] || []
    }
  },
  methods: {
    letterItemClick (letter) {
      this.scrollLetter = letter
      console.log(letter)
    },
    switchRankingTab (index) {
      this.activeRankingTab = index
    },
    goToHotelList (type) {
      this.$router.push({
        path: '/hotel-list',
        query: {
          type: type
        }
      })
    },
    goToHotelDetail (hotel) {
      this.$router.push({
        name: 'HotelDetail',
        params: { hotelId: hotel.id },
        query: {
          hotelName: hotel.name,
          hotelImage: hotel.image,
          hotelScore: hotel.score,
          hotelLocation: hotel.location,
          hotelTags: hotel.tags ? hotel.tags.join(',') : '',
          hotelPrice: hotel.price
        }
      })
    }
  },
  components: {
    Search,
    City,
    Datepicker,
    QuerySelector,
    LetterSelector
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.index
  background-color: #f5f5f5
  padding-bottom: px2rem(20px)

.section-container
  background-color: #fff
  margin-top: px2rem(12px)
  padding: px2rem(20px) px2rem(16px)

  .section-header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: px2rem(25px)

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

  .hotel-grid
    display: grid
    grid-template-columns: repeat(2, 1fr)
    gap: px2rem(20px)

    .hotel-card
      background-color: #fff
      border-radius: px2rem(12px)
      overflow: hidden
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)
      cursor: pointer
      transition: transform 0.3s, box-shadow 0.3s

      &:hover
        transform: translateY(-4px)
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12)

      .hotel-card-image
        position: relative
        width: 100%
        height: px2rem(200px)
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover

        .hotel-card-tag
          position: absolute
          top: px2rem(12px)
          left: px2rem(12px)
          background-color: rgba(6, 193, 174, 0.9)
          color: #fff
          font-size: px2rem(22px)
          padding: px2rem(6px) px2rem(16px)
          border-radius: px2rem(4px)

      .hotel-card-info
        padding: px2rem(20px)

        .hotel-card-name
          font-size: px2rem(30px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .hotel-card-location
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(15px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .hotel-card-bottom
          display: flex
          justify-content: space-between
          align-items: flex-end

          .hotel-card-score
            .score-value
              font-size: px2rem(36px)
              font-weight: bold
              color: #ff9800

            .score-text
              font-size: px2rem(24px)
              color: #999

          .hotel-card-price
            display: flex
            align-items: baseline

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00
              margin-right: px2rem(4px)

            .price-value
              font-size: px2rem(44px)
              font-weight: bold
              color: #ff6b00

            .price-unit
              font-size: px2rem(24px)
              color: #666
              margin-left: px2rem(4px)

  .hotel-scroll
    display: flex
    overflow-x: auto
    padding-bottom: px2rem(10px)
    scrollbar-width: none
    -ms-overflow-style: none

    &::-webkit-scrollbar
      display: none

    .special-hotel-card
      flex-shrink: 0
      width: px2rem(320px)
      margin-right: px2rem(20px)
      background-color: #fff
      border-radius: px2rem(12px)
      overflow: hidden
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)
      cursor: pointer
      transition: transform 0.3s

      &:last-child
        margin-right: 0

      &:hover
        transform: translateY(-4px)

      .special-hotel-image
        position: relative
        width: 100%
        height: px2rem(220px)
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover

        .special-badge
          position: absolute
          top: px2rem(12px)
          left: px2rem(12px)
          background: linear-gradient(135deg, #ff6b00, #ff9800)
          color: #fff
          font-size: px2rem(22px)
          font-weight: bold
          padding: px2rem(6px) px2rem(20px)
          border-radius: px2rem(20px)

        .discount-badge
          position: absolute
          top: px2rem(12px)
          right: px2rem(12px)
          background-color: rgba(255, 107, 0, 0.9)
          color: #fff
          font-size: px2rem(24px)
          font-weight: bold
          padding: px2rem(8px) px2rem(16px)
          border-radius: px2rem(6px)

      .special-hotel-info
        padding: px2rem(20px)

        .special-hotel-name
          font-size: px2rem(30px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .special-hotel-location
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(15px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .special-hotel-price
          display: flex
          align-items: baseline
          flex-wrap: wrap

          .original-price
            font-size: px2rem(26px)
            color: #999
            text-decoration: line-through
            margin-right: px2rem(15px)

          .current-price
            display: flex
            align-items: baseline

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00
              margin-right: px2rem(4px)

            .price-value
              font-size: px2rem(44px)
              font-weight: bold
              color: #ff6b00

            .price-unit
              font-size: px2rem(24px)
              color: #666
              margin-left: px2rem(4px)

  .groupbuy-grid
    display: flex
    flex-direction: column
    gap: px2rem(20px)

    .groupbuy-card
      display: flex
      background-color: #fff
      border-radius: px2rem(12px)
      overflow: hidden
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)
      cursor: pointer
      transition: transform 0.3s

      &:hover
        transform: translateX(4px)

      .groupbuy-image
        position: relative
        width: px2rem(240px)
        height: px2rem(180px)
        flex-shrink: 0
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover

        .groupbuy-badge
          position: absolute
          top: px2rem(12px)
          left: px2rem(12px)
          background: linear-gradient(135deg, #e91e63, #f44336)
          color: #fff
          font-size: px2rem(22px)
          font-weight: bold
          padding: px2rem(6px) px2rem(20px)
          border-radius: px2rem(20px)

      .groupbuy-info
        flex: 1
        padding: px2rem(20px)
        display: flex
        flex-direction: column
        justify-content: space-between

        .groupbuy-title
          font-size: px2rem(30px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          display: -webkit-box
          -webkit-line-clamp: 2
          -webkit-box-orient: vertical
          overflow: hidden

        .groupbuy-desc
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(15px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .groupbuy-price
          display: flex
          align-items: baseline
          flex-wrap: wrap

          .groupbuy-current-price
            display: flex
            align-items: baseline
            margin-right: px2rem(15px)

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00
              margin-right: px2rem(4px)

            .price-value
              font-size: px2rem(48px)
              font-weight: bold
              color: #ff6b00

          .groupbuy-original-price
            font-size: px2rem(24px)
            color: #999
            margin-right: px2rem(15px)

          .groupbuy-sold
            font-size: px2rem(22px)
            color: #ff6b00

  .ranking-tabs
    display: flex
    background-color: #f8f8f8
    border-radius: px2rem(8px)
    padding: px2rem(8px)
    margin-bottom: px2rem(25px)
    overflow-x: auto

    .ranking-tab
      flex: 1
      min-width: px2rem(140px)
      text-align: center
      padding: px2rem(18px) px2rem(10px)
      font-size: px2rem(26px)
      color: #666
      border-radius: px2rem(6px)
      cursor: pointer
      transition: all 0.3s
      white-space: nowrap

      &.active
        background-color: #06c1ae
        color: #fff
        font-weight: bold

  .ranking-list
    display: flex
    flex-direction: column
    gap: px2rem(20px)

    .ranking-item
      display: flex
      align-items: center
      padding: px2rem(20px)
      background-color: #fafafa
      border-radius: px2rem(12px)
      cursor: pointer
      transition: background-color 0.3s

      &:hover
        background-color: #f0f9f8

      .ranking-number
        width: px2rem(60px)
        height: px2rem(60px)
        display: flex
        align-items: center
        justify-content: center
        font-size: px2rem(36px)
        font-weight: bold
        color: #999
        margin-right: px2rem(20px)
        flex-shrink: 0

        &.top3
          background: linear-gradient(135deg, #ff6b00, #ff9800)
          color: #fff
          border-radius: 50%

      .ranking-hotel-info
        flex: 1
        min-width: 0

        .ranking-hotel-name
          font-size: px2rem(32px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(8px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .ranking-hotel-desc
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(12px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .ranking-hotel-tags
          display: flex
          flex-wrap: wrap
          gap: px2rem(10px)

          .ranking-tag
            font-size: px2rem(22px)
            color: #06c1ae
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(6px) px2rem(14px)
            border-radius: px2rem(4px)

      .ranking-score
        text-align: right
        flex-shrink: 0
        margin-left: px2rem(20px)

        .score-value
          font-size: px2rem(40px)
          font-weight: bold
          color: #ff9800

        .score-label
          font-size: px2rem(22px)
          color: #999
</style>
