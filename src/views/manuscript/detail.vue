<template>
  <div class="app-container">
    <h4>标题</h4>
    <p>{{ manuscript.title }}</p>
    <h4>内容</h4>
    <div v-html="manuscript.content" />
  </div>
</template>
<script>
import { fetchManuscript } from '@/api/manuscript'
export default {
  name: 'ManuscriptDetail',
  data() {
    return {
      manuscript: null
    }
  },
  created() {
    const id = this.$route.params.id
    this.getManuscript(id)
  },
  methods: {
    getManuscript(id) {
      fetchManuscript(id).then(response => {
        this.manuscript = response.data
      })
    }
  }
}
</script>
