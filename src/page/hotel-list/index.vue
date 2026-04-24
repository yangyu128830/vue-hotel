<template>
  <div class="hotel-list-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="header-title" @click="openDatePicker">
        <div class="city-name">{{ cityName }}</div>
        <div class="date-info">
          {{ checkinDate }} 至 {{ checkoutDate }} · {{ checkDays }}晚
          <span class="arrow">▼</span>
        </div>
      </div>
      <div class="search-icon" @click="toggleSearchBox">
        <span>🔍</span>
      </div>
    </div>

    <div class="search-box" v-show="showSearchBox">
      <input 
        type="text" 
        v-model="searchKeyword" 
        placeholder="搜索酒店名称" 
        class="search-input"
        @input="searchHotelByName"
      />
      <button class="cancel-btn" @click="cancelSearch">取消</button>
    </div>

    <div class="filter-bar">
      <div class="filter-item" @click="toggleSortDropdown">
        <span :class="{ active: sortBy !== '' }">价格排序</span>
        <span class="arrow" :class="{ up: showSortDropdown }">▼</span>
      </div>
      <div class="filter-item" @click="toggleLocationDropdown">
        <span :class="{ active: selectedLocation !== '' }">附近地点</span>
        <span class="arrow" :class="{ up: showLocationDropdown }">▼</span>
      </div>
    </div>

    <div class="sort-dropdown" v-show="showSortDropdown">
      <div 
        class="sort-option" 
        :class="{ active: sortBy === 'default' }" 
        @click="selectSort('default')"
      >
        默认排序
      </div>
      <div 
        class="sort-option" 
        :class="{ active: sortBy === 'price-asc' }" 
        @click="selectSort('price-asc')"
      >
        价格从低到高
      </div>
      <div 
        class="sort-option" 
        :class="{ active: sortBy === 'price-desc' }" 
        @click="selectSort('price-desc')"
      >
        价格从高到低
      </div>
    </div>

    <div class="location-dropdown" v-show="showLocationDropdown">
      <div 
        class="location-option" 
        :class="{ active: selectedLocation === '' }" 
        @click="selectLocation('')"
      >
        全部
      </div>
      <div 
        v-for="location in nearbyLocations" 
        :key="location.id"
        class="location-option" 
        :class="{ active: selectedLocation === location.id }" 
        @click="selectLocation(location.id)"
      >
        {{ location.name }}
      </div>
    </div>

    <div class="hotel-list">
      <div 
        v-for="hotel in filteredHotels" 
        :key="hotel.id" 
        class="hotel-item"
      >
        <div class="hotel-image">
          <img :src="hotel.image" :alt="hotel.name" />
        </div>
        <div class="hotel-info">
          <div class="hotel-name">{{ hotel.name }}</div>
          <div class="hotel-location">{{ hotel.location }}</div>
          <div class="hotel-tags">
            <span v-for="tag in hotel.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="hotel-bottom">
            <div class="hotel-score">
              <span class="score-value">{{ hotel.score }}</span>
              <span class="score-text">分</span>
              <span class="comment-count">{{ hotel.commentCount }}条点评</span>
            </div>
            <div class="hotel-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ hotel.price }}</span>
              <span class="price-unit">起</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="no-result" v-show="filteredHotels.length === 0">
      <div class="no-result-icon">🏨</div>
      <div class="no-result-text">暂无符合条件的酒店</div>
    </div>

    <div v-show="showDatePicker" class="date-picker-overlay">
      <calender 
        :date="currentDate" 
        :monthNumber="4" 
        v-on:asureEvent="onDateSelected" 
        :onlyOne="roomType === 1 ? false : true"
        :isShowDatePicker="showDatePicker"
      ></calender>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'
import Calender from '@/common/calender'

export default {
  name: 'HotelList',
  data () {
    return {
      showSearchBox: false,
      searchKeyword: '',
      showSortDropdown: false,
      showLocationDropdown: false,
      showDatePicker: false,
      sortBy: '',
      selectedLocation: '',
      localCheckinDate: '',
      localCheckoutDate: '',
      nearbyLocations: [
        { id: 'center', name: '市中心' },
        { id: 'railway', name: '火车站' },
        { id: 'airport', name: '机场' },
        { id: 'business', name: '商业区' },
        { id: 'university', name: '大学城' }
      ],
      hotels: [
        {
          id: 1,
          name: '北京希尔顿酒店',
          location: '市中心 · 距地铁1号线500米',
          tags: ['豪华酒店', '含早餐', '免费WiFi', '游泳池'],
          score: 4.8,
          commentCount: 2345,
          price: 899,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20modern%20architecture%20daytime&image_size=square',
          locationArea: 'center'
        },
        {
          id: 2,
          name: '北京洲际酒店',
          location: '火车站附近 · 距北京站300米',
          tags: ['商务酒店', '含早餐', '免费停车', '健身房'],
          score: 4.6,
          commentCount: 1876,
          price: 688,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20hotel%20building%20entrance&image_size=square',
          locationArea: 'railway'
        },
        {
          id: 3,
          name: '北京万豪酒店',
          location: '商业区 · 国贸CBD商圈',
          tags: ['豪华酒店', '行政酒廊', '免费WiFi', '会议室'],
          score: 4.9,
          commentCount: 3456,
          price: 1299,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=upscale%20hotel%20lobby%20interior%20elegant&image_size=square',
          locationArea: 'business'
        },
        {
          id: 4,
          name: '北京如家快捷酒店',
          location: '大学城 · 清华大学附近',
          tags: ['经济实惠', '免费WiFi', '24小时前台'],
          score: 4.2,
          commentCount: 987,
          price: 299,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=budget%20hotel%20exterior%20simple%20clean&image_size=square',
          locationArea: 'university'
        },
        {
          id: 5,
          name: '北京香格里拉酒店',
          location: '市中心 · 中关村商圈',
          tags: ['豪华酒店', '含早餐', 'SPA', '游泳池'],
          score: 4.7,
          commentCount: 2156,
          price: 998,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=five%20star%20hotel%20exterior%20luxury&image_size=square',
          locationArea: 'center'
        },
        {
          id: 6,
          name: '北京7天连锁酒店',
          location: '机场附近 · 首都机场T3航站楼',
          tags: ['机场接送', '免费WiFi', '经济实惠'],
          score: 4.0,
          commentCount: 654,
          price: 199,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=economy%20chain%20hotel%20building&image_size=square',
          locationArea: 'airport'
        },
        {
          id: 7,
          name: '北京威斯汀酒店',
          location: '商业区 · 三里屯商圈',
          tags: ['豪华酒店', '含早餐', '酒吧', '健身房'],
          score: 4.8,
          commentCount: 2789,
          price: 1188,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20hotel%20modern%20design%20exterior&image_size=square',
          locationArea: 'business'
        },
        {
          id: 8,
          name: '北京汉庭酒店',
          location: '火车站附近 · 北京西站',
          tags: ['经济实惠', '免费WiFi', '24小时热水'],
          score: 4.1,
          commentCount: 876,
          price: 258,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=budget%20friendly%20hotel%20entrance&image_size=square',
          locationArea: 'railway'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      city: 'city',
      checkinDateStore: 'checkinDate',
      checkoutDateStore: 'checkoutDate',
      roomType: 'roomType'
    }),
    cityName () {
      return this.$route.query.cityName || this.city.cityName || '北京'
    },
    checkinDate () {
      return this.localCheckinDate || this.$route.query.checkinDate || this.checkinDateStore || '2026-04-24'
    },
    checkoutDate () {
      return this.localCheckoutDate || this.$route.query.checkoutDate || this.checkoutDateStore || '2026-04-25'
    },
    checkDays () {
      return (moment(this.checkoutDate).format('X') - moment(this.checkinDate).format('X')) / (24 * 60 * 60)
    },
    currentDate () {
      return new Date(this.checkinDate)
    },
    filteredHotels () {
      let result = [...this.hotels]

      if (this.searchKeyword) {
        result = result.filter(hotel =>
          hotel.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }

      if (this.selectedLocation) {
        result = result.filter(hotel => hotel.locationArea === this.selectedLocation)
      }

      if (this.sortBy === 'price-asc') {
        result.sort((a, b) => a.price - b.price)
      } else if (this.sortBy === 'price-desc') {
        result.sort((a, b) => b.price - a.price)
      }

      return result
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    toggleSearchBox () {
      this.showSearchBox = !this.showSearchBox
      if (!this.showSearchBox) {
        this.searchKeyword = ''
      }
    },
    searchHotelByName () {
    },
    cancelSearch () {
      this.showSearchBox = false
      this.searchKeyword = ''
    },
    toggleSortDropdown () {
      this.showSortDropdown = !this.showSortDropdown
      this.showLocationDropdown = false
      this.showDatePicker = false
    },
    toggleLocationDropdown () {
      this.showLocationDropdown = !this.showLocationDropdown
      this.showSortDropdown = false
      this.showDatePicker = false
    },
    selectSort (sortType) {
      this.sortBy = sortType
      this.showSortDropdown = false
    },
    selectLocation (locationId) {
      this.selectedLocation = locationId
      this.showLocationDropdown = false
    },
    openDatePicker () {
      this.showDatePicker = !this.showDatePicker
      this.showSortDropdown = false
      this.showLocationDropdown = false
    },
    onDateSelected (chooseDate) {
      this.showDatePicker = false
      this.localCheckinDate = chooseDate.startDate.format
      if (chooseDate.endDate && chooseDate.endDate.format) {
        this.localCheckoutDate = chooseDate.endDate.format
      }
    }
  },
  components: {
    Calender
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.hotel-list-page
  min-height: 100vh
  background-color: #f5f5f5

  .header
    display: flex
    align-items: center
    padding: px2rem(20px)
    background-color: #fff
    border-bottom: 1px solid #eee
    position: relative

    .back-btn
      width: px2rem(80px)
      height: px2rem(80px)
      display: flex
      align-items: center
      justify-content: center
      font-size: px2rem(40px)
      color: #333
      cursor: pointer

    .header-title
      flex: 1
      text-align: center
      cursor: pointer

      .city-name
        font-size: px2rem(36px)
        font-weight: bold
        color: #333

      .date-info
        font-size: px2rem(24px)
        color: #666
        margin-top: px2rem(5px)
        display: flex
        align-items: center
        justify-content: center

        .arrow
          margin-left: px2rem(10px)
          font-size: px2rem(20px)
          transition: transform 0.3s

    .search-icon
      width: px2rem(80px)
      height: px2rem(80px)
      display: flex
      align-items: center
      justify-content: center
      font-size: px2rem(36px)
      cursor: pointer

  .search-box
    display: flex
    align-items: center
    padding: px2rem(20px)
    background-color: #fff
    border-bottom: 1px solid #eee

    .search-input
      flex: 1
      height: px2rem(70px)
      padding: 0 px2rem(20px)
      border: 1px solid #ddd
      border-radius: px2rem(35px)
      font-size: px2rem(28px)
      outline: none

      &:focus
        border-color: #06c1ae

    .cancel-btn
      margin-left: px2rem(20px)
      font-size: px2rem(28px)
      color: #06c1ae
      background: none
      border: none
      cursor: pointer

  .filter-bar
    display: flex
    background-color: #fff
    border-bottom: 1px solid #eee

    .filter-item
      flex: 1
      display: flex
      align-items: center
      justify-content: center
      padding: px2rem(25px) 0
      font-size: px2rem(28px)
      color: #666
      cursor: pointer
      position: relative

      span.active
        color: #06c1ae

      .arrow
        margin-left: px2rem(10px)
        font-size: px2rem(20px)
        transition: transform 0.3s

        &.up
          transform: rotate(180deg)

  .sort-dropdown, .location-dropdown
    background-color: #fff
    border-bottom: 1px solid #eee
    padding: px2rem(10px) 0

    .sort-option, .location-option
      padding: px2rem(25px) px2rem(40px)
      font-size: px2rem(28px)
      color: #333
      cursor: pointer

      &.active
        color: #06c1ae
        background-color: rgba(6, 193, 174, 0.1)

  .hotel-list
    padding: px2rem(20px)

    .hotel-item
      display: flex
      background-color: #fff
      border-radius: px2rem(10px)
      margin-bottom: px2rem(20px)
      overflow: hidden
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)

      .hotel-image
        width: px2rem(240px)
        height: px2rem(180px)
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover

      .hotel-info
        flex: 1
        padding: px2rem(20px)
        display: flex
        flex-direction: column

        .hotel-name
          font-size: px2rem(32px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .hotel-location
          font-size: px2rem(24px)
          color: #666
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .hotel-tags
          display: flex
          flex-wrap: wrap
          margin-bottom: px2rem(15px)

          .tag
            font-size: px2rem(22px)
            color: #06c1ae
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(5px) px2rem(15px)
            border-radius: px2rem(4px)
            margin-right: px2rem(10px)
            margin-bottom: px2rem(8px)

        .hotel-bottom
          display: flex
          justify-content: space-between
          align-items: flex-end
          margin-top: auto

          .hotel-score
            display: flex
            align-items: baseline

            .score-value
              font-size: px2rem(32px)
              font-weight: bold
              color: #ff9800

            .score-text
              font-size: px2rem(24px)
              color: #666
              margin-left: px2rem(5px)

            .comment-count
              font-size: px2rem(22px)
              color: #999
              margin-left: px2rem(10px)

          .hotel-price
            display: flex
            align-items: baseline

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00
              margin-right: px2rem(5px)

            .price-value
              font-size: px2rem(40px)
              font-weight: bold
              color: #ff6b00

            .price-unit
              font-size: px2rem(24px)
              color: #666
              margin-left: px2rem(5px)

  .no-result
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    padding: px2rem(100px) 0

    .no-result-icon
      font-size: px2rem(120px)
      margin-bottom: px2rem(30px)

    .no-result-text
      font-size: px2rem(32px)
      color: #999

  .date-picker-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    z-index: 9999
</style>
