<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.mobile"
        clearable
        placeholder="手机号"
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.orderId"
        clearable
        placeholder=" 订单号"
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.isPay"
        clearable
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        placeholder="支付状态"
      >
        <el-option value="1" label="已支付" />
        <el-option value="2" label="已退款" />
        <el-option value="3" label="超时未支付" />
      </el-select>
      <el-date-picker
        v-model="listQuery.time"
        clearable
        class="filter-item"
        style="margin-right: 20px;"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
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
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="showUploadDialog"
      >导入订单</el-button>
      <!-- <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出为Excel</el-button> -->
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
      <el-table-column v-for="col in columns" :key="col.key" :label="col.label" :prop="col.key" :width="col.key === 'wineNameList' ? 200 : col.key === 'addressLabel' ? '' : col.key === 'index' ? 50 : 120" :fixed="col.fixed">
        <template slot-scope="scope">
          <div v-if="col.key === 'wineNameList'">
            <el-card v-for="wine in scope.row[col.key]" :key="wine.wineId">
              <span>名称：</span><span>{{ wine.wineName }}</span>
              <el-divider class="divider" />
              <span>规格：</span><span>{{ wine.volume }}</span>
              <el-divider class="divider" />
              <span>价格：</span><span>{{ wine.price }}</span>
              <el-divider class="divider" />
              <span>数量：</span><span>{{ wine.count }}</span>
              <el-divider class="divider" />
            </el-card>
          </div>
          <div v-else-if="col.key === 'operation'">
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
    <el-pagination
      style="margin-top: 15px;;"
      :current-page="listQuery.page"
      :page-size="listQuery.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 30, 50]"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!-- 发货 -->
    <el-dialog
      title="物流信息"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form
        :model="sendInfo"
        label-width="80px"
      >
        <el-form-item label="物流公司" prop="company">
          <el-select
            v-model="sendInfo.company"
            clearable
            class="filter-item"
            placeholder="选择物流公司"
            filterable
          >
            <el-option v-for="item in expressCompany" :key="item.id" :value="item.name" :label="item.name + ' —— ' + item.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="sendNumber">
          <el-input v-model="sendInfo.sendNumber" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="updateSend" @click="confirmSend">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 收货 -->
    <el-dialog
      title="确定收货？"
      :visible.sync="dialogVisible2"
      width="30%"
    >
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" :loading="updateSend" @click="confirmSend2">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="Type" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Date" prop="timestamp">
          <el-date-picker
            v-model="temp.timestamp"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Imp">
          <el-rate
            v-model="temp.importance"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :max="3"
            style="margin-top:8px;"
          />
        </el-form-item>
        <el-form-item label="Remark">
          <el-input
            v-model="temp.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">Confirm</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="uploadDialogVisible" @close="fileList = []">
      <el-upload :multiple="false" :file-list="fileList" :on-error="handleError" :on-success="hanelSuccess" :auto-upload="false" :action="action" drag>
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPv,
  createArticle,
  updateArticle
} from '@/api/article'
import {
  orderManage, updateSendState, getExpressCompanyList
} from '@/api/order'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

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
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        mobile: '',
        orderId: '',
        isPay: '',
        time: []
      },
      recordPageParam: {},
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
      updateSend: false,
      expressCompany: [],
      uploadDialogVisible: false,
      fileList: [],
      action: process.env.VUE_APP_BASE_API + '/services/importSendOrder'
    }
  },
  created() {
    this.getList()
    this.getExpressCompanyData()
  },
  methods: {
    hanelSuccess(response, file, fileList) {
      console.log(response, file, fileList)
    },
    handleError(error, file) {
      console.log(error, file)
    },
    showUploadDialog() {
      this.uploadDialogVisible = true
    },
    getExpressCompanyData() {
      getExpressCompanyList({})
        .then(res => {
          const data = res.body || []
          this.expressCompany = data
        })
    },
    handleSizeChange(val) {
      const data = Object.assign({}, this.recordPageParam)
      data.pageSize = val
      this.listQuery.limit = val
      this.getList(data)
    },
    handleCurrentChange(val) {
      const data = Object.assign({}, this.recordPageParam)
      data.startIndex = val
      this.listQuery.page = val
      this.getList(data)
    },
    getList(obj = undefined) {
      this.listLoading = true
      const param = obj || {
        startIndex: this.listQuery.page,
        pageSize: this.listQuery.limit
      }
      orderManage(param).then(response => {
        this.recordPageParam = param
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
      const param = {
        'mobile': this.listQuery.mobile || undefined,
        'orderId': this.listQuery.orderId || undefined,
        'isPay': this.listQuery.isPay || undefined,
        'startIndex': this.listQuery.page,
        'pageSize': this.listQuery.limit,
        'startTime': this.listQuery.time[0] ? new Date(this.listQuery.time[0]).getTime() : undefined,
        'endTime': this.listQuery.time[1] ? new Date(this.listQuery.time[1]).getTime() : undefined
      }
      this.getList(param)
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
        const companyData = this.expressCompany.find(item => item.name.trim() === this.sendInfo.company.trim()) || []
        this.sendInfo.companyCode = companyData.code
        console.log(111, this.sendInfo)
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
