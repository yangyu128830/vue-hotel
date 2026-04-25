<template>
  <div class="food-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="header-content">
        <div class="location-section" @click="toggleCityDropdown">
          <div class="location-icon">📍</div>
          <div class="location-info">
            <div class="location-label">当前位置</div>
            <div class="location-name">{{ currentCity }}</div>
          </div>
          <div class="location-arrow" :class="{ up: showCityDropdown }">▼</div>
        </div>
        <div class="search-section">
          <div class="search-icon-inline">🔍</div>
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索美食、餐厅、小吃" 
            class="search-input-inline"
            @focus="showSearchSuggestion"
            @keyup.enter="doSearch"
          />
          <div class="search-clear-btn" v-show="searchKeyword" @click="clearSearch">✕</div>
        </div>
        <div class="search-btn" @click="doSearch">
          <span class="search-btn-text">搜索</span>
        </div>
      </div>
    </div>

    <div class="search-suggestion-overlay" v-show="showSuggestion" @click="hideSearchSuggestion">
      <div class="search-suggestion" @click.stop>
        <div class="search-suggestion-header">
          <span class="suggestion-title">热门搜索</span>
        </div>
        <div class="hot-search-tags">
          <span 
            v-for="tag in hotSearchTags" 
            :key="tag" 
            class="hot-search-tag"
            @click="searchByTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
        <div class="search-suggestion-header" v-show="searchHistory.length > 0">
          <span class="suggestion-title">搜索历史</span>
          <span class="clear-history" @click="clearHistory">清空</span>
        </div>
        <div class="search-history-list" v-show="searchHistory.length > 0">
          <div 
            v-for="(history, index) in searchHistory" 
            :key="index" 
            class="search-history-item"
            @click="searchByHistory(history)"
          >
            <span class="history-icon">🕐</span>
            <span class="history-text">{{ history }}</span>
          </div>
        </div>
        <div class="search-suggestion-header" v-show="searchKeyword && searchSuggestions.length > 0">
          <span class="suggestion-title">搜索建议</span>
        </div>
        <div class="search-suggestion-list" v-show="searchKeyword && searchSuggestions.length > 0">
          <div 
            v-for="(suggestion, index) in searchSuggestions" 
            :key="index" 
            class="search-suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <span class="suggestion-icon">🍽️</span>
            <span class="suggestion-text">{{ suggestion.name }}</span>
            <span class="suggestion-location">{{ suggestion.location }}</span>
          </div>
        </div>
        <div class="no-search-result" v-show="searchKeyword && searchSuggestions.length === 0">
          <div class="no-result-icon">🔍</div>
          <div class="no-result-text">未找到相关美食</div>
        </div>
      </div>
    </div>

    <div class="city-dropdown-overlay" v-show="showCityDropdown" @click="closeCityDropdown">
      <div class="city-dropdown" @click.stop>
        <div class="city-dropdown-header">
          <span class="city-dropdown-title">选择城市</span>
          <span class="city-dropdown-close" @click="closeCityDropdown">✕</span>
        </div>
        <div class="city-dropdown-content">
          <div class="city-group">
            <div class="city-group-title">热门城市</div>
            <div class="hot-cities">
              <div 
                v-for="city in hotCities" 
                :key="city.id"
                class="hot-city-item"
                :class="{ active: currentCity === city.name }"
                @click="selectCity(city)"
              >
                {{ city.name }}
              </div>
            </div>
          </div>
          <div class="city-group">
            <div class="city-group-title">全部城市</div>
            <div class="all-cities">
              <div 
                v-for="city in allCities" 
                :key="city.id"
                class="city-item"
                :class="{ active: currentCity === city.name }"
                @click="selectCity(city)"
              >
                {{ city.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="coupon-section">
      <div class="section-header">
        <span class="section-title">🎁 领卷专区</span>
        <span class="section-more" @click="viewMoreCoupons">更多 ></span>
      </div>
      <div class="coupon-scroll">
        <div 
          v-for="coupon in availableCoupons" 
          :key="coupon.id"
          class="coupon-card"
          :class="{ claimed: isCouponClaimed(coupon.id) }"
          @click="claimCoupon(coupon)"
        >
          <div class="coupon-left">
            <div class="coupon-value">
              <span class="currency">¥</span>
              <span class="value">{{ coupon.value }}</span>
            </div>
            <div class="coupon-condition">满{{ coupon.minAmount }}可用</div>
          </div>
          <div class="coupon-divider"></div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-validity">有效期至{{ coupon.validUntil }}</div>
            <div class="coupon-btn" :class="{ disabled: isCouponClaimed(coupon.id) }">
              {{ isCouponClaimed(coupon.id) ? '已领取' : '立即领取' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="category-section">
      <div class="category-card">
        <div class="category-tabs">
          <div 
            v-for="(tab, index) in categoryTabs" 
            :key="tab.id"
            class="category-tab"
            :class="{ active: activeCategoryTab === index }"
            @click="switchCategoryTab(index)"
          >
            <div class="category-icon">{{ tab.icon }}</div>
            <div class="category-name">{{ tab.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="recommend-section">
      <div class="section-header">
        <span class="section-title">🍽️ 为你推荐</span>
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

      <div class="distance-dropdown" v-show="showDistanceDropdown">
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

      <div class="type-dropdown" v-show="showTypeDropdown">
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

      <div class="sort-dropdown" v-show="showSortDropdown">
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
          v-for="food in filteredFoods" 
          :key="food.id"
          class="food-item"
          @click="viewFoodDetail(food)"
        >
          <div class="food-image">
            <img :src="food.image" :alt="food.name" />
            <div class="distance-badge">{{ food.distance }}</div>
            <div class="coupon-badge" v-if="food.hasCoupon">
              <span>🎫</span>
              <span>有券</span>
            </div>
          </div>
          <div class="food-info">
            <div class="food-name">{{ food.name }}</div>
            <div class="food-rating">
              <span class="rating-value">{{ food.rating }}</span>
              <span class="rating-count">({{ food.ratingCount }}条点评)</span>
              <span class="order-count" v-if="food.orderCount">月售{{ food.orderCount }}+</span>
            </div>
            <div class="food-tags">
              <span v-for="tag in food.tags.slice(0, 3)" :key="tag" class="food-tag">{{ tag }}</span>
            </div>
            <div class="food-location">
              <span class="location-icon">📍</span>
              <span>{{ food.location }}</span>
              <span class="delivery-info" v-if="food.deliveryFee">
                | 配送费¥{{ food.deliveryFee }}
              </span>
            </div>
            <div class="food-price">
              <div class="price-section">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ food.price }}</span>
                <span class="original-price" v-if="food.originalPrice">¥{{ food.originalPrice }}</span>
              </div>
              <div class="coupon-info" v-if="food.hasCoupon">
                <span class="coupon-icon">🎫</span>
                <span>可使用优惠券</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="no-result" v-show="filteredFoods.length === 0">
        <div class="no-result-icon">🍽️</div>
        <div class="no-result-text">暂无符合条件的美食</div>
        <div class="no-result-tip">试试调整筛选条件</div>
      </div>
    </div>

    <div class="coupon-modal-overlay" v-show="showCouponModal" @click="closeCouponModal">
      <div class="coupon-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">领取优惠券</span>
          <span class="modal-close" @click="closeCouponModal">✕</span>
        </div>
        <div class="modal-content">
          <div class="modal-coupon-preview" :class="{ success: couponClaimSuccess }">
            <div class="coupon-preview-left">
              <div class="coupon-preview-value">
                <span class="currency">¥</span>
                <span class="value">{{ selectedCoupon.value }}</span>
              </div>
              <div class="coupon-preview-condition">满{{ selectedCoupon.minAmount }}可用</div>
            </div>
            <div class="coupon-preview-divider"></div>
            <div class="coupon-preview-right">
              <div class="coupon-preview-name">{{ selectedCoupon.name }}</div>
              <div class="coupon-preview-validity">有效期至{{ selectedCoupon.validUntil }}</div>
            </div>
          </div>
          <div class="modal-status" v-if="couponClaimSuccess">
            <span class="success-icon">✅</span>
            <span class="success-text">领取成功！</span>
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-btn" :class="{ disabled: couponClaimSuccess }" @click="confirmClaimCoupon">
            {{ couponClaimSuccess ? '已领取' : '立即领取' }}
          </div>
        </div>
      </div>
    </div>

    <div class="toast" :class="{ show: showToastVisible }">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-text">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Food',
  data () {
    return {
      currentCity: '北京',
      currentDistrict: '朝阳区',
      showCityDropdown: false,
      showSuggestion: false,
      searchKeyword: '',
      searchHistory: [],
      hotSearchTags: ['火锅', '奶茶', '烧烤', '汉堡', '披萨', '寿司', '麻辣烫', '炸鸡'],
      showDistanceDropdown: false,
      showTypeDropdown: false,
      showSortDropdown: false,
      selectedDistance: '',
      selectedType: '',
      selectedSort: '',
      activeCategoryTab: 0,
      showCouponModal: false,
      couponClaimSuccess: false,
      selectedCoupon: {
        id: 0,
        name: '',
        value: 0,
        minAmount: 0,
        validUntil: ''
      },
      claimedCoupons: [],
      showToastVisible: false,
      toastMessage: '',
      toastIcon: '✅',
      hotCities: [
        { id: 1, name: '北京' },
        { id: 2, name: '上海' },
        { id: 3, name: '广州' },
        { id: 4, name: '深圳' },
        { id: 5, name: '杭州' },
        { id: 6, name: '成都' },
        { id: 7, name: '西安' },
        { id: 8, name: '南京' }
      ],
      allCities: [
        { id: 1, name: '北京' },
        { id: 2, name: '上海' },
        { id: 3, name: '广州' },
        { id: 4, name: '深圳' },
        { id: 5, name: '杭州' },
        { id: 6, name: '成都' },
        { id: 7, name: '西安' },
        { id: 8, name: '南京' },
        { id: 9, name: '武汉' },
        { id: 10, name: '重庆' },
        { id: 11, name: '天津' },
        { id: 12, name: '苏州' },
        { id: 13, name: '厦门' },
        { id: 14, name: '三亚' },
        { id: 15, name: '青岛' },
        { id: 16, name: '大连' }
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
        { value: 'snack', label: '小吃' },
        { value: 'dessert', label: '甜点饮品' }
      ],
      sortOptions: [
        { value: '', label: '综合排序' },
        { value: 'distance', label: '距离最近' },
        { value: 'rating', label: '评分最高' },
        { value: 'price-asc', label: '价格最低' },
        { value: 'price-desc', label: '价格最高' },
        { value: 'sales', label: '销量最高' }
      ],
      categoryTabs: [
        { id: 'nearby', name: '附近美食', icon: '🍽️' },
        { id: 'milktea', name: '奶茶咖啡', icon: '🥤' },
        { id: 'snack', name: '小食快餐', icon: '🍔' },
        { id: 'student', name: '学生专区', icon: '🎓' }
      ],
      availableCoupons: [
        {
          id: 1,
          name: '新用户专享券',
          value: 20,
          minAmount: 50,
          validUntil: '2024-12-31',
          category: 'all'
        },
        {
          id: 2,
          name: '美食满减券',
          value: 15,
          minAmount: 60,
          validUntil: '2024-12-31',
          category: 'food'
        },
        {
          id: 3,
          name: '奶茶饮品券',
          value: 8,
          minAmount: 25,
          validUntil: '2024-12-31',
          category: 'drink'
        },
        {
          id: 4,
          name: '学生特惠券',
          value: 25,
          minAmount: 80,
          validUntil: '2024-12-31',
          category: 'student'
        }
      ],
      foods: [
        {
          id: 101,
          name: '老北京火锅',
          rating: 4.8,
          ratingCount: 2345,
          orderCount: 567,
          price: 88,
          originalPrice: 128,
          distance: '1.2km',
          distanceValue: 1.2,
          location: '朝阳区 · 三里屯',
          deliveryFee: 5,
          tags: ['火锅', '老北京', '人气推荐'],
          types: ['hotpot', 'chinese'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20hotpot%20restaurant%20delicious%20food%20beef%20lamb%20slices&image_size=square'
        },
        {
          id: 102,
          name: '川味烧烤',
          rating: 4.7,
          ratingCount: 1876,
          orderCount: 890,
          price: 68,
          originalPrice: 88,
          distance: '2.1km',
          distanceValue: 2.1,
          location: '朝阳区 · 国贸',
          deliveryFee: 3,
          tags: ['烧烤', '川味', '深夜食堂'],
          types: ['bbq', 'chinese'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20bbq%20grill%20skewers%20meat%20vegetables%20delicious&image_size=square'
        },
        {
          id: 103,
          name: '喜茶 HEYTEA',
          rating: 4.9,
          ratingCount: 3456,
          orderCount: 1234,
          price: 25,
          originalPrice: 30,
          distance: '0.8km',
          distanceValue: 0.8,
          location: '朝阳区 · 太古里',
          deliveryFee: 2,
          tags: ['奶茶', '网红店', '下午茶'],
          types: ['dessert', 'drink'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bubble%20tea%20milk%20tea%20drink%20tapioca%20pearls%20refreshing&image_size=square'
        },
        {
          id: 104,
          name: '肯德基 KFC',
          rating: 4.6,
          ratingCount: 5678,
          orderCount: 3456,
          price: 35,
          originalPrice: 45,
          distance: '1.5km',
          distanceValue: 1.5,
          location: '朝阳区 · 东直门',
          deliveryFee: 4,
          tags: ['快餐', '炸鸡', '汉堡'],
          types: ['fastfood', 'snack'],
          hasCoupon: false,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fried%20chicken%20hamburger%20fast%20food%20kfc%20style%20delicious&image_size=square'
        },
        {
          id: 105,
          name: '寿司之神',
          rating: 4.9,
          ratingCount: 1234,
          orderCount: 456,
          price: 128,
          originalPrice: 158,
          distance: '3.2km',
          distanceValue: 3.2,
          location: '朝阳区 · 望京',
          deliveryFee: 6,
          tags: ['日料', '寿司', '高端'],
          types: ['japanese'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20sushi%20fresh%20fish%20salmon%20tuna%20premium&image_size=square'
        },
        {
          id: 106,
          name: '麦当劳 McDonalds',
          rating: 4.5,
          ratingCount: 4567,
          orderCount: 2890,
          price: 38,
          originalPrice: 48,
          distance: '2.8km',
          distanceValue: 2.8,
          location: '朝阳区 · 大望路',
          deliveryFee: 3,
          tags: ['快餐', '汉堡', '薯条'],
          types: ['fastfood', 'snack'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hamburger%20french%20fries%20mcdonalds%20fast%20food%20burger&image_size=square'
        },
        {
          id: 107,
          name: '星巴克 Starbucks',
          rating: 4.7,
          ratingCount: 3210,
          orderCount: 1567,
          price: 32,
          originalPrice: 38,
          distance: '1.8km',
          distanceValue: 1.8,
          location: '朝阳区 · CBD',
          deliveryFee: 2,
          tags: ['咖啡', '下午茶', '商务'],
          types: ['dessert', 'drink'],
          hasCoupon: false,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starbucks%20coffee%20latte%20cappuccino%20coffee%20shop&image_size=square'
        },
        {
          id: 108,
          name: '杨国福麻辣烫',
          rating: 4.4,
          ratingCount: 2345,
          orderCount: 1890,
          price: 28,
          originalPrice: 35,
          distance: '0.5km',
          distanceValue: 0.5,
          location: '朝阳区 · 团结湖',
          deliveryFee: 1,
          tags: ['麻辣烫', '小吃', '实惠'],
          types: ['snack', 'chinese'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=malatang%20spicy%20hot%20pot%20chinese%20street%20food%20noodles&image_size=square'
        },
        {
          id: 109,
          name: '必胜客 Pizza Hut',
          rating: 4.6,
          ratingCount: 3456,
          orderCount: 2345,
          price: 78,
          originalPrice: 98,
          distance: '2.5km',
          distanceValue: 2.5,
          location: '朝阳区 · 双井',
          deliveryFee: 5,
          tags: ['披萨', '西餐', '家庭餐'],
          types: ['western'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pizza%20hut%20cheese%20pizza%20italian%20food%20pepperoni&image_size=square'
        },
        {
          id: 110,
          name: '一点点奶茶',
          rating: 4.8,
          ratingCount: 5678,
          orderCount: 4567,
          price: 18,
          originalPrice: 22,
          distance: '0.6km',
          distanceValue: 0.6,
          location: '朝阳区 · 工体',
          deliveryFee: 1,
          tags: ['奶茶', '饮品', '实惠'],
          types: ['dessert', 'drink'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bubble%20tea%20milk%20green%20tea%20tapioca%20refreshing%20drink&image_size=square'
        },
        {
          id: 111,
          name: '海底捞火锅',
          rating: 4.9,
          ratingCount: 8901,
          orderCount: 5678,
          price: 158,
          originalPrice: 198,
          distance: '4.2km',
          distanceValue: 4.2,
          location: '朝阳区 · 西单',
          deliveryFee: 8,
          tags: ['火锅', '服务好', '品牌连锁'],
          types: ['hotpot', 'chinese'],
          hasCoupon: true,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=haidilao%20hotpot%20chinese%20fondue%20meat%20vegetables%20delicious&image_size=square'
        },
        {
          id: 112,
          name: '汉堡王 Burger King',
          rating: 4.5,
          ratingCount: 2345,
          orderCount: 1890,
          price: 32,
          originalPrice: 40,
          distance: '1.9km',
          distanceValue: 1.9,
          location: '朝阳区 · 三里屯',
          deliveryFee: 4,
          tags: ['快餐', '汉堡', '实惠'],
          types: ['fastfood', 'snack'],
          hasCoupon: false,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=burger%20king%20hamburger%20whopper%20fast%20food%20beef%20burger&image_size=square'
        }
      ]
    }
  },
  computed: {
    filteredFoods () {
      let result = [...this.foods]

      if (this.searchKeyword) {
        result = result.filter(item =>
          item.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          item.location.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(this.searchKeyword.toLowerCase()))
        )
      }

      if (this.selectedDistance) {
        const maxDistance = parseFloat(this.selectedDistance)
        result = result.filter(item => item.distanceValue <= maxDistance)
      }

      if (this.selectedType) {
        result = result.filter(item => item.types.includes(this.selectedType))
      }

      if (this.activeCategoryTab === 1) {
        result = result.filter(item => item.types.includes('drink') || item.types.includes('dessert'))
      } else if (this.activeCategoryTab === 2) {
        result = result.filter(item => item.types.includes('fastfood') || item.types.includes('snack'))
      } else if (this.activeCategoryTab === 3) {
        result = result.filter(item => item.price <= 50)
      }

      if (this.selectedSort) {
        result = this.sortFoods(result, this.selectedSort)
      }

      return result
    },
    searchSuggestions () {
      if (!this.searchKeyword) {
        return []
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.foods.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword))
      ).slice(0, 10)
    }
  },
  methods: {
    sortFoods (foods, sortType) {
      const sorted = [...foods]
      switch (sortType) {
        case 'distance':
          sorted.sort((a, b) => a.distanceValue - b.distanceValue)
          break
        case 'rating':
          sorted.sort((a, b) => b.rating - a.rating)
          break
        case 'price-asc':
          sorted.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          sorted.sort((a, b) => b.price - a.price)
          break
        case 'sales':
          sorted.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
          break
      }
      return sorted
    },
    goBack () {
      this.$router.go(-1)
    },
    toggleCityDropdown () {
      this.showCityDropdown = !this.showCityDropdown
    },
    closeCityDropdown () {
      this.showCityDropdown = false
    },
    selectCity (city) {
      this.currentCity = city.name
      this.closeCityDropdown()
      console.log('选择城市:', city.name)
    },
    showSearchSuggestion () {
      this.showSuggestion = true
    },
    hideSearchSuggestion () {
      this.showSuggestion = false
    },
    clearSearch () {
      this.searchKeyword = ''
    },
    doSearch () {
      if (this.searchKeyword.trim()) {
        this.addToHistory(this.searchKeyword.trim())
      }
      this.hideSearchSuggestion()
    },
    searchByTag (tag) {
      this.searchKeyword = tag
      this.addToHistory(tag)
      this.hideSearchSuggestion()
    },
    searchByHistory (history) {
      this.searchKeyword = history
      this.addToHistory(history)
      this.hideSearchSuggestion()
    },
    selectSuggestion (suggestion) {
      this.searchKeyword = suggestion.name
      this.addToHistory(suggestion.name)
      this.hideSearchSuggestion()
    },
    addToHistory (keyword) {
      if (!keyword) return
      const history = this.searchHistory.filter(h => h !== keyword)
      history.unshift(keyword)
      this.searchHistory = history.slice(0, 10)
    },
    clearHistory () {
      this.searchHistory = []
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
    switchCategoryTab (index) {
      this.activeCategoryTab = index
    },
    viewMoreCoupons () {
      console.log('查看更多优惠券')
      this.showToast('📋', '更多优惠券功能开发中...')
    },
    isCouponClaimed (couponId) {
      return this.claimedCoupons.includes(couponId)
    },
    claimCoupon (coupon) {
      if (this.isCouponClaimed(coupon.id)) {
        this.showToast('❌', '您已经领取过该优惠券了')
        return
      }
      this.selectedCoupon = coupon
      this.couponClaimSuccess = false
      this.showCouponModal = true
    },
    closeCouponModal () {
      this.showCouponModal = false
      setTimeout(() => {
        this.couponClaimSuccess = false
      }, 300)
    },
    confirmClaimCoupon () {
      if (this.couponClaimSuccess) return

      this.claimedCoupons.push(this.selectedCoupon.id)
      this.couponClaimSuccess = true

      setTimeout(() => {
        this.closeCouponModal()
        this.showToast('✅', '优惠券领取成功！')
      }, 1500)
    },
    getFoodDescription (food) {
      const descriptions = {
        101: '老北京火锅传承百年老北京涮羊肉技艺，选用内蒙锡林郭勒草原优质羊肉，肉质鲜嫩，不膻不腻。锅底采用大骨熬制8小时，汤底浓郁醇厚。店内环境古色古香，服务热情周到，是朋友聚餐、家庭聚会的绝佳选择。',
        102: '川味烧烤秉承正宗川渝烧烤风味，独家秘制酱料，选用新鲜食材，每日现切现串。特色菜品包括烤五花肉、烤鸡翅、烤茄子等，麻辣鲜香，回味无穷。深夜不打烊，是宵夜小聚的好去处。',
        103: '喜茶HEYTEA致力于为消费者提供高品质的茶饮体验。严选世界各地优质茶叶，采用新鲜水果，用心打造每一杯好茶。招牌产品多肉葡萄、芝芝莓莓深受消费者喜爱。店内环境简约时尚，适合朋友小聚。',
        104: '肯德基KFC全球知名快餐品牌，以炸鸡、汉堡为主打产品。精选优质鸡肉，独家配方腌制，外酥里嫩。提供早餐、午餐、晚餐、宵夜全天服务，是快捷用餐的理想选择。',
        105: '寿司之神传承正宗日式寿司技艺，选用当日新鲜海产，由经验丰富的寿司师傅现场制作。招牌三文鱼寿司、金枪鱼寿司口感鲜美，是日料爱好者的天堂。店内环境优雅，服务专业。',
        106: '麦当劳McDonalds全球知名快餐品牌，以汉堡、薯条、麦旋风等产品深受消费者喜爱。提供超值套餐、开心乐园餐等多种选择，全天24小时服务，是家庭聚餐、快捷用餐的首选。',
        107: '星巴克Starbucks全球知名咖啡品牌，提供多种高品质咖啡饮品。精选世界各地优质咖啡豆，专业咖啡师手工制作。除咖啡外，还提供各种甜点、轻食，是商务洽谈、休闲小憩的理想场所。',
        108: '杨国福麻辣烫源自东北的知名麻辣烫品牌，以独特的骨汤汤底和丰富的食材选择著称。提供数十种新鲜食材，消费者可自由搭配。汤底浓郁，味道鲜美，价格实惠，深受消费者喜爱。',
        109: '必胜客Pizza Hut全球知名披萨品牌，以手工制作披萨为主打产品。精选优质面粉、新鲜食材，多种口味选择。除披萨外，还提供意面、焗饭、小吃等，是家庭聚餐、朋友聚会的好去处。',
        110: '一点点奶茶源自台湾的知名奶茶品牌，以新鲜、健康、美味为理念。提供多种茶饮产品，招牌波霸奶茶、四季奶青深受消费者喜爱。价格实惠，口味丰富，是年轻人喜爱的茶饮品牌。',
        111: '海底捞火锅以极致服务和优质菜品著称的知名火锅品牌。特色服务包括美甲、擦鞋、儿童游乐区等。招牌菜品有毛肚、虾滑、牛肉等，食材新鲜，味道正宗。是家庭聚餐、朋友聚会的热门选择。',
        112: '汉堡王Burger King全球知名快餐品牌，以"火烤"为特色。招牌皇堡系列汉堡，采用火烤牛肉饼，口感独特。提供多种汉堡、薯条、饮品选择，价格实惠，是快捷用餐的好选择。'
      }
      return descriptions[food.id] || `${food.name}是一家深受消费者喜爱的美食商家，提供优质的菜品和贴心的服务。食材新鲜，味道正宗，价格实惠，是休闲用餐的绝佳选择。`
    },
    viewFoodDetail (food) {
      const foodData = {
        id: food.id,
        name: food.name,
        image: food.image,
        rating: food.rating,
        ratingCount: food.ratingCount,
        orderCount: food.orderCount || 0,
        location: food.location,
        distance: food.distanceValue || 2,
        tags: food.tags || [],
        description: this.getFoodDescription(food)
      }
      this.$router.push({
        name: 'FoodDetail',
        params: { restaurantId: foodData.id },
        query: {
          name: foodData.name,
          image: foodData.image,
          rating: foodData.rating,
          ratingCount: foodData.ratingCount,
          orderCount: foodData.orderCount,
          location: foodData.location,
          distance: foodData.distance,
          tags: foodData.tags.join(','),
          description: foodData.description
        }
      })
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

.food-page
  min-height: 100vh
  background-color: #f5f5f5
  padding-bottom: px2rem(20px)

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
      flex-shrink: 0

    .header-content
      flex: 1
      display: flex
      flex-direction: column
      margin-left: px2rem(15px)
      gap: px2rem(15px)

    .location-section
      display: flex
      align-items: center
      padding: px2rem(12px) px2rem(16px)
      background-color: #f8f8f8
      border-radius: px2rem(8px)
      cursor: pointer

      .location-icon
        font-size: px2rem(32px)
        margin-right: px2rem(10px)

      .location-info
        flex: 1

        .location-label
          font-size: px2rem(20px)
          color: #999
          margin-bottom: px2rem(2px)

        .location-name
          font-size: px2rem(28px)
          font-weight: bold
          color: #333

      .location-arrow
        font-size: px2rem(18px)
        color: #999
        transition: transform 0.3s

        &.up
          transform: rotate(180deg)

    .search-section
      display: flex
      align-items: center
      background-color: #f5f5f5
      border-radius: px2rem(35px)
      padding: px2rem(12px) px2rem(20px)

      .search-icon-inline
        font-size: px2rem(32px)
        margin-right: px2rem(12px)
        color: #999

      .search-input-inline
        flex: 1
        border: none
        background: transparent
        font-size: px2rem(26px)
        color: #333
        outline: none

        &::placeholder
          color: #999

      .search-clear-btn
        font-size: px2rem(28px)
        color: #999
        cursor: pointer
        padding: px2rem(10px)

    .search-btn
      display: flex
      align-items: center
      justify-content: center
      padding: px2rem(12px) px2rem(30px)
      background-color: #06c1ae
      border-radius: px2rem(35px)
      cursor: pointer
      margin-left: px2rem(15px)
      transition: all 0.2s

      &:hover
        background-color: #05a897

      .search-btn-text
        font-size: px2rem(28px)
        font-weight: bold
        color: #fff

  .search-suggestion-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.3)
    z-index: 999

    .search-suggestion
      position: fixed
      top: px2rem(0)
      left: 0
      right: 0
      max-height: 70vh
      background-color: #fff
      overflow-y: auto
      padding: px2rem(20px)
      padding-top: px2rem(160px)

      .search-suggestion-header
        display: flex
        justify-content: space-between
        align-items: center
        margin-bottom: px2rem(15px)
        margin-top: px2rem(20px)

        &:first-child
          margin-top: 0

        .suggestion-title
          font-size: px2rem(28px)
          font-weight: bold
          color: #333

        .clear-history
          font-size: px2rem(24px)
          color: #999
          cursor: pointer

      .hot-search-tags
        display: flex
        flex-wrap: wrap
        gap: px2rem(15px)
        margin-bottom: px2rem(10px)

        .hot-search-tag
          padding: px2rem(12px) px2rem(25px)
          background-color: #f8f8f8
          border-radius: px2rem(30px)
          font-size: px2rem(26px)
          color: #666
          cursor: pointer
          transition: all 0.2s

          &:hover
            background-color: #f0f9f8
            color: #06c1ae

      .search-history-list
        margin-bottom: px2rem(10px)

        .search-history-item
          display: flex
          align-items: center
          padding: px2rem(20px) 0
          border-bottom: 1px solid #f5f5f5
          cursor: pointer

          &:last-child
            border-bottom: none

          .history-icon
            font-size: px2rem(28px)
            margin-right: px2rem(15px)
            color: #999

          .history-text
            font-size: px2rem(28px)
            color: #333

      .search-suggestion-list
        margin-bottom: px2rem(10px)

        .search-suggestion-item
          display: flex
          align-items: center
          padding: px2rem(20px) 0
          border-bottom: 1px solid #f5f5f5
          cursor: pointer

          &:last-child
            border-bottom: none

          .suggestion-icon
            font-size: px2rem(28px)
            margin-right: px2rem(15px)
            color: #999

          .suggestion-text
            font-size: px2rem(28px)
            color: #333
            flex: 1

          .suggestion-location
            font-size: px2rem(24px)
            color: #999

      .no-search-result
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        padding: px2rem(60px) 0

        .no-result-icon
          font-size: px2rem(80px)
          margin-bottom: px2rem(15px)

        .no-result-text
          font-size: px2rem(28px)
          color: #999

  .city-dropdown-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.5)
    z-index: 1000
    display: flex
    align-items: flex-end

    .city-dropdown
      width: 100%
      max-height: 80vh
      background-color: #fff
      border-top-left-radius: px2rem(20px)
      border-top-right-radius: px2rem(20px)
      overflow: hidden

      .city-dropdown-header
        display: flex
        justify-content: space-between
        align-items: center
        padding: px2rem(25px) px2rem(30px)
        border-bottom: 1px solid #eee

        .city-dropdown-title
          font-size: px2rem(32px)
          font-weight: bold
          color: #333

        .city-dropdown-close
          font-size: px2rem(36px)
          color: #999
          cursor: pointer
          padding: px2rem(10px)

      .city-dropdown-content
        padding: px2rem(25px) px2rem(30px)
        max-height: calc(80vh - px2rem(100px))
        overflow-y: auto

        .city-group
          margin-bottom: px2rem(30px)

          &:last-child
            margin-bottom: 0

          .city-group-title
            font-size: px2rem(26px)
            color: #999
            margin-bottom: px2rem(20px)

        .hot-cities
          display: flex
          flex-wrap: wrap
          gap: px2rem(15px)

          .hot-city-item
            padding: px2rem(15px) px2rem(30px)
            background-color: #f8f8f8
            border-radius: px2rem(8px)
            font-size: px2rem(28px)
            color: #333
            cursor: pointer
            transition: all 0.2s

            &:hover
              background-color: #f0f9f8

            &.active
              background-color: rgba(6, 193, 174, 0.1)
              color: #06c1ae

        .all-cities
          display: flex
          flex-direction: column

          .city-item
            padding: px2rem(20px) 0
            font-size: px2rem(28px)
            color: #333
            cursor: pointer
            border-bottom: 1px solid #f5f5f5

            &:last-child
              border-bottom: none

            &.active
              color: #06c1ae

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

  .coupon-section
    background-color: #fff
    margin-top: px2rem(12px)
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
      width: px2rem(450px)
      margin-right: px2rem(20px)
      display: flex
      cursor: pointer
      transition: transform 0.3s

      &:last-child
        margin-right: 0

      &:hover
        transform: translateY(-4px)

      &.claimed
        opacity: 0.6

      .coupon-left
        background: linear-gradient(135deg, #06c1ae, #05a897)
        border-radius: px2rem(12px) 0 0 px2rem(12px)
        padding: px2rem(25px) px2rem(20px)
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        min-width: px2rem(150px)
        position: relative
        overflow: hidden

        &::before
          content: ''
          position: absolute
          right: 0
          top: 50%
          transform: translateY(-50%)
          width: px2rem(20px)
          height: px2rem(20px)
          border-radius: 50%
          background-color: #f5f5f5
          margin-right: px2rem(-10px)

        .coupon-value
          display: flex
          align-items: baseline
          margin-bottom: px2rem(5px)

          .currency
            font-size: px2rem(24px)
            color: #fff
            font-weight: bold

          .value
            font-size: px2rem(64px)
            font-weight: bold
            color: #fff
            line-height: 1

        .coupon-condition
          font-size: px2rem(22px)
          color: rgba(255, 255, 255, 0.9)

      .coupon-divider
        width: px2rem(1px)
        background-color: #eee
        position: relative

        &::before
          content: ''
          position: absolute
          left: 50%
          top: 0
          transform: translateX(-50%) translateY(-50%)
          width: px2rem(20px)
          height: px2rem(20px)
          border-radius: 50%
          background-color: #f5f5f5

        &::after
          content: ''
          position: absolute
          left: 50%
          bottom: 0
          transform: translateX(-50%) translateY(50%)
          width: px2rem(20px)
          height: px2rem(20px)
          border-radius: 50%
          background-color: #f5f5f5

      .coupon-right
        background-color: #fff
        border-radius: 0 px2rem(12px) px2rem(12px) 0
        border: 1px solid #eee
        border-left: none
        padding: px2rem(25px) px2rem(20px)
        display: flex
        flex-direction: column
        justify-content: space-between
        flex: 1
        position: relative

        &::before
          content: ''
          position: absolute
          left: 0
          top: 50%
          transform: translateY(-50%)
          width: px2rem(20px)
          height: px2rem(20px)
          border-radius: 50%
          background-color: #f5f5f5
          margin-left: px2rem(-10px)

        .coupon-name
          font-size: px2rem(28px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(8px)

        .coupon-validity
          font-size: px2rem(22px)
          color: #999
          margin-bottom: px2rem(15px)

        .coupon-btn
          background-color: #06c1ae
          color: #fff
          padding: px2rem(10px) px2rem(20px)
          border-radius: px2rem(25px)
          text-align: center
          font-size: px2rem(24px)
          font-weight: bold
          transition: all 0.2s

          &:hover
            background-color: #05a897

          &.disabled
            background-color: #ccc
            cursor: not-allowed

  .category-section
    margin-top: px2rem(12px)
    padding: 0 px2rem(16px)

    .category-card
      background-color: #fff
      border-radius: px2rem(12px)
      padding: px2rem(20px)
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)

      .category-tabs
        display: flex
        justify-content: space-between

        .category-tab
          display: flex
          flex-direction: column
          align-items: center
          padding: px2rem(15px) px2rem(10px)
          cursor: pointer
          transition: all 0.3s
          border-radius: px2rem(8px)
          flex: 1
          margin: 0 px2rem(5px)

          &:first-child
            margin-left: 0

          &:last-child
            margin-right: 0

          &:hover
            background-color: #f0f9f8

          &.active
            background-color: rgba(6, 193, 174, 0.1)

            .category-icon
              transform: scale(1.1)

            .category-name
              color: #06c1ae
              font-weight: bold

          .category-icon
            font-size: px2rem(56px)
            margin-bottom: px2rem(10px)
            transition: transform 0.3s

          .category-name
            font-size: px2rem(24px)
            color: #333
            text-align: center

  .recommend-section
    background-color: #fff
    margin-top: px2rem(12px)
    padding: px2rem(20px) px2rem(16px)

    .filter-bar
      display: flex
      background-color: #f8f8f8
      border-radius: px2rem(8px)
      padding: px2rem(8px)
      margin-bottom: px2rem(25px)

      .filter-item
        flex: 1
        display: flex
        align-items: center
        justify-content: center
        padding: px2rem(15px) px2rem(10px)
        font-size: px2rem(26px)
        color: #666
        border-radius: px2rem(6px)
        cursor: pointer
        transition: all 0.3s
        position: relative

        &:hover
          background-color: #fff

        &.active
          background-color: #fff
          font-weight: bold
          color: #06c1ae

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

    .distance-dropdown,
    .type-dropdown,
    .sort-dropdown
      background-color: #fff
      border-radius: px2rem(8px)
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)
      margin-top: px2rem(-20px)
      margin-bottom: px2rem(20px)
      overflow: hidden
      z-index: 100
      position: relative

      .dropdown-option
        padding: px2rem(25px) px2rem(30px)
        font-size: px2rem(28px)
        color: #333
        cursor: pointer
        border-bottom: 1px solid #f5f5f5
        transition: all 0.2s

        &:last-child
          border-bottom: none

        &:hover
          background-color: #f0f9f8

        &.active
          color: #06c1ae
          font-weight: bold
          background-color: rgba(6, 193, 174, 0.05)

    .food-list
      display: flex
      flex-direction: column
      gap: px2rem(20px)

    .food-item
      display: flex
      padding: px2rem(20px)
      background-color: #fafafa
      border-radius: px2rem(12px)
      cursor: pointer
      transition: background-color 0.3s

      &:hover
        background-color: #f0f9f8

      .food-image
        width: px2rem(200px)
        height: px2rem(180px)
        flex-shrink: 0
        border-radius: px2rem(8px)
        overflow: hidden
        margin-right: px2rem(20px)
        position: relative

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

        .coupon-badge
          position: absolute
          bottom: px2rem(12px)
          left: px2rem(12px)
          background: linear-gradient(135deg, #06c1ae, #05a897)
          color: #fff
          font-size: px2rem(20px)
          padding: px2rem(4px) px2rem(12px)
          border-radius: px2rem(12px)
          display: flex
          align-items: center
          gap: px2rem(4px)

      .food-info
        flex: 1
        min-width: 0
        display: flex
        flex-direction: column

        .food-name
          font-size: px2rem(32px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .food-rating
          display: flex
          align-items: center
          margin-bottom: px2rem(12px)

          .rating-value
            font-size: px2rem(28px)
            font-weight: bold
            color: #05a897
            margin-right: px2rem(8px)

          .rating-count
            font-size: px2rem(22px)
            color: #999
            margin-right: px2rem(15px)

          .order-count
            font-size: px2rem(22px)
            color: #06c1ae

        .food-tags
          display: flex
          flex-wrap: wrap
          gap: px2rem(10px)
          margin-bottom: px2rem(12px)

          .food-tag
            font-size: px2rem(22px)
            color: #06c1ae
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(4px) px2rem(12px)
            border-radius: px2rem(4px)

        .food-location
          display: flex
          align-items: center
          margin-bottom: px2rem(15px)
          font-size: px2rem(24px)
          color: #999

          .location-icon
            margin-right: px2rem(6px)

          .delivery-info
            margin-left: px2rem(10px)

        .food-price
          display: flex
          justify-content: space-between
          align-items: center
          margin-top: auto

          .price-section
            display: flex
            align-items: baseline

            .price-symbol
              font-size: px2rem(24px)
              color: #06c1ae
              margin-right: px2rem(4px)

            .price-value
              font-size: px2rem(40px)
              font-weight: bold
              color: #06c1ae

            .original-price
              font-size: px2rem(24px)
              color: #999
              text-decoration: line-through
              margin-left: px2rem(10px)

          .coupon-info
            display: flex
            align-items: center
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(8px) px2rem(15px)
            border-radius: px2rem(20px)

            .coupon-icon
              font-size: px2rem(24px)
              margin-right: px2rem(6px)

            span:last-child
              font-size: px2rem(22px)
              color: #06c1ae

  .no-result
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    padding: px2rem(60px) 0

    .no-result-icon
      font-size: px2rem(80px)
      margin-bottom: px2rem(15px)

    .no-result-text
      font-size: px2rem(28px)
      color: #999
      margin-bottom: px2rem(8px)

    .no-result-tip
      font-size: px2rem(24px)
      color: #ccc

  .coupon-modal-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.6)
    z-index: 2000
    display: flex
    align-items: center
    justify-content: center

    .coupon-modal
      width: px2rem(600px)
      background-color: #fff
      border-radius: px2rem(20px)
      overflow: hidden
      margin: px2rem(40px)

      .modal-header
        display: flex
        justify-content: space-between
        align-items: center
        padding: px2rem(30px) px2rem(40px)
        border-bottom: 1px solid #eee

        .modal-title
          font-size: px2rem(36px)
          font-weight: bold
          color: #333

        .modal-close
          font-size: px2rem(40px)
          color: #999
          cursor: pointer
          padding: px2rem(10px)

      .modal-content
        padding: px2rem(40px)
        display: flex
        flex-direction: column
        align-items: center

        .modal-coupon-preview
          display: flex
          width: 100%
          border-radius: px2rem(12px)
          overflow: hidden
          margin-bottom: px2rem(30px)
          transition: all 0.3s

          &.success
            opacity: 0.6

          .coupon-preview-left
            background: linear-gradient(135deg, #06c1ae, #05a897)
            padding: px2rem(35px) px2rem(30px)
            display: flex
            flex-direction: column
            align-items: center
            justify-content: center
            min-width: px2rem(180px)

            .coupon-preview-value
              display: flex
              align-items: baseline
              margin-bottom: px2rem(8px)

              .currency
                font-size: px2rem(28px)
                color: #fff
                font-weight: bold

              .value
                font-size: px2rem(72px)
                font-weight: bold
                color: #fff
                line-height: 1

            .coupon-preview-condition
              font-size: px2rem(24px)
              color: rgba(255, 255, 255, 0.9)

          .coupon-preview-divider
            width: px2rem(1px)
            background-color: #eee
            position: relative

            &::before
              content: ''
              position: absolute
              left: 50%
              top: 0
              transform: translateX(-50%) translateY(-50%)
              width: px2rem(24px)
              height: px2rem(24px)
              border-radius: 50%
              background-color: #f5f5f5

            &::after
              content: ''
              position: absolute
              left: 50%
              bottom: 0
              transform: translateX(-50%) translateY(50%)
              width: px2rem(24px)
              height: px2rem(24px)
              border-radius: 50%
              background-color: #f5f5f5

          .coupon-preview-right
            background-color: #fff
            border: 1px solid #eee
            border-left: none
            padding: px2rem(35px) px2rem(30px)
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1

            .coupon-preview-name
              font-size: px2rem(32px)
              font-weight: bold
              color: #333
              margin-bottom: px2rem(12px)

            .coupon-preview-validity
              font-size: px2rem(26px)
              color: #999

        .modal-status
          display: flex
          align-items: center
          justify-content: center

          .success-icon
            font-size: px2rem(40px)
            margin-right: px2rem(15px)

          .success-text
            font-size: px2rem(32px)
            font-weight: bold
            color: #4caf50

      .modal-footer
        padding: px2rem(30px) px2rem(40px)
        border-top: 1px solid #eee

        .modal-btn
          background-color: #06c1ae
          color: #fff
          padding: px2rem(25px)
          border-radius: px2rem(10px)
          text-align: center
          font-size: px2rem(32px)
          font-weight: bold
          cursor: pointer
          transition: all 0.2s

          &:hover
            background-color: #05a897

          &.disabled
            background-color: #ccc
            cursor: not-allowed

  .toast
    position: fixed
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    background-color: rgba(0, 0, 0, 0.8)
    color: #fff
    padding: px2rem(30px) px2rem(50px)
    border-radius: px2rem(12px)
    font-size: px2rem(28px)
    display: flex
    align-items: center
    gap: px2rem(15px)
    z-index: 3000
    opacity: 0
    visibility: hidden
    transition: all 0.3s

    &.show
      opacity: 1
      visibility: visible

    .toast-icon
      font-size: px2rem(40px)

    .toast-text
      font-weight: bold
</style>
