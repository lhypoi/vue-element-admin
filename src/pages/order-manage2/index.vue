<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.wineId"
        clearable
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        placeholder="票务类型"
      >

        <el-option v-for="item in ticketOptions" :key="item.key" :value="item.key" :label="item.label" />
      </el-select>
      {{ ticketDict }}
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
      @sort-change="sortChange"
    >
      <el-table-column v-for="col in columns" :key="col.key" :label="col.label" :prop="col.key" :width="col.width || 'auto'" :fixed="col.fixed">
        <template slot-scope="scope">
          <span>
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
  </div>
</template>

<script>
import {
  getOrderByPage,
  getWineList
} from '@/api/ticket'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

export default {
  name: 'OrderManage',
  directives: { waves },
  data() {
    return {
      ticketOptions: [],
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
        time: [],
        wineId: ''
      },
      recordPageParam: {},
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
      columns: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
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
    async getList(obj = undefined) {
      this.listLoading = true
      if (this.ticketOptions.length === 0) {
        const ticketOptionsRes = await getWineList()
        this.ticketOptions = ticketOptionsRes.map((item) => {
          return {
            key: item.wineId,
            label: item.wineName
          }
        }, {})
      }
      const param = obj || {
        startIndex: this.listQuery.page,
        pageSize: this.listQuery.limit
      }
      getOrderByPage(param).then(response => {
        this.recordPageParam = param
        const data = response
        data.hideTitle = data.hideTitle.concat('id')
        const columns = data.columns.filter(col => data.hideTitle.indexOf(col.key) === -1).map(item => {
          if (item.key === 'transactionId') {
            item.width = 250
          }
          return item
        })

        columns[0].fixed = 'left'
        this.columns = columns
        this.list = data.list
        this.total = data.totalCount

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
        'endTime': this.listQuery.time[1] ? new Date(this.listQuery.time[1]).getTime() : undefined,
        'wineId': this.listQuery.wineId || undefined
      }
      this.getList(param)
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = this.columns.filter(col => col.key !== 'operation').map(({ label }) => label)
        const filterVal = this.columns.filter(col => col.key !== 'operation').map(({ key }) => key)
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
          if (j === 'timestamp' || j === 'payTime') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    }
  }
}
</script>
<style lang="scss" scoped>
  .divider {
    margin: 5px 0;
  }
  >>> .el-upload-dragger {
    width: 100%;
  }
  >>> .el-upload {
    width: 100%;
  }
</style>
