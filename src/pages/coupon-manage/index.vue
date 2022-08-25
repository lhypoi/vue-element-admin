<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.name"
        placeholder="商品名称搜索"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button> -->
      <el-button v-waves class="filter-item" type="primary" @click="handleShowInfo">新增优惠券</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        v-for="col in tableColumns"
        :key="col.key"
        :label="col.label"
        :prop="col.key"
        :width="col.width"
        :fixed="col.fixed"
      >
        <template slot-scope="scope">
          <div v-if="col.key === 'wineNameList'">
            <el-card v-for="wine in scope.row[col.key]" :key="wine.wineId">
              <span>名称：</span>
              <span>{{ wine.wineName }}</span>
              <el-divider class="divider" />
              <span>规格：</span>
              <span>{{ wine.volume }}</span>
              <el-divider class="divider" />
              <span>价格：</span>
              <span>{{ wine.price }}</span>
              <el-divider class="divider" />
              <span>数量：</span>
              <span>{{ wine.count }}</span>
              <el-divider class="divider" />
            </el-card>
          </div>
          <div v-else-if="col.key === 'operation'">
            <el-link :type="scope.row.isShow === '1' ? 'warning' : ''" :disabled="scope.row.isShow === '0'" @click="handleDown(scope.row)">下架</el-link>
            <el-link type="primary" style="margin-left: 15px;" @click="handleShowInfo(scope.row)">详情</el-link>
            <!-- <el-button type="danger" :disabled="scope.row.isShow === '0'" style="margin-left: 5px" @click="handleDown(scope.row)">下架</el-button> -->
            <!-- <el-button type="success" style="margin-left: 5px" @click="handleShowInfo(scope.row)">详情</el-button> -->
          </div>
          <div v-else-if="/Time/.test(col.key)">
            <span>{{ parseTime(scope.row[col.key]) }}</span>
          </div>
          <div v-else-if="col.key === 'couponNumber'">
            <span v-if="scope.row.couponType === '满减券'">{{ `满${scope.row.couponUpon}减${scope.row.couponNum}` }}</span>
            <span v-else>{{ `${scope.row.couponNum}折` }}</span>
          </div>
          <div v-else-if="col.key === 'isPay'">
            <span>{{ scope.row.isPay === "1" ? "已支付" : ( scope.row.isPay === "2" ? "待支付" : ( scope.row.isPay === "3" ? "已过期" : "") ) }}</span>
          </div>
          <div v-else-if="col.key === 'sendStatus'">
            <span>{{ scope.row.sendStatus === "0" ? "未发货" : ( scope.row.sendStatus === "1" ? "已发货" : ( scope.row.sendStatus === "2" ? "已收货" : "") ) }}</span>
          </div>
          <div v-else-if="col.key === 'index'">
            <span>{{ scope.$index + 1 + ( listQuery.page - 1 ) * listQuery.limit }}</span>
          </div>
          <span v-else>{{ scope.row[col.key] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList(listQuery.page, listQuery.limit)"
    />
    <!-- 酒信息 -->
    <el-dialog :visible.sync="dialogVisible" width="60%" title="优惠券信息">
      <el-form v-loading="updateSend" :model="wineInfo" label-width="150px" :disabled="!!curRowId">
        <!-- <el-form-item label="优惠券范围" prop="wineId">
          <el-select v-model="wineInfo.wineId">
            <el-option v-for="item in wineList" :key="item.wineId" :value="item.wineId" :label="item.wineName" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="优惠券类型" prop="couponType">
          <el-select v-model="wineInfo.couponType">
            <el-option v-for="item in couponTypeList" :key="item.id" :value="item.id" :label="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="wineInfo.couponType === '1'" :label="`优惠内容`" prop="couponNum">
          <el-row>
            <el-col :span="12">
              <el-input v-model="wineInfo.couponNum" />
            </el-col>
            &nbsp;&nbsp;&nbsp;&nbsp;折
          </el-row>
        </el-form-item>
        <el-form-item v-if="wineInfo.couponType === '2'" :label="`优惠内容`" prop="couponNum">
          <el-row>
            <span style="float: left">满&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <el-col :span="4">
              <el-input v-model="wineInfo.couponUpon" />
            </el-col>
            <span style="float: left">&nbsp;&nbsp;&nbsp;&nbsp;减&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <el-col :span="4">
              <el-input v-model="wineInfo.couponNum" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="领取时间" prop="time">
          <el-date-picker
            v-model="wineInfo.time"
            style="width: 100%"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="数量" prop="couponCount">
          <el-input v-model="wineInfo.couponCount" type="number" />
        </el-form-item>
        <el-form-item label="过期时间" prop="validateTime">
          <el-date-picker
            v-model="wineInfo.validateTime"
            style="width: 100%"
            type="datetime"
          />
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
  getCouponByPage, insertCoupon, getCouponDetail, updateCoupon, getAllWineListByPage
} from '@/api/order'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { parseTime } from '@/utils/index'
export default {
  name: 'ShopManage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30
      },
      list: null,
      total: 0,
      columns: [],
      dialogVisible: false,
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
      tableColumns: [
        { label: '优惠券类型', key: 'couponType' },
        { label: '优惠力度', key: 'couponNumber' },
        { label: '领取开始时间', key: 'couponStartTime', width: '160' },
        { label: '领取结束时间', key: 'couponEndTime', width: '160' },
        { label: '过期时间', key: 'validateTime', width: '160' },
        { label: '创建时间', key: 'createTime', width: '160' },
        { label: '操作', key: 'operation' }
      ],
      wineList: []
    }
  },
  created() {
    getAllWineListByPage({
      'startIndex': 1,
      'pageSize': 999
    }).then(response => {
      const list = response.body.list
      this.wineList = list
      console.log(list)
    })
    this.getList(1, 30)
  },
  methods: {
    parseTime,
    getList(page, limit) {
      this.listLoading = true
      this.listQuery.page = page
      this.listQuery.limit = limit
      getCouponByPage({
        'startIndex': this.listQuery.page,
        'pageSize': this.listQuery.limit
      }).then(response => {
        const data = response.body
        const columns = data.columns.filter(col => data.hideTitle.indexOf(col.key) === -1)
        columns.push({
          label: '操作',
          fixed: 'right',
          key: 'operation'
        })
        columns.unshift({
          label: '序号',
          fixed: 'left',
          key: 'index'
        })
        this.columns = columns
        this.list = data.couponList
        this.total = data.totalCount

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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
    async handleShowInfo(row) {
      this.curRowId = row ? row.couponId : ''
      this.wineInfo = {
        wineId: null,
        couponType: '1',
        couponNum: null,
        couponUpon: null,
        time: null,
        couponCount: null,
        validateTime: null
      }
      this.updateSend = false
      this.dialogVisible = true
      if (this.curRowId) {
        this.updateSend = true
        const res = await getCouponDetail({
          couponId: this.curRowId
        })
        const wine = res.body
        this.wineInfo = {
          wineId: wine.wineId || null,
          couponType: wine.couponType,
          couponNum: wine.couponNum,
          couponUpon: wine.couponUpon,
          time: [new Date(parseInt(wine.couponStartTime)), new Date(parseInt(wine.couponEndTime))],
          couponCount: wine.couponCount,
          validateTime: new Date(parseInt(wine.validateTime))
        }
        this.updateSend = false
      }
    },
    async confirmSend() {
      console.log(this.wineInfo)
      this.updateSend = true
      const params = {
        wineId: this.wineInfo.wineId,
        couponType: this.wineInfo.couponType,
        couponNum: this.wineInfo.couponNum,
        couponUpon: this.wineInfo.couponUpon,
        couponStartTime: this.wineInfo.time[0].getTime(),
        couponEndTime: this.wineInfo.time[1].getTime(),
        couponCount: this.wineInfo.couponCount,
        validateTime: this.wineInfo.validateTime.getTime()
      }
      const res = await insertCoupon({
        data: params
      })
      console.log(res)
      this.updateSend = false
      this.$message({
        type: 'success',
        message: `${this.curRowId ? '修改' : '上架'}成功!`
      })
      this.dialogVisible = false
      this.getList(1, 10)
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
</style>
