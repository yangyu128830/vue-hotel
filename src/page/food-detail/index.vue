<template>
  <div class="food-detail-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="header-title">{{ restaurantName }}</div>
      <div class="share-btn">
        <span>⋮</span>
      </div>
    </div>

    <div class="restaurant-banner">
      <img :src="restaurantImage" :alt="restaurantName" class="restaurant-image" />
      <div class="restaurant-info-overlay">
        <div class="restaurant-name">{{ restaurantName }}</div>
        <div class="restaurant-tags">
          <span v-for="tag in restaurantTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="score-section">
      <div class="score-info">
        <div class="score-value">{{ restaurantRating }}</div>
        <div class="score-text">
          <div class="score-label">综合评分</div>
          <div class="comment-count">{{ restaurantRatingCount }}条点评</div>
          <div class="order-count" v-if="restaurantOrderCount">月售{{ restaurantOrderCount }}+</div>
        </div>
      </div>
      <div class="score-breakdown">
        <div class="score-item">
          <span class="score-dimension">口味</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.taste) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.taste }}</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">环境</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.environment) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.environment }}</span>
        </div>
        <div class="score-item">
          <span class="score-dimension">服务</span>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: getScorePercent(scoreBreakdown.service) + '%' }"></div>
          </div>
          <span class="score-number">{{ scoreBreakdown.service }}</span>
        </div>
      </div>
    </div>

    <div class="intro-section">
      <div class="section-title">
        <span class="title-text">🍽️ 商家特色</span>
      </div>
      <div class="intro-content">
        <p>{{ restaurantDescription }}</p>
      </div>
      <div class="business-info">
        <div class="info-item">
          <span class="info-icon">⏰</span>
          <span class="info-label">营业时间</span>
          <span class="info-value">{{ businessHours }}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📞</span>
          <span class="info-label">联系电话</span>
          <span class="info-value">{{ phoneNumber }}</span>
        </div>
      </div>
    </div>

    <div class="location-section">
      <div class="section-title">
        <span class="title-text">📍 位置与导航</span>
      </div>
      <div class="location-header">
        <div class="location-info">
          <div class="location-title">{{ restaurantLocation }}</div>
          <div class="location-distance">距您约 {{ restaurantDistance }} 公里</div>
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

    <div class="package-section">
      <div class="section-title">
        <span class="title-text">🎁 特价团购套餐</span>
        <span class="package-count">共 {{ packages.length }} 种套餐</span>
      </div>
      <div class="package-tabs">
        <div 
          v-for="(tab, index) in packageTabs" 
          :key="tab.value"
          class="package-tab"
          :class="{ active: activePackageTab === index }"
          @click="switchPackageTab(index)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="package-list">
        <div 
          v-for="pkg in filteredPackages" 
          :key="pkg.id" 
          class="package-card"
          :class="[
            getPackageClass(pkg),
            { selected: selectedPackage && selectedPackage.id === pkg.id }
          ]"
          @click="selectPackage(pkg)"
        >
          <div class="package-image-wrapper">
            <img :src="pkg.image" :alt="pkg.name" class="package-image" />
            <div class="save-badge">
              <span class="save-label">省</span>
              <span class="save-amount">¥{{ getSaveAmount(pkg) }}</span>
            </div>
            <div class="discount-badge" v-if="pkg.discount">
              <span class="discount-text">{{ pkg.discount }}折</span>
            </div>
          </div>
          <div class="package-content">
            <div class="package-top">
              <div class="package-name-row">
                <span class="package-name">{{ pkg.name }}</span>
                <div class="package-badges">
                  <span v-for="badge in pkg.badges" :key="badge" class="package-badge" :class="getBadgeClass(badge)">{{ badge }}</span>
                </div>
              </div>
              <div class="package-desc">{{ pkg.description }}</div>
            </div>
            <div class="package-middle">
              <div class="package-includes">
                <span class="includes-icon">🍽️</span>
                <span class="includes-text">
                  <span v-for="(item, index) in pkg.includes.slice(0, 4)" :key="index">
                    {{ item }}<span v-if="index < Math.min(pkg.includes.length - 1, 3)">、</span>
                  </span>
                  <span v-if="pkg.includes.length > 4">等{{ pkg.includes.length }}种</span>
                </span>
              </div>
              <div class="package-restrictions-mini" v-if="pkg.restrictions">
                <span class="restriction-item" v-if="pkg.restrictions.noWeekend">
                  <span class="restriction-icon">⚠️</span>
                  周六周日不可用
                </span>
                <span class="restriction-item" v-if="pkg.restrictions.studentOnly">
                  <span class="restriction-icon">🎓</span>
                  需学生证
                </span>
                <span class="restriction-item" v-if="pkg.restrictions.minHours">
                  <span class="restriction-icon">⏰</span>
                  {{ pkg.restrictions.minHours }}
                </span>
              </div>
            </div>
            <div class="package-bottom">
              <div class="package-price-info">
                <div class="price-row">
                  <span class="original-price" v-if="pkg.originalPrice">¥{{ pkg.originalPrice }}</span>
                  <span class="current-price">
                    <span class="price-symbol">¥</span>
                    <span class="price-value">{{ pkg.price }}</span>
                  </span>
                </div>
                <div class="sales-info" v-if="pkg.soldCount">
                  <span class="hot-icon">🔥</span>
                  <span class="sales-text">已售{{ pkg.soldCount }}+</span>
                </div>
              </div>
              <button 
                class="buy-button" 
                :class="{ selected: selectedPackage && selectedPackage.id === pkg.id }"
                @click.stop="togglePackageSelection(pkg)"
              >
                <span class="button-text">{{ selectedPackage && selectedPackage.id === pkg.id ? '已选择' : '立即抢购' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="filteredPackages.length === 0" class="no-packages">
        暂无符合条件的套餐
      </div>
    </div>

    <div class="recommend-dishes-section">
      <div class="section-title">
        <span class="title-text">🥘 推荐菜品</span>
      </div>
      <div class="dishes-list">
        <div 
          v-for="dish in recommendDishes" 
          :key="dish.id" 
          class="dish-item"
        >
          <div class="dish-image">
            <img :src="dish.image" :alt="dish.name" />
          </div>
          <div class="dish-info">
            <div class="dish-name">{{ dish.name }}</div>
            <div class="dish-tags">
              <span v-for="tag in dish.tags" :key="tag" class="dish-tag">{{ tag }}</span>
            </div>
            <div class="dish-desc">{{ dish.description }}</div>
            <div class="dish-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ dish.price }}</span>
            </div>
          </div>
          <div class="dish-sales" v-if="dish.sales">
            <span class="sales-text">月售{{ dish.sales }}份</span>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-section">
      <div class="section-title">
        <span class="title-text">💬 用户点评</span>
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

    <div v-if="selectedPackage" class="bottom-bar">
      <div class="bottom-price">
        <div class="selected-package-name">{{ selectedPackage.name }}</div>
        <div class="selected-package-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ selectedPackage.price }}</span>
          <span class="price-unit">/份</span>
        </div>
      </div>
      <div class="package-quantity">
        <button class="qty-btn" @click="decreaseQuantity" :disabled="packageQuantity <= 1">-</button>
        <span class="qty-value">{{ packageQuantity }}</span>
        <button class="qty-btn" @click="increaseQuantity">+</button>
      </div>
      <button class="bottom-buy-btn" @click="buySelectedPackage">立即抢购</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoodDetail',
  data () {
    return {
      selectedPackage: null,
      packageQuantity: 1,
      activePackageTab: 0,
      packageTabs: [
        { label: '全部', value: 'all' },
        { label: '限时特惠', value: 'limited' },
        { label: '学生专享', value: 'student' },
        { label: '工作日可用', value: 'weekday' }
      ],
      currentFilter: 'all',
      commentFilters: [
        { label: '全部', value: 'all' },
        { label: '好评', value: 'good' },
        { label: '中评', value: 'medium' },
        { label: '差评', value: 'bad' },
        { label: '有图', value: 'withImage' }
      ],
      scoreBreakdown: {
        taste: 4.8,
        environment: 4.6,
        service: 4.5
      },
      businessHours: '10:00 - 22:00',
      phoneNumber: '010-12345678',
      packages: [
        {
          id: 1,
          name: '双人豪华套餐',
          description: '包含招牌锅底、肉类拼盘、蔬菜拼盘、特色小吃、饮品等，适合2-3人享用',
          badges: ['热销推荐', '随时退'],
          includes: ['招牌鸳鸯锅', '精品牛肉卷', '精选羊肉卷', '时令蔬菜拼盘', '手打虾滑', '特色小吃x2', '酸梅汤x2'],
          price: 168,
          originalPrice: 268,
          discount: 6.3,
          soldCount: 5678,
          restrictions: null,
          packageType: 'hot',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20hotpot%20double%20set%20meal%20with%20beef%20lamb%20vegetables%20soup%20base&image_size=square'
        },
        {
          id: 2,
          name: '单人午市套餐',
          description: '工作日午市特惠，包含锅底、主食、配菜，适合单人午餐',
          badges: ['工作日特惠', '限午市'],
          includes: ['单人锅底', '精品肥牛', '蔬菜拼盘', '手打面条', '酸梅汤'],
          price: 58,
          originalPrice: 98,
          discount: 5.9,
          soldCount: 3456,
          restrictions: {
            noWeekend: true,
            minHours: '周一至周五 11:00-14:00'
          },
          packageType: 'weekday',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lunch%20special%20hotpot%20set%20for%20one%20person%20with%20beef%20vegetables%20noodles&image_size=square'
        },
        {
          id: 3,
          name: '大学生特惠双人餐',
          description: '大学生专享特惠，凭有效学生证可享此优惠，包含丰富菜品',
          badges: ['🎓学生专享', '超值特惠'],
          includes: ['招牌骨汤锅', '精品牛肉卷', '精选羊肉卷', '鱼豆腐', '蔬菜拼盘', '金针菇', '酸梅汤x2'],
          price: 128,
          originalPrice: 218,
          discount: 5.9,
          soldCount: 2345,
          restrictions: {
            studentOnly: true,
            quantityLimit: '每人限购2份'
          },
          packageType: 'student',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=student%20discount%20hotpot%20meal%20for%20two%20people%20affordable%20and%20delicious&image_size=square'
        },
        {
          id: 4,
          name: '4-6人欢聚套餐',
          description: '家庭聚餐、朋友聚会首选，包含多种招牌菜品，量大实惠',
          badges: ['家庭聚餐', '量大实惠'],
          includes: ['招牌鸳鸯锅', '精品牛肉卷x2', '精选羊肉卷x2', '手打虾滑', '毛肚', '黄喉', '鸭肠', '蔬菜大拼盘', '特色小吃x4', '酸梅汤x4'],
          price: 298,
          originalPrice: 458,
          discount: 6.5,
          soldCount: 1890,
          restrictions: null,
          packageType: 'family',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20gathering%20hotpot%20feast%20large%20portion%20various%20ingredients%20delicious&image_size=square'
        },
        {
          id: 5,
          name: '深夜食堂特惠',
          description: '夜间20:00以后使用，包含锅底、肉类、蔬菜，适合宵夜小聚',
          badges: ['深夜特惠', '限时段'],
          includes: ['单人锅底', '精品肥牛', '精选羊肉', '蔬菜拼盘', '特色小吃', '酸梅汤'],
          price: 88,
          originalPrice: 138,
          discount: 6.4,
          soldCount: 1234,
          restrictions: {
            minHours: '每日 20:00-22:00'
          },
          packageType: 'night',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=late%20night%20hotpot%20special%20snack%20dinner%20cozy%20atmosphere%20beef%20vegetables&image_size=square'
        }
      ],
      recommendDishes: [
        {
          id: 1,
          name: '招牌鸳鸯锅',
          tags: ['必点', '招牌'],
          description: '精选大骨熬制8小时，红汤麻辣鲜香，白汤浓郁醇厚，一锅两味满足不同需求',
          price: 58,
          sales: 12560,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20hotpot%20double%20flavor%20spicy%20and%20mild%20broth%20delicious&image_size=square'
        },
        {
          id: 2,
          name: '精品雪花牛肉',
          tags: ['人气TOP1', '鲜嫩'],
          description: '精选澳洲进口雪花牛肉，脂肪分布均匀，入口即化，涮煮8秒最佳',
          price: 68,
          sales: 9876,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20snowflake%20beef%20slices%20hotpot%20ingredient%20marbled%20meat&image_size=square'
        },
        {
          id: 3,
          name: '手打鲜虾滑',
          tags: ['手工制作', 'Q弹'],
          description: '选用鲜活青虾，手工捶打数百次，保留虾肉原有的鲜甜和弹性',
          price: 38,
          sales: 8765,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=handmade%20shrimp%20paste%20hotpot%20balls%20fresh%20seafood%20dish&image_size=square'
        },
        {
          id: 4,
          name: '九尺鲜鸭肠',
          tags: ['爽脆', '火锅必点'],
          description: '选用当日新鲜鸭肠，经过多道工序清洗，口感爽脆，七上八下最佳',
          price: 28,
          sales: 7654,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20duck%20intestines%20chinese%20hotpot%20ingredient%20crispy%20delicious&image_size=square'
        },
        {
          id: 5,
          name: '特色红糖糍粑',
          tags: ['小吃', '甜点'],
          description: '手工现炸糍粑，外酥里糯，搭配正宗红糖浆，解辣又解腻',
          price: 18,
          sales: 6543,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20brown%20sugar%20rice%20cake%20glutinous%20fried%20snack%20dessert&image_size=square'
        }
      ],
      comments: [
        {
          id: 1,
          userName: '张先生',
          date: '2026-04-24',
          score: 5,
          content: '非常棒的火锅体验！雪花牛肉入口即化，虾滑超级Q弹。服务员态度很好，环境也不错。团购套餐很划算，强烈推荐！',
          tags: ['味道好', '服务好', '性价比高'],
          images: [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20hotpot%20meal%20beef%20vegetables%20restaurant%20photo&image_size=square'
          ]
        },
        {
          id: 2,
          userName: '李女士',
          date: '2026-04-22',
          score: 4,
          content: '团购的工作日午餐套餐，价格很实惠，份量也够。环境还可以，就是中午人有点多，稍微有点吵。味道还是不错的。',
          tags: ['实惠', '午餐不错'],
          images: []
        },
        {
          id: 3,
          userName: '王同学',
          date: '2026-04-20',
          score: 5,
          content: '作为大学生，这个学生套餐真的太划算了！和室友一起来的，人均才60多，吃得特别饱。雪花牛肉真的太好吃了，下次还要来！',
          tags: ['学生优惠', '份量足', '味道赞'],
          images: [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friends%20eating%20hotpot%20together%20happy%20meal%20restaurant&image_size=square',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotpot%20with%20meat%20plates%20vegetables%20dining%20table&image_size=square'
          ]
        },
        {
          id: 4,
          userName: '赵女士',
          date: '2026-04-18',
          score: 3,
          content: '周末来的，人特别多，等了大概40分钟。味道还可以，但感觉没有特别惊艳的地方。团购套餐里的菜量一般。',
          tags: ['排队久'],
          images: []
        },
        {
          id: 5,
          userName: '陈先生',
          date: '2026-04-15',
          score: 5,
          content: '深夜食堂套餐真的太赞了！晚上加班后和同事来吃，价格实惠，份量足够。环境很安静，服务也很好。推荐给喜欢吃宵夜的朋友！',
          tags: ['深夜友好', '服务好', '价格实惠'],
          images: []
        }
      ]
    }
  },
  computed: {
    restaurantId () {
      return this.$route.params.restaurantId
    },
    restaurantName () {
      return this.$route.query.name || '商家名称'
    },
    restaurantImage () {
      return this.$route.query.image || ''
    },
    restaurantRating () {
      return this.$route.query.rating || 4.5
    },
    restaurantRatingCount () {
      return this.$route.query.ratingCount || 0
    },
    restaurantOrderCount () {
      return this.$route.query.orderCount || 0
    },
    restaurantLocation () {
      return this.$route.query.location || '商家位置'
    },
    restaurantDistance () {
      return this.$route.query.distance || '2.0'
    },
    restaurantTags () {
      const tags = this.$route.query.tags
      return tags ? tags.split(',') : []
    },
    restaurantDescription () {
      return this.$route.query.description || this.getDefaultDescription()
    },
    filteredPackages () {
      if (this.activePackageTab === 0) {
        return this.packages
      } else if (this.activePackageTab === 1) {
        return this.packages.filter(pkg => pkg.badges.some(b => b.includes('特惠') || b.includes('热销')))
      } else if (this.activePackageTab === 2) {
        return this.packages.filter(pkg => pkg.restrictions && pkg.restrictions.studentOnly)
      } else if (this.activePackageTab === 3) {
        return this.packages.filter(pkg => pkg.restrictions && pkg.restrictions.noWeekend)
      }
      return this.packages
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
    getDefaultDescription () {
      const id = parseInt(this.restaurantId)
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
      return descriptions[id] || '这是一家深受消费者喜爱的美食商家，提供优质的菜品和贴心的服务。食材新鲜，味道正宗，价格实惠，是休闲用餐的绝佳选择。'
    },
    goBack () {
      this.$router.go(-1)
    },
    getScorePercent (score) {
      return (score / 5) * 100
    },
    openMapNavigation () {
      alert('正在打开地图导航...\n位置：' + this.restaurantLocation)
    },
    copyAddress () {
      const address = this.restaurantLocation
      alert('地址已复制到剪贴板：\n' + address)
    },
    switchPackageTab (index) {
      this.activePackageTab = index
    },
    selectCommentFilter (filterValue) {
      this.currentFilter = filterValue
    },
    selectPackage (pkg) {
      if (this.selectedPackage && this.selectedPackage.id === pkg.id) {
        this.selectedPackage = null
      } else {
        this.selectedPackage = pkg
      }
    },
    togglePackageSelection (pkg) {
      this.selectPackage(pkg)
    },
    decreaseQuantity () {
      if (this.packageQuantity > 1) {
        this.packageQuantity--
      }
    },
    increaseQuantity () {
      this.packageQuantity++
    },
    buySelectedPackage () {
      if (this.selectedPackage) {
        const totalPrice = this.selectedPackage.price * this.packageQuantity
        alert(`购买 ${this.selectedPackage.name} × ${this.packageQuantity} 份\n总价：¥${totalPrice}`)
      }
    },
    getSaveAmount (pkg) {
      if (pkg.originalPrice && pkg.price) {
        return pkg.originalPrice - pkg.price
      }
      return 0
    },
    getPackageClass (pkg) {
      const typeClassMap = {
        hot: 'package-hot',
        student: 'package-student',
        weekday: 'package-weekday',
        family: 'package-family',
        night: 'package-night'
      }
      return typeClassMap[pkg.packageType] || ''
    },
    getBadgeClass (badge) {
      if (badge.includes('学生')) return 'badge-student'
      if (badge.includes('热销')) return 'badge-hot'
      if (badge.includes('特惠') || badge.includes('特价')) return 'badge-discount'
      if (badge.includes('工作日')) return 'badge-weekday'
      if (badge.includes('深夜')) return 'badge-night'
      return 'badge-default'
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.food-detail-page
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

  .restaurant-banner
    position: relative
    margin-top: px2rem(120px)
    height: px2rem(400px)
    overflow: hidden

    .restaurant-image
      width: 100%
      height: 100%
      object-fit: cover

    .restaurant-info-overlay
      position: absolute
      bottom: 0
      left: 0
      right: 0
      padding: px2rem(30px) px2rem(20px)
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7))

      .restaurant-name
        font-size: px2rem(40px)
        font-weight: bold
        color: #fff
        margin-bottom: px2rem(10px)

      .restaurant-tags
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
        color: #05a897
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
          display: inline-block
          margin-right: px2rem(15px)

        .order-count
          font-size: px2rem(24px)
          color: #06c1ae
          display: inline-block

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
            background-color: #05a897
            border-radius: px2rem(6px)
            transition: width 0.3s

        .score-number
          width: px2rem(60px)
          font-size: px2rem(24px)
          color: #05a897
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
      margin-bottom: px2rem(20px)

    .business-info
      background-color: #f8f8f8
      border-radius: px2rem(10px)
      padding: px2rem(20px)

      .info-item
        display: flex
        align-items: center
        margin-bottom: px2rem(15px)

        &:last-child
          margin-bottom: 0

        .info-icon
          font-size: px2rem(32px)
          margin-right: px2rem(15px)

        .info-label
          font-size: px2rem(24px)
          color: #999
          margin-right: px2rem(15px)
          min-width: px2rem(120px)

        .info-value
          font-size: px2rem(26px)
          color: #333
          font-weight: bold

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

  .package-section
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

      .package-count
        font-size: px2rem(24px)
        color: #999

    .package-tabs
      display: flex
      margin-bottom: px2rem(20px)
      overflow-x: auto

      .package-tab
        padding: px2rem(10px) px2rem(25px)
        background-color: #f5f5f5
        border: none
        border-radius: px2rem(20px)
        font-size: px2rem(24px)
        color: #666
        cursor: pointer
        margin-right: px2rem(15px)
        white-space: nowrap
        transition: all 0.3s

        &.active
          background-color: #ff6b00
          color: #fff
          font-weight: bold

    .package-list
      display: flex
      flex-direction: column
      gap: px2rem(20px)

    .package-card
      display: flex
      background-color: #fff
      border-radius: px2rem(16px)
      overflow: hidden
      cursor: pointer
      transition: all 0.3s ease
      border: 2px solid #f0f0f0
      position: relative

      &:hover
        box-shadow: 0 px2rem(8px) px2rem(24px) rgba(0, 0, 0, 0.08)
        transform: translateY(-px2rem(2px))

      &.selected
        border-color: #ff6b00
        box-shadow: 0 px2rem(4px) px2rem(16px) rgba(255, 107, 0, 0.15)

      &.package-hot
        background: linear-gradient(135deg, #fff5f5 0%, #fff 50%)
        border-color: #ffe0e0

      &.package-student
        background: linear-gradient(135deg, #f0f9ff 0%, #fff 50%)
        border-color: #d0e8ff

      &.package-weekday
        background: linear-gradient(135deg, #f0fff4 0%, #fff 50%)
        border-color: #d4edda

      &.package-family
        background: linear-gradient(135deg, #fffbeb 0%, #fff 50%)
        border-color: #fef3c7

      &.package-night
        background: linear-gradient(135deg, #faf5ff 0%, #fff 50%)
        border-color: #e9d5ff

      .package-image-wrapper
        position: relative
        width: px2rem(240px)
        flex-shrink: 0
        overflow: hidden

        .package-image
          width: 100%
          height: 100%
          object-fit: cover
          transition: transform 0.3s ease

      .package-card:hover .package-image-wrapper .package-image
        transform: scale(1.05)

      .save-badge
        position: absolute
        top: px2rem(12px)
        left: px2rem(12px)
        background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)
        border-radius: px2rem(4px)
        padding: px2rem(6px) px2rem(12px)
        display: flex
        flex-direction: column
        align-items: center
        box-shadow: 0 px2rem(2px) px2rem(8px) rgba(255, 107, 0, 0.3)

        .save-label
          font-size: px2rem(18px)
          color: rgba(255, 255, 255, 0.9)
          line-height: 1

        .save-amount
          font-size: px2rem(28px)
          font-weight: bold
          color: #fff
          line-height: 1
          margin-top: px2rem(2px)

      .discount-badge
        position: absolute
        top: px2rem(12px)
        right: px2rem(12px)
        background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)
        border-radius: px2rem(4px)
        padding: px2rem(6px) px2rem(12px)
        box-shadow: 0 px2rem(2px) px2rem(8px) rgba(255, 71, 87, 0.3)

        .discount-text
          font-size: px2rem(24px)
          font-weight: bold
          color: #fff

      .package-content
        flex: 1
        display: flex
        flex-direction: column
        padding: px2rem(20px)
        min-width: 0

        .package-top
          margin-bottom: px2rem(12px)

          .package-name-row
            display: flex
            align-items: center
            margin-bottom: px2rem(8px)
            flex-wrap: wrap
            gap: px2rem(8px)

            .package-name
              font-size: px2rem(30px)
              font-weight: bold
              color: #333
              margin-right: px2rem(10px)

            .package-badges
              display: flex
              gap: px2rem(8px)
              flex-wrap: wrap

              .package-badge
                font-size: px2rem(20px)
                padding: px2rem(4px) px2rem(12px)
                border-radius: px2rem(4px)
                font-weight: 500

                &.badge-hot
                  color: #ff4757
                  background-color: rgba(255, 71, 87, 0.1)

                &.badge-student
                  color: #1890ff
                  background-color: rgba(24, 144, 255, 0.1)

                &.badge-discount
                  color: #ff6b00
                  background-color: rgba(255, 107, 0, 0.1)

                &.badge-weekday
                  color: #52c41a
                  background-color: rgba(82, 196, 26, 0.1)

                &.badge-night
                  color: #722ed1
                  background-color: rgba(114, 46, 209, 0.1)

                &.badge-default
                  color: #666
                  background-color: #f5f5f5

          .package-desc
            font-size: px2rem(24px)
            color: #666
            line-height: 1.5
            overflow: hidden
            text-overflow: ellipsis
            display: -webkit-box
            -webkit-line-clamp: 2
            -webkit-box-orient: vertical

        .package-middle
          margin-bottom: px2rem(12px)

          .package-includes
            display: flex
            align-items: flex-start
            font-size: px2rem(22px)
            color: #666
            margin-bottom: px2rem(8px)
            flex-wrap: wrap

            .includes-icon
              margin-right: px2rem(6px)
              font-size: px2rem(24px)

            .includes-text
              overflow: hidden
              text-overflow: ellipsis
              white-space: nowrap

          .package-restrictions-mini
            display: flex
            flex-wrap: wrap
            gap: px2rem(12px)
            font-size: px2rem(20px)
            color: #999

            .restriction-item
              display: flex
              align-items: center
              padding: px2rem(4px) px2rem(8px)
              background-color: rgba(0, 0, 0, 0.02)
              border-radius: px2rem(4px)

              .restriction-icon
                margin-right: px2rem(4px)

        .package-bottom
          display: flex
          justify-content: space-between
          align-items: flex-end
          margin-top: auto

          .package-price-info
            display: flex
            flex-direction: column

            .price-row
              display: flex
              align-items: baseline
              margin-bottom: px2rem(4px)

              .original-price
                font-size: px2rem(24px)
                color: #999
                text-decoration: line-through
                margin-right: px2rem(10px)

              .current-price
                display: flex
                align-items: baseline

                .price-symbol
                  font-size: px2rem(24px)
                  color: #ff6b00
                  font-weight: bold

                .price-value
                  font-size: px2rem(44px)
                  font-weight: bold
                  color: #ff6b00
                  line-height: 1

            .sales-info
              display: flex
              align-items: center
              font-size: px2rem(20px)
              color: #ff6b00

              .hot-icon
                margin-right: px2rem(4px)

          .buy-button
            padding: px2rem(16px) px2rem(36px)
            background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%)
            color: #fff
            border: none
            border-radius: px2rem(8px)
            font-size: px2rem(26px)
            font-weight: bold
            cursor: pointer
            transition: all 0.3s ease
            box-shadow: 0 px2rem(4px) px2rem(12px) rgba(255, 107, 0, 0.3)

            &:hover
              background: linear-gradient(135deg, #e55a00 0%, #ff7a1a 100%)
              box-shadow: 0 px2rem(6px) px2rem(16px) rgba(255, 107, 0, 0.4)

            &.selected
              background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%)
              box-shadow: 0 px2rem(4px) px2rem(12px) rgba(82, 196, 26, 0.3)

            .button-text
              position: relative
              z-index: 1

    .no-packages
      text-align: center
      padding: px2rem(50px) 0
      font-size: px2rem(28px)
      color: #999

  .recommend-dishes-section
    background-color: #fff
    padding: px2rem(20px)
    margin-top: px2rem(20px)

    .section-title
      margin-bottom: px2rem(20px)

      .title-text
        font-size: px2rem(32px)
        font-weight: bold
        color: #333

    .dishes-list
      display: flex
      flex-direction: column
      gap: px2rem(20px)

    .dish-item
      display: flex
      padding: px2rem(15px)
      background-color: #fafafa
      border-radius: px2rem(12px)
      position: relative

      .dish-image
        width: px2rem(180px)
        height: px2rem(150px)
        flex-shrink: 0
        border-radius: px2rem(8px)
        overflow: hidden
        margin-right: px2rem(20px)

        img
          width: 100%
          height: 100%
          object-fit: cover

      .dish-info
        flex: 1
        min-width: 0

        .dish-name
          font-size: px2rem(30px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(8px)

        .dish-tags
          display: flex
          gap: px2rem(8px)
          margin-bottom: px2rem(10px)
          flex-wrap: wrap

          .dish-tag
            font-size: px2rem(20px)
            color: #ff6b00
            background-color: rgba(255, 107, 0, 0.1)
            padding: px2rem(4px) px2rem(10px)
            border-radius: px2rem(4px)

        .dish-desc
          font-size: px2rem(22px)
          color: #666
          line-height: 1.6
          margin-bottom: px2rem(10px)

        .dish-price
          display: flex
          align-items: baseline

          .price-symbol
            font-size: px2rem(22px)
            color: #ff6b00

          .price-value
            font-size: px2rem(32px)
            font-weight: bold
            color: #ff6b00

      .dish-sales
        position: absolute
        top: px2rem(15px)
        right: px2rem(15px)

        .sales-text
          font-size: px2rem(20px)
          color: #999

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
        transition: all 0.3s

        &.active
          background-color: #06c1ae
          color: #fff
          font-weight: bold

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
      .selected-package-name
        font-size: px2rem(24px)
        color: #333
        font-weight: bold
        margin-bottom: px2rem(5px)

      .selected-package-price
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

    .package-quantity
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

    .bottom-buy-btn
      padding: px2rem(20px) px2rem(50px)
      background-color: #ff6b00
      color: #fff
      border: none
      border-radius: px2rem(10px)
      font-size: px2rem(30px)
      font-weight: bold
      cursor: pointer
</style>

