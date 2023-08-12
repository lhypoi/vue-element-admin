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
      <el-button v-waves class="filter-item" size="small" style="float: right;" type="primary" @click="showAddNewPointsModal">手机充分</el-button>
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
            <el-link style="margin-right: 32px;" type="primary" @click="showAddPointsModal(scope.row)">充值</el-link>
            <el-link type="primary" @click="handleDown(scope.row)">充值记录</el-link>
            <!-- <el-link type="warning" @click="showStatistics(scope.row)">查看汇总</el-link> -->
          </div>
          <div v-else-if="/Time/.test(col.key)">
            <span>{{ parseTime(scope.row[col.key]) }}</span>
          </div>
          <!-- <div v-else-if="col.key === 'teamNum'">
            <el-link type="primary">{{ scope.row[col.key] }}</el-link>
          </div> -->
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
    <el-dialog title="充值积分" :visible.sync="pointsModal.show">
      <el-form>
        <el-form-item label="手机号">
          <el-input :value="pointsModal.row && pointsModal.row.phoneNumber" disabled />
        </el-form-item>
        <el-form-item label="积分数量">
          <el-input v-model="pointsModal.points" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="pointsModal.show = false">取 消</el-button>
        <el-button type="primary" :loading="pointsModal.submitting" @click="handlePointsModalSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="手机充分" :visible.sync="newPointsModal.show">
      <el-form>
        <el-form-item label="手机号">
          <el-input v-model="newPointsModal.phoneNumber" />
        </el-form-item>
        <el-form-item label="积分数量">
          <el-input v-model="newPointsModal.points" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="newPointsModal.show = false">取 消</el-button>
        <el-button type="primary" :loading="newPointsModal.submitting" @click="handleNewPointsModalSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <promoterOrder ref="promoterOrder" />
    <statistics ref="statistics" />
  </div>
</template>

<script>
import { getUserListByPage, insertPromoter, addUserPoint, addUserPointByPhone } from '@/api/promoter'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils/index'
import promoterOrder from './promoterOrder'
import statistics from './statistics'
export default {
  name: 'ShopManage',
  components: { promoterOrder, statistics },
  directives: { waves },
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
      wineList: [],
      pointsModal: {
        show: false,
        row: null,
        points: '',
        submitting: false
      },
      newPointsModal: {
        show: false,
        phoneNumber: '',
        points: '',
        submitting: false
      }
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
        pageSize: this.listQuery.limit,
        phoneNumber: this.listQuery.phoneNumber || undefined
      }
      getUserListByPage(param).then(response => {
        this.recordPageParam = param
        const data = response.body
        data.columns = [
          {
            key: 'phoneNumber',
            label: '手机号'
          },
          {
            key: 'point',
            label: '剩余积分'
          }
        ]
        const columns = data.columns
        columns.push({
          label: '操作',
          // fixed: 'right',
          key: 'operation'
        })
        this.columns = columns
        this.list = data.data
        this.total = data.total

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
        phoneNumber: this.listQuery.phoneNumber || undefined
      }
      this.getList(param)
    },
    async handleShowInfo() {
      this.updateSend = false
      this.dialogVisible = true
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
      // console.log(row)
      // if (!row.userId) {
      //   this.$message.warning('该用户未登录小程序激活')
      //   // return false
      // }
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
    },
    showAddPointsModal(row) {
      this.pointsModal.row = row
      this.pointsModal.points = ''
      this.pointsModal.show = true
    },
    async handlePointsModalSubmit() {
      if (!this.pointsModal.points) {
        this.$message({
          type: 'warning',
          message: '请输入充值积分'
        })
        return
      }
      this.pointsModal.submitting = true
      try {
        const res = await addUserPoint({
          'userId': this.pointsModal.row.userId,
          'point': this.pointsModal.points
        })
        if (res && res.body === 1) {
          this.$message({
            type: 'success',
            message: '充值成功'
          })
          this.pointsModal.show = false
          this.handleFilter()
        } else {
          this.$message({
            type: 'error',
            message: '充值失败'
          })
        }
      } catch (error) {
        console.log(error)
      }
      this.pointsModal.submitting = false
    },
    showAddNewPointsModal() {
      this.newPointsModal.phoneNumber = ''
      this.newPointsModal.points = ''
      this.newPointsModal.show = true
    },
    async handleNewPointsModalSubmit() {
      if (!this.newPointsModal.points || !this.newPointsModal.phoneNumber) {
        this.$message({
          type: 'warning',
          message: '请输入手机号和充值积分'
        })
        return
      }
      this.newPointsModal.submitting = true
      try {
        const res = await addUserPointByPhone({
          'phoneNumber': this.newPointsModal.phoneNumber,
          'point': this.newPointsModal.points
        })
        if (res && res.body === 1) {
          this.$message({
            type: 'success',
            message: '充值成功'
          })
          this.newPointsModal.show = false
          this.handleFilter()
        } else {
          this.$message({
            type: 'error',
            message: '充值失败'
          })
        }
      } catch (error) {
        console.log(error)
      }
      this.newPointsModal.submitting = false
    }
  }
}
</script>

<style lang="scss" scoped>
.divider {
  margin: 5px 0;
}
</style>
