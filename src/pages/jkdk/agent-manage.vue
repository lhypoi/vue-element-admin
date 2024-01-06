<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.phoneNumber"
        clearable
        placeholder="手机号搜索"
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button v-waves class="filter-item" style="float: right;" type="success" @click="handleShowTeacherModal">添加老师</el-button>
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
        v-for="col in tableColumns"
        :key="col.key"
        :label="col.label"
        :prop="col.key"
        :width="col.width"
        :fixed="col.fixed"
        :align="col.align"
      >
        <template slot-scope="scope">
          <!-- 模板列 -->
          <div v-if="col.key === 'index'">
            <span>{{ scope.$index + 1 + ( listQuery.page - 1 ) * listQuery.limit }}</span>
          </div>
          <div v-else-if="col.renderType === 'dict'">
            <span>{{ dictObj[col.dictObjKey][scope.row[col.key]] }}</span>
          </div>
          <div v-else-if="col.renderType === 'time'">
            {{ parseTime(scope.row[col.key], col.timeFormat) }}
          </div>
          <!-- 操作列 -->
          <div v-else-if="col.key === 'operation'">
            <div style="display: flex; column-gap: 12px;">
              <el-button type="primary" @click="handleShowTeacherModal(scope.row)">查看详情</el-button>
              <el-button type="danger" @click="handleDele(scope.row)">删除</el-button>
            </div>
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
    <!-- 老师信息弹窗 -->
    <el-dialog
      v-if="teacherModalParams.show"
      :visible="true"
      width="600px"
      title="老师信息"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="teacherModalParams.show = false"
    >
      <el-form ref="teacherModalForm" :model="teacherModalParams.formData" :rules="teacherModalParams.formRules" label-width="80px" label-position="left">
        <el-form-item label="手机号：" prop="phoneNumber">
          <el-input v-model="teacherModalParams.formData.phoneNumber" size="small" placeholder="请输入" :disabled="!!teacherModalParams.phoneNumber" />
        </el-form-item>
        <el-form-item label="类型：" prop="userType">
          <el-select v-model="teacherModalParams.formData.userType" size="small" style="width: 100%;" filterable clearable placeholder="请选择">
            <el-option v-for="item in dictFormOptions['userTeacherType']" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="teacherModalParams.show = false">取 消</el-button>
        <el-button type="primary" :loading="teacherModalParams.submitting" @click="handleTeacherModalSubmit">{{ teacherModalParams.phoneNumber ? '更 新' : '添 加' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import jkdkApi from '@/api/jkdk'
import { parseTime } from '@/utils/index'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AgentManage',
  directives: { waves },
  data() {
    return {
      teacherModalParams: {
        show: false,
        phoneNumber: '',
        formData: {
          phoneNumber: '',
          userType: undefined
        },
        formRules: {
          phoneNumber: [{ required: true, message: '请输入' }],
          userType: [{ required: true, message: '请选择' }]
        },
        submitting: false
      },
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        phoneNumber: ''
      },
      list: null,
      total: 0,
      tableColumns: [
        { label: '序号', key: 'index', width: 60, align: 'center' },
        { label: '手机号', key: 'phoneNumber' },
        { label: '创建时间', key: 'createTime', width: 160, renderType: 'time' },
        { label: '操作', key: 'operation', width: 240, fixed: 'right' }
      ]
    }
  },
  computed: {
    ...mapState('user', ['dictObj']),
    ...mapGetters('user', ['dictFormOptions'])
  },
  mounted() {
    this.getList()
  },
  methods: {
    parseTime,
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    async getList() {
      this.listLoading = true
      try {
        const param = {
          currentPage: this.listQuery.page,
          pageSize: this.listQuery.limit,
          phoneNumber: this.listQuery.phoneNumber
        }
        const res = await jkdkApi.getAgentList(param)
        const data = res.body
        this.list = data.list
        this.total = data.total
      } catch (error) {
        console.log(error)
      }
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleShowTeacherModal(row) {
      this.teacherModalParams = {
        ...this.teacherModalParams,
        show: true,
        phoneNumber: row?.phoneNumber || '',
        formData: {
          phoneNumber: row?.phoneNumber || '',
          userType: row?.userType
        },
        submitting: false
      }
    },
    async handleTeacherModalSubmit() {
      let valid = false
      try {
        valid = await this.$refs.teacherModalForm.validate()
      } catch (error) {
        console.log(error)
      }
      if (!valid) {
        this.$message.warning('请填完必填项')
        return
      }
      this.teacherModalParams.submitting = true
      try {
        const formData = this.teacherModalParams.formData
        const params = {
          phoneNumber: formData.phoneNumber,
          userType: formData.userType
        }
        const res = this.teacherModalParams.phoneNumber ? await jkdkApi.updateTeacher(params) : await jkdkApi.insertTeacher(params)
        if (res?.body === 1) {
          this.$message({
            type: 'success',
            message: `${this.teacherModalParams.phoneNumber ? '更新' : '添加'}成功!`
          })
          this.teacherModalParams.show = false
          this.handleFilter()
        }
      } catch (error) {
        console.log(error)
      }
      this.teacherModalParams.submitting = false
    },
    handleDele(row) {
      this.$confirm(
        '此操作将删除老师【' + row.phoneNumber + '】, 是否继续?',
        '提示'
      ).then(async() => {
        const res = await jkdkApi.deleteTeacher({
          phoneNumber: row.phoneNumber
        })
        if (res?.body === 1) {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.handleFilter()
        }
      }).catch(err => { console.log(err) })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
