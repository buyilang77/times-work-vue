<template>
  <div class="dashboard-container">
    <el-table :data="statistics" border style="width: 100%">
      <el-table-column prop="created_at" label="日期" width="180" />
      <el-table-column prop="sum" label="总计" />
      <el-table-column prop="name" label="姓名" />
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
