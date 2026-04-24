import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/index/Index'
import HotelList from '@/page/hotel-list/index'
import HotelDetail from '@/page/hotel-detail/index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/hotel'
    },
    {
      path: '/hotel',
      name: 'HotelMain',
      component: Index,
      children: [
        {
          path: '',
          name: 'HotelHome',
          component: Index
        }
      ]
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
      component: {
        template: '<div class="placeholder-page"><div class="placeholder-icon">🌍</div><div class="placeholder-text">周边游玩板块开发中...</div></div>'
      }
    },
    {
      path: '/food',
      name: 'Food',
      component: {
        template: '<div class="placeholder-page"><div class="placeholder-icon">🍜</div><div class="placeholder-text">周边美食板块开发中...</div></div>'
      }
    },
    {
      path: '/member',
      name: 'Member',
      component: {
        template: '<div class="placeholder-page"><div class="placeholder-icon">💎</div><div class="placeholder-text">会员中心板块开发中...</div></div>'
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: {
        template: '<div class="placeholder-page"><div class="placeholder-icon">👤</div><div class="placeholder-text">个人中心板块开发中...</div></div>'
      }
    }
  ]
})
