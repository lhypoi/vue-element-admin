<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" style="float: right; margin-left: 10px;" type="primary" @click="editMessage">添加全局消息</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="infoList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="消息" prop="message" />
      <el-table-column
        label="操作"
        fixed="right"
        width="200"
      >
        <template slot-scope="scope">
          <div>
            <el-link @click="editMessage(scope.row)">更新</el-link>
            <el-link style="margin-left: 15px" @click="handleDelete(scope.row)">删除</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogVisible" width="80%" title="上传图片" :close-on-click-modal="false" :close-on-press-escape="false" top="10px">
      <el-form ref="shopForm" v-loading="updateSend" :model="wineInfo" label-width="150px" label-position="left" hide-required-asterisk>
        <el-form-item label="输入通知内容" prop="description">
          <el-input v-model="wineInfo.description" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="updateSend" @click="confirmSend">{{ editId ? '修 改' : '提 交' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getGlobalMessageList, updateGlobalMessage, insertGlobalMessage, deleteGlobalMessage } from '@/api/brand'
import waves from '@/directive/waves' // waves directive
import { getCategoryList } from '@/api/category'
import { deepClone, parseTime } from '@/utils/index'
export default {
  name: 'ShopManage',
  directives: { waves },
  data() {
    return {
      infoList: [],
      dialogVisible: false,
      wineInfo: {
        description: ''
      },
      brandImageList: [],
      soldKnowImageList: [],
      rules: {
        imageList: [{ required: true, message: '请上传图片', trigger: 'blur' }]
      },
      updateSend: false,
      categoryList: [],
      areaList: [],
      imageType: '',
      editId: ''
    }
  },
  mounted() {
    this.getInfoList()
  },
  methods: {
    parseTime,
    getInfoList() {
      getGlobalMessageList({
        type: '1'
      }).then(res => {
        this.infoList = res.body || []
        console.log(res)
      })
    },
    async editMessage(row = {}) {
      if (row.id) {
        this.editId = row.id
      } else {
        this.editId = ''
      }
      this.dialogVisible = true
      this.wineInfo = {
        description: row.message || ''
      }
    },
    async confirmSend() {
      this.updateSend = true
      const fn = this.editId ? updateGlobalMessage : insertGlobalMessage
      const param = { data: { message: this.wineInfo.description }}
      if (this.editId) { param.data.id = this.editId }
      const res = await fn(param)
      console.log(res)
      const body = res.body || 0
      if (body !== 0) {
        this.updateSend = false
        this.$message({
          type: 'success',
          message: `${this.editId ? '修改' : '添加'}成功!`
        })
        this.dialogVisible = false
        this.getInfoList(this.imageType)
      }
    },
    handleDelete(row) {
      const param = {
        id: row.id
      }
      this.$confirm('确定删除吗?')
        .then(async() => {
          const body = await deleteGlobalMessage(param)
          if (body !== 0) {
            this.updateSend = false
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.dialogVisible = false
            this.getInfoList(this.imageType)
          }
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
