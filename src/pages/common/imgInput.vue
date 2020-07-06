<template>
  <el-upload
    action=""
    class="upload-demo"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :file-list="fileList"
    list-type="picture-card"
    :multiple="multi"
    :on-change="handleChange"
    :auto-upload="false"
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
      fileList: this.imgList
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
