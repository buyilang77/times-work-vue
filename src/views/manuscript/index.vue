<template>
  <div class="app-container">
    <el-table
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="{row}">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="{row}">
          {{ row.title }}
        </template>
      </el-table-column>
      <el-table-column label="媒体" width="110">
        <template slot-scope="{row}">
          {{ row.media_name }}
        </template>
      </el-table-column>
      <el-table-column label="采编" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.text_editor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文编" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.writing_editor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审稿人" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag size="small" :type="row.status | statusFilter" effect="plain">{{ row.status | statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="100">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="checkPermission(['text_editor', 'writing_editor']) || isPending" type="primary" size="mini" @click="handleEdit(row.id)">
            编辑
          </el-button>
          <el-button v-if="checkPermission(['writing_editor']) && isList" :disabled="row.status !== 0" type="primary" size="mini" @click="handleStatus(row)">
            领取
          </el-button>
          <el-button v-permission="['text_editor']" :disabled="row.status !== 0" type="danger" size="mini" @click="handleDestroy(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, updateManuscriptStatus } from '@/api/manuscript'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import permission from '@/directive/permission/index' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
export default {
  directives: { permission },
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'warning',
        1: 'primary',
        2: 'info',
        3: 'danger',
        4: 'success'
      }
      return statusMap[status]
    },
    statusText(status) {
      const statusMap = {
        0: '待处理',
        1: '处理中',
        2: '审核中',
        3: '未通过',
        4: '已完成'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      isList: false,
      isPending: false,
      isReview: false,
      listQuery: {
        page: 1,
        limit: 20,
        filter: {
          title: undefined,
          'workflow.status': null
        }
      },
      listLoading: true
    }
  },
  created() {
    switch (this.$route.name) {
      case 'ManuscriptList':
        this.isList = true
        break
      case 'ManuscriptPending':
        this.isPending = true
        this.listQuery.filter['workflow.status'] = [1, 2, 3]
        break
      case 'ManuscriptReview':
        this.isReview = true
        this.listQuery.filter['workflow.status'] = [2]
        break
    }
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.meta.total
      })
    },
    handleEdit(id) {
      this.$router.push('/manuscript/edit/' + id)
    },
    handleStatus(row) {
      updateManuscriptStatus(row.id, { status: 1 }).then(response => {
        row.status = 1
        this.$notify({
          title: 'Success',
          message: response.message,
          type: 'success',
          duration: 3000
        })
      })
    }
  }
}
</script>
