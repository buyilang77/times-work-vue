<template>
  <div class="app-container">
    <el-form ref="form" :rules="rules" :model="postForm" :label-position="labelPosition">
      <el-row :gutter="20">
        <el-col :span="17">
          <div class="grid-content bg-purple">
            <el-form-item prop="title">
              <el-input v-model="postForm.title" placeholder="标题" />
            </el-form-item>
            <el-form-item style="margin-bottom: 30px;" prop="description">
              <Tinymce ref="editor" v-model="postForm.content" />
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="7">
          <div class="grid-content bg-purple">
            <el-form-item label="材料">
              <el-input v-model="postForm.article_link" placeholder="微信链接" style="width: 82%" />
              <el-button plain style="width: 18%" :loading="importLoading" @click="importManuscript">导入</el-button>
            </el-form-item>
            <el-divider />
            <el-form-item>
              <el-upload
                action=""
                :on-preview="handlePreview"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                :http-request="handleFile"
                :file-list="postForm.file_list"
                accept=".jpg, .jpeg, .png, .zip, .rar, .doc, .docx"
              >
                <el-button slot="trigger" size="small" type="primary">上传材料</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item label="媒体" prop="media_id">
              <el-radio-group v-model="postForm.media_id" @change="handleMediaChanges">
                <el-radio v-for="medium in media" :key="medium.id" :label="medium.id">{{ medium.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-select v-model="postForm.channel_id" placeholder="请选择频道" style="margin-right: 1rem">
                <el-option v-for="(item, index) in media_channels" :key="index" :label="item.ChannelName" :value="item.ChannelID" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源">
              <el-input v-model="postForm.source" />
            </el-form-item>
            <el-form-item label="客户">
              <el-input v-model="postForm.customer" />
            </el-form-item>
            <el-form-item label="是否合作单位">
              <el-radio-group v-model="postForm.is_collaborate">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="稿件要求">
              <el-input v-model="postForm.remark" type="textarea" />
            </el-form-item>
            <el-form-item class="text-center submit-button">
              <el-button v-loading="loading" plain type="primary" @click="onSubmit()">保存</el-button>
              <el-button v-if="postForm.status === 2" v-permission="['advanced_editor', 'chief_editor']" plain type="success" @click="handleReview(4)">通过</el-button>
              <el-button v-if="postForm.status === 2" v-permission="['advanced_editor', 'chief_editor']" plain type="danger" @click="handleReview(3)">未通过</el-button>
              <el-button
                v-if="postForm.status === 1 || postForm.status === 3"
                v-permission="['writing_editor', 'advanced_editor']"
                plain
                type="primary"
                @click="updateStatus"
              >提交审核</el-button>
            </el-form-item>
            <el-divider />
            <div @click="doCopy($event)">
              <p>文编: {{ postForm.workflow.writing_editor ? postForm.workflow.writing_editor : '未知' }}</p>
              <p>采编: {{ postForm.workflow.text_editor ? postForm.workflow.text_editor : '未知' }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import { fetchMedia, fetchArticle, fetchManuscript, createManuscript, updateManuscript, updateManuscriptStatus, reviewStatus, fetchChannelList, uploadFile } from '@/api/manuscript'
import permission from '@/directive/permission/index' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

const defaultForm = {
  id: null,
  media_id: null,
  title: null,
  content: null,
  article_link: null,
  channel_id: undefined,
  source: undefined,
  customer: null,
  is_collaborate: 1,
  file_list: [],
  thumbnail: null,
  workflow: [],
  remark: null
}
export default {
  name: 'ManuscriptForm',
  directives: { permission },
  components: { Tinymce },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      media: [],
      media_channels: [],
      importLoading: false,
      labelPosition: 'top',
      postForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        title: [{ required: true, message: '稿件名称不可为空!', trigger: 'blur' }],
        media_id: [{ required: true, message: '媒体不可为空!', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getMedia()
    if (this.isEdit) {
      const id = this.$route.params.id
      this.getManuscript(id)
    }
  },
  updated() {
    this.$nextTick(() => {
      const document = new DOMParser().parseFromString(this.postForm.content, 'text/html')
      this.postForm.thumbnail = document.images[0] && document.images[0].src
    })
  },
  methods: {
    checkPermission,
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            updateManuscript(this.postForm.id, this.postForm).then(response => {
              this.$notify({
                title: 'Success',
                message: response.message,
                type: 'success',
                duration: 3000
              })
              this.$router.go(-1)
            })
          } else {
            if (!this.postForm.channel_id && this.postForm.media_id !== 4) {
              this.$message.error('频道不可为空!')
              return
            }
            createManuscript(this.postForm).then(response => {
              this.$notify({
                title: 'Success',
                message: response.message,
                type: 'success',
                duration: 3000
              })
              this.$router.push('/manuscript/todo')
            })
          }
        }
      })
    },
    getMedia() {
      fetchMedia().then(response => {
        this.media = response.data
      })
    },
    getManuscript(id) {
      fetchManuscript(id).then(response => {
        this.postForm = response.data
        this.postForm.media_id = response.data.media_id
        this.handleMediaChanges(this.postForm.media_id)
      })
    },
    updateStatus() {
      updateManuscriptStatus(this.postForm.id, { status: 2, update_type: 'review' }).then(response => {
        this.$message({
          message: response.message,
          type: 'success'
        })
      })
      this.$router.go(-1)
    },
    async importManuscript() {
      this.importLoading = true
      await fetchArticle({ article_link: this.postForm.article_link }).then(response => {
        this.postForm.title = response.title
        this.postForm.content = response.content
        this.importLoading = false
      })
    },
    handleSuccess(response, file) {
      this.postForm.file_list.push({ name: file.name, url: response.data.file_path })
    },
    handlePreview(file) {
      const url = file.url.replace('public', process.env.VUE_APP_RESOURCE_DOMAIN + 'storage')
      if (file.url.substring(file.url.lastIndexOf('.') + 1) === 'jpeg') {
        this.$copyText(url).then(() => {
          this.onCopy()
        }, (e) => {
          this.$message.error('Can not copy!')
          console.log(e)
        })
      } else {
        window.open(url)
      }
    },
    handleRemove(file, fileList) {
      this.postForm.file_list = fileList
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleFile(file) {
      const formData = new FormData()
      formData.set('file', file.file)
      uploadFile(formData).then(response => {
        this.handleSuccess(response, file.file)
      })
    },
    handleMediaChanges(value) {
      fetchChannelList({ media_id: value }).then(response => {
        this.media_channels = response.data
      })
    },
    handleReview(status) {
      const form = this.postForm
      form['status'] = status
      reviewStatus(this.postForm.id, form)
        .then(response => {
          this.$notify({
            title: 'Success',
            message: response.message,
            type: 'success',
            duration: 3000
          })
          this.$router.go(-1)
        })
    },
    doCopy(event) {
      this.$copyText(event.currentTarget.innerText).then(() => {
        this.onCopy()
      }, (e) => {
        this.$message.error('Can not copy!')
        console.log(e)
      })
    },
    onCopy() {
      this.$message({
        message: '复制成功!',
        type: 'success'
      })
    }
  }
}
</script>

<style>
  .el-form-item__label {
    font-size: 1rem;
    font-weight: 700;
  }
  .el-form-item__content {
    line-height: unset;
  }
</style>

