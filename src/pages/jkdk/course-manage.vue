<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.courseName"
        clearable
        placeholder="课程名搜索"
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
      />
      <el-select
        v-model="listQuery.status"
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        clearable
        filterable
        placeholder="课程状态"
      >
        <el-option v-for="item in dictFormOptions['courseStatus']" :key="item.id" :value="item.id" :label="item.name" />
      </el-select>
      <el-date-picker
        v-model="listQuery.time"
        style="width: 260px;margin-right: 20px;"
        class="filter-item"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        clearable
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button v-waves class="filter-item" style="float: right;" type="success" @click="handleShowCourseModal">添加课程</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      row-key="courseId"
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
          <!-- 定制列 -->
          <div v-else-if="col.key === 'openUser'">
            <div v-if="!scope.row[col.key]">
              <el-tag type="success">全部</el-tag>
            </div>
            <div v-else style="display: flex; flex-direction: column; row-gap: 8px; align-items: center;">
              <el-tag
                v-for="(tagName, index) in scope.row[col.key].split(',')"
                :key="index"
              >
                {{ tagName }}
              </el-tag>
            </div>
          </div>
          <!-- 操作列 -->
          <div v-else-if="col.key === 'operation'">
            <div style="display: flex; column-gap: 12px;">
              <el-button type="primary" @click="handleShowCourseUserModal(scope.row)">查看学员</el-button>
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
    <!-- 课程信息弹窗 -->
    <el-dialog
      v-if="courseModalParams.show"
      :visible="true"
      width="600px"
      title="课程信息"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="courseModalParams.show = false"
    >
      <el-form ref="courseModalForm" :model="courseModalParams.formData" :rules="courseModalParams.formRules" label-width="100px" label-position="left">
        <el-form-item label="课程名：" prop="courseName">
          <el-input v-model="courseModalParams.formData.courseName" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="开放的导师：" prop="openUser">
          <el-select v-model="courseModalParams.formData.openUser" multiple size="small" style="width: 100%;" filterable clearable placeholder="不选择则默认开放给所有导师">
            <el-option v-for="item in dynamicFormOptions['openUser']" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型：" prop="type">
          <el-select v-model="courseModalParams.formData.type" size="small" style="width: 100%;" filterable clearable placeholder="请选择">
            <el-option v-for="item in dictFormOptions['courseType']" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程时间：" prop="time">
          <el-date-picker
            v-model="courseModalParams.formData.time"
            type="daterange"
            style="width: 100%;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="courseModalParams.show = false">取 消</el-button>
        <el-button type="primary" :loading="courseModalParams.submitting" @click="handleCourseModalSubmit">{{ '添 加' }}</el-button>
      </span>
    </el-dialog>
    <!-- 课程学员列表弹窗 -->
    <el-dialog
      v-if="courseUserModalParams.show"
      :visible="true"
      width="1200px"
      :title="`课程【${courseUserModalParams.courseInfo.courseName}】学员信息`"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="courseUserModalParams.show = false"
    >
      <div>
        <el-table
          :key="tableKey"
          v-loading="courseUserModalParams.loading"
          :data="courseUserModalParams.rows"
          border
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column
            v-for="col in courseUserModalParams.columns"
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
              <!-- 定制列 -->
              <!-- 操作列 -->
              <div v-else-if="col.key === 'operation'">
                <div style="display: flex; column-gap: 12px;">
                  <el-button type="danger" @click="handleDeleUserByCourseIdAndPhone(scope.row)">删除</el-button>
                </div>
              </div>
              <span v-else>{{ scope.row[col.key] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="handleExportUnRecordUserList">导出今日未打卡学员</el-button>
        <el-button type="success" @click="handleExportCourseRecordListByDate">导出今日打卡记录</el-button>
        <el-button type="success" @click="handleExportCourseRecordList">导出全部打卡记录</el-button>
        <el-button @click="courseUserModalParams.show = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import jkdkApi from '@/api/jkdk'
import { parseTime } from '@/utils/index'
import { mapState, mapGetters } from 'vuex'
import { downloadByStream } from '@/utils'

export default {
  name: 'CourseManage',
  directives: { waves },
  data() {
    return {
      courseUserModalParams: {
        show: false,
        loading: false,
        courseInfo: null,
        columns: [
          { label: '序号', key: 'index', width: 60, align: 'center' },
          { label: '名称', key: 'userName' },
          { label: '手机号', key: 'phoneNumber', width: 160 },
          { label: '操作', key: 'operation', width: 120, fixed: 'right' }
        ],
        rows: []
      },
      courseModalParams: {
        show: false,
        formData: {
          courseName: '',
          openUser: [],
          type: undefined,
          time: []
        },
        formRules: {
          courseName: [{ required: true, message: '请输入' }],
          type: [{ required: true, message: '请选择' }],
          time: [{ required: true, message: '请选择' }]
        },
        submitting: false
      },
      dynamicFormOptions: {
        openUser: []
      },
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        courseName: '',
        status: undefined,
        time: []
      },
      list: [],
      total: 0,
      tableColumns: [
        { label: '序号', key: 'index', width: 60, align: 'center' },
        { label: '课程名', key: 'courseName' },
        { label: '类型', key: 'type', width: 100, renderType: 'dict', dictObjKey: 'courseType' },
        { label: '状态', key: 'status', width: 100, renderType: 'dict', dictObjKey: 'courseStatus' },
        { label: '开放的导师', key: 'openUser', width: 140, align: 'center' },
        { label: '开始时间', key: 'startTime', width: 100, renderType: 'time', timeFormat: '{y}-{m}-{d}' },
        { label: '结束时间', key: 'endTime', width: 100, renderType: 'time', timeFormat: '{y}-{m}-{d}' },
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
    this.getDynamicFormOptions()
    this.getList()
  },
  methods: {
    parseTime,
    async getDynamicFormOptions() {
      try {
        const teacherListRes = await jkdkApi.getTeacherList({
          currentPage: 1,
          pageSize: 99999
        })
        this.dynamicFormOptions['openUser'] = teacherListRes.body.list.map(row => ({
          id: row.phoneNumber,
          name: row.phoneNumber
        }))
      } catch (error) {
        console.log(error)
      }
    },
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
          courseName: this.listQuery.courseName,
          status: this.listQuery.status || undefined,
          startTime: (this.listQuery.time || [])[0]?.getTime(),
          endTime: (this.listQuery.time || [])[1]?.getTime()
        }
        const res = await jkdkApi.getAllCourseList(param)
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
    handleShowCourseModal() {
      this.courseModalParams = {
        ...this.courseModalParams,
        show: true,
        formData: {
          courseName: '',
          openUser: [],
          type: undefined,
          time: []
        },
        submitting: false
      }
    },
    async handleCourseModalSubmit() {
      let valid = false
      try {
        valid = await this.$refs.courseModalForm.validate()
      } catch (error) {
        console.log(error)
      }
      if (!valid) {
        this.$message.warning('请填完必填项')
        return
      }
      this.courseModalParams.submitting = true
      try {
        const formData = this.courseModalParams.formData
        const params = {
          courseName: formData.courseName,
          openUser: (formData.openUser || []).join(','),
          type: formData.type,
          startTime: (formData.time || [])[0]?.getTime(),
          endTime: (formData.time || [])[1]?.getTime()
        }
        const res = await jkdkApi.insertCourse(params)
        if (res?.body === 1) {
          this.$message({
            type: 'success',
            message: `${'添加'}成功!`
          })
          this.courseModalParams.show = false
          this.handleFilter()
        }
      } catch (error) {
        console.log(error)
      }
      this.courseModalParams.submitting = false
    },
    handleDele(row) {
      this.$confirm(
        '此操作将删除课程【' + row.courseName + '】, 是否继续?',
        '提示'
      ).then(async() => {
        const res = await jkdkApi.deleteCourse({
          courseId: row.courseId
        })
        if (res?.body === 1) {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.handleFilter()
        }
      }).catch(err => { console.log(err) })
    },
    async handleShowCourseUserModal(courseInfo) {
      this.courseUserModalParams = {
        ...this.courseUserModalParams,
        show: true,
        loading: true,
        courseInfo: courseInfo,
        rows: []
      }
      try {
        const params = {
          courseId: courseInfo.courseId
        }
        const res = await jkdkApi.selectCourseUserList(params)
        this.courseUserModalParams.rows = res.body
      } catch (error) {
        console.log(error)
      }
      this.courseUserModalParams.loading = false
    },
    handleDeleUserByCourseIdAndPhone(row) {
      this.$confirm(
        '此操作将从课程【' + this.courseUserModalParams.courseInfo.courseName + '】中删除学员【' + row.userName + '】, 是否继续?',
        '提示'
      ).then(async() => {
        const res = await jkdkApi.deleteByCourseIdAndPhone({
          phoneNumber: row.phoneNumber,
          courseId: this.courseUserModalParams.courseInfo.courseId
        })
        if (res?.body === 1) {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.handleShowCourseUserModal(this.courseUserModalParams.courseInfo)
        }
      }).catch(err => { console.log(err) })
    },
    handleExportCourseRecordList() {
      this.$confirm(
        '此操作将导出【' + this.courseUserModalParams.courseInfo.courseName + '】全部打卡记录, 是否继续?',
        '提示'
      ).then(async() => {
        const res = await jkdkApi.exportCourseRecordList({
          courseId: this.courseUserModalParams.courseInfo.courseId
        })
        downloadByStream(res, '【' + this.courseUserModalParams.courseInfo.courseName + '】全部打卡记录.xlsx')
      }).catch(err => { console.log(err) })
    },
    handleExportCourseRecordListByDate() {
      this.$confirm(
        '此操作将导出【' + this.courseUserModalParams.courseInfo.courseName + '】今日打卡记录, 是否继续?',
        '提示'
      ).then(async() => {
        const res = await jkdkApi.exportCourseRecordListByDate({
          courseId: this.courseUserModalParams.courseInfo.courseId,
          queryDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime()
        })
        downloadByStream(res, '【' + this.courseUserModalParams.courseInfo.courseName + '】今日打卡记录.xlsx')
      }).catch(err => { console.log(err) })
    },
    handleExportUnRecordUserList() {
      this.$confirm(
        '此操作将导出【' + this.courseUserModalParams.courseInfo.courseName + '】今日未打卡学员, 是否继续?',
        '提示'
      ).then(async() => {
        const res = await jkdkApi.exportUnRecordUserList({
          courseId: this.courseUserModalParams.courseInfo.courseId,
          queryDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime()
        })
        downloadByStream(res, '【' + this.courseUserModalParams.courseInfo.courseName + '】今日未打卡学员.xlsx')
      }).catch(err => { console.log(err) })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
