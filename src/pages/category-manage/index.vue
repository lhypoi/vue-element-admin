<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: right;">
      <el-button v-waves class="filter-item" type="primary" @click="dialogVisible = true">新增分类</el-button>
      <el-button v-waves class="filter-item" type="danger" @click="confirmDelete">删除</el-button>
    </div>
    <div style="text-align: center;">
      <draggable v-model="categoryList" style="width: 50%;margin: 0 auto;" @start="onStart" @end="onEnd">
        <transition-group animation="200">
          <el-checkbox v-for="item in categoryList" :key="item.id" :label="item.name" class="item" border @change="categorySelect($event, item.id)" />
          <!-- <div v-for="item in categoryList" :key="item.id" class="item">{{ item.name }}</div> -->
        </transition-group>
      </draggable>
    </div>
    <!-- 酒信息 -->
    <el-dialog :visible.sync="dialogVisible" width="40%" title="添加分类">
      <el-form v-loading="updateSend" :model="categoryForm" :disabled="!!curRowId">
        <el-form-item label="分类名称：" prop="couponType">
          <el-input v-model="categoryForm.name " />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="!curRowId" type="primary" :loading="updateSend" @click="confirmSend">{{ curRowId ? '修 改' : '提 交' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { getCategoryList, insertCategory, deleteCategory } from '@/api/category'
import waves from '@/directive/waves' // waves directive
export default {
  name: 'ShopManage',
  components: { draggable },
  directives: { waves },
  data() {
    return {
      columns: [{
        label: '分类名称',
        key: 'name'
      }],
      dialogVisible: false,
      categoryForm: {
        name: ''
      },
      updateSend: false,
      curRowId: null,
      categoryList: [],
      categorySelected: []
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      getCategoryList({}).then(response => {
        const list = response.body
        this.categoryList = list
        console.log(list)
      })
    },
    categorySelect(value, id) {
      console.log(value, id)
      if (value) {
        this.categorySelected.push(id)
      } else {
        const idx = this.categorySelected.indexOf(id)
        this.categorySelected.splice(idx, 1)
      }
      console.log(this.categorySelected)
    },
    onStart() {

    },
    onEnd() {
      console.log(this.categoryList)
    },
    confirmDelete() {
      if (this.categorySelected.length === 0) {
        this.$message.warning('请选择要删除的分类')
        return false
      }
      this.$confirm('确定删除选择的分类吗', '警告')
        .then(() => {
          const data = {
            ids: this.categorySelected
          }
          deleteCategory(data)
            .then(res => {
              console.log(res)
              this.$message.success('操作成功')
              this.getDataList()
            })
            .catch(() => {
              this.$message.error('操作失败，请重试')
            })
        }).catch()
    },
    async confirmSend() {
      this.updateSend = true
      const params = {
        parentId: 0,
        sortOrder: 0,
        name: this.categoryForm.name
      }
      const res = await insertCategory({
        data: params
      })
      console.log(res)
      this.updateSend = false
      this.$message({
        type: 'success',
        message: `${this.curRowId ? '修改' : '上架'}成功!`
      })
      this.dialogVisible = false
      this.getDataList()
    }
  }
}
</script>

<style lang="scss" scoped>
.divider {
  margin: 5px 0;
}
.item {
  display: block;
  width: 100%;
  background-color: #F8F8F8;
  border: solid 1px #eee;
  margin-bottom: 15px;
  cursor: move;
  border-radius: 12px;
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
  height: auto!important;
  color: black;
}
.item:first-of-type {
  margin-left: 10px;
}
.item:hover {
  background-color: #f1f1f1;
  cursor: move;
}
.chosen {
  border: solid 2px #3089dc !important;
}
</style>
