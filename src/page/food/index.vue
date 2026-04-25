<template>
  <div class="food-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="header-title">周边美食</div>
      <div class="search-btn" @click="showSearch = true">
        <span>🔍</span>
      </div>
    </div>

    <div class="coupon-section">
      <div class="section-header">
        <span class="section-title">🎁 领券专区</span>
        <span class="section-more" @click="viewMoreCoupons">更多优惠券 ></span>
      </div>
      <div class="coupon-scroll">
        <div 
          v-for="coupon in availableCoupons" 
          :key="coupon.id"
          class="coupon-card"
          :class="{ 'coupon-claimed': coupon.claimed }"
        >
          <div class="coupon-left">
            <div class="coupon-value">
              <span class="coupon-symbol">¥</span>
              <span class="coupon-amount">{{ coupon.value }}</span>
            </div>
            <div class="coupon-condition">满{{ coupon.minAmount }}可用</div>
          </div>
          <div class="coupon-divider"></div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-validity">{{ coupon.validity }}</div>
            <button 
              class="coupon-btn" 
              :class="{ claimed: coupon.claimed }"
              @click="claimCoupon(coupon)"
            >
              {{ coupon.claimed ? '已领取' : '立即领取' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="category-section">
      <div class="section-header">
        <span class="section-title">🍽️ 美食分类</span>
      </div>
      <div class="category-card">
        <div 
          v-for="(category, index) in categories" 
          :key="category.id"
          class="category-item"
          :class="{ active: activeCategory === index }"
          @click="selectCategory(index)"
        >
          <div class="category-icon">{{ category.icon }}</div>
          <div class="category-name">{{ category.name }}</div>
        </div>
      </div>
    </div>

    <div class="recommend-section">
      <div class="section-header">
        <span class="section-title">🔥 为你推荐</span>
      </div>
      
      <div class="filter-bar">
        <div class="filter-item" @click="toggleDistanceDropdown">
          <span :class="{ active: selectedDistance !== '' }">
            {{ selectedDistance ? getDistanceLabel(selectedDistance) : '附近' }}
          </span>
          <span class="arrow" :class="{ up: showDistanceDropdown }">▼</span>
        </div>
        <div class="filter-item" @click="toggleTypeDropdown">
          <span :class="{ active: selectedType !== '' }">
            {{ selectedType ? getTypeLabel(selectedType) : '美食类型' }}
          </span>
          <span class="arrow" :class="{ up: showTypeDropdown }">▼</span>
        </div>
        <div class="filter-item" @click="toggleSortDropdown">
          <span :class="{ active: selectedSort !== '' }">
            {{ selectedSort ? getSortLabel(selectedSort) : '排序' }}
          </span>
          <span class="arrow" :class="{ up: showSortDropdown }">▼</span>
        </div>
      </div>

      <div class="filter-dropdown" v-show="showDistanceDropdown">
        <div 
          v-for="option in distanceOptions" 
          :key="option.value"
          class="dropdown-option"
          :class="{ active: selectedDistance === option.value }"
          @click="selectDistance(option.value)"
        >
          {{ option.label }}
        </div>
      </div>

      <div class="filter-dropdown" v-show="showTypeDropdown">
        <div 
          v-for="option in typeOptions" 
          :key="option.value"
          class="dropdown-option"
          :class="{ active: selectedType === option.value }"
          @click="selectType(option.value)"
        >
          {{ option.label }}
        </div>
      </div>

      <div class="filter-dropdown" v-show="showSortDropdown">
        <div 
          v-for="option in sortOptions" 
          :key="option.value"
          class="dropdown-option"
          :class="{ active: selectedSort === option.value }"
          @click="selectSort(option.value)"
        >
          {{ option.label }}
        </div>
      </div>

      <div class="food-list">
        <div 
          v-for="food in filteredFoodList" 
          :key="food.id"
          class="food-card"
          @click="goToFoodDetail(food)"
        >
          <div class="food-image">
            <img :src="food.image" :alt="food.name" />
            <div class="distance-badge">{{ food.distance }}</div>
            <div v-if="food.isNew" class="new-badge">新店</div>
          </div>
          <div class="food-info">
            <div class="food-name-row">
              <span class="food-name">{{ food.name }}</span>
              <div class="food-badges">
                <span v-for="badge in food.badges" :key="badge" class="food-badge">{{ badge }}</span>
              </div>
            </div>
            <div class="food-tags">
              <span v-for="tag in food.tags.slice(0, 3)" :key="tag" class="food-tag">{{ tag }}</span>
            </div>
            <div class="food-meta">
              <div class="food-score">
                <span class="score-value">{{ food.score }}</span>
                <span class="score-text">分</span>
              </div>
              <div class="food-order-count" v-if="food.orderCount">
                月售{{ food.orderCount }}+
              </div>
              <div class="food-price-info">
                <span class="price-text">人均</span>
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ food.averagePrice }}</span>
              </div>
            </div>
            <div class="food-location">
              <span class="location-icon">📍</span>
              <span class="location-text">{{ food.location }}</span>
            </div>
            <div class="food-coupon-section" v-if="food.availableCoupons && food.availableCoupons.length > 0">
              <div class="coupon-tags">
                <span 
                  v-for="coupon in food.availableCoupons" 
                  :key="coupon.id"
                  class="coupon-tag"
                  @click.stop="showCouponDetail(food, coupon)"
                >
                  券 ¥{{ coupon.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="no-result" v-show="filteredFoodList.length === 0">
        <div class="no-result-icon">🍜</div>
        <div class="no-result-text">暂无符合条件的美食</div>
        <div class="no-result-tip">试试调整筛选条件</div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>

    <div class="coupon-modal-overlay" v-show="showCouponModal" @click="hideCouponModal">
      <div class="coupon-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">优惠券详情</div>
          <div class="modal-close" @click="hideCouponModal">✕</div>
        </div>
        <div class="modal-coupon-info">
          <div class="modal-coupon-card">
            <div class="modal-coupon-left">
              <div class="modal-coupon-value">
                <span class="modal-coupon-symbol">¥</span>
                <span class="modal-coupon-amount">{{ selectedCouponForDetail?.value }}</span>
              </div>
              <div class="modal-coupon-condition">满{{ selectedCouponForDetail?.minAmount }}可用</div>
            </div>
            <div class="modal-coupon-divider"></div>
            <div class="modal-coupon-right">
              <div class="modal-coupon-name">{{ selectedCouponForDetail?.name }}</div>
              <div class="modal-coupon-validity">{{ selectedCouponForDetail?.validity }}</div>
            </div>
          </div>
          <div class="modal-coupon-restaurant">
            <span class="restaurant-label">适用商家：</span>
            <span class="restaurant-name">{{ selectedRestaurantForCoupon?.name }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button 
            class="modal-btn primary" 
            @click="claimAndUseCoupon"
            :disabled="selectedCouponForDetail?.claimed"
          >
            {{ selectedCouponForDetail?.claimed ? '已领取' : '立即领取并使用' }}
          </button>
        </div>
      </div>
    </div>

    <div class="search-overlay" v-show="showSearch" @click="hideSearch">
      <div class="search-panel" @click.stop>
        <div class="search-header">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索餐厅、美食" 
            class="search-input"
            @keyup.enter="doSearch"
            autofocus
          />
          <button class="search-cancel" @click="hideSearch">取消</button>
        </div>
        <div class="search-history-section" v-if="searchHistory.length > 0">
          <div class="search-section-header">
            <span class="search-section-title">搜索历史</span>
            <span class="search-clear-history" @click="clearSearchHistory">清空</span>
          </div>
          <div class="search-tags">
            <span 
              v-for="(history, index) in searchHistory" 
              :key="index" 
              class="search-tag"
              @click="searchByKeyword(history)"
            >
              {{ history }}
            </span>
          </div>
        </div>
        <div class="search-hot-section">
          <div class="search-section-header">
            <span class="search-section-title">热门搜索</span>
          </div>
          <div class="search-tags">
            <span 
              v-for="tag in hotSearchTags" 
              :key="tag" 
              class="search-tag hot"
              @click="searchByKeyword(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodPage',
  data () {
    return {
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅',
      activeCategory: 0,
      selectedDistance: '',
      selectedType: '',
      selectedSort: '',
      showDistanceDropdown: false,
      showTypeDropdown: false,
      showSortDropdown: false,
      showCouponModal: false,
      selectedCouponForDetail: null,
      selectedRestaurantForCoupon: null,
      showSearch: false,
      searchKeyword: '',
      searchHistory: [],
      hotSearchTags: ['火锅', '烧烤', '奶茶', '汉堡', '日料', '川菜', '粤菜', '咖啡'],
      categories: [
        { id: 1, name: '附近美食', icon: '🍱' },
        { id: 2, name: '奶茶咖啡', icon: '🧋' },
        { id: 3, name: '小食快餐', icon: '🍔' },
        { id: 4, name: '学生专区', icon: '🎓' }
      ],
      distanceOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '1公里内' },
        { value: '3', label: '3公里内' },
        { value: '5', label: '5公里内' },
        { value: '10', label: '10公里内' }
      ],
      typeOptions: [
        { value: '', label: '全部类型' },
        { value: 'hotpot', label: '火锅' },
        { value: 'bbq', label: '烧烤' },
        { value: 'chinese', label: '中餐' },
        { value: 'western', label: '西餐' },
        { value: 'japanese', label: '日料' },
        { value: 'fastfood', label: '快餐' },
        { value: 'drink', label: '饮品' }
      ],
      sortOptions: [
        { value: '', label: '综合排序' },
        { value: 'distance', label: '距离最近' },
        { value: 'score', label: '评分最高' },
        { value: 'sales', label: '销量最高' },
        { value: 'price-low', label: '价格最低' },
        { value: 'price-high', label: '价格最高' }
      ],
      availableCoupons: [
        { id: 1, name: '新用户专享券', value: 15, minAmount: 50, validity: '有效期至2026-12-31', claimed: false },
        { id: 2, name: '美食满减券', value: 20, minAmount: 100, validity: '有效期至2026-12-31', claimed: false },
        { id: 3, name: '学生专属券', value: 10, minAmount: 30, validity: '凭学生证使用', claimed: false },
        { id: 4, name: '下午茶特惠券', value: 8, minAmount: 25, validity: '14:00-17:00可用', claimed: false }
      ],
      foodList: [
        {
          id: 101,
          name: '老北京火锅',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20beijing%20hotpot%20restaurant%20cozy%20atmosphere%20delicious%20food&image_size=square',
          score: 4.8,
          distance: '1.2km',
          distanceValue: 1.2,
          location: '东城区 · 王府井大街88号',
          averagePrice: 89,
          orderCount: 2345,
          tags: ['火锅', '老北京', '涮羊肉'],
          badges: ['品牌'],
          isNew: false,
          type: 'hotpot',
          availableCoupons: [
            { id: 101, value: 15, minAmount: 50, name: '新用户专享券', claimed: false },
            { id: 102, value: 20, minAmount: 100, name: '满减优惠', claimed: false }
          ]
        },
        {
          id: 102,
          name: '喜茶HEYTEA',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=heytea%20milk%20tea%20shop%20modern%20store%20interior%20delicious%20boba%20tea&image_size=square',
          score: 4.6,
          distance: '0.8km',
          distanceValue: 0.8,
          location: '朝阳区 · 三里屯太古里',
          averagePrice: 25,
          orderCount: 5678,
          tags: ['奶茶', '果茶', '网红店'],
          badges: ['网红'],
          isNew: false,
          type: 'drink',
          availableCoupons: [
            { id: 103, value: 5, minAmount: 20, name: '满减优惠', claimed: false }
          ]
        },
        {
          id: 103,
          name: '肯德基KFC',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kfc%20fried%20chicken%20restaurant%20fast%20food%20store%20delicious%20burger%20chicken%20wings&image_size=square',
          score: 4.5,
          distance: '0.5km',
          distanceValue: 0.5,
          location: '朝阳区 · 国贸商城B1层',
          averagePrice: 35,
          orderCount: 8901,
          tags: ['快餐', '炸鸡', '汉堡'],
          badges: ['24小时'],
          isNew: false,
          type: 'fastfood',
          availableCoupons: [
            { id: 104, value: 10, minAmount: 40, name: '工作日特惠', claimed: false },
            { id: 105, value: 15, minAmount: 60, name: '满减优惠', claimed: false }
          ]
        },
        {
          id: 104,
          name: '寿司之神',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=authentic%20japanese%20sushi%20restaurant%20elegant%20interior%20fresh%20sashimi%20sushi%20plate&image_size=square',
          score: 4.9,
          distance: '2.3km',
          distanceValue: 2.3,
          location: '朝阳区 · 望京SOHO',
          averagePrice: 128,
          orderCount: 1234,
          tags: ['日料', '寿司', '刺身'],
          badges: ['品质'],
          isNew: true,
          type: 'japanese',
          availableCoupons: [
            { id: 106, value: 30, minAmount: 150, name: '新店开业', claimed: false }
          ]
        },
        {
          id: 105,
          name: '川味烧烤',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sichuan%20bbq%20restaurant%20spicy%20grilled%20meat%20skewers%20cozy%20night%20atmosphere&image_size=square',
          score: 4.7,
          distance: '1.8km',
          distanceValue: 1.8,
          location: '海淀区 · 五道口美食街',
          averagePrice: 68,
          orderCount: 3456,
          tags: ['烧烤', '川菜', '宵夜'],
          badges: ['深夜'],
          isNew: false,
          type: 'bbq',
          availableCoupons: [
            { id: 107, value: 20, minAmount: 100, name: '宵夜特惠', claimed: false }
          ]
        },
        {
          id: 106,
          name: '麦当劳McDonalds',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mcdonalds%20restaurant%20fast%20food%20burgers%20french%20fries%20modern%20store%20interior&image_size=square',
          score: 4.4,
          distance: '0.6km',
          distanceValue: 0.6,
          location: '东城区 · 东方新天地',
          averagePrice: 32,
          orderCount: 6789,
          tags: ['快餐', '汉堡', '薯条'],
          badges: ['24小时'],
          isNew: false,
          type: 'fastfood',
          availableCoupons: [
            { id: 108, value: 8, minAmount: 30, name: '学生专享', claimed: false }
          ]
        },
        {
          id: 107,
          name: '星巴克Starbucks',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starbucks%20coffee%20shop%20cozy%20interior%20coffee%20cups%20lattes%20relaxing%20atmosphere&image_size=square',
          score: 4.5,
          distance: '1.0km',
          distanceValue: 1.0,
          location: '朝阳区 · 国贸三期',
          averagePrice: 38,
          orderCount: 4567,
          tags: ['咖啡', '下午茶', '商务'],
          badges: ['品牌'],
          isNew: false,
          type: 'drink',
          availableCoupons: [
            { id: 109, value: 10, minAmount: 50, name: '下午茶特惠', claimed: false }
          ]
        },
        {
          id: 108,
          name: '杨国福麻辣烫',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yangguofu%20malatang%20spicy%20hot%20pot%20noodle%20soup%20various%20ingredients%20delicious&image_size=square',
          score: 4.3,
          distance: '0.9km',
          distanceValue: 0.9,
          location: '海淀区 · 中关村软件园',
          averagePrice: 28,
          orderCount: 2345,
          tags: ['麻辣烫', '快餐', '实惠'],
          badges: ['实惠'],
          isNew: false,
          type: 'chinese',
          availableCoupons: [
            { id: 110, value: 5, minAmount: 20, name: '满减优惠', claimed: false }
          ]
        }
      ]
    }
  },
  computed: {
    filteredFoodList () {
      let result = [...this.foodList]

      if (this.activeCategory === 1) {
        result = result.filter(item => item.type === 'drink')
      } else if (this.activeCategory === 2) {
        result = result.filter(item => item.type === 'fastfood')
      } else if (this.activeCategory === 3) {
        result = result.filter(item => item.averagePrice <= 50)
      }

      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(item =>
          item.name.toLowerCase().includes(keyword) ||
          item.location.toLowerCase().includes(keyword) ||
          item.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
      }

      if (this.selectedDistance) {
        const maxDistance = parseFloat(this.selectedDistance)
        result = result.filter(item => item.distanceValue <= maxDistance)
      }

      if (this.selectedType) {
        result = result.filter(item => item.type === this.selectedType)
      }

      if (this.selectedSort === 'distance') {
        result.sort((a, b) => a.distanceValue - b.distanceValue)
      } else if (this.selectedSort === 'score') {
        result.sort((a, b) => b.score - a.score)
      } else if (this.selectedSort === 'sales') {
        result.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      } else if (this.selectedSort === 'price-low') {
        result.sort((a, b) => a.averagePrice - b.averagePrice)
      } else if (this.selectedSort === 'price-high') {
        result.sort((a, b) => b.averagePrice - a.averagePrice)
      }

      return result
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    showToast (icon, message) {
      this.toastIcon = icon
      this.toastMessage = message
      this.showToastVisible = true

      setTimeout(() => {
        this.showToastVisible = false
      }, 2000)
    },
    selectCategory (index) {
      this.activeCategory = index
    },
    toggleDistanceDropdown () {
      this.showDistanceDropdown = !this.showDistanceDropdown
      this.showTypeDropdown = false
      this.showSortDropdown = false
    },
    toggleTypeDropdown () {
      this.showTypeDropdown = !this.showTypeDropdown
      this.showDistanceDropdown = false
      this.showSortDropdown = false
    },
    toggleSortDropdown () {
      this.showSortDropdown = !this.showSortDropdown
      this.showDistanceDropdown = false
      this.showTypeDropdown = false
    },
    selectDistance (value) {
      this.selectedDistance = value
      this.showDistanceDropdown = false
    },
    selectType (value) {
      this.selectedType = value
      this.showTypeDropdown = false
    },
    selectSort (value) {
      this.selectedSort = value
      this.showSortDropdown = false
    },
    getDistanceLabel (value) {
      const option = this.distanceOptions.find(o => o.value === value)
      return option ? option.label : '附近'
    },
    getTypeLabel (value) {
      const option = this.typeOptions.find(o => o.value === value)
      return option ? option.label : '美食类型'
    },
    getSortLabel (value) {
      const option = this.sortOptions.find(o => o.value === value)
      return option ? option.label : '排序'
    },
    viewMoreCoupons () {
      this.showToast('🎁', '更多优惠券加载中...')
    },
    claimCoupon (coupon) {
      if (coupon.claimed) {
        this.showToast('ℹ️', '您已领取过该优惠券')
        return
      }
      coupon.claimed = true
      this.showToast('✅', `恭喜您领取了¥${coupon.value}优惠券！`)
    },
    showCouponDetail (food, coupon) {
      this.selectedRestaurantForCoupon = food
      this.selectedCouponForDetail = coupon
      this.showCouponModal = true
    },
    hideCouponModal () {
      this.showCouponModal = false
      this.selectedCouponForDetail = null
      this.selectedRestaurantForCoupon = null
    },
    claimAndUseCoupon () {
      if (!this.selectedCouponForDetail) return
      
      if (this.selectedCouponForDetail.claimed) {
        this.showToast('ℹ️', '您已领取过该优惠券')
        return
      }

      this.selectedCouponForDetail.claimed = true
      this.showToast('✅', `领取成功！¥${this.selectedCouponForDetail.value}优惠券已到账`)
      
      setTimeout(() => {
        this.hideCouponModal()
        if (this.selectedRestaurantForCoupon) {
          this.goToFoodDetail(this.selectedRestaurantForCoupon)
        }
      }, 1000)
    },
    goToFoodDetail (food) {
      this.$router.push({
        name: 'FoodDetail',
        params: { restaurantId: food.id },
        query: {
          name: food.name,
          image: food.image,
          rating: food.score,
          ratingCount: Math.floor(food.orderCount * 0.8),
          orderCount: food.orderCount,
          location: food.location,
          distance: food.distanceValue,
          tags: food.tags.join(','),
          description: this.getFoodDescription(food)
        }
      })
    },
    getFoodDescription (food) {
      const descriptions = {
        101: '老北京火锅传承百年老北京涮羊肉技艺，选用内蒙锡林郭勒草原优质羊肉，肉质鲜嫩，不膻不腻。锅底采用大骨熬制8小时，汤底浓郁醇厚。',
        102: '喜茶HEYTEA致力于为消费者提供高品质的茶饮体验。严选世界各地优质茶叶，采用新鲜水果，用心打造每一杯好茶。',
        103: '肯德基KFC全球知名快餐品牌，以炸鸡、汉堡为主打产品。精选优质鸡肉，独家配方腌制，外酥里嫩。',
        104: '寿司之神传承正宗日式寿司技艺，选用当日新鲜海产，由经验丰富的寿司师傅现场制作。招牌三文鱼寿司、金枪鱼寿司口感鲜美。',
        105: '川味烧烤秉承正宗川渝烧烤风味，独家秘制酱料，选用新鲜食材，每日现切现串。特色菜品包括烤五花肉、烤鸡翅、烤茄子等。',
        106: '麦当劳McDonalds全球知名快餐品牌，以汉堡、薯条、麦旋风等产品深受消费者喜爱。',
        107: '星巴克Starbucks全球知名咖啡品牌，提供多种高品质咖啡饮品。精选世界各地优质咖啡豆，专业咖啡师手工制作。',
        108: '杨国福麻辣烫源自东北的知名麻辣烫品牌，以独特的骨汤汤底和丰富的食材选择著称。'
      }
      return descriptions[food.id] || `${food.name}是一家深受消费者喜爱的美食商家，提供优质的菜品和贴心的服务。`
    },
    hideSearch () {
      this.showSearch = false
    },
    clearSearchHistory () {
      this.searchHistory = []
    },
    searchByKeyword (keyword) {
      this.searchKeyword = keyword
      this.addToSearchHistory(keyword)
      this.doSearch()
    },
    addToSearchHistory (keyword) {
      if (!keyword) return
      const history = this.searchHistory.filter(h => h !== keyword)
      history.unshift(keyword)
      this.searchHistory = history.slice(0, 10)
    },
    doSearch () {
      if (this.searchKeyword.trim()) {
        this.addToSearchHistory(this.searchKeyword.trim())
      }
      this.hideSearch()
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.food-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(20px)

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

    .back-btn, .search-btn
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

  .section-header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: px2rem(20px)

    .section-title
      font-size: px2rem(32px)
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
        background-color: #ff6b00
        border-radius: px2rem(4px)

    .section-more
      font-size: px2rem(26px)
      color: #ff6b00
      cursor: pointer

  .coupon-section
    background-color: #fff
    margin-top: px2rem(120px)
    padding: px2rem(20px) px2rem(16px)

    .coupon-scroll
      display: flex
      overflow-x: auto
      padding-bottom: px2rem(10px)
      scrollbar-width: none
      -ms-overflow-style: none

      &::-webkit-scrollbar
        display: none

    .coupon-card
      flex-shrink: 0
      width: px2rem(520px)
      margin-right: px2rem(20px)
      display: flex
      background: linear-gradient(135deg, #fff5f5 0%, #fff 100%)
      border-radius: px2rem(16px)
      overflow: hidden
      position: relative
      border: 2px solid #ffe0e0
      cursor: pointer
      transition: all 0.3s

      &:last-child
        margin-right: 0

      &:hover
        transform: translateY(-2px)
        box-shadow: 0 px2rem(8px) px2rem(20px) rgba(255, 107, 0, 0.15)

      &.coupon-claimed
        opacity: 0.7

        .coupon-btn.claimed
          background-color: #ccc

    .coupon-left
      flex: 0 0 px2rem(180px)
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center
      padding: px2rem(20px)
      background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)

      .coupon-value
        display: flex
        align-items: baseline
        margin-bottom: px2rem(8px)

        .coupon-symbol
          font-size: px2rem(32px)
          color: #fff
          font-weight: bold
          margin-right: px2rem(4px)

        .coupon-amount
          font-size: px2rem(64px)
          font-weight: bold
          color: #fff
          line-height: 1

      .coupon-condition
        font-size: px2rem(22px)
        color: rgba(255, 255, 255, 0.9)

    .coupon-divider
      width: px2rem(2px)
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent px2rem(8px),
        #fff px2rem(8px),
        #fff px2rem(16px)
      )
      margin: px2rem(20px) 0
      position: relative

      &::before, &::after
        content: ''
        position: absolute
        left: 50%
        transform: translateX(-50%)
        width: px2rem(32px)
        height: px2rem(32px)
        background-color: #f5f5f5
        border-radius: 50%

      &::before
        top: -px2rem(36px)

      &::after
        bottom: -px2rem(36px)

    .coupon-right
      flex: 1
      display: flex
      flex-direction: column
      justify-content: center
      padding: px2rem(20px)

      .coupon-name
        font-size: px2rem(30px)
        font-weight: bold
        color: #333
        margin-bottom: px2rem(8px)

      .coupon-validity
        font-size: px2rem(22px)
        color: #999
        margin-bottom: px2rem(16px)

      .coupon-btn
        align-self: flex-start
        padding: px2rem(10px) px2rem(30px)
        background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)
        color: #fff
        border: none
        border-radius: px2rem(30px)
        font-size: px2rem(24px)
        font-weight: bold
        cursor: pointer
        transition: all 0.3s

        &:hover
          opacity: 0.9

        &.claimed
          background-color: #ccc

  .category-section
    background-color: #fff
    margin-top: px2rem(12px)
    padding: px2rem(20px) px2rem(16px)

    .category-card
      display: flex
      justify-content: space-around
      background: linear-gradient(135deg, #fffbeb 0%, #fff 100%)
      border-radius: px2rem(16px)
      padding: px2rem(24px) px2rem(16px)
      border: 2px solid #fef3c7

    .category-item
      display: flex
      flex-direction: column
      align-items: center
      cursor: pointer
      transition: all 0.3s

      &:hover
        transform: scale(1.05)

      &.active
        .category-icon
          transform: scale(1.1)
          box-shadow: 0 px2rem(8px) px2rem(20px) rgba(255, 107, 0, 0.3)

        .category-name
          color: #ff6b00
          font-weight: bold

    .category-icon
      width: px2rem(120px)
      height: px2rem(120px)
      display: flex
      align-items: center
      justify-content: center
      font-size: px2rem(60px)
      background: linear-gradient(135deg, #fff5f5 0%, #ffecd2 100%)
      border-radius: px2rem(24px)
      margin-bottom: px2rem(12px)
      transition: all 0.3s

    .category-name
      font-size: px2rem(26px)
      color: #333
      transition: all 0.3s

  .recommend-section
    background-color: #fff
    margin-top: px2rem(12px)
    padding: px2rem(20px) px2rem(16px)

    .filter-bar
      display: flex
      gap: px2rem(16px)
      margin-bottom: px2rem(20px)

    .filter-item
      flex: 1
      display: flex
      align-items: center
      justify-content: center
      padding: px2rem(16px) px2rem(12px)
      background-color: #f8f8f8
      border-radius: px2rem(8px)
      cursor: pointer
      position: relative
      transition: all 0.3s

      &:hover
        background-color: #f0f9f8

      span.active
        color: #06c1ae
        font-weight: bold

      .arrow
        font-size: px2rem(18px)
        color: #999
        margin-left: px2rem(8px)
        transition: transform 0.3s

        &.up
          transform: rotate(180deg)

    .filter-dropdown
      position: absolute
      top: 100%
      left: 0
      right: 0
      background-color: #fff
      border-radius: px2rem(8px)
      box-shadow: 0 px2rem(8px) px2rem(24px) rgba(0, 0, 0, 0.12)
      z-index: 10
      margin-top: px2rem(8px)
      overflow: hidden

    .dropdown-option
      padding: px2rem(20px) px2rem(24px)
      font-size: px2rem(26px)
      color: #333
      cursor: pointer
      transition: all 0.2s

      &:hover
        background-color: #f8f8f8

      &.active
        color: #06c1ae
        background-color: rgba(6, 193, 174, 0.05)
        font-weight: bold

    .food-list
      display: flex
      flex-direction: column
      gap: px2rem(20px)

    .food-card
      display: flex
      background-color: #fff
      border-radius: px2rem(16px)
      overflow: hidden
      cursor: pointer
      transition: all 0.3s
      border: 1px solid #f0f0f0

      &:hover
        transform: translateX(px2rem(4px))
        box-shadow: 0 px2rem(4px) px2rem(16px) rgba(0, 0, 0, 0.08)

    .food-image
      width: px2rem(240px)
      height: px2rem(220px)
      flex-shrink: 0
      position: relative
      overflow: hidden

      img
        width: 100%
        height: 100%
        object-fit: cover

      .distance-badge
        position: absolute
        top: px2rem(12px)
        left: px2rem(12px)
        background-color: rgba(0, 0, 0, 0.6)
        color: #fff
        font-size: px2rem(20px)
        padding: px2rem(4px) px2rem(12px)
        border-radius: px2rem(12px)

      .new-badge
        position: absolute
        top: px2rem(12px)
        right: px2rem(12px)
        background: linear-gradient(135deg, #ff6b00 0%, #ff9800 100%)
        color: #fff
        font-size: px2rem(20px)
        font-weight: bold
        padding: px2rem(4px) px2rem(12px)
        border-radius: px2rem(4px)

    .food-info
      flex: 1
      padding: px2rem(20px)
      display: flex
      flex-direction: column
      min-width: 0

    .food-name-row
      display: flex
      align-items: center
      margin-bottom: px2rem(8px)
      flex-wrap: wrap
      gap: px2rem(8px)

    .food-name
      font-size: px2rem(32px)
      font-weight: bold
      color: #333
      flex-shrink: 0

    .food-badges
      display: flex
      gap: px2rem(8px)

    .food-badge
      font-size: px2rem(20px)
      padding: px2rem(4px) px2rem(10px)
      border-radius: px2rem(4px)
      background-color: rgba(255, 107, 0, 0.1)
      color: #ff6b00

    .food-tags
      display: flex
      gap: px2rem(8px)
      margin-bottom: px2rem(12px)
      flex-wrap: wrap

    .food-tag
      font-size: px2rem(22px)
      color: #666
      background-color: #f5f5f5
      padding: px2rem(4px) px2rem(10px)
      border-radius: px2rem(4px)

    .food-meta
      display: flex
      align-items: center
      margin-bottom: px2rem(12px)
      flex-wrap: wrap
      gap: px2rem(16px)

    .food-score
      display: flex
      align-items: baseline

      .score-value
        font-size: px2rem(36px)
        font-weight: bold
        color: #ff9800

      .score-text
        font-size: px2rem(22px)
        color: #999
        margin-left: px2rem(4px)

    .food-order-count
      font-size: px2rem(22px)
      color: #999

    .food-price-info
      display: flex
      align-items: baseline
      margin-left: auto

      .price-text
        font-size: px2rem(22px)
        color: #999
        margin-right: px2rem(4px)

      .price-symbol
        font-size: px2rem(22px)
        color: #ff6b00
        margin-right: px2rem(2px)

      .price-value
        font-size: px2rem(36px)
        font-weight: bold
        color: #ff6b00

    .food-location
      display: flex
      align-items: center
      margin-bottom: px2rem(12px)

      .location-icon
        font-size: px2rem(24px)
        margin-right: px2rem(6px)

      .location-text
        font-size: px2rem(24px)
        color: #999
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

    .food-coupon-section
      margin-top: auto

      .coupon-tags
        display: flex
        gap: px2rem(10px)
        flex-wrap: wrap

      .coupon-tag
        font-size: px2rem(22px)
        color: #ff6b00
        background: linear-gradient(135deg, #fff5f5 0%, #fff 100%)
        border: 1px solid #ffd6cc
        padding: px2rem(6px) px2rem(16px)
        border-radius: px2rem(4px)
        cursor: pointer
        transition: all 0.2s

        &:hover
          background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)
          color: #fff
          border-color: #ff6b00

    .no-result
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center
      padding: px2rem(80px) 0

      .no-result-icon
        font-size: px2rem(100px)
        margin-bottom: px2rem(20px)

      .no-result-text
        font-size: px2rem(32px)
        color: #333
        margin-bottom: px2rem(12px)

      .no-result-tip
        font-size: px2rem(26px)
        color: #999

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

  .coupon-modal-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.5)
    z-index: 1000
    display: flex
    align-items: flex-end

  .coupon-modal
    width: 100%
    background-color: #fff
    border-top-left-radius: px2rem(24px)
    border-top-right-radius: px2rem(24px)
    padding: px2rem(30px)

    .modal-header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: px2rem(30px)

      .modal-title
        font-size: px2rem(36px)
        font-weight: bold
        color: #333

      .modal-close
        font-size: px2rem(40px)
        color: #999
        cursor: pointer
        padding: px2rem(10px)

    .modal-coupon-info
      .modal-coupon-card
        display: flex
        background: linear-gradient(135deg, #fff5f5 0%, #fff 100%)
        border-radius: px2rem(16px)
        overflow: hidden
        border: 2px solid #ffe0e0
        margin-bottom: px2rem(20px)

      .modal-coupon-left
        flex: 0 0 px2rem(200px)
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        padding: px2rem(24px)
        background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)

        .modal-coupon-value
          display: flex
          align-items: baseline
          margin-bottom: px2rem(8px)

          .modal-coupon-symbol
            font-size: px2rem(36px)
            color: #fff
            font-weight: bold
            margin-right: px2rem(4px)

          .modal-coupon-amount
            font-size: px2rem(72px)
            font-weight: bold
            color: #fff
            line-height: 1

        .modal-coupon-condition
          font-size: px2rem(24px)
          color: rgba(255, 255, 255, 0.9)

      .modal-coupon-divider
        width: px2rem(2px)
        background: repeating-linear-gradient(
          to bottom,
          transparent,
          transparent px2rem(8px),
          #fff px2rem(8px),
          #fff px2rem(16px)
        )
        margin: px2rem(24px) 0
        position: relative

        &::before, &::after
          content: ''
          position: absolute
          left: 50%
          transform: translateX(-50%)
          width: px2rem(36px)
          height: px2rem(36px)
          background-color: #f5f5f5
          border-radius: 50%

        &::before
          top: -px2rem(42px)

        &::after
          bottom: -px2rem(42px)

      .modal-coupon-right
        flex: 1
        display: flex
        flex-direction: column
        justify-content: center
        padding: px2rem(24px)

        .modal-coupon-name
          font-size: px2rem(34px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)

        .modal-coupon-validity
          font-size: px2rem(24px)
          color: #999

    .modal-coupon-restaurant
      display: flex
      align-items: center
      padding: px2rem(16px) px2rem(20px)
      background-color: #f8f8f8
      border-radius: px2rem(8px)
      margin-bottom: px2rem(30px)

      .restaurant-label
        font-size: px2rem(26px)
        color: #999
        margin-right: px2rem(8px)

      .restaurant-name
        font-size: px2rem(28px)
        color: #333
        font-weight: bold

    .modal-actions
      .modal-btn
        width: 100%
        padding: px2rem(28px)
        font-size: px2rem(32px)
        font-weight: bold
        border: none
        border-radius: px2rem(12px)
        cursor: pointer
        transition: all 0.3s

        &.primary
          background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)
          color: #fff

          &:hover
            opacity: 0.9

          &:disabled
            background-color: #ccc
            cursor: not-allowed

  .search-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.3)
    z-index: 200

  .search-panel
    background-color: #fff
    min-height: 60vh
    padding: px2rem(20px)

    .search-header
      display: flex
      align-items: center
      margin-bottom: px2rem(30px)

      .search-input
        flex: 1
        height: px2rem(70px)
        padding: 0 px2rem(24px)
        font-size: px2rem(28px)
        background-color: #f5f5f5
        border: none
        border-radius: px2rem(35px)
        outline: none

        &::placeholder
          color: #999

      .search-cancel
        font-size: px2rem(28px)
        color: #666
        margin-left: px2rem(20px)
        cursor: pointer

    .search-history-section, .search-hot-section
      margin-bottom: px2rem(30px)

    .search-section-header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: px2rem(20px)

      .search-section-title
        font-size: px2rem(28px)
        font-weight: bold
        color: #333

      .search-clear-history
        font-size: px2rem(24px)
        color: #999
        cursor: pointer

    .search-tags
      display: flex
      flex-wrap: wrap
      gap: px2rem(16px)

      .search-tag
        font-size: px2rem(26px)
        color: #333
        background-color: #f8f8f8
        padding: px2rem(16px) px2rem(32px)
        border-radius: px2rem(30px)
        cursor: pointer
        transition: all 0.2s

        &:hover
          background-color: #f0f9f8
          color: #06c1ae

        &.hot
          color: #ff6b00
          background-color: rgba(255, 107, 0, 0.05)

          &:hover
            background-color: rgba(255, 107, 0, 0.1)
</style>
