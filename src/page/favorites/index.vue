<template>
  <div class="favorites-page">
    <div class="search-header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="search-section">
        <div class="search-icon-inline">🔍</div>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索收藏的美食、酒店" 
          class="search-input-inline"
          @keyup.enter="doSearch"
        />
        <div class="search-clear-btn" v-show="searchKeyword" @click="clearSearch">✕</div>
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
        <span class="tab-count" v-if="getTabCount(tab.id) > 0">({{ getTabCount(tab.id) }})</span>
      </div>
    </div>

    <div class="favorites-list" v-show="filteredFavorites.length > 0">
      <div 
        v-for="item in filteredFavorites" 
        :key="item.id"
        class="favorite-item"
      >
        <div class="item-image">
          <img :src="item.image" :alt="item.name" />
          <div class="item-type-badge" :class="item.type">
            {{ item.type === 'food' ? '美食' : '酒店' }}
          </div>
        </div>
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-rating">
            <span class="rating-value">{{ item.rating }}</span>
            <span class="rating-count">({{ item.ratingCount }}条点评)</span>
          </div>
          <div class="item-location">
            <span class="location-icon">📍</span>
            <span>{{ item.location }}</span>
          </div>
          <div class="item-tags">
            <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="item-tag">{{ tag }}</span>
          </div>
          <div class="item-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ item.price }}</span>
            <span class="price-unit" v-if="item.type === 'hotel'">起/晚</span>
            <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="action-btn view-btn" @click="viewDetail(item)">
            查看详情
          </button>
          <button class="action-btn remove-btn" @click="removeFavorite(item)">
            取消收藏
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-show="filteredFavorites.length === 0 && searchKeyword === ''">
      <div class="empty-icon">💝</div>
      <div class="empty-text">暂无收藏</div>
      <div class="empty-tip">去发现更多{{ currentCategoryName }}吧</div>
      <button class="go-explore-btn" @click="goExplore">
        去逛逛
      </button>
    </div>

    <div class="empty-state" v-show="filteredFavorites.length === 0 && searchKeyword !== ''">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">未找到相关收藏</div>
      <div class="empty-tip">试试其他关键词</div>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FavoritesPage',
  data () {
    return {
      searchKeyword: '',
      activeCategoryTab: 0,
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅',
      categoryTabs: [
        { id: 'all', name: '全部' },
        { id: 'food', name: '美食' },
        { id: 'hotel', name: '酒店' }
      ],
      favorites: [
        {
          id: 101,
          name: '老北京火锅',
          type: 'food',
          rating: 4.8,
          ratingCount: 2345,
          price: 88,
          originalPrice: 128,
          location: '朝阳区 · 三里屯',
          tags: ['火锅', '老北京', '人气推荐'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20hotpot%20restaurant%20delicious%20food%20beef%20lamb%20slices&image_size=square',
          favoritedAt: '2024-03-15 18:30'
        },
        {
          id: 201,
          name: '北京王府半岛酒店',
          type: 'hotel',
          rating: 4.9,
          ratingCount: 5678,
          price: 1288,
          originalPrice: 1588,
          location: '东城区 · 王府井',
          tags: ['五星级', '豪华', '交通便利'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20five%20star%20hotel%20lobby%20elegant%20interior%20design&image_size=square',
          favoritedAt: '2024-03-10 10:20'
        },
        {
          id: 102,
          name: '喜茶 HEYTEA',
          type: 'food',
          rating: 4.9,
          ratingCount: 3456,
          price: 25,
          originalPrice: 30,
          location: '朝阳区 · 太古里',
          tags: ['奶茶', '网红店', '下午茶'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bubble%20tea%20milk%20tea%20drink%20tapioca%20pearls%20refreshing&image_size=square',
          favoritedAt: '2024-03-08 14:15'
        },
        {
          id: 202,
          name: '洲际酒店',
          type: 'hotel',
          rating: 4.7,
          ratingCount: 3456,
          price: 888,
          originalPrice: 1088,
          location: '朝阳区 · CBD',
          tags: ['商务', '会议', '健身房'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20hotel%20exterior%20city%20view%20contemporary%20architecture&image_size=square',
          favoritedAt: '2024-03-05 09:45'
        },
        {
          id: 103,
          name: '海底捞火锅',
          type: 'food',
          rating: 4.9,
          ratingCount: 8901,
          price: 158,
          originalPrice: 198,
          location: '朝阳区 · 西单',
          tags: ['火锅', '服务好', '品牌连锁'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=haidilao%20hotpot%20chinese%20fondue%20meat%20vegetables%20delicious&image_size=square',
          favoritedAt: '2024-02-28 19:20'
        },
        {
          id: 104,
          name: '一点点奶茶',
          type: 'food',
          rating: 4.8,
          ratingCount: 5678,
          price: 18,
          originalPrice: 22,
          location: '朝阳区 · 工体',
          tags: ['奶茶', '饮品', '实惠'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bubble%20tea%20milk%20green%20tea%20tapioca%20refreshing%20drink&image_size=square',
          favoritedAt: '2024-02-20 15:30'
        },
        {
          id: 203,
          name: '希尔顿酒店',
          type: 'hotel',
          rating: 4.6,
          ratingCount: 2345,
          price: 688,
          originalPrice: 888,
          location: '海淀区 · 中关村',
          tags: ['舒适', '性价比高', '早餐丰富'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hilton%20hotel%20interior%20comfortable%20room%20modern%20furniture&image_size=square',
          favoritedAt: '2024-02-15 11:00'
        }
      ]
    }
  },
  computed: {
    currentCategoryName () {
      if (this.activeCategoryTab === 0) return '美食和酒店'
      if (this.activeCategoryTab === 1) return '美食'
      return '酒店'
    },
    filteredFavorites () {
      let result = [...this.favorites]

      if (this.activeCategoryTab === 1) {
        result = result.filter(item => item.type === 'food')
      } else if (this.activeCategoryTab === 2) {
        result = result.filter(item => item.type === 'hotel')
      }

      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(item =>
          item.name.toLowerCase().includes(keyword) ||
          item.location.toLowerCase().includes(keyword) ||
          item.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
      }

      return result
    }
  },
  methods: {
    getTabCount (tabId) {
      if (tabId === 'all') return this.favorites.length
      return this.favorites.filter(item => item.type === tabId).length
    },
    switchCategoryTab (index) {
      this.activeCategoryTab = index
    },
    doSearch () {
      console.log('搜索:', this.searchKeyword)
    },
    clearSearch () {
      this.searchKeyword = ''
    },
    viewDetail (item) {
      if (item.type === 'food') {
        this.$router.push({
          name: 'FoodDetail',
          params: { restaurantId: item.id },
          query: {
            name: item.name,
            image: item.image,
            rating: item.rating,
            ratingCount: item.ratingCount,
            location: item.location,
            tags: item.tags.join(','),
            description: `${item.name}是一家深受消费者喜爱的美食商家，提供优质的菜品和贴心的服务。`
          }
        })
      } else {
        this.$router.push({
          name: 'HotelDetail',
          params: { hotelId: item.id },
          query: {
            name: item.name,
            image: item.image,
            rating: item.rating,
            ratingCount: item.ratingCount,
            location: item.location,
            tags: item.tags.join(','),
            price: item.price
          }
        })
      }
    },
    removeFavorite (item) {
      const index = this.favorites.findIndex(f => f.id === item.id)
      if (index > -1) {
        this.favorites.splice(index, 1)
        this.showToast('💔', `已取消收藏「${item.name}」`)
      }
    },
    goExplore () {
      if (this.activeCategoryTab === 1) {
        this.$router.push('/food')
      } else if (this.activeCategoryTab === 2) {
        this.$router.push('/hotel')
      } else {
        this.$router.push('/')
      }
    },
    showToast (icon, message) {
      this.toastIcon = icon
      this.toastMessage = message
      this.showToastVisible = true

      setTimeout(() => {
        this.showToastVisible = false
      }, 2000)
    },
    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.favorites-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(40px)

.search-header
  display: flex
  align-items: center
  background-color: #fff
  padding: px2rem(20px)
  border-bottom: 1px solid #eee

.back-btn
  width: px2rem(80px)
  height: px2rem(80px)
  display: flex
  align-items: center
  justify-content: center
  font-size: px2rem(40px)
  color: #333
  cursor: pointer
  margin-right: px2rem(20px)
  flex-shrink: 0

.search-section
  flex: 1
  display: flex
  align-items: center
  background-color: #f5f5f5
  border-radius: px2rem(35px)
  padding: px2rem(16px) px2rem(24px)

.search-icon-inline
  font-size: px2rem(36px)
  margin-right: px2rem(16px)
  color: #999

.search-input-inline
  flex: 1
  border: none
  background: transparent
  font-size: px2rem(28px)
  color: #333
  outline: none

  &::placeholder
    color: #999

.search-clear-btn
  font-size: px2rem(32px)
  color: #999
  cursor: pointer
  padding: px2rem(10px)

.category-tabs
  display: flex
  background-color: #fff
  padding: px2rem(20px)
  gap: px2rem(20px)
  border-bottom: 1px solid #eee

.category-tab
  flex: 1
  display: flex
  align-items: center
  justify-content: center
  padding: px2rem(20px)
  background-color: #f8f8f8
  border-radius: px2rem(12px)
  cursor: pointer
  transition: all 0.3s

  &:active
    transform: scale(0.98)

  &.active
    background: linear-gradient(135deg, #06c1ae, #0a9d8c)

    .tab-name,
    .tab-count
      color: #fff

.tab-name
  font-size: px2rem(28px)
  color: #333
  font-weight: 500

.tab-count
  font-size: px2rem(24px)
  color: #999
  margin-left: px2rem(8px)

.favorites-list
  padding: px2rem(20px)

.favorite-item
  background-color: #fff
  border-radius: px2rem(16px)
  padding: px2rem(24px)
  margin-bottom: px2rem(20px)
  display: flex
  flex-direction: column
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)

.item-image
  width: 100%
  height: px2rem(300px)
  border-radius: px2rem(12px)
  overflow: hidden
  position: relative
  margin-bottom: px2rem(20px)

  img
    width: 100%
    height: 100%
    object-fit: cover

.item-type-badge
  position: absolute
  top: px2rem(16px)
  left: px2rem(16px)
  padding: px2rem(8px) px2rem(20px)
  border-radius: px2rem(20px)
  font-size: px2rem(24px)
  font-weight: bold

  &.food
    background: linear-gradient(135deg, #ff6b6b, #ee5a5a)
    color: #fff

  &.hotel
    background: linear-gradient(135deg, #4ecdc4, #44a3aa)
    color: #fff

.item-info
  flex: 1
  margin-bottom: px2rem(20px)

.item-name
  font-size: px2rem(32px)
  font-weight: bold
  color: #333
  margin-bottom: px2rem(12px)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.item-rating
  display: flex
  align-items: center
  margin-bottom: px2rem(12px)

.rating-value
  font-size: px2rem(28px)
  font-weight: bold
  color: #ff9500

.rating-count
  font-size: px2rem(24px)
  color: #999
  margin-left: px2rem(8px)

.item-location
  display: flex
  align-items: center
  margin-bottom: px2rem(12px)

.location-icon
  font-size: px2rem(24px)
  margin-right: px2rem(8px)

.item-location span:last-child
  font-size: px2rem(26px)
  color: #666

.item-tags
  display: flex
  gap: px2rem(12px)
  margin-bottom: px2rem(16px)
  flex-wrap: wrap

.item-tag
  padding: px2rem(6px) px2rem(16px)
  background-color: #f0f9f8
  color: #06c1ae
  font-size: px2rem(22px)
  border-radius: px2rem(20px)

.item-price
  display: flex
  align-items: baseline

.price-symbol
  font-size: px2rem(24px)
  color: #ff6b6b
  font-weight: bold

.price-value
  font-size: px2rem(40px)
  color: #ff6b6b
  font-weight: bold

.price-unit
  font-size: px2rem(22px)
  color: #999
  margin-left: px2rem(8px)

.original-price
  font-size: px2rem(24px)
  color: #999
  text-decoration: line-through
  margin-left: px2rem(12px)

.item-actions
  display: flex
  gap: px2rem(16px)

.action-btn
  flex: 1
  padding: px2rem(24px)
  font-size: px2rem(28px)
  border-radius: px2rem(12px)
  border: none
  cursor: pointer
  transition: all 0.2s

  &:active
    transform: scale(0.98)

.view-btn
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  color: #fff

.remove-btn
  background-color: #fff5f5
  color: #ff6b6b
  border: px2rem(1px) solid #ffd6d6

.empty-state
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: px2rem(120px) px2rem(40px)

.empty-icon
  font-size: px2rem(120px)
  margin-bottom: px2rem(30px)

.empty-text
  font-size: px2rem(36px)
  color: #333
  font-weight: bold
  margin-bottom: px2rem(12px)

.empty-tip
  font-size: px2rem(28px)
  color: #999
  margin-bottom: px2rem(40px)

.go-explore-btn
  padding: px2rem(24px) px2rem(60px)
  background: linear-gradient(135deg, #06c1ae, #0a9d8c)
  color: #fff
  font-size: px2rem(30px)
  font-weight: bold
  border: none
  border-radius: px2rem(40px)
  cursor: pointer
  transition: all 0.2s

  &:active
    transform: scale(0.98)

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
