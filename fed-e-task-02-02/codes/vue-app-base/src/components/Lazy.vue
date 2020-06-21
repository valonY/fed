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
}
</script>

<style lang="less">
.lazy {
  color: #f0a;
  font-size: 18px;
  font-weight: bold;
}
</style>
