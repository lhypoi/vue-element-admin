<template>
  <el-dialog :visible.sync="dialogVisible" destroy-on-close width="50%" title="营销员订单汇总" top="10px">
    <el-form label-position="left" inline class="demo-table-expand">
      <el-form-item label="推广员上级名称：">
        <span>{{ statisticsData.parentName || '无上级' }}</span>
      </el-form-item>
      <el-form-item label="推广员上级ID：">
        <span>{{ (statisticsData.parentId === '0' ? '无上级' : (statisticsData.parentId || '无上级')) }}</span>
      </el-form-item>
      <el-form-item label="当月订单数：">
        <span>{{ statisticsData.monthOrderNum || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="当月营业额：">
        <span>{{ statisticsData.monthTurnover || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="收益余额：">
        <span>{{ statisticsData.profitBalance || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="总收益：">
        <span>{{ statisticsData.totalProfit || '暂无数据' }}</span>
      </el-form-item>
      <el-form-item label="当月社群新增人数：">
        <span>{{ statisticsData.monthTeamNum || '暂无数据' }}</span>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { getPromoterTotal } from '@/api/promoter'

export default {
  name: 'OrderManage',
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      recordPageParam: {},
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
