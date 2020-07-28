<template>
  <el-upload
    :action="action"
    class="upload-demo"
    name="imageList"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :file-list="fileList"
    list-type="picture-card"
    :multiple="multi"
    :on-change="handleChange"
  >
    <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
    <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
  </el-upload>
</template>

<script>
export default {
  props: {
    multi: {
      type: Boolean,
      default: true
    },
    imgList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fileList: this.imgList,
      action: process.env.VUE_APP_BASE_API + '/services/uploadImg'
    }
  },
  watch: {
    imgList() {
      this.fileList = this.imgList
    }
  },
  methods: {
    handleRemove(file, fileList) {
      this.$emit('change', fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    handleChange(file, fileList) {
      if (this.multi) {
        this.fileList = fileList
      } else {
        this.fileList = fileList.slice(-1)
      }
      this.$emit('change', fileList)
      console.log(fileList)
    }
  }
}
</script>

<style scoped>

</style>
