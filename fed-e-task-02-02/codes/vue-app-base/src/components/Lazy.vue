<template>
  <div class="lazy">{{ lazyMsg }}</div>
</template>

<script>
export default {
  data () {
    return {
      lazyMsg: 'lazy message'
    }
  }
  // render () {
  //   return <div class="lazy">
  //     <img alt="Vue logo" src="./assets/logo.png" onClick="test" />
  //   </div>
  // }
}
</script>

<style lang="less">
.lazy {
  color: #f0a;
  font-size: 18px;
  font-weight: bold;
}
</style>
