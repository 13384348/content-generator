<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-row class="header" justify="space-between" align="middle">
          <el-col :span="12">
            <h2>运营内容生成工具</h2>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-button type="primary" @click="$router.push('/')" v-if="$route.path !== '/'">
              <el-icon><House /></el-icon>
              选题生成
            </el-button>
            <el-button type="warning" @click="$router.push('/hooks')" v-if="$route.path !== '/hooks'">
              <el-icon><Star /></el-icon>
              钩子生成
            </el-button>
            <el-button type="success" @click="$router.push('/content')" v-if="$route.path !== '/content'">
              <el-icon><Edit /></el-icon>
              文案生成
            </el-button>
            <el-button type="info" @click="$router.push('/admin')" v-if="$route.path !== '/admin'">
              <el-icon><Setting /></el-icon>
              管理后台
            </el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.el-main {
  background-color: #f5f5f5;
  padding: 20px;
}

h2 {
  margin: 0;
  color: #409eff;
}
</style>