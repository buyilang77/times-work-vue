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
      <el-table-column label="客户">
        <template slot-scope="{row}">
          <span>{{ row.customer }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否合作单位" width="110">
        <template slot-scope="{row}">
          <span>{{ row.is_collaborate | collaborateText }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题">
        <template slot-scope="{row}">
          {{ row.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="媒体" width="110">
        <template slot-scope="{row}">
          {{ row.media_name }}
        </template>
      </el-table-column>
      <el-table-column v-if="!checkPermission(['text_editor'])" label="采编" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.workflow.text_editor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文编" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.workflow.writing_editor }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!checkPermission(['text_editor'])" label="审稿人" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.workflow.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag size="small" :type="row.status | statusFilter" effect="plain">{{ row.status | statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="155">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isList" align="center" label="领取时间" width="155">
        <template slot-scope="{row}">
          <span>{{ row.receive_at }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isToDo && !isList" align="center" label="提交审核时间" width="155">
        <template slot-scope="{row}">
          <span>{{ row.submit_at }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="isHistory" align="center" label="审核时间" width="155">
        <template slot-scope="{row}">
          <span>{{ row.review_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="isPending || isToDo || isReview" type="primary" size="mini" @click="handleEdit(row.id)">查看</el-button>
          <el-button v-if="isToDo" v-permission="['writing_editor', 'advanced_editor']" type="primary" size="mini" @click="handleCancellation(row.id)">退回稿件池</el-button>
          <el-button v-if="isReview" type="primary" size="mini" @click="handleReview(row)">审核</el-button>
          <el-button v-if="checkPermission(['writing_editor', 'advanced_editor']) && isList" :disabled="row.status !== 0 && row.status !== 2" type="primary" size="mini" @click="handleStatus(row)">
            领取
          </el-button>
          <el-button v-permission="['text_editor']" :disabled="row.status !== 0" type="danger" size="mini" @click="handleDestroy(row)">删除</el-button>
          <el-button v-if="row.status === 4" size="mini" @click="detail(row.id)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, updateManuscriptStatus, reviewStatus, handleDestroy, cancellation } from '@/api/manuscript'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import permission from '@/directive/permission/index' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
import store from '@/store'

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
    },
    collaborateText(status) {
      const statusMap = {
        0: '否',
        1: '是'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      isList: false,
      isToDo: false,
      isPending: false,
      isReview: false,
      isHistory: false,
      listQuery: {
        page: 1,
        limit: 100,
        filter: {
          title: undefined,
          'workflow.status': null,
          'workflow.text_editor_id': undefined,
          'workflow.writing_editor_id': undefined
        }
      },
      listLoading: true
    }
  },
  created() {
    switch (this.$route.name) {
      case 'ManuscriptList':
        this.isList = true
        this.listQuery.filter['workflow.status'] = [0]
        break
      case 'ManuscriptToDo':
        this.isToDo = true
        switch (store.getters.type) {
          case 1:
            this.listQuery.filter['workflow.status'] = [0, 1, 2, 3]
            this.listQuery.filter['workflow.text_editor_id'] = store.getters.user_id
            break
          case 2:
            this.listQuery.filter['workflow.status'] = [1, 3]
            this.listQuery.filter['workflow.writing_editor_id'] = store.getters.user_id
            break
          case 3:
            this.listQuery.filter['workflow.status'] = [1, 3]
            this.listQuery.filter['workflow.writing_editor_id'] = store.getters.user_id
            break
        }
        break
      case 'ManuscriptReview':
        this.isReview = true
        this.listQuery.filter['workflow.status'] = [2]
        break
      case 'ManuscriptHistory':
        this.isHistory = true
        this.listQuery.filter['workflow.status'] = [4]
        switch (store.getters.type) {
          case 1:
            this.listQuery.filter['workflow.text_editor_id'] = store.getters.user_id
            break
          case 2:
            this.listQuery.filter['workflow.writing_editor_id'] = store.getters.user_id
            break
          case 3:
            this.listQuery.filter['workflow.reviewer_id'] = store.getters.user_id
            break
        }
        break
      case 'ManuscriptPending':
        this.isPending = true
        this.listQuery.filter['workflow.status'] = [2]
        this.listQuery.filter['workflow.writing_editor_id'] = store.getters.user_id
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
    detail(id) {
      this.$router.push('/manuscript/detail/' + id)
    },
    handleDestroy(row) {
      handleDestroy(row.id).then(response => {
        this.removeItem(row.id)
        this.$notify({
          title: 'Success',
          message: response.message,
          type: 'success',
          duration: 3000
        })
      })
    },
    handleReview(row) {
      const form = row
      form['status'] = 4
      reviewStatus(row.id, form)
        .then(response => {
          this.removeItem(row.id)
          this.$notify({
            title: 'Success',
            message: response.message,
            type: 'success',
            duration: 3000
          })
        })
    },
    handleCancellation(id) {
      cancellation(id)
        .then(response => {
          this.removeItem(id)
          this.$notify({
            title: 'Success',
            message: response.message,
            type: 'success',
            duration: 3000
          })
        })
    },
    removeItem(id) {
      const index = this.list.findIndex(item => {
        return item.id === id
      })
      this.list.splice(index, 1)
    },
    handleStatus(row) {
      updateManuscriptStatus(row.id, { status: 1, update_type: 'receive' }).then(response => {
        row.status = 1
        console.log(response)
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
