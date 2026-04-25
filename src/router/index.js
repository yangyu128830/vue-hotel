import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/index/Index'
import HotelList from '@/page/hotel-list/index'
import HotelDetail from '@/page/hotel-detail/index'
import Travel from '@/page/travel/index'
import AttractionDetail from '@/page/attraction-detail/index'
import Food from '@/page/food/index'
import FoodDetail from '@/page/food-detail/index'
import Member from '@/page/member/index'
import Profile from '@/page/profile/index'
import Favorites from '@/page/favorites/index'
import Consumption from '@/page/consumption/index'

Vue.use(Router)

const PlaceholderPage = {
  template: `
    <div class="placeholder-page">
      <div class="placeholder-icon">🏗️</div>
      <div class="placeholder-text">该功能正在开发中...</div>
    </div>
  `
}

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/hotel',
      name: 'Hotel',
      component: Index
    },
    {
      path: '/hotel-list',
      name: 'HotelList',
      component: HotelList
    },
    {
      path: '/hotel-detail/:hotelId',
      name: 'HotelDetail',
      component: HotelDetail
    },
    {
      path: '/travel',
      name: 'Travel',
      component: Travel
    },
    {
      path: '/attraction-detail/:attractionId',
      name: 'AttractionDetail',
      component: AttractionDetail
    },
    {
      path: '/food',
      name: 'Food',
      component: Food
    },
    {
      path: '/food-detail/:restaurantId',
      name: 'FoodDetail',
      component: FoodDetail
    },
    {
      path: '/member',
      name: 'Member',
      component: Member
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: Favorites
    },
    {
      path: '/consumption',
      name: 'Consumption',
      component: Consumption
    }
  ]
})
