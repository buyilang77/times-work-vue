<template>
  <div class="app-container">
    <el-form ref="form" :rules="rules" :model="postForm" :label-position="labelPosition">
      <el-row :gutter="20">
        <el-col :span="7">
          <div class="grid-content bg-purple">
            <el-form-item label="材料">
              <el-input v-model="postForm.article_link" placeholder="微信链接" style="width: 82%" />
              <el-button plain style="width: 18%" :loading="importLoading" @click="importManuscript">导入</el-button>
            </el-form-item>
            <el-divider />
            <el-alert type="warning" description="保存前请检查材料是否上传到服务器!" :closable="false" show-icon style="margin-bottom: 1rem" />
            <el-form-item>
              <el-upload
                ref="upload"
                action=""
                :on-preview="handlePreview"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                :http-request="handleFile"
                :file-list="postForm.file_list"
                accept=".jpg, .jpeg, .png, .zip, .rar, .doc, .docx"
                :auto-upload="false"
              >
                <el-button slot="trigger" size="small" type="primary">选取材料</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">需要点击上传到服务器按钮</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item label="媒体" prop="media_id">
              <el-radio-group v-model="postForm.media_id" @change="handleChannelChanges">
                <el-radio v-for="medium in media" :key="medium.id" :label="medium.id">{{ medium.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="media_channel">
              <el-select v-model="postForm.channel_id" placeholder="请选择">
                <el-option v-for="(item, index) in media_channels" :key="index" :label="item.ChannelName" :value="item.ChannelID" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户">
              <el-input v-model="postForm.customer" />
            </el-form-item>
            <el-form-item label="稿件要求">
              <el-input v-model="postForm.remark" type="textarea" />
            </el-form-item>
            <el-divider />
            <el-form-item class="text-center submit-button">
              <el-button plain type="primary" @click="onSubmit(postForm.is_review = false)">保存</el-button>
              <el-button v-permission="['advanced_editor']" plain type="success" @click="handleReview(4)">通过</el-button>
              <el-button v-permission="['advanced_editor']" plain type="danger" @click="handleReview(3)">未通过</el-button>
              <el-button v-permission="['writing_editor']" plain type="primary" @click="onSubmit(postForm.is_review = true)">提交审核</el-button>
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="17">
          <div class="grid-content bg-purple">
            <el-form-item label="标题" prop="title">
              <el-input v-model="postForm.title" />
            </el-form-item>
            <el-form-item style="margin-bottom: 30px;" prop="description">
              <div class="el-form-item__label">内容</div>
              <el-alert title="如需上传本地图片，在有微信图片的情况下，请先点击右侧处理微信图片，处理完毕后才可以进行上传否则会覆盖本地上传的图片。" type="warning" :closable="false" style="margin-bottom: 1rem" />
              <Tinymce ref="editor" v-model="postForm.content" :height="400" />
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import { fetchMedia, fetchArticle, fetchManuscript, createManuscript, updateManuscript, reviewStatus, fetchChannelList, uploadFile } from '@/api/manuscript'
import permission from '@/directive/permission/index' // 权限判断指令

const defaultForm = {
  id: null,
  media_id: null,
  title: null,
  content: null,
  article_link: null,
  channel_id: undefined,
  customer: null,
  file_list: [],
  is_review: false,
  thumbnail: null,
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
            createManuscript(this.postForm).then(response => {
              this.$notify({
                title: 'Success',
                message: response.message,
                type: 'success',
                duration: 3000
              })
              this.$router.push('/manuscript/pending')
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
        this.handleChannelChanges(this.postForm.media_id)
      })
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
      window.open(url)
    },
    submitUpload() {
      this.$refs.upload.submit()
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
    handleChannelChanges(value) {
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

