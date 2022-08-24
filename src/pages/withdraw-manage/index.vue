<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.phoneNumber"
        clearable
        placeholder="提现手机号"
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.userName"
        clearable
        placeholder="提现用户名"
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.auditStatus"
        clearable
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        placeholder="审核状态"
      >
        <el-option value="0" label="待审核" />
        <el-option value="1" label="已支付" />
        <el-option value="2" label="已驳回" />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        size="small"
        @click="handleFilter"
      >查询</el-button>
      <!-- <el-button
        v-waves
        class="filter-item"
        style="float: right;"
        type="warning"
        icon="el-icon-search"
        size="small"
        @click="showPromoterDialog"
      >查询营销员提现订单</el-button> -->
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
      <el-table-column
        v-for="col in columns"
        :key="col.key"
        :label="col.label"
        :prop="col.key"
        :width="col.width"
        :fixed="col.fixed"
      >
        <template slot-scope="scope">
          <div v-if="col.key === 'operation'">
            <el-link style="margin-right: 10px;" type="primary" :disabled="scope.row.auditStatus !== '0'" @click="setPay(scope.row)">已支付</el-link>
            <el-link type="danger" :disabled="scope.row.auditStatus !== '0'" @click="setBack(scope.row)">驳回</el-link>
          </div>
          <div v-else-if="/Time/.test(col.key)">
            <span>{{ parseTime(scope.row[col.key]) }}</span>
          </div>
          <div v-else-if="col.key === 'teamNum'">
            <el-link type="primary">{{ scope.row[col.key] }}</el-link>
          </div>
          <div v-else-if="col.key === 'index'">
            <span>{{ scope.$index + 1 + ( listQuery.page - 1 ) * listQuery.limit }}</span>
          </div>
          <div v-else-if="col.key === 'auditStatus'">
            <span>{{ statusMap[scope.row[col.key]] }}</span>
          </div>
          <span v-else>{{ scope.row[col.key] }}</span>
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
    <promoterWithdrawOrder ref="promoterWithdrawOrder" />
  </div>
</template>

<script>
import { getWithdrawalOrderByPage, updateWithdrawalOrder } from '@/api/promoter'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils/index'
import promoterWithdrawOrder from './promoterWithdrawOrder'
export default {
  name: 'ShopManage',
  components: { promoterWithdrawOrder },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        phoneNumber: '',
        userName: '',
        auditStatus: ''
      },
      recordPageParam: {},
      list: null,
      total: 0,
      columns: [],
      dialogVisible: false,
      promoterInfo: {
        phoneNumber: '',
        level: 1
      },
      statusMap: {
        '0': '待审核',
        '1': '已支付',
        '2': '已驳回'
      },
      updateSend: false,
      curRowId: null,
      wineList: []
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
    getList(obj = undefined) {
      this.listLoading = true
      const param = obj || {
        startIndex: this.listQuery.page,
        pageSize: this.listQuery.limit
      }
      getWithdrawalOrderByPage(param).then(response => {
        this.recordPageParam = param
        const data = response.body
        const columns = data.columns
        columns.push({
          label: '操作',
          fixed: 'right',
          key: 'operation'
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
    showPromoterDialog() {
      this.$refs.promoterWithdrawOrder.showDialog()
    },
    handleFilter() {
      this.listQuery.page = 1
      const param = {
        startIndex: 1,
        pageSize: this.listQuery.limit,
        phoneNumber: this.listQuery.phoneNumber || undefined,
        userName: this.listQuery.userName || undefined,
        auditStatus: this.listQuery.auditStatus || undefined
      }
      this.getList(param)
    },
    setPay(row) {
      this.$confirm('确定将该提现订单设置为已支付吗?')
        .then(() => {
          const param = {
            orderId: row.orderId,
            auditStatus: 1
          }
          updateWithdrawalOrder({data: param})
            .then(res => {
              if (res.body === 1) {
                this.$message.success('操作成功')
                this.getList()
              }
            }).catch(() => { this.$message.error('发生错误，请重试') })
        })
        .catch(err => { console.log(err) })
    },
    setBack(row) {
      this.$confirm('确定驳回该提现订单吗?')
        .then(() => {
          const param = {
            orderId: row.orderId,
            auditStatus: 2
          }
          updateWithdrawalOrder({data: param})
            .then(res => {
              if (res.body === 1) {
                this.$message.success('操作成功')
                this.getList()
              }
            }).catch(() => { this.$message.error('发生错误，请重试') })
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
