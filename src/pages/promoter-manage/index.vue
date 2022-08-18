<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.phoneNumber"
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
      @sort-change="sortChange"
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
            <el-link type="primary" @click="handleDown(scope.row)">查看订单</el-link>
          </div>
          <div v-else-if="/Time/.test(col.key)">
            <span>{{ parseTime(scope.row[col.key]) }}</span>
          </div>
          <div v-else-if="col.key === 'index'">
            <span>{{ scope.$index + 1 + ( listQuery.page - 1 ) * listQuery.limit }}</span>
          </div>
          <span v-else>{{ scope.row[col.key] }}</span>
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
  </div>
</template>

<script>
import {
  updateCoupon
} from '@/api/order'
import { getPromoterList, insertPromoter, getPromoterOrder } from '@/api/promoter'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { parseTime } from '@/utils/index'
import promoterOrder from './promoterOrder'
export default {
  name: 'ShopManage',
  components: { Pagination, promoterOrder },
  directives: { waves },
  props: ["userId"],
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30
      },
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
    this.getList(1, 30)
  },
  methods: {
    parseTime,
    getList(page, limit) {
      this.listLoading = true
      this.listQuery.page = page
      this.listQuery.limit = limit
      getPromoterList({
        'startIndex': this.listQuery.page,
        'pageSize': this.listQuery.limit,
        'phoneNumber': this.listQuery.phoneNumber
      }).then(response => {
        const data = response.body
        const columns = data.columns.filter(col => data.hideTitle.indexOf(col.key) === -1)
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
      this.getList(1, 30)
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
      insertPromoter({data: params}).then(res => {
        const body = res.body || 0
        if (body === 1) {
          this.$message({
            type: 'success',
            message: `${this.curRowId ? '修改' : '上架'}成功!`
          })
          this.dialogVisible = false
          this.updateSend = false
          this.getList(1, 30)
        }
      }).catch(() => { this.updateSend = false })
    },
    handleDown(row) {
      this.$refs.promoterOrder.showDialog()
      // this.$confirm('确定下架? （下架后不可再上架）')
      //   .then(async() => {
      //     const res = await updateCoupon({
      //       data: {
      //         couponId: row.couponId,
      //         isShow: '0'
      //       }
      //     })
      //     if (res.body === 1) {
      //       this.$message({
      //         type: 'success',
      //         message: '下架成功!'
      //       })
      //       this.$set(row, 'isShow', '0')
      //     }
      //   })
      //   .catch(err => { console.log(err) })
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
