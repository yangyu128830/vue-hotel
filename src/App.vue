<template>
  <div id="app">
    <HeaderNav></HeaderNav>
    <router-view></router-view>
  </div>
</template>

<script>
import HeaderNav from '@/common/HeaderNav'

export default {
  name: 'app',
  components: {
    HeaderNav
  }
}
</script>

<style lang="sass">
@import 'src/style/common'

#app
  min-height: 100vh
  background-color: #f5f5f5

.placeholder-page
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: px2rem(160px) px2rem(40px)

  .placeholder-icon
    font-size: px2rem(160px)
    margin-bottom: px2rem(40px)

  .placeholder-text
    font-size: px2rem(36px)
    color: #999
</style>
