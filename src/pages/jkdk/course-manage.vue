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
      <el-button v-waves class="filter-item" style="float: right;" type="success" @click="handleShowCourseModal()">添加课程</el-button>
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
              <el-button v-if="scope.row.canEdit" type="success" @click="handleShowCourseModal(scope.row)">修改课程</el-button>
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
          <el-select v-model="courseModalParams.formData.openUser" :disabled="!!courseModalParams.formData.courseId" multiple size="small" style="width: 100%;" filterable clearable placeholder="不选择则默认开放给所有导师">
            <el-option v-for="item in dynamicFormOptions['openUser']" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型：" prop="type">
          <el-select v-model="courseModalParams.formData.type" :disabled="!!courseModalParams.formData.courseId" size="small" style="width: 100%;" filterable clearable placeholder="请选择">
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
        <el-button type="primary" :loading="courseModalParams.submitting" @click="handleCourseModalSubmit">{{ !!courseModalParams.formData.courseId ? '修 改' : '添 加' }}</el-button>
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
        <div class="filter-container">
          <el-input
            v-model="courseUserModalParams.formData.userName"
            clearable
            placeholder="学员名搜索"
            style="width: 200px;margin-right: 20px;"
            class="filter-item"
          />
          <el-button
            v-waves
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleShowCourseUserModal(courseUserModalParams.courseInfo, courseUserModalParams.formData)"
          >查询</el-button>
        </div>
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
                  <el-button type="primary" @click="handleShowUserCourseRecordModal(courseUserModalParams.courseInfo, scope.row)">查看打卡</el-button>
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
    <!-- 学员课程打卡列表弹窗 -->
    <el-dialog
      v-if="userCourseRecordModalParams.show"
      :visible="true"
      width="1000px"
      :title="`学员【${userCourseRecordModalParams.studentInfo.userName}】打卡信息`"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="userCourseRecordModalParams.show = false"
    >
      <div>
        <el-table
          :key="tableKey"
          v-loading="userCourseRecordModalParams.loading"
          :data="userCourseRecordModalParams.rows"
          border
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column
            v-for="col in userCourseRecordModalParams.columns"
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
              <div v-else-if="col.renderType === 'suffix'">
                <span>{{ scope.row[col.key] && scope.row[col.key] + col.suffixValue }}</span>
              </div>
              <div v-else-if="col.renderType === 'image'">
                <div v-if="scope.row[col.key] && scope.row[col.key].length">
                  <el-image
                    v-for="img in scope.row[col.key]"
                    :key="img.uuid"
                    style="width: 100px; height: auto;"
                    :src="img.url"
                    :preview-src-list="[img.url]"
                  />
                </div>
              </div>
              <!-- 定制列 -->
              <span v-else>{{ scope.row[col.key] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userCourseRecordModalParams.show = false">关 闭</el-button>
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
        formData: {
          userName: ''
        },
        columns: [
          { label: '序号', key: 'index', width: 60, align: 'center' },
          { label: '名称', key: 'userName' },
          { label: '手机号', key: 'phoneNumber', width: 160 },
          { label: '操作', key: 'operation', width: 240, fixed: 'right' }
        ],
        rows: []
      },
      userCourseRecordModalParams: {
        show: false,
        loading: false,
        courseInfo: null,
        studentInfo: null,
        baseColumns: [
          { label: '序号', key: 'index', width: 60, align: 'center' },
          { label: '打卡时间', key: 'recordDate', width: 100, renderType: 'time', timeFormat: '{y}-{m}-{d}' }
        ],
        columns: [],
        rows: []
      },
      courseModalParams: {
        show: false,
        formData: {
          courseId: '',
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
        { label: '操作', key: 'operation', width: 328, fixed: 'right' }
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
        this.list = data.list.map(row => {
          return {
            canEdit: new Date(new Date().setHours(0, 0, 0, 0)).getTime() < parseInt(row.startTime),
            ...row
          }
        })
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
    handleShowCourseModal(row) {
      this.courseModalParams = {
        ...this.courseModalParams,
        show: true,
        formData: {
          courseId: row?.courseId || '',
          courseName: row?.courseName || '',
          openUser: row?.openUser ? row.openUser.split(',') : undefined,
          type: row?.type || undefined,
          time: (row?.startTime && row?.endTime) ? [
            new Date(new Date(parseInt(row?.startTime)).setHours(0, 0, 0, 0)),
            new Date(new Date(parseInt(row?.endTime)).setHours(23, 59, 59, 999))
          ] : []
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
          courseId: formData.courseId || undefined,
          courseName: formData.courseName || undefined,
          openUser: (formData.openUser || []).join(',') || undefined,
          type: formData.type || undefined,
          startTime: (formData.time || [])[0] ? new Date(new Date(formData.time[0]).setHours(0, 0, 0, 0)).getTime() : undefined,
          endTime: (formData.time || [])[1] ? new Date(new Date(formData.time[1]).setHours(23, 59, 59, 999)).getTime() : undefined
        }
        const res = formData.courseId ? await jkdkApi.updateCourse(params) : await jkdkApi.insertCourse(params)
        if (res?.body === 1) {
          this.$message({
            type: 'success',
            message: `${formData.courseId ? '修改' : '添加'}成功!`
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
    async handleShowCourseUserModal(courseInfo, formData) {
      formData = formData || {
        userName: ''
      }
      this.courseUserModalParams = {
        ...this.courseUserModalParams,
        formData: formData,
        show: true,
        loading: true,
        courseInfo: courseInfo,
        rows: []
      }
      try {
        const params = {
          courseId: courseInfo.courseId,
          userName: formData.userName || undefined
        }
        const res = await jkdkApi.selectCourseUserList(params)
        this.courseUserModalParams.rows = res.body
      } catch (error) {
        console.log(error)
      }
      this.courseUserModalParams.loading = false
    },
    async handleShowUserCourseRecordModal(courseInfo, studentInfo) {
      const columns = [
        ...this.userCourseRecordModalParams.baseColumns,
        ...(courseInfo.type === '2' ? [
          { label: '体重', key: 'weight', width: 100, renderType: 'suffix', suffixValue: '斤' },
          { label: '体脂率', key: 'rate', width: 100, renderType: 'suffix', suffixValue: '%' },
          { label: '腰围', key: 'waist', width: 100, renderType: 'suffix', suffixValue: 'cm' },
          { label: '使用方案', key: 'plan', width: 100, renderType: 'dict', dictObjKey: 'plan' },
          { label: '昨日早餐', key: 'morning', width: 160 },
          { label: '昨日午餐', key: 'noon', width: 160 },
          { label: '昨日晚餐', key: 'night', width: 160 },
          { label: '昨日加餐', key: 'extra', width: 160 },
          { label: '排便', key: 'shitTimes', width: 100, renderType: 'suffix', suffixValue: '次' },
          { label: '饮水', key: 'drinkMeasure', width: 100, renderType: 'suffix', suffixValue: 'ml' },
          { label: '分享与感受', key: 'selfComment', width: 200 },
          { label: '导师课程评分', key: 'evaluation', width: 120, renderType: 'dict', dictObjKey: 'evaluation' },
          { label: '点评', key: 'teacherComment', width: 200 }
        ] : [
          { label: '是否做过宫腔手术', key: 'isOperation', width: 140, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '手术时间', key: 'operationTime', width: 100, renderType: 'time', timeFormat: '{y}-{m}-{d}' },
          { label: '是否生育', key: 'isBirth', width: 100, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '生育次数', key: 'birthTimes', width: 100, renderType: 'suffix', suffixValue: '次' },
          { label: '是否流过产', key: 'isAbort', width: 100, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '流产次数', key: 'abortTimes', width: 100, renderType: 'suffix', suffixValue: '次' },
          { label: '是否有性生活', key: 'isSex', width: 120, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '月经颜色', key: 'menstruationColor', width: 160 },
          { label: '是否痛经', key: 'dysmenorrhea', width: 100, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '月经是否有血块', key: 'clot', width: 140, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '经期', key: 'menstruationTime', width: 100, renderType: 'time', timeFormat: '{y}-{m}-{d}' },
          { label: '月经天数', key: 'menstruationDay', width: 160 },
          { label: '月经量', key: 'menstruationMeasure', width: 160 },
          { label: '是否使用清洁药物', key: 'isClean', width: 160, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '使用的时间', key: 'cleanTime', width: 100, renderType: 'time', timeFormat: '{y}-{m}-{d}' },
          { label: '白带颜色', key: 'leucorrheaColor', width: 160 },
          { label: '是否瘙痒', key: 'isItch', width: 100, renderType: 'dict', dictObjKey: 'boolean' },
          { label: '多图上传', key: 'imageList', width: 360, renderType: 'image' },
          { label: '使用反馈', key: 'selfComment', width: 200 },
          { label: '导师课程评分', key: 'evaluation', width: 120, renderType: 'dict', dictObjKey: 'evaluation' },
          { label: '点评', key: 'teacherComment', width: 200 }
        ])
      ]
      this.userCourseRecordModalParams = {
        ...this.userCourseRecordModalParams,
        columns: columns,
        show: true,
        loading: true,
        courseInfo: courseInfo,
        studentInfo: studentInfo,
        rows: []
      }
      try {
        const params = {
          courseId: courseInfo.courseId,
          phoneNumber: studentInfo.phoneNumber
        }
        const res = await jkdkApi.selectUserCourseRecordList(params)
        this.userCourseRecordModalParams.rows = (res.body || []).map(row => ({
          ...row,
          imageList: (row.imageList && row.imageList.split(',').map(name => ({
            name: name,
            url: `${process.env.VUE_APP_BASE_API}/healthyImg/${name}`,
            uuid: name + Math.random()
          }))) || []
        }))
      } catch (error) {
        console.log(error)
      }
      this.userCourseRecordModalParams.loading = false
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
          queryDate: parseTime(new Date(new Date().setHours(0, 0, 0, 0)).getTime(), '{y}-{m}-{d}')
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
          queryDate: parseTime(new Date(new Date().setHours(0, 0, 0, 0)).getTime(), '{y}-{m}-{d}')
        })
        downloadByStream(res, '【' + this.courseUserModalParams.courseInfo.courseName + '】今日未打卡学员.xlsx')
      }).catch(err => { console.log(err) })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
