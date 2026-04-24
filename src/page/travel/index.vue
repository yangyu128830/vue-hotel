<template>
  <div class="travel-page">
    <div class="header">
      <div class="back-btn" @click="goBack">
        <span>←</span>
      </div>
      <div class="location-section">
        <div class="location-icon">📍</div>
        <div class="location-info">
          <div class="location-label">当前位置</div>
          <div class="location-name">{{ currentCity }} · {{ currentDistrict }}</div>
        </div>
        <div class="location-arrow">▼</div>
      </div>
      <div class="search-icon" @click="toggleSearchBox">
        <span>🔍</span>
      </div>
    </div>

    <div class="search-box" v-show="showSearchBox">
      <input 
        type="text" 
        v-model="searchKeyword" 
        placeholder="搜索景点、门票、游玩项目" 
        class="search-input"
        @input="searchAttractions"
      />
      <button class="cancel-btn" @click="cancelSearch">取消</button>
    </div>

    <div class="special-deals-section">
      <div class="section-header">
        <span class="section-title">景点门票 · 天天特价</span>
        <span class="section-more" @click="viewMoreSpecialDeals">更多 ></span>
      </div>
      <div class="special-deals-scroll">
        <div 
          v-for="deal in specialDeals" 
          :key="deal.id"
          class="special-deal-card"
          @click="goToAttractionDetail(deal)"
        >
          <div class="deal-image">
            <img :src="deal.image" :alt="deal.name" />
            <div class="deal-badge">特价</div>
            <div class="discount-badge" v-if="deal.discount">{{ deal.discount }}折</div>
          </div>
          <div class="deal-info">
            <div class="deal-name">{{ deal.name }}</div>
            <div class="deal-location">{{ deal.location }}</div>
            <div class="deal-price">
              <span class="original-price" v-if="deal.originalPrice">¥{{ deal.originalPrice }}</span>
              <span class="current-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ deal.price }}</span>
                <span class="price-unit">起</span>
              </span>
            </div>
            <div class="deal-sold" v-if="deal.soldCount">已售{{ deal.soldCount }}+</div>
          </div>
        </div>
      </div>
    </div>

    <div class="ranking-section">
      <div class="section-header">
        <span class="section-title">游玩榜单</span>
        <span class="section-more" @click="viewMoreRanking">更多 ></span>
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
          :key="item.attraction.id"
          class="ranking-item"
          @click="goToAttractionDetail(item.attraction)"
        >
          <div class="ranking-number" :class="{ top3: index < 3 }">{{ index + 1 }}</div>
          <div class="ranking-image">
            <img :src="item.attraction.image" :alt="item.attraction.name" />
          </div>
          <div class="ranking-info">
            <div class="ranking-name">{{ item.attraction.name }}</div>
            <div class="ranking-desc">{{ item.description }}</div>
            <div class="ranking-tags">
              <span v-for="tag in item.attraction.tags.slice(0, 2)" :key="tag" class="ranking-tag">{{ tag }}</span>
            </div>
            <div class="ranking-bottom">
              <div class="ranking-score">
                <span class="score-value">{{ item.attraction.score }}</span>
                <span class="score-text">分</span>
              </div>
              <div class="ranking-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.attraction.price }}</span>
                <span class="price-unit">起</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="recommend-section">
      <div class="section-header">
        <span class="section-title">为你推荐</span>
      </div>
      
      <div class="filter-bar">
        <div class="filter-item" @click="toggleDistanceDropdown">
          <span :class="{ active: selectedDistance !== '' }">
            {{ selectedDistance ? getDistanceLabel(selectedDistance) : '距离筛选' }}
          </span>
          <span class="arrow" :class="{ up: showDistanceDropdown }">▼</span>
        </div>
        <div class="filter-item" @click="toggleTimeDropdown">
          <span :class="{ active: selectedTime !== '' }">
            {{ selectedTime ? getTimeLabel(selectedTime) : '交通时长' }}
          </span>
          <span class="arrow" :class="{ up: showTimeDropdown }">▼</span>
        </div>
        <div class="filter-item" :class="{ active: showFreeOnly }" @click="toggleFreeFilter">
          <span>免费景点</span>
          <span class="check-icon" v-show="showFreeOnly">✓</span>
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

      <div class="time-dropdown" v-show="showTimeDropdown">
        <div 
          v-for="option in timeOptions" 
          :key="option.value"
          class="dropdown-option"
          :class="{ active: selectedTime === option.value }"
          @click="selectTime(option.value)"
        >
          {{ option.label }}
        </div>
      </div>

      <div class="recommend-list">
        <div 
          v-for="attraction in filteredRecommendations" 
          :key="attraction.id"
          class="recommend-item"
          @click="goToAttractionDetail(attraction)"
        >
          <div class="recommend-image">
            <img :src="attraction.image" :alt="attraction.name" />
            <div class="free-badge" v-if="attraction.isFree">免费</div>
            <div class="distance-badge">{{ attraction.distance }}</div>
          </div>
          <div class="recommend-info">
            <div class="recommend-name">{{ attraction.name }}</div>
            <div class="recommend-location">{{ attraction.location }}</div>
            <div class="recommend-tags">
              <span v-for="tag in attraction.tags" :key="tag" class="recommend-tag">{{ tag }}</span>
            </div>
            <div class="recommend-meta">
              <div class="travel-time">
                <span class="time-icon">🚗</span>
                <span class="time-text">{{ attraction.travelTime }}</span>
              </div>
              <div class="recommend-score">
                <span class="score-value">{{ attraction.score }}</span>
                <span class="score-text">分</span>
                <span class="comment-count" v-if="attraction.commentCount">({{ attraction.commentCount }}条点评)</span>
              </div>
            </div>
            <div class="recommend-bottom">
              <div class="recommend-price" v-if="!attraction.isFree">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ attraction.price }}</span>
                <span class="price-unit">起</span>
              </div>
              <div class="recommend-free" v-else>
                <span class="free-text">免费入场</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="no-result" v-show="filteredRecommendations.length === 0">
        <div class="no-result-icon">🎡</div>
        <div class="no-result-text">暂无符合条件的景点</div>
        <div class="no-result-tip">试试调整筛选条件</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Travel',
  data () {
    return {
      currentCity: '北京',
      currentDistrict: '朝阳区',
      showSearchBox: false,
      searchKeyword: '',
      showDistanceDropdown: false,
      showTimeDropdown: false,
      selectedDistance: '',
      selectedTime: '',
      showFreeOnly: false,
      activeRankingTab: 0,
      rankingTabs: ['综合评分', '人气最热', '好评优先', '低价精选'],
      distanceOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '1公里内' },
        { value: '3', label: '3公里内' },
        { value: '5', label: '5公里内' },
        { value: '10', label: '10公里内' }
      ],
      timeOptions: [
        { value: '', label: '全部' },
        { value: '15', label: '15分钟内' },
        { value: '30', label: '30分钟内' },
        { value: '60', label: '1小时内' },
        { value: '120', label: '2小时内' }
      ],
      specialDeals: [
        {
          id: 101,
          name: '故宫博物院',
          location: '东城区 · 景山前街',
          price: 60,
          originalPrice: 80,
          discount: 7.5,
          soldCount: 2345,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%20ancient%20palace%20architecture&image_size=square'
        },
        {
          id: 102,
          name: '八达岭长城',
          location: '延庆区 · 八达岭镇',
          price: 45,
          originalPrice: 60,
          discount: 7.5,
          soldCount: 1876,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%20badaling%20scenic%20view&image_size=square'
        },
        {
          id: 103,
          name: '颐和园',
          location: '海淀区 · 新建宫门路',
          price: 30,
          originalPrice: 50,
          discount: 6,
          soldCount: 1567,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20palace%20beijing%20kunming%20lake%20garden&image_size=square'
        },
        {
          id: 104,
          name: '天坛公园',
          location: '东城区 · 天坛内大街',
          price: 25,
          originalPrice: 35,
          discount: 7,
          soldCount: 987,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=temple%20of%20heaven%20beijing%20temple%20architecture&image_size=square'
        }
      ],
      rankingData: [
        [
          { attraction: { id: 201, name: '故宫博物院', score: 4.9, price: 60, tags: ['历史古迹', '必游推荐', '世界遗产'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%20ancient%20palace%20architecture&image_size=square' }, description: '明清两代皇宫，世界最大的木质结构建筑群' },
          { attraction: { id: 202, name: '八达岭长城', score: 4.8, price: 45, tags: ['世界遗产', '自然风光', '登山徒步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%20badaling%20scenic%20view&image_size=square' }, description: '不到长城非好汉，万里长城最著名的段落' },
          { attraction: { id: 203, name: '颐和园', score: 4.7, price: 30, tags: ['皇家园林', '历史文化', '休闲漫步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20palace%20beijing%20kunming%20lake%20garden&image_size=square' }, description: '中国现存最大的皇家园林，湖光山色美不胜收' },
          { attraction: { id: 204, name: '天坛公园', score: 4.6, price: 25, tags: ['历史古迹', '祭祀文化', '公园散步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=temple%20of%20heaven%20beijing%20temple%20architecture&image_size=square' }, description: '明清皇帝祭天祈谷的场所，建筑设计精妙绝伦' },
          { attraction: { id: 205, name: '圆明园遗址公园', score: 4.5, price: 15, tags: ['历史遗址', '爱国主义', '园林景观'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20summer%20palace%20ruins%20yuanmingyuan%20park&image_size=square' }, description: '万园之园遗址，铭记历史，勿忘国耻' }
        ],
        [
          { attraction: { id: 201, name: '故宫博物院', score: 4.9, price: 60, tags: ['历史古迹', '必游推荐', '世界遗产'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%20ancient%20palace%20architecture&image_size=square' }, description: '人气爆棚，一票难求，需要提前预约' },
          { attraction: { id: 202, name: '八达岭长城', score: 4.8, price: 45, tags: ['世界遗产', '自然风光', '登山徒步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%20badaling%20scenic%20view&image_size=square' }, description: '节假日游客众多，建议错峰出行' },
          { attraction: { id: 206, name: '南锣鼓巷', score: 4.3, price: 0, tags: ['胡同文化', '特色街区', '美食小吃'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nanluoguxiang%20hutong%20beijing%20traditional%20street&image_size=square' }, description: '北京最古老的街区之一，网红打卡圣地' },
          { attraction: { id: 203, name: '颐和园', score: 4.7, price: 30, tags: ['皇家园林', '历史文化', '休闲漫步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20palace%20beijing%20kunming%20lake%20garden&image_size=square' }, description: '春夏秋冬四季皆宜，周末家庭游首选' },
          { attraction: { id: 207, name: '798艺术区', score: 4.4, price: 0, tags: ['艺术创意', '拍照打卡', '文艺范'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=798%20art%20district%20beijing%20contemporary%20art&image_size=square' }, description: '艺术爱好者天堂，拍照打卡超有格调' }
        ],
        [
          { attraction: { id: 201, name: '故宫博物院', score: 4.9, price: 60, tags: ['历史古迹', '必游推荐', '世界遗产'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%20ancient%20palace%20architecture&image_size=square' }, description: '好评如潮，服务贴心，值得反复游览' },
          { attraction: { id: 202, name: '八达岭长城', score: 4.8, price: 45, tags: ['世界遗产', '自然风光', '登山徒步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%20badaling%20scenic%20view&image_size=square' }, description: '设施完善，风景壮丽，导游讲解专业' },
          { attraction: { id: 203, name: '颐和园', score: 4.7, price: 30, tags: ['皇家园林', '历史文化', '休闲漫步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20palace%20beijing%20kunming%20lake%20garden&image_size=square' }, description: '环境优美，服务周到，适合全家出游' },
          { attraction: { id: 204, name: '天坛公园', score: 4.6, price: 25, tags: ['历史古迹', '祭祀文化', '公园散步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=temple%20of%20heaven%20beijing%20temple%20architecture&image_size=square' }, description: '建筑宏伟，历史厚重，讲解内容丰富' },
          { attraction: { id: 208, name: '恭王府', score: 4.5, price: 40, tags: ['历史建筑', '王府文化', '园林景观'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gong%20wang%20fu%20prince%20kung%20mansion%20beijing&image_size=square' }, description: '一座恭王府，半部清代史，值得细细品味' }
        ],
        [
          { attraction: { id: 206, name: '南锣鼓巷', score: 4.3, price: 0, tags: ['胡同文化', '特色街区', '美食小吃'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nanluoguxiang%20hutong%20beijing%20traditional%20street&image_size=square' }, description: '免费开放，美食众多，性价比超高' },
          { attraction: { id: 207, name: '798艺术区', score: 4.4, price: 0, tags: ['艺术创意', '拍照打卡', '文艺范'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=798%20art%20district%20beijing%20contemporary%20art&image_size=square' }, description: '免费入场，艺术氛围浓厚，拍照超赞' },
          { attraction: { id: 205, name: '圆明园遗址公园', score: 4.5, price: 15, tags: ['历史遗址', '爱国主义', '园林景观'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20summer%20palace%20ruins%20yuanmingyuan%20park&image_size=square' }, description: '门票便宜，历史厚重，适合带孩子学习' },
          { attraction: { id: 204, name: '天坛公园', score: 4.6, price: 25, tags: ['历史古迹', '祭祀文化', '公园散步'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=temple%20of%20heaven%20beijing%20temple%20architecture&image_size=square' }, description: '价格亲民，公园超大，可以玩一整天' },
          { attraction: { id: 209, name: '后海公园', score: 4.3, price: 0, tags: ['湖泊风光', '酒吧街', '胡同游'], image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=houhai%20lake%20beijing%20shichahai%20scenic&image_size=square' }, description: '免费开放，夜景超美，适合散步约会' }
        ]
      ],
      recommendations: [
        {
          id: 301,
          name: '故宫博物院',
          location: '东城区景山前街4号',
          distance: '2.5km',
          distanceValue: 2.5,
          travelTime: '约30分钟',
          travelTimeValue: 30,
          score: 4.9,
          commentCount: 23456,
          price: 60,
          isFree: false,
          tags: ['历史古迹', '必游推荐', '世界遗产'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%20ancient%20palace%20architecture&image_size=square'
        },
        {
          id: 302,
          name: '南锣鼓巷',
          location: '东城区南锣鼓巷胡同',
          distance: '1.2km',
          distanceValue: 1.2,
          travelTime: '约15分钟',
          travelTimeValue: 15,
          score: 4.3,
          commentCount: 18765,
          price: 0,
          isFree: true,
          tags: ['胡同文化', '特色街区', '美食小吃'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nanluoguxiang%20hutong%20beijing%20traditional%20street&image_size=square'
        },
        {
          id: 303,
          name: '八达岭长城',
          location: '延庆区八达岭镇',
          distance: '60km',
          distanceValue: 60,
          travelTime: '约2小时',
          travelTimeValue: 120,
          score: 4.8,
          commentCount: 34567,
          price: 45,
          isFree: false,
          tags: ['世界遗产', '自然风光', '登山徒步'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%20badaling%20scenic%20view&image_size=square'
        },
        {
          id: 304,
          name: '798艺术区',
          location: '朝阳区酒仙桥路4号',
          distance: '8km',
          distanceValue: 8,
          travelTime: '约45分钟',
          travelTimeValue: 45,
          score: 4.4,
          commentCount: 12345,
          price: 0,
          isFree: true,
          tags: ['艺术创意', '拍照打卡', '文艺范'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=798%20art%20district%20beijing%20contemporary%20art&image_size=square'
        },
        {
          id: 305,
          name: '颐和园',
          location: '海淀区新建宫门路19号',
          distance: '15km',
          distanceValue: 15,
          travelTime: '约1小时',
          travelTimeValue: 60,
          score: 4.7,
          commentCount: 28765,
          price: 30,
          isFree: false,
          tags: ['皇家园林', '历史文化', '休闲漫步'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20palace%20beijing%20kunming%20lake%20garden&image_size=square'
        },
        {
          id: 306,
          name: '后海公园',
          location: '西城区后海北沿',
          distance: '3km',
          distanceValue: 3,
          travelTime: '约20分钟',
          travelTimeValue: 20,
          score: 4.3,
          commentCount: 9876,
          price: 0,
          isFree: true,
          tags: ['湖泊风光', '酒吧街', '胡同游'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=houhai%20lake%20beijing%20shichahai%20scenic&image_size=square'
        },
        {
          id: 307,
          name: '天坛公园',
          location: '东城区天坛内大街1号',
          distance: '5km',
          distanceValue: 5,
          travelTime: '约35分钟',
          travelTimeValue: 35,
          score: 4.6,
          commentCount: 21567,
          price: 25,
          isFree: false,
          tags: ['历史古迹', '祭祀文化', '公园散步'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=temple%20of%20heaven%20beijing%20temple%20architecture&image_size=square'
        },
        {
          id: 308,
          name: '圆明园遗址公园',
          location: '海淀区清华西路28号',
          distance: '12km',
          distanceValue: 12,
          travelTime: '约50分钟',
          travelTimeValue: 50,
          score: 4.5,
          commentCount: 15678,
          price: 15,
          isFree: false,
          tags: ['历史遗址', '爱国主义', '园林景观'],
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20summer%20palace%20ruins%20yuanmingyuan%20park&image_size=square'
        }
      ]
    }
  },
  computed: {
    currentRankingList () {
      return this.rankingData[this.activeRankingTab] || []
    },
    filteredRecommendations () {
      let result = [...this.recommendations]

      if (this.searchKeyword) {
        result = result.filter(item =>
          item.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          item.location.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }

      if (this.selectedDistance) {
        const maxDistance = parseFloat(this.selectedDistance)
        result = result.filter(item => item.distanceValue <= maxDistance)
      }

      if (this.selectedTime) {
        const maxTime = parseInt(this.selectedTime)
        result = result.filter(item => item.travelTimeValue <= maxTime)
      }

      if (this.showFreeOnly) {
        result = result.filter(item => item.isFree)
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
    cancelSearch () {
      this.showSearchBox = false
      this.searchKeyword = ''
    },
    searchAttractions () {
      console.log('搜索景点:', this.searchKeyword)
    },
    toggleDistanceDropdown () {
      this.showDistanceDropdown = !this.showDistanceDropdown
      this.showTimeDropdown = false
    },
    toggleTimeDropdown () {
      this.showTimeDropdown = !this.showTimeDropdown
      this.showDistanceDropdown = false
    },
    selectDistance (value) {
      this.selectedDistance = value
      this.showDistanceDropdown = false
    },
    selectTime (value) {
      this.selectedTime = value
      this.showTimeDropdown = false
    },
    toggleFreeFilter () {
      this.showFreeOnly = !this.showFreeOnly
    },
    getDistanceLabel (value) {
      const option = this.distanceOptions.find(o => o.value === value)
      return option ? option.label : '距离筛选'
    },
    getTimeLabel (value) {
      const option = this.timeOptions.find(o => o.value === value)
      return option ? option.label : '交通时长'
    },
    switchRankingTab (index) {
      this.activeRankingTab = index
    },
    viewMoreSpecialDeals () {
      console.log('查看更多特价景点')
    },
    viewMoreRanking () {
      console.log('查看更多榜单')
    },
    goToAttractionDetail (attraction) {
      console.log('前往景点详情:', attraction.name)
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.travel-page
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

    .location-section
      flex: 1
      display: flex
      align-items: center
      padding: px2rem(15px) px2rem(20px)
      background-color: #f8f8f8
      border-radius: px2rem(8px)
      margin: 0 px2rem(15px)
      cursor: pointer

      .location-icon
        font-size: px2rem(36px)
        margin-right: px2rem(12px)

      .location-info
        flex: 1

        .location-label
          font-size: px2rem(22px)
          color: #999
          margin-bottom: px2rem(4px)

        .location-name
          font-size: px2rem(28px)
          font-weight: bold
          color: #333

      .location-arrow
        font-size: px2rem(20px)
        color: #999

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

  .special-deals-section
    background-color: #fff
    margin-top: px2rem(12px)
    padding: px2rem(20px) px2rem(16px)

    .special-deals-scroll
      display: flex
      overflow-x: auto
      padding-bottom: px2rem(10px)
      scrollbar-width: none
      -ms-overflow-style: none

      &::-webkit-scrollbar
        display: none

    .special-deal-card
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

      .deal-image
        position: relative
        width: 100%
        height: px2rem(220px)
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover

        .deal-badge
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

      .deal-info
        padding: px2rem(20px)

        .deal-name
          font-size: px2rem(30px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .deal-location
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(15px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .deal-price
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

        .deal-sold
          font-size: px2rem(22px)
          color: #ff6b00
          margin-top: px2rem(8px)

  .ranking-section
    background-color: #fff
    margin-top: px2rem(12px)
    padding: px2rem(20px) px2rem(16px)

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

      .ranking-image
        width: px2rem(160px)
        height: px2rem(120px)
        flex-shrink: 0
        border-radius: px2rem(8px)
        overflow: hidden
        margin-right: px2rem(20px)

        img
          width: 100%
          height: 100%
          object-fit: cover

      .ranking-info
        flex: 1
        min-width: 0

        .ranking-name
          font-size: px2rem(32px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(8px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .ranking-desc
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(12px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .ranking-tags
          display: flex
          flex-wrap: wrap
          gap: px2rem(10px)
          margin-bottom: px2rem(12px)

          .ranking-tag
            font-size: px2rem(22px)
            color: #06c1ae
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(6px) px2rem(14px)
            border-radius: px2rem(4px)

        .ranking-bottom
          display: flex
          justify-content: space-between
          align-items: flex-end

          .ranking-score
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

          .ranking-price
            display: flex
            align-items: baseline

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00
              margin-right: px2rem(4px)

            .price-value
              font-size: px2rem(36px)
              font-weight: bold
              color: #ff6b00

            .price-unit
              font-size: px2rem(24px)
              color: #666
              margin-left: px2rem(4px)

  .recommend-section
    background-color: #fff
    margin-top: px2rem(12px)
    padding: px2rem(20px) px2rem(16px)

    .filter-bar
      display: flex
      background-color: #f8f8f8
      border-radius: px2rem(8px)
      margin-bottom: px2rem(25px)

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
        border-right: 1px solid #eee

        &:last-child
          border-right: none

        &.active
          color: #06c1ae
          background-color: rgba(6, 193, 174, 0.1)

        span.active
          color: #06c1ae

        .arrow
          margin-left: px2rem(10px)
          font-size: px2rem(20px)
          transition: transform 0.3s

          &.up
            transform: rotate(180deg)

        .check-icon
          margin-left: px2rem(8px)
          color: #06c1ae
          font-weight: bold

    .distance-dropdown, .time-dropdown
      background-color: #fff
      border: 1px solid #eee
      border-radius: px2rem(8px)
      margin-top: px2rem(-20px)
      margin-bottom: px2rem(20px)
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
      position: relative
      z-index: 10

      .dropdown-option
        padding: px2rem(25px) px2rem(40px)
        font-size: px2rem(28px)
        color: #333
        cursor: pointer
        border-bottom: 1px solid #f5f5f5

        &:last-child
          border-bottom: none

        &.active
          color: #06c1ae
          background-color: rgba(6, 193, 174, 0.1)

    .recommend-list
      display: flex
      flex-direction: column
      gap: px2rem(20px)

    .recommend-item
      display: flex
      background-color: #fff
      border-radius: px2rem(12px)
      overflow: hidden
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08)
      cursor: pointer
      transition: transform 0.3s

      &:hover
        transform: translateY(-4px)

      .recommend-image
        position: relative
        width: px2rem(240px)
        height: px2rem(180px)
        flex-shrink: 0
        overflow: hidden

        img
          width: 100%
          height: 100%
          object-fit: cover

        .free-badge
          position: absolute
          top: px2rem(12px)
          left: px2rem(12px)
          background-color: #4caf50
          color: #fff
          font-size: px2rem(22px)
          font-weight: bold
          padding: px2rem(6px) px2rem(16px)
          border-radius: px2rem(4px)

        .distance-badge
          position: absolute
          bottom: px2rem(12px)
          right: px2rem(12px)
          background-color: rgba(0, 0, 0, 0.7)
          color: #fff
          font-size: px2rem(22px)
          padding: px2rem(6px) px2rem(12px)
          border-radius: px2rem(4px)

      .recommend-info
        flex: 1
        padding: px2rem(20px)
        display: flex
        flex-direction: column
        min-width: 0

        .recommend-name
          font-size: px2rem(32px)
          font-weight: bold
          color: #333
          margin-bottom: px2rem(10px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .recommend-location
          font-size: px2rem(24px)
          color: #999
          margin-bottom: px2rem(12px)
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

        .recommend-tags
          display: flex
          flex-wrap: wrap
          gap: px2rem(10px)
          margin-bottom: px2rem(15px)

          .recommend-tag
            font-size: px2rem(22px)
            color: #06c1ae
            background-color: rgba(6, 193, 174, 0.1)
            padding: px2rem(6px) px2rem(14px)
            border-radius: px2rem(4px)

        .recommend-meta
          display: flex
          align-items: center
          margin-bottom: px2rem(15px)

          .travel-time
            display: flex
            align-items: center
            margin-right: px2rem(20px)

            .time-icon
              font-size: px2rem(24px)
              margin-right: px2rem(8px)

            .time-text
              font-size: px2rem(24px)
              color: #666

          .recommend-score
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

        .recommend-bottom
          margin-top: auto
          display: flex
          align-items: flex-end

          .recommend-price
            display: flex
            align-items: baseline

            .price-symbol
              font-size: px2rem(24px)
              color: #ff6b00
              margin-right: px2rem(4px)

            .price-value
              font-size: px2rem(40px)
              font-weight: bold
              color: #ff6b00

            .price-unit
              font-size: px2rem(24px)
              color: #666
              margin-left: px2rem(4px)

          .recommend-free
            .free-text
              font-size: px2rem(32px)
              font-weight: bold
              color: #4caf50

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
      margin-bottom: px2rem(10px)

    .no-result-tip
      font-size: px2rem(26px)
      color: #ccc
</style>
