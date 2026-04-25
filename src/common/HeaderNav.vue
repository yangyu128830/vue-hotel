<template>
  <div class="header-nav">
    <div class="nav-container">
      <div 
        v-for="item in navItems" 
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="navigateTo(item.path)"
      >
        <span class="nav-text">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderNav',
  data () {
    return {
      navItems: [
        { name: '酒店民宿', path: '/hotel' },
        { name: '周边游玩', path: '/travel' },
        { name: '周边美食', path: '/food' },
        { name: '会员中心', path: '/member' },
        { name: '个人中心', path: '/profile' }
      ]
    }
  },
  methods: {
    isActive (path) {
      return this.$route.path.startsWith(path)
    },
    navigateTo (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped lang="sass">
@import 'src/style/common'

.header-nav
  background-color: #06c1ae
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  position: sticky
  top: 0
  z-index: 100

  .nav-container
    display: flex
    justify-content: center
    padding: 0 px2rem(20px)
    overflow-x: auto
    scrollbar-width: none
    -ms-overflow-style: none

    &::-webkit-scrollbar
      display: none

  .nav-item
    padding: px2rem(30px) px2rem(40px)
    cursor: pointer
    position: relative
    white-space: nowrap

    &:last-child
      padding-right: px2rem(20px)

    .nav-text
      font-size: px2rem(32px)
      color: rgba(255, 255, 255, 0.8)
      font-weight: 500
      transition: all 0.3s

    &:hover .nav-text
      color: #fff

    &.active
      .nav-text
        color: #fff
        font-weight: bold

      &::after
        content: ''
        position: absolute
        bottom: 0
        left: 50%
        transform: translateX(-50%)
        width: px2rem(60px)
        height: px2rem(6px)
        background-color: #fff
        border-radius: px2rem(3px)
</style>
