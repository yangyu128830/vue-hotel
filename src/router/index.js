import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/index/Index'
import HotelList from '@/page/hotel-list/index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/hotel-list',
      name: 'HotelList',
      component: HotelList
    }
  ]
})
