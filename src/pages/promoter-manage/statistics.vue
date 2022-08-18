<template>
  <el-dialog :visible.sync="dialogVisible" destroy-on-close width="50%" title="营销员订单">
    <el-form label-position="left" inline class="demo-table-expand">
      <el-form-item label="当月订单数">
        <span>{{ statisticsData.monthOrderNum || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="当月社群新增人数">
        <span>{{ statisticsData.monthTeamNum || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="当月营业额">
        <span>{{ statisticsData.monthTurnover || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="推广员上级名称">
        <span>{{ statisticsData.parentName || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="收益余额">
        <span>{{ statisticsData.profitBalance || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="总收益">
        <span>{{ statisticsData.totalProfit || '暂无数据' }}</span>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { getPromoterTotal } from '@/api/promoter'
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
      promoterRowInfo: {},
      statisticsData: {}
    }
  },
  methods: {
    showDialog(row) {
      this.promoterRowInfo = row
      this.getData()
      this.dialogVisible = true
    },
    getData(obj = undefined) {
      this.listLoading = true
      const param = obj || {
        userId: this.promoterRowInfo.userId
      }
      getPromoterTotal(param).then(response => {
        this.recordPageParam = param
        const data = response.body
        this.statisticsData = data || {}
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(() => {
        this.$message.error('发生错误')
        this.statisticsData = {}
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.divider {
    margin: 5px 0;
}
div >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
