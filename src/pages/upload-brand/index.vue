<template>
  <div class="app-container">
    <div class="filter-container" style="overflow: hidden;">
      <el-button v-waves class="filter-item" style="float: right; margin-left: 10px;" type="default" @click="editImage('4')">更新首页底部图片</el-button>
      <el-button v-waves class="filter-item" style="float: right; margin-left: 10px;" type="success" @click="editImage('3')">更新首页banner图</el-button>
      <el-button v-waves class="filter-item" style="float: right; margin-left: 10px;" type="primary" @click="editImage('2')">更新售后须知</el-button>
      <el-button v-waves class="filter-item" style="float: right; " type="warning" @click="editImage('1')">更新品牌介绍</el-button>
    </div>
    <div style="border: solid 1px rgba(0,0,0,0.1); padding: 20px;">
      <p>首页banner轮播图</p>
      <div style="display: flex;flex-wrap: wrap;">
        <div v-for="item in bannerImageList" :key="item" style="display: inline-block; padding: 5px; border: solid 1px rgba(0,0,0,0.3);margin-right: 20px;">
          <img style="width: 200px;height: 200px;" :src="'/brandImg/' + item">
        </div>
      </div>
    </div>
    <div style="border: solid 1px rgba(0,0,0,0.1); padding: 20px;margin-top: 20px;">
      <p>首页底部背景图片</p>
      <div style="display: flex;flex-wrap: wrap;">
        <div v-for="item in bottomImageList" :key="item" style="display: inline-block; padding: 5px; border: solid 1px rgba(0,0,0,0.3);margin-right: 20px;">
          <img style="width: 200px;height: 200px;" :src="'/brandImg/' + item">
        </div>
      </div>
    </div>
    <div style="border: solid 1px rgba(0,0,0,0.1); padding: 20px;margin-top: 20px;">
      <p>品牌介绍图片</p>
      <div style="display: flex;flex-wrap: wrap;">
        <div v-for="item in brandImageList" :key="item" style="display: inline-block; padding: 5px; border: solid 1px rgba(0,0,0,0.3);margin-right: 20px;">
          <img style="width: 200px;height: 200px;" :src="'/brandImg/' + item">
        </div>
      </div>
    </div>
    <div style="border: solid 1px rgba(0,0,0,0.1); padding: 20px;margin-top: 20px;">
      <p>售后须知图片</p>
      <div style="display: flex;flex-wrap: wrap;">
        <div v-for="item in soldKnowImageList" :key="item" style="display: inline-block; padding: 5px; border: solid 1px rgba(0,0,0,0.3);margin-right: 20px;">
          <img style="width: 200px;height: 200px;" :src="'/brandImg/' + item">
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="80%" title="上传图片" :close-on-click-modal="false" :close-on-press-escape="false" top="10px">
      <el-form ref="shopForm" v-loading="updateSend" :model="wineInfo" label-width="110px" label-position="left" hide-required-asterisk>
        <el-form-item label="上传图片：" prop="imageList">
          <img-input :img-list="wineInfo.imageList" :multi="true" @change="list => wineInfo.imageList = list" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="updateSend" @click="confirmSend">{{ curRowId ? '修 改' : '上 传' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getBrandInfoList, uploadBrandInfo } from '@/api/brand'
import waves from '@/directive/waves' // waves directive
import imgInput from '@/pages/common/imgInput'
import { getCategoryList } from '@/api/category'
import { parseTime } from '@/utils/index'
export default {
  name: 'ShopManage',
  components: { imgInput },
  directives: { waves },
  data() {
    return {
      dialogVisible: false,
      wineInfo: {
        imageList: []
      },
      brandImageList: [],
      bannerImageList: [],
      bottomImageList: [],
      soldKnowImageList: [],
      rules: {
        imageList: [{ required: true, message: '请上传图片', trigger: 'blur' }]
      },
      updateSend: false,
      categoryList: [],
      curRowId: null,
      areaList: [],
      imageType: ''
    }
  },
  created() {
    this.getImageList('1')
    this.getImageList('2')
    this.getImageList('3')
    this.getImageList('4')
  },
  mounted() {
    getCategoryList({})
      .then(res => {
        const list = res.body
        this.categoryList = list
      })
  },
  methods: {
    parseTime,
    getImageList(type = '1') {
      getBrandInfoList({
        type
      }).then(res => {
        console.log(res)
        if (type === '1') {
          this.brandImageList = res.body[0].imagesList
        } else if (type === '2') {
          this.soldKnowImageList = res.body[0].imagesList
        } else if (type === '3') {
          this.bannerImageList = res.body[0].imagesList
        } else if (type === '4') {
          this.bottomImageList = res.body[0].imagesList
        }
      })
    },
    async editImage(type) {
      // this.updateSend = false
      this.imageType = type
      this.dialogVisible = true
      // this.updateSend = true
      let tempImageList = []
      if (type === '1') {
        tempImageList = this.brandImageList
      } else if (type === '2') {
        tempImageList = this.soldKnowImageList
      } else if (type === '3') {
        tempImageList = this.bannerImageList
      } else if (type === '4') {
        tempImageList = this.bottomImageList
      }
      console.log(type, tempImageList)
      this.wineInfo = {
        imageList: await Promise.all(tempImageList.map(async name => {
          return {
            url: `/brandImg/${name}`,
            response: [`${name}`]
            // raw: await this.getFileFromSrc(`/goodDetailImg/${wine.wineId}/${name.src}.png`)
          }
        }))
      }
    },
    async confirmSend() {
      this.updateSend = true
      const formData = new FormData()
      formData.append('type', this.imageType)
      formData.append('images', this.wineInfo.imageList.map(item => item.response[0]).join(','))
      const res = await uploadBrandInfo(formData)
      console.log(res)
      const body = res.body || 0
      if (body !== 0) {
        this.updateSend = false
        this.$message({
          type: 'success',
          message: `${this.curRowId ? '修改' : '上传'}成功!`
        })
        this.dialogVisible = false
        this.getImageList(this.imageType)
      }
    },
    handleDele() {
      this.$confirm('确定删除?')
        .then(async() => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve()
            }, 300)
          })
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.log(err) })
    }
  }
}
</script>

<style lang="scss" scoped>
.divider {
  margin: 5px 0;
}
</style>
