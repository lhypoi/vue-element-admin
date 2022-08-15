<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: right;">
      <el-button v-waves class="filter-item" type="primary">新增分类</el-button>
      <el-button v-waves class="filter-item" type="danger">删除</el-button>
    </div>
    <div style="text-align: center;">
      <draggable v-model="wineList" style="width: 50%;margin: 0 auto;" @start="onStart" @end="onEnd">
        <transition-group animation="200">
          <el-checkbox v-for="item in wineList" :key="item.id" :label="item.name" class="item" @change="categorySelect($event, item.id)" border />
          <!-- <div v-for="item in wineList" :key="item.id" class="item">{{ item.name }}</div> -->
        </transition-group>
      </draggable>
    </div>
    <!-- 酒信息 -->
    <el-dialog :visible.sync="dialogVisible" width="60%" title="优惠券信息">
      <el-form v-loading="updateSend" :model="categoryForm" label-width="150px" :disabled="!!curRowId">
        <el-form-item label="分类名称" prop="couponType">
          <el-input v-model="categoryForm.name " />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <!-- <el-button v-if="curRowId" type="danger" @click="handleDele">删 除</el-button> -->
        <el-button v-if="!curRowId" type="primary" :loading="updateSend" @click="confirmSend">{{ curRowId ? '修 改' : '上 架' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  insertCoupon, getCouponDetail, updateCoupon
} from '@/api/order'
import draggable from 'vuedraggable'
import { getCategoryList, insertCategory } from '@/api/category'
import waves from '@/directive/waves' // waves directive
export default {
  name: 'ShopManage',
  components: { draggable },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 30
      },
      list: null,
      total: 0,
      columns: [{
        label: '分类名称',
        key: 'name'
      }],
      dialogVisible: false,
      categoryForm: {
        name: ''
      },
      wineInfo: {
        wineId: null,
        couponType: '1',
        couponNum: null,
        couponUpon: null,
        time: null,
        couponCount: null,
        validateTime: null
      },
      updateSend: false,
      curRowId: null,
      couponTypeList: [
        {
          label: '折扣券',
          id: '1'
        },
        {
          label: '满减券',
          id: '2'
        }
      ],
      wineList: [],
      categorySelected: []
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      getCategoryList({}).then(response => {
        const list = response.body
        this.wineList = list
        console.log(list)
      })
    },
    categorySelect(value, id) {
      console.log(value, id)
      if (value) {
        this.categorySelected.push(id)
      } else {
        const idx = this.categorySelected.indexOf(id)
        this.categorySelected.splice(idx, 1)
      }
      console.log(this.categorySelected)
    },
    onStart() {

    },
    onEnd() {
      console.log(this.wineList)
    },
    getList(page, limit) {
    },
    handleFilter() {
      this.getList(1, 30)
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    async confirmSend() {
      console.log(this.wineInfo)
      this.updateSend = true
      const params = {
        parentId: 0,
        sortOrder: 0,
        name: this.categoryForm.name
      }
      const res = await insertCategory({
        data: params
      })
      console.log(res)
      this.updateSend = false
      this.$message({
        type: 'success',
        message: `${this.curRowId ? '修改' : '上架'}成功!`
      })
      this.dialogVisible = false
      this.getDataList()
    },

    getFileFromSrc(img) {
      function convertBase64UrlToBlob(base64) {
        var urlData = base64.dataURL
        var type = base64.type
        var bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length)
        var ia = new Uint8Array(ab)
        for (var i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i)
        }
        return new Blob([ab], { type: type })
      }
      function getBase64Image(img) {
        var canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        var ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, img.width, img.height)
        var ext = img.src.substring(img.src.lastIndexOf('.') + 1).toLowerCase()
        var dataURL = canvas.toDataURL('image/' + ext)
        return {
          dataURL: dataURL,
          type: 'image/' + ext
        }
      }
      return new Promise((resolve, reject) => {
        var image = new Image()
        image.crossOrigin = ''
        image.src = img
        image.onload = function() {
          var base64 = getBase64Image(image)
          var img2 = convertBase64UrlToBlob(base64)
          var file = new File([img2], 'filename', { type: base64.type })
          resolve(file)
        }
      })
    },
    handleDown(row) {
      this.$confirm('确定下架? （下架后不可再上架）')
        .then(async() => {
          const res = await updateCoupon({
            data: {
              couponId: row.couponId,
              isShow: '0'
            }
          })
          if (res.body === 1) {
            this.$message({
              type: 'success',
              message: '下架成功!'
            })
            this.$set(row, 'isShow', '0')
          }
        })
        .catch(err => { console.log(err) })
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
.item {
  display: block;
  width: 100%;
  background-color: #F8F8F8;
  border: solid 1px #eee;
  margin-bottom: 15px;
  cursor: move;
  border-radius: 12px;
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
  height: auto!important;
  color: black;
}
.item:first-of-type {
  margin-left: 10px;
}
.item:hover {
  background-color: #f1f1f1;
  cursor: move;
}
.chosen {
  border: solid 2px #3089dc !important;
}
</style>
