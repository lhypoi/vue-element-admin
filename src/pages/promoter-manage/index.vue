<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.phoneNumber"
        clearable
        placeholder="手机号"
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        size="small"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="warning"
        icon="el-icon-search"
        size="small"
        @click="handleFilter"
      >查询</el-button>
      <el-button v-waves class="filter-item" size="small" style="float: right;" type="primary" @click="handleShowInfo">添加一级分销员</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @expand-change="test"
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
            <el-link style="margin-right: 10px;" type="primary" @click="handleDown(scope.row)">查看订单</el-link>
            <el-link type="warning" @click="showStatistics(scope.row)">查看汇总</el-link>
            <!-- <el-link type="primary" @click="handleDown(scope.row)"></el-link> -->
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
    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList(listQuery.page, listQuery.limit)"
    /> -->
    <!-- 酒信息 -->
    <el-dialog :visible.sync="dialogVisible" width="40%" title="添加一级营销员">
      <el-form v-loading="updateSend" :model="promoterInfo" :disabled="!!curRowId">
        <el-form-item label="手机号：" prop="phoneNumber">
          <el-input v-model="promoterInfo.phoneNumber" type="number" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <!-- <el-button v-if="curRowId" type="danger" @click="handleDele">删 除</el-button> -->
        <el-button v-if="!curRowId" size="small" type="primary" :loading="updateSend" @click="confirmSend">{{ curRowId ? '修 改' : '提 交' }}</el-button>
      </span>
    </el-dialog>
    <promoterOrder ref="promoterOrder" />
    <statistics ref="statistics" />
  </div>
</template>

<script>
import { getPromoterList, insertPromoter, getPromoterOrder } from '@/api/promoter'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { parseTime } from '@/utils/index'
import promoterOrder from './promoterOrder'
import statistics from './statistics'
export default {
  name: 'ShopManage',
  components: { Pagination, promoterOrder, statistics },
  directives: { waves },
  props: ['userId'],
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        phoneNumber: ''
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
    test(a, b) {
      console.log(a, b)
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
      getPromoterList(param).then(response => {
        this.recordPageParam = param
        const data = response.body
        const columns = data.columns
        columns.push({
          label: '操作',
          fixed: 'right',
          key: 'operation'
        })
        this.columns = columns
        this.list = data.promoterList
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
        startIndex: 1,
        pageSize: this.listQuery.limit,
        phoneNumber: this.listQuery.phoneNumber
      }
      this.getList(param)
    },
    async handleShowInfo(row) {
      this.curRowId = row ? row.couponId : ''
      this.updateSend = false
      this.dialogVisible = true
      if (this.curRowId) {
        this.updateSend = true
        const res = await getPromoterOrder({
          couponId: this.curRowId
        })
        const wine = res.body
        console.log(wine)
        this.updateSend = false
      }
    },
    confirmSend() {
      this.updateSend = true
      const params = this.promoterInfo
      params.userName = this.promoterInfo.phoneNumber // 用户名默认是手机号码
      // const res = insertPromoter(params)
      insertPromoter({ data: params }).then(res => {
        const body = res.body || 0
        if (body === 1) {
          this.$message({
            type: 'success',
            message: `${this.curRowId ? '修改' : '上架'}成功!`
          })
          this.dialogVisible = false
          this.updateSend = false
          this.listQuery.page = 1
          this.getList()
        }
      }).catch(() => { this.updateSend = false })
    },
    handleDown(row) {
      console.log(row)
      if (!row.userId) {
        this.$message.warning('该用户未登录小程序激活')
        // return false
      }
      this.$refs.promoterOrder.showDialog(row)
    },
    showStatistics(row) {
      console.log(row)
      if (!row.userId) {
        this.$message.warning('该用户未登录小程序激活')
        // return false
      }
      this.$refs.statistics.showDialog(row)
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
