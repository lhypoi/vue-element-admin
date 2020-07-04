<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="商品名称搜索"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.area"
        style="width: 200px;"
        class="filter-item"
      >
        <el-option v-for="item in areaList" :key="item.id" :value="item.id" :label="item.areaName" />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button v-waves class="filter-item" type="primary" @click="handleShowInfo">上架新品</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      height="calc(100vh - 50px - 40px - 96px - 56px - 30px)"
      @sort-change="sortChange"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.key"
        :label="col.label"
        :prop="col.key"
        :width="col.key === 'wineNameList' ? 200 : col.key === 'addressLabel' ? '' : col.key === 'index' ? 50 : col.key === 'operation' ? 250 : 120"
        :fixed="col.fixed"
      >
        <template slot-scope="scope">
          <div v-if="col.key === 'wineNameList'">
            <el-card v-for="wine in scope.row[col.key]" :key="wine.wineId">
              <span>名称：</span>
              <span>{{ wine.wineName }}</span>
              <el-divider class="divider" />
              <span>规格：</span>
              <span>{{ wine.volume }}</span>
              <el-divider class="divider" />
              <span>价格：</span>
              <span>{{ wine.price }}</span>
              <el-divider class="divider" />
              <span>数量：</span>
              <span>{{ wine.count }}</span>
              <el-divider class="divider" />
            </el-card>
          </div>
          <div v-else-if="col.key === 'operation'">
            <el-button type="success" @click="handleUp">上架</el-button>
            <el-button type="danger" style="margin-left: 5px" @click="handleDown">下架</el-button>
            <el-button type="success" style="margin-left: 5px" @click="handleShowInfo(scope.row)">详情</el-button>
          </div>
          <div v-else-if="col.key === 'isPay'">
            <span>{{ scope.row.isPay === "1" ? "已支付" : ( scope.row.isPay === "2" ? "待支付" : ( scope.row.isPay === "3" ? "已过期" : "") ) }}</span>
          </div>
          <div v-else-if="col.key === 'sendStatus'">
            <span>{{ scope.row.sendStatus === "0" ? "未发货" : ( scope.row.sendStatus === "1" ? "已发货" : ( scope.row.sendStatus === "2" ? "已收货" : "") ) }}</span>
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
    <el-dialog :visible.sync="dialogVisible" width="60%" title="物品信息">
      <el-form :model="wineInfo" label-width="150px">
        <el-form-item label="选择上架板块" prop="areaType">
          <el-select v-model="wineInfo.areaType">
            <el-option v-for="item in areaList" :key="item.id" :value="item.id" :label="item.areaName" />
          </el-select>
        </el-form-item>
        <el-form-item label="输入商品名称" prop="wineName">
          <el-input v-model="wineInfo.wineName" />
        </el-form-item>
        <el-form-item label="输入商品形容词描述" prop="words">
          <tag-input :tags="wineInfo.words" @change="(words) => wineInfo.words = words" />
        </el-form-item>
        <el-form-item label="输入商品文字描述" prop="description">
          <el-input v-model="wineInfo.description" type="textarea" />
        </el-form-item>
        <el-row v-for="(type, index) in wineInfo.wineTypeList" :key="index">
          <el-col :span="8">
            <el-form-item :label="`输入${index === 0 ? '默认' : ''}规格名称`" prop="volumn">
              <el-input v-model="type.volumn" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="输入商品价格" prop="price">
              <el-input v-model="type.price" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="输入商品库存" prop="stock">
              <el-input v-model="type.stock" type="number" />
            </el-form-item>
          </el-col>
          <el-col v-if="index != 0" :span="1" style="text-align: center;">
            <i
              class="el-icon-remove"
              style="font-size: 25px; cursor: pointer; padding-top: 6px"
              @click="() => {
                wineInfo.wineTypeList.splice(index, 1)
              }"
            />
          </el-col>
          <el-col v-if="wineInfo.areaType === '1' && index === 0" :span="8">
            <el-form-item label="输入特价" prop="salePrice">
              <el-input v-model="type.salePrice" type="number" />
            </el-form-item>
          </el-col>
          <el-col v-if="wineInfo.areaType === '1' && index === 0" :span="16">
            <el-form-item label="选择开展活动时间" prop="time">
              <el-date-picker
                v-model="type.time"
                style="width: 100%"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="" prop="">
          <i
            class="el-icon-circle-plus"
            style="font-size: 20px; cursor: pointer;"
            @click="() => {
              wineInfo.wineTypeList.push({ volumn: null, price: null, stock: null, time: null, salePrice: null })
            }"
          >&nbsp;添加规格</i>
        </el-form-item>
        <el-form-item label="添加筛选标签" prop="tags">
          <el-select v-model="wineInfo.tags" multiple placeholder="请选择" style="width: 100%">
            <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传封面图" prop="wineImage">
          <img-input :img-list="wineInfo.wineImage" :multi="false" @change="list => wineInfo.wineImage = list" />
        </el-form-item>
        <el-form-item label="上传详情页轮播图" prop="detailTopImage">
          <img-input :img-list="wineInfo.detailTopImage" @change="list => wineInfo.detailTopImage = list" />
        </el-form-item>
        <el-form-item label="上传详情页详情图" prop="detailImage">
          <img-input :img-list="wineInfo.detailImage" @change="list => wineInfo.detailImage = list" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="handleDele">删 除</el-button>
        <el-button type="primary" :loading="updateSend" @click="confirmSend">{{ curRow ? '修 改' : '上 架' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  orderManage, getAreaList, uploadWine
} from '@/api/order'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import tagInput from '@/pages/common/tagInput'
import imgInput from '@/pages/common/imgInput'
export default {
  name: 'ShopManage',
  components: { Pagination, tagInput, imgInput },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        name: '',
        area: ''
      },
      list: null,
      total: 0,
      columns: [],
      dialogVisible: true,
      // formData:
      // ******text类型*****
      // wineName: 123,
      // wineTypeList: [
      // {"volumn":"标准",price:"100",stock:"999",vipPrice:"96",salePrice:"90",saleTime:"1353568745569"},
      // {"volumn":"120ml",price:"120",stock:"999",vipPrice:"96"}
      // ],
      // boldText: "形容与"
      // prodPlace: "法国"
      // description:"描述"
      // display: 1瀑布流，3轮播
      // areaType: 传对应板块的ID
      // words: "word1#word2#word3"
      // isSale: 1表示促销，2表示不促销
      // ********文件类型********
      // wineImage一张图片，酒大图
      // detailTopImage 酒的轮播图
      // detailImage 酒的详情图
      wineInfo: {
        areaType: '',
        wineName: '',
        words: [],
        description: '',
        wineTypeList: [
          { volumn: null, price: null, stock: null, time: null, salePrice: null }
        ],
        tags: [],
        wineImage: [],
        detailTopImage: [],
        detailImage: []
      },
      updateSend: false,
      tagOptions: [
        '水果花香型',
        '木质香料型',
        '动物森林型',
        '红葡萄酒',
        '白葡萄酒',
        '粉红酒',
        '气泡酒',
        '香槟',
        '加烈酒',
        '甜酒',
        '威士忌',
        '清酒',
        '果酒',
        '白葡萄品种',
        '红葡萄品种',
        '法国',
        '意大利',
        '西班牙',
        '葡萄牙',
        '希腊',
        '德国',
        '美国',
        '澳洲',
        '智利',
        '阿根廷',
        '新西兰'
      ],
      curRow: null,
      areaList: []
    }
  },
  created() {
    this.getList(1, 30)
    getAreaList({}).then(res => {
      // areaName: "特价"
      // createTime: "1592914685993"
      // id: "1"
      // isSwiper: "0"
      // isTop: "0"
      const data = res.body
      this.areaList = data
    })
  },
  methods: {
    getList(page, limit) {
      this.listLoading = true
      this.listQuery.page = page
      this.listQuery.limit = limit
      orderManage({
        'mobile': this.listQuery.mobile || undefined,
        'orderId': this.listQuery.orderId || undefined,
        'startIndex': this.listQuery.page,
        'pageSize': this.listQuery.limit
      }).then(response => {
        const data = response.body
        data.hideTitle = data.hideTitle.concat('id')
        const columns = data.columns.filter(col => data.hideTitle.indexOf(col.key) === -1)
        columns.push({
          label: '操作',
          fixed: 'right',
          key: 'operation'
        })
        columns.unshift({
          label: '序号',
          fixed: 'left',
          key: 'index'
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
    handleShowInfo(row) {
      this.curRow = row
      this.dialogVisible = true
    },
    async confirmSend() {
      console.log(this.wineInfo)
      // ******text类型*****
      // wineName: 123,
      // wineTypeList: [
      // {"volumn":"标准",price:"100",stock:"999",vipPrice:"96",salePrice:"90",saleTime:"1353568745569"},
      // {"volumn":"120ml",price:"120",stock:"999",vipPrice:"96"}
      // ],
      // boldText: "形容与"
      // prodPlace: "法国"
      // description:"描述"
      // display: 1瀑布流，3轮播
      // areaType: 传对应板块的ID
      // words: "word1#word2#word3"
      // isSale: 1表示促销，2表示不促销
      // ********文件类型********
      // wineImage一张图片，酒大图
      // detailTopImage 酒的轮播图
      // detailImage 酒的详情图

      // areaType: '',
      // wineName: '',
      // words: [],
      // description: '',
      // wineTypeList: [
      //   { volumn: null, price: null, stock: null, time: null, salePrice: null },
      //   { volumn: null, price: null, stock: null, time: null, salePrice: null }
      // ],
      // tags: [],
      // wineImage: [],
      // detailTopImage: [],
      // detailImage: []
      const formData = new FormData()
      formData.append('areaType', this.wineInfo.areaType)
      formData.append('wineName', this.wineInfo.wineName)
      formData.append('words', this.wineInfo.words.join(','))
      formData.append('description', this.wineInfo.description)
      formData.append('wineTypeList', JSON.stringify(this.wineInfo.wineTypeList.map((item, index) => {
        const wine = {
          volumn: item.volumn,
          price: item.price,
          stock: item.stock
        }
        if (this.wineInfo.areaType === '1' && index === 0) {
          wine.salePrice = item.salePrice
          wine.saleStartTime = item.time[0].getTime()
          wine.saleEndTime = item.time[1].getTime()
        }
        return wine
      })))
      formData.append('tags', this.wineInfo.tags.join(','))
      formData.append('wineImage', this.wineInfo.wineImage.map(item => item.raw)[0])
      formData.append('detailTopImage', this.wineInfo.detailTopImage.map(item => item.raw))
      formData.append('detailImage', this.wineInfo.detailImage.map(item => item.raw))
      const res = await uploadWine(formData)
      console.log(res)
      this.$message({
        type: 'success',
        message: `${this.curRow ? '修改' : '上架'}成功!`
      })
      // this.dialogVisible = false
    },

    getFileFromSrc(img) {
      function convertBase64UrlToBlob(base64) {
        var urlData = base64.dataURL
        var type = base64.type
        var bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length)
        var ia = new Uint8Array(ab)
        for (var i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i)
        }
        return new Blob([ab], { type: type })
      }
      function getBase64Image(img) {
        var canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        var ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, img.width, img.height)
        var ext = img.src.substring(img.src.lastIndexOf('.') + 1).toLowerCase()
        var dataURL = canvas.toDataURL('image/' + ext)
        return {
          dataURL: dataURL,
          type: 'image/' + ext
        }
      }
      return new Promise((resolve, reject) => {
        var image = new Image()
        image.crossOrigin = ''
        image.src = img
        image.onload = function() {
          var base64 = getBase64Image(image)
          var img2 = convertBase64UrlToBlob(base64)
          var file = new File([img2], 'filename', { type: base64.type })
          resolve(file)
        }
      })
    },
    handleUp() {
      this.$confirm('确定上架?')
        .then(async() => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve()
            }, 300)
          })
          this.$message({
            type: 'success',
            message: '上架成功!'
          })
        })
        .catch(err => { console.log(err) })
    },
    handleDown() {
      this.$confirm('确定下架?')
        .then(async() => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve()
            }, 300)
          })
          this.$message({
            type: 'success',
            message: '下架成功!'
          })
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
