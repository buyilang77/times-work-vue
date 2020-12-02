<template>
  <div class="dashboard-container">
    <el-table :data="statistics" border style="width: 100%">
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="zhangying" label="张颖" />
      <el-table-column prop="maruiqin" label="马瑞琴" />
      <el-table-column prop="dupengfei" label="杜鹏飞" />
      <el-table-column prop="liupengtao" label="刘朋涛" />
      <el-table-column prop="zuoyue" label="左悦" />
      <el-table-column prop="zhugang" label="朱刚" />
      <el-table-column prop="yangyang" label="杨洋" />
      <el-table-column prop="zhangjinxia" label="张金侠" />
      <el-table-column prop="zhangwen" label="张文" />
      <el-table-column prop="liujia" label="刘佳" />
      <el-table-column prop="wangling" label="王玲" />
      <el-table-column prop="liujiangxia" label="刘江霞" />
      <el-table-column prop="wuming" label="武明" />
    </el-table>
  </div>
</template>

<script>
import { fetchStatistic } from '@/api/statistic'

export default {
  name: 'Dashboard',
  data() {
    return {
      statistics: []
    }
  },
  created() {
    this.getStatistic()
  },
  methods: {
    getStatistic() {
      fetchStatistic().then(response => {
        this.statistics = response.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
  .dashboard-container {
    height: calc(100vh - 150px);
  }
</style>
