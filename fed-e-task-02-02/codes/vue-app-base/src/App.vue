<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" @click="test">
    <el-button>2313</el-button>
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <Lazy />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import { Button } from 'element-ui'
import { test } from '@/utils'
import merge from 'lodash/merge'
import axios from 'axios'
// const { Button } = require('element-ui')

const req = axios.create({
  baseURL: process.env.BASE_API_ROOT
})

export default {
  name: 'App',
  components: {
    HelloWorld,
    'el-button': Button,
    Lazy: () => import('@/components/Lazy')
  },
  methods: {
    test () {
      test()
      merge({}, {})
      req('/orgs/octokit/repos')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000;
  margin-top: 60px;
}
</style>
