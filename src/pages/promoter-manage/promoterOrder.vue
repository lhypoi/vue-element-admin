<template>
  <el-dialog :visible.sync="dialogVisible" destroy-on-close width="80%" title="营销员订单">
    <div class="app-container">
      <div class="filter-container">
        <el-input
          v-model="listQuery.mobile"
          placeholder="手机号"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-input
          v-model="listQuery.orderId"
          placeholder=" 订单号"
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
        >查询</el-button>
        <el-button
          v-waves
          :loading="downloadLoading"
          class="filter-item"
          type="primary"
          icon="el-icon-download"
          @click="handleDownload"
        >导出为Excel</el-button>
      </div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        height="calc(100vh - 50px - 40px - 96px - 56px - 30px)"
        @sort-change="sortChange"
      >
        <el-table-column v-for="col in columns" :key="col.key" :label="col.label" :prop="col.key" :width="col.key === 'wineNameList' ? 200 : col.key === 'addressLabel' ? '' : col.key === 'index' ? 50 : 120" :fixed="col.fixed">
          <template slot-scope="scope">
            <div v-if="col.key === 'operation'">
              <el-button type="success" :disabled="scope.row.sendStatus != '0'" @click="sendGood(scope.row)">发货通知</el-button>
              <br>
              <el-button type="danger" style="margin-top: 5px" :disabled="scope.row.sendStatus != '1'" @click="sendGood2(scope.row)">到货通知</el-button>
            </div>
            <div v-else-if="col.key === 'isPay'">
              <span>{{ scope.row.isPay === "1" ? "已支付" : ( scope.row.isPay === "2" ? "待支付" : ( scope.row.isPay === "3" ? "超时未付款" : "") ) }}</span>
            </div>
            <div v-else-if="col.key === 'sendStatus'">
              <span>{{ scope.row.sendStatus === "0" ? "未发货" : ( scope.row.sendStatus === "1" ? "已发货" : ( scope.row.sendStatus === "2" ? "已收货" : "") ) }}</span>
            </div>
            <div v-else-if="col.key === 'index'">
              <span>{{ scope.$index + 1 + ( listQuery.page - 1 ) * listQuery.limit }}</span>
            </div>
            <span v-else>
              {{ scope.row[col.key] }}
            </span>
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
    </div>
  </el-dialog>
</template>

<script>
import {
  fetchPv,
  createArticle,
  updateArticle
} from '@/api/article'
import {
  orderManage, updateSendState
} from '@/api/order'
import { getPromoterOrder } from '@/api/promoter'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'OrderManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        mobile: '',
        orderId: '',
        time: []
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [
          { required: true, message: 'type is required', trigger: 'change' }
        ],
        timestamp: [
          {
            type: 'date',
            required: true,
            message: 'timestamp is required',
            trigger: 'change'
          }
        ],
        title: [
          { required: true, message: 'title is required', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      columns: [],
      dialogVisible: false,
      dialogVisible2: false,
      sendInfo: {
        'orderId': '',
        'state': '',
        'company': '',
        'sendNumber': ''
      },
      handleRow: null,
      updateSend: false
    }
  },
  created() {
    this.getList(1, 30)
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },
    getList(page, limit) {
      this.listLoading = true
      this.listQuery.page = page
      this.listQuery.limit = limit
      orderManage({
        'mobile': this.listQuery.mobile || undefined,
        'orderId': this.listQuery.orderId || undefined,
        'startIndex': this.listQuery.page,
        'pageSize': this.listQuery.limit,
        'startTime': this.listQuery.time[0] ? new Date(this.listQuery.time[0]).getTime() : undefined,
        'endTime': this.listQuery.time[1] ? new Date(this.listQuery.time[1]).getTime() : undefined
      }).then(response => {
        const data = response.body
        data.hideTitle = data.hideTitle.concat('id')
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
        this.list = data.orderList
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
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
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
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = this.columns.filter(col => col.key !== 'wineNameList' && col.key !== 'operation').map(({ label }) => label).concat('商品明细')
        const filterVal = this.columns.filter(col => col.key !== 'wineNameList' && col.key !== 'operation').map(({ key }) => key)
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '订单'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v =>
        filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }).concat(v['wineNameList'].map(wine => JSON.stringify(wine)))
      )
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    sendGood(row) {
      this.sendInfo.orderId = row.orderId
      this.sendInfo.state = '1'
      this.dialogVisible = true
      this.handleRow = row
    },
    sendGood2(row) {
      row.disable = true
      this.sendInfo.orderId = row.orderId
      this.sendInfo.state = '2'
      this.sendInfo.company = ''
      this.sendInfo.sendNumber = ''
      this.dialogVisible2 = true
      this.handleRow = row
    },
    confirmSend() {
      if (this.sendInfo.company.trim() && this.sendInfo.sendNumber.trim()) {
        this.updateSend = true
        updateSendState(this.sendInfo).then(res => {
          this.updateSend = false
          this.dialogVisible = false
          if (res.header.resCode === '0000') {
            this.$message({
              message: '发货成功',
              type: 'success',
              duration: 1500
            })
            this.handleRow.sendStatus = '1'
          } else {
            this.$message({
              message: '发货失败：' + res.header.resMessage,
              type: 'error',
              duration: 1500
            })
          }
        })
      } else {
        this.$message({
          message: '请填写物流信息',
          type: 'error',
          duration: 1500
        })
      }
    },
    confirmSend2() {
      this.updateSend = true
      updateSendState(this.sendInfo).then(res => {
        this.updateSend = false
        this.dialogVisible2 = false
        if (res.header.resCode === '0000') {
          this.$message({
            message: '收货成功',
            type: 'success',
            duration: 1500
          })
          this.handleRow.sendStatus = '2'
        } else {
          this.$message({
            message: '收货失败：' + res.header.resMessage,
            type: 'error',
            duration: 1500
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .divider {
    margin: 5px 0;
  }
</style>
