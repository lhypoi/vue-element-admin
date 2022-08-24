<template>
  <el-dialog :visible.sync="dialogVisible" destroy-on-close width="80%" title="营销员提现订单">
    <div class="app-container">
      <div class="filter-container">
        <el-input
          v-model="listQuery.userId"
          clearable
          placeholder="营销员ID"
          style="width: 200px;margin-right: 15px;"
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
      </div>
      <div style="margin: 15px 0px;">
        <el-form label-position="left" inline class="demo-table-expand">
          <el-form-item label="总收益">
            <span>{{ total.totalProfit || '暂无数据' }}</span>
          </el-form-item>
          <el-form-item label="已结算收益">
            <span>{{ total.settledProfit || '暂无数据' }}</span>
          </el-form-item>
          <el-form-item label="未结算收益">
            <span>{{ total.unsettledProfit || '暂无数据' }}</span>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column v-for="col in columns" :key="col.key" :label="col.label" :prop="col.key" :fixed="col.fixed">
          <template slot-scope="scope">
            <div v-if="col.key === 'auditStatus'">
              <span>{{ statusMap[scope.row[col.key]] }}</span>
            </div>
            <span v-else>
              {{ scope.row[col.key] }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import { getPromoterWithdrawal } from '@/api/promoter'
import waves from '@/directive/waves' // waves directive

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
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        userId: ''
      },
      statusMap: {
        '0': '待审核',
        '1': '已支付',
        '2': '已驳回'
      },
      columns: [
        {
          'label': '用户名',
          'key': 'userName'
        },
        {
          'label': '姓名',
          'key': 'realName'
        },
        {
          'label': '申请提现金额',
          'key': 'amount'
        },
        {
          'label': '申请提现卡号',
          'key': 'bankNo'
        },
        {
          'label': '银行卡类型',
          'key': 'bankType'
        },
        {
          'label': '支行名称',
          'key': 'bankBranch'
        },
        {
          'label': '推广商级别',
          'key': 'promoterLevel'
        },
        {
          'label': '手机号码',
          'key': 'phoneNumber'
        },
        {
          'label': '申请时间',
          'key': 'createTime'
        },
        {
          'label': '支付情况',
          'key': 'auditStatus'
        }
      ],
      dialogVisible: false,
      totalData: {}
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },
    getList(obj) {
      this.listLoading = true
      getPromoterWithdrawal(obj).then(response => {
        const data = response.body || {}
        this.list = data.orderList || []
        this.totalData = data.total || {}
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() {
      if (!this.listQuery.userId) {
        this.$message.warning('请输入营销员ID')
        return false
      }
      const param = {
        userId: this.listQuery.userId
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
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
