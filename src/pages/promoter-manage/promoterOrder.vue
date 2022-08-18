<template>
  <el-dialog :visible.sync="dialogVisible" destroy-on-close width="80%" title="营销员订单">
    <div class="app-container">
      <div class="filter-container">
        <el-input
          clearable
          v-model="listQuery.phoneNumber"
          placeholder="手机号"
          style="width: 200px;margin-right: 15px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-input
          clearable
          v-model="listQuery.orderId"
          placeholder="订单号"
          style="width: 200px;margin-right: 15px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-select
          clearable
          v-model="listQuery.source"
          style="width: 200px;margin-right: 20px;"
          class="filter-item"
          placeholder="选择来源"
        >
          <el-option value="1" label="自购" />
          <el-option value="2" label="直推" />
          <el-option value="3" label="间推" />
        </el-select>
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >查询</el-button>
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
      >
        <el-table-column v-for="col in columns" :key="col.key" :label="col.label" :prop="col.key" :fixed="col.fixed">
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
        layout='total, sizes, prev, pager, next, jumper'
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-dialog>
</template>

<script>
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
        phoneNumber: '',
        source: '',
        orderId: ''
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
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      pvData: [],
      downloadLoading: false,
      columns: [],
      dialogVisible: false,
      handleRow: null,
      updateSend: false,
      promoterRowInfo: {}
    }
  },
  methods: {
    showDialog(row) {
      this.promoterRowInfo = row
      this.getList()
      this.dialogVisible = true
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
        promoterId: this.promoterRowInfo.userId,
        startIndex: this.listQuery.page,
        pageSize: this.listQuery.limit
      }
      getPromoterOrder(param).then(response => {
        this.recordPageParam = param
        const data = response.body
        const columns = data.columns
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
      this.listQuery.page = 1
      const param = {
        promoterId: this.promoterRowInfo.userId,
        startIndex: 1,
        pageSize: this.listQuery.limit,
        phoneNumber: this.listQuery.phoneNumber,
        orderId: this.listQuery.orderId,
        source: this.listQuery.source
      }
      this.getList(param)
    }
  }
}
</script>
<style lang="scss" scoped>
  .divider {
    margin: 5px 0;
  }
</style>
