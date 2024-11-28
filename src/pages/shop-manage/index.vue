<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        placeholder="商品名称搜索"
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.area"
        clearable
        style="width: 200px;margin-right: 20px;"
        class="filter-item"
        placeholder="选择模块"
      >
        <el-option v-for="item in areaList" :key="item.id" :value="item.id" :label="item.areaName" />
      </el-select>
      <el-select v-model="listQuery.catId" style="width: 200px;margin-right: 20px;" class="filter-item" clearable filterable placeholder="选择商品分类">
        <el-option v-for="item in categoryList" :key="item.id" :value="item.id" :label="item.name" />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="warning"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button v-waves class="filter-item" style="float: right;" type="primary" @click="handleShowInfo">上架新品</el-button>
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
        v-for="col in tableColumns"
        :key="col.key"
        :label="col.label"
        :prop="col.key"
        :width="col.key === 'createTime' ? 160 : col.key === 'saleTime' ? '300' : col.key === 'index' ? 50 : col.key === 'operation' ? 150 : ''"
        :fixed="col.fixed"
      >
        <template slot-scope="scope">
          <div v-if="col.key === 'stockAndSaleNum'">
            <el-card v-for="wine in scope.row[col.key]" :key="wine.wineId">
              <span>规格：</span>
              <span>{{ wine.volume }}</span>
              <el-divider class="divider" />
              <span>库存：</span>
              <span>{{ wine.stock }}</span>
              <el-divider class="divider" />
              <span>销量：</span>
              <span>{{ wine.saleNum }}</span>
              <el-divider class="divider" />
            </el-card>
          </div>
          <div v-else-if="col.key === 'operation'">
            <el-link :type="scope.row.isShow === '0' ? 'warning' : ''" :disabled="scope.row.isShow === '1'" @click="handleUp(scope.row)">上架</el-link>
            <el-link :type="scope.row.isShow === '1' ? 'warning' : ''" :disabled="scope.row.isShow === '0'" style="margin-left: 15px" @click="handleDown(scope.row)">下架</el-link>
            <el-link type="primary" style="margin-left: 15px" @click="handleShowInfo(scope.row)">详情</el-link>
          </div>
          <div v-else-if="col.key === 'isShow'">
            <el-tag v-if="scope.row.isShow === '1'" type="success">已上架</el-tag>
            <el-tag v-else type="warning">已下架</el-tag>
          </div>
          <div v-else-if="col.key === 'createTime'">
            {{ parseTime(scope.row.createTime) }}
          </div>
          <div v-else-if="col.key === 'saleTime'">
            {{ scope.row.saleStartTime ? (parseTime(scope.row.saleStartTime) + ' 至 ' + parseTime(scope.row.saleEndTime)) : '未开启特价' }}
          </div>
          <div v-else-if="col.key === 'sendStatus'">
            <span>{{ scope.row.sendStatus === "0" ? "未发货" : ( scope.row.sendStatus === "1" ? "已发货" : ( scope.row.sendStatus === "2" ? "已收货" : "") ) }}</span>
          </div>
          <div v-else-if="col.key === 'index'">
            <span>{{ scope.$index + 1 + ( listQuery.page - 1 ) * listQuery.limit }}</span>
          </div>
          <span v-else>{{ scope.row[col.key] }}</span>
          <span v-if="/Rate/.test(col.key)">%</span>
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
    <el-dialog :visible.sync="dialogVisible" width="80%" title="物品信息" :close-on-click-modal="false" :close-on-press-escape="false" top="10px">
      <el-form ref="shopForm" v-loading="updateSend" :model="wineInfo" :rules="rules" label-width="110px" label-position="left" hide-required-asterisk>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="选择上架板块：" prop="areaType">
              <el-select v-model="wineInfo.areaType" size="small" style="width: 100%;" placeholder="选择上架板块">
                <el-option v-for="item in areaList" :key="item.id" :value="item.id" :label="item.areaName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="输入商品名称：" prop="wineName">
              <el-input v-model="wineInfo.wineName" size="small" placeholder="输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="选择商品分类：" prop="catId">
              <el-select v-model="wineInfo.catId" size="small" style="width: 100%;" filterable placeholder="选择商品分类">
                <el-option v-for="item in categoryList" :key="item.id" :value="item.id" :label="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品短标题：" prop="title">
              <el-input v-model="wineInfo.title" size="small" placeholder="输入商品短标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-form-item v-if="wineInfo.areaType !== '99'" label="是否置顶：" prop="topOrder">
          <el-switch v-model="wineInfo.topOrder" active-value="1" inactive-value="0" />
        </el-form-item> -->
        <div style="background: #F7F6F4;padding: 20px 10px;border-radius: 4px;margin-bottom: 10px;">
          <el-form-item v-if="wineInfo.areaType === '99'" label="特价活动时间：" prop="saleTime">
            <el-date-picker
              v-model="wineInfo.saleTime"
              style="width: 40%"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-row v-for="(type, index) in wineInfo.wineTypeList" :key="index" :gutter="20">
            <el-col :span="wineInfo.areaType === '99' ? 6 : 8">
              <el-form-item :rules="{ required: true, message: '请输入规格名称', trigger: 'blur' }" label="输入规格名称：" :prop="'wineTypeList.' + index + '.volume'">
                <el-input v-model="type.volume" />
              </el-form-item>
            </el-col>
            <el-col :span="wineInfo.areaType === '99' ? 6 : 8">
              <el-form-item :rules="{ required: true, message: '请输入价格', trigger: 'blur' }" label="输入价格：" :prop="'wineTypeList.' + index + '.price'">
                <el-input v-model="type.price" type="number" />
              </el-form-item>
            </el-col>
            <el-col :span="wineInfo.areaType === '99' ? 6 : 7">
              <el-form-item :rules="{ required: true, message: '请输入库存', trigger: 'blur' }" label="输入库存：" :prop="'wineTypeList.' + index + '.stock'">
                <el-input v-model="type.stock" type="number" />
              </el-form-item>
            </el-col>
            <el-col v-if="wineInfo.areaType === '99'" :span="5">
              <el-form-item :rules="{ required: true, message: '请输入特价', trigger: 'blur' }" label="输入特价：" :prop="'wineTypeList.' + index + '.salePrice'">
                <el-input v-model="type.salePrice" type="number" />
              </el-form-item>
            </el-col>
            <el-col v-if="index != 0 && !curRowId" :span="1" style="text-align: center;">
              <!-- <el-button size="small" @click="() => { wineInfo.wineTypeList.splice(index, 1) }">删除</el-button> -->
              <i
                class="el-icon-delete"
                style="font-size: 16px; cursor: pointer; padding-top: 10px"
                @click="() => {
                  wineInfo.wineTypeList.splice(index, 1)
                }"
              />
            </el-col>
          </el-row>
          <el-button
            type="primary"
            size="small"
            @click="() => {
              wineInfo.wineTypeList.push({ volume: null, price: null, stock: null, time: null, salePrice: null })
            }"
          >添加规格</el-button>
        </div>
        <el-form-item label="商品佣金比例：" prop="commissionRate">
          <el-input v-model="wineInfo.commissionRate" style="width: 40%;" type="number">
            <span slot="append">%</span>
          </el-input>
        </el-form-item>
        <el-form-item label="推销佣金比例：" prop="promoterRate">
          <el-input v-model="wineInfo.promoterRate" style="width: 40%;" type="number">
            <span slot="append">%</span>
          </el-input>
        </el-form-item>
        <el-form-item label="上传封面图：" prop="wineImage">
          <!-- <img-input :img-list="wineInfo.wineImage" :multi="false" @change="list => wineInfo.wineImage = list" /> -->
          <img-input :img-list="wineInfo.wineImage" :multi="false" @change="list => wineInfo.wineImage = list" />
        </el-form-item>
        <el-form-item label="上传外盒图：" prop="packageImage">
          <img-input :img-list="wineInfo.packageImage" :multi="false" @change="list => wineInfo.packageImage = list" />
        </el-form-item>
        <el-form-item label="九宫格封面图：" prop="coverImage">
          <img-input :img-list="wineInfo.coverImage" :multi="false" @change="list => wineInfo.coverImage = list" />
        </el-form-item>
        <el-form-item label="详情页轮播图：" prop="detailTopImage">
          <img-input :img-list="wineInfo.detailTopImage" @change="list => wineInfo.detailTopImage = list" />
        </el-form-item>
        <el-form-item label="商品详情图：" prop="detailImage">
          <img-input :img-list="wineInfo.detailImage" @change="list => wineInfo.detailImage = list" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <!-- <el-button v-if="curRowId" type="danger" @click="handleDele">删 除</el-button> -->
        <el-button type="primary" :loading="updateSend" @click="confirmSend">{{ curRowId ? '修 改' : '上 架' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAllWineListByPage, getAreaList, uploadWine, getWineDetail, updateWine
} from '@/api/order'
import waves from '@/directive/waves' // waves directive
import imgInput from '@/pages/common/imgInput'
import { getCategoryList } from '@/api/category'
import { parseTime } from '@/utils/index'
export default {
  name: 'ShopManage',
  components: { imgInput },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        name: '',
        area: '',
        catId: ''
      },
      recordPageParam: {},
      list: null,
      total: 0,
      columns: [],
      dialogVisible: false,
      // wineInfo: {
      //   areaType: '',
      //   catId: '',
      //   wineName: '',
      //   words: [],
      //   description: '',
      //   topOrder: '0',
      //   wineTypeList: [
      //     { volume: null, price: null, stock: null, time: null, salePrice: null }
      //   ],
      //   commissionRate: 80,
      //   promoterRate: 80,
      //   tags: [],
      //   wineImage: [],
      //   detailTopImage: [],
      //   detailImage: [],
      //   saleTime: []
      // },
      wineInfo: {
        areaType: '',
        catId: '',
        wineName: '',
        title: '',
        wineTypeList: [
          { volume: null, price: null, stock: null, time: null, salePrice: null }
        ],
        commissionRate: 80,
        promoterRate: 80,
        wineImage: [],
        packageImage: [],
        coverImage: [],
        detailTopImage: [],
        detailImage: [],
        saleTime: []
      },
      rules: {
        areaType: [{ required: true, message: '请选择上架板块', trigger: 'blur' }],
        catId: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
        wineName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        commissionRate: [{ required: true, message: '请输入商品佣金比例', trigger: 'blur' }],
        promoterRate: [{ required: true, message: '请输入推销佣金比例', trigger: 'blur' }],
        wineImage: [{ required: true, message: '请上传商品封面图', trigger: 'blur' }],
        detailTopImage: [{ required: true, message: '请上传商品轮播图', trigger: 'blur' }],
        detailImage: [{ required: true, message: '请上传商品详情图', trigger: 'blur' }],
        saleTime: [{ required: true, message: '请选择促销时间', trigger: 'blur' }]
      },
      updateSend: false,
      categoryList: [],
      curRowId: null,
      areaList: [],
      tableColumns: [
        { label: '商品名称', key: 'wineName', fixed: 'left' },
        { label: '短名称', key: 'title' },
        { label: '所属板块', key: 'areaName' },
        { label: '商品分类', key: 'catName' },
        { label: '商品价格', key: 'price' },
        { label: '特价价格', key: 'salePrice' },
        { label: '特价活动时间', key: 'saleTime' },
        { label: '商品佣金', key: 'commission' },
        { label: '推销佣金', key: 'promoterCommission' },
        { label: '商品状态', key: 'isShow' },
        { label: '添加时间', key: 'createTime' },
        { label: '操作', key: 'operation', fixed: 'right' }
      ]
    }
  },
  created() {
    getAreaList({}).then(res => {
      const data = res.body
      this.areaList = data
    })
    this.getList()
  },
  mounted() {
    getCategoryList({})
      .then(res => {
        const list = res.body
        this.categoryList = list
      })
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
        pageSize: this.listQuery.limit
      }
      getAllWineListByPage(param).then(response => {
        this.recordPageParam = param
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
        // this.columns = columns
        this.list = data.list
        this.total = data.totalCount
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      const param = {
        'wineName': this.listQuery.name || undefined,
        'areaType': this.listQuery.area || undefined,
        'catId': this.listQuery.catId || undefined,
        'startIndex': this.listQuery.page,
        'pageSize': this.listQuery.limit
      }
      this.getList(param)
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
      this.curRowId = row ? row.wineId : ''
      this.wineInfo = {
        areaType: '',
        catId: '',
        wineName: '',
        title: '',
        words: [],
        description: '',
        // topOrder: '0',
        wineTypeList: [
          { volume: null, price: null, stock: null, salePrice: null }
        ],
        commissionRate: 80,
        promoterRate: 80,
        tags: [],
        wineImage: [],
        packageImage: [],
        coverImage: [],
        detailTopImage: [],
        detailImage: [],
        saleTime: []
      }
      this.updateSend = false
      this.dialogVisible = true
      if (this.curRowId) {
        this.updateSend = true
        const res = await getWineDetail({
          wineId: this.curRowId
        })
        const wine = res.body
        this.wineInfo = {
          isShow: wine.isShow,
          saleTime: wine.saleStartTime ? [new Date(Number(wine.saleStartTime)), new Date(Number(wine.saleEndTime))] : [],
          areaType: wine.areaType,
          catId: wine.catId,
          wineName: wine.wineName,
          title: wine.title,
          words: wine.words,
          description: wine.description,
          // topOrder: wine.topOrder,
          commissionRate: wine.commissionRate,
          promoterRate: wine.promoterRate,
          wineTypeList: wine.typeList.map(type => {
            const tempType = {}
            tempType.volume = type.volume
            tempType.price = type.price
            tempType.stock = type.stock
            tempType.salePrice = type.salePrice
            if (type.saleStartTime || type.saleEndTime) {
              tempType.time = []
              tempType.time[0] = type.saleStartTime ? new Date(parseInt(type.saleStartTime)) : null
              tempType.time[1] = type.saleEndTime ? new Date(parseInt(type.saleEndTime)) : null
            }
            return tempType
          }),
          tags: wine.tags,
          wineImage: [{
            url: `https://api.ukshuxi.com/goodsImg/${wine.wineId}.png`,
            response: [`${wine.wineId}.png`]
            // raw: await this.getFileFromSrc(`https://api.ukshuxi.com/goodsImg/${wine.wineId}.png`)
          }],
          packageImage: [{
            url: `https://api.ukshuxi.com/packageImg/${wine.wineId}/${wine.packageImage}`,
            response: [`${wine.packageImage}`]
            // raw: await this.getFileFromSrc(`https://api.ukshuxi.com/goodsPackageImg/${wine.wineId}.png`)
          }],
          coverImage: [{
            url: `https://api.ukshuxi.com/coverImg/${wine.wineId}/${wine.coverImage}`,
            response: [`${wine.coverImage}`]
            // raw: await this.getFileFromSrc(`https://api.ukshuxi.com/goodsCoverImg/${wine.wineId}/${wine.coverImage}.png`)
          }],
          detailTopImage: await Promise.all(wine.detailTopImage.map(async name => {
            return {
              url: `https://api.ukshuxi.com/goodsDetailTopImg/${wine.wineId}/${name}`,
              response: [`${name}`]
              // raw: await this.getFileFromSrc(`https://api.ukshuxi.com/goodDetailTopImg/${wine.wineId}/${name}`)
            }
          })),
          detailImage: await Promise.all(wine.detail.map(async name => {
            return {
              url: `https://api.ukshuxi.com/goodsDetailImg/${wine.wineId}/${name.src}.png`,
              response: [`${name.src}.png`]
              // raw: await this.getFileFromSrc(`https://api.ukshuxi.com/goodDetailImg/${wine.wineId}/${name.src}.png`)
            }
          }))
        }
        this.updateSend = false
      }
    },
    confirmSend() {
      this.$refs.shopForm.validate(async valid => {
        if (valid) {
          const cloneData = Object.assign({}, this.wineInfo)
          delete cloneData.saleTime
          if (this.wineInfo.isShow === '1') {
            this.$message({
              type: 'warning',
              message: `请先下架`
            })
            return false
          }
          this.updateSend = true
          const formData = new FormData()
          if (this.curRowId) formData.append('wineId', this.curRowId)
          formData.append('areaType', this.wineInfo.areaType)
          formData.append('wineName', this.wineInfo.wineName)
          formData.append('title', this.wineInfo.title)
          formData.append('catId', this.wineInfo.catId)
          formData.append('promoterRate', this.wineInfo.promoterRate)
          formData.append('commissionRate', this.wineInfo.commissionRate)
          if (this.wineInfo.words.length) formData.append('words', this.wineInfo.words.join(','))
          formData.append('description', this.wineInfo.description)
          // formData.append('topOrder', this.wineInfo.topOrder)
          if (this.wineInfo.areaType === '99') {
            formData.append('saleStartTime', this.wineInfo.saleTime[0].getTime())
            formData.append('saleEndTime', this.wineInfo.saleTime[1].getTime())
          }
          // formData.append('wineTypeList', JSON.stringify(this.wineInfo.wineTypeList.filter((item, index) => this.wineInfo.areaType !== '99' || index === 0).map((item, index) => {
          formData.append('wineTypeList', JSON.stringify(this.wineInfo.wineTypeList.map((item, index) => {
            const wine = {
              volume: item.volume,
              price: item.price,
              stock: item.stock
            }
            // if (this.wineInfo.areaType === '99' && index === 0) {
            if (this.wineInfo.areaType === '99') {
              wine.salePrice = item.salePrice
              // wine.saleStartTime = item.time[0].getTime()
              // wine.saleEndTime = item.time[1].getTime()
              wine.saleStartTime = this.wineInfo.saleTime[0].getTime()
              wine.saleEndTime = this.wineInfo.saleTime[1].getTime()
            }
            return wine
          })))
          formData.append('tags', this.wineInfo.tags.join(','))
          formData.append('wineImage', this.wineInfo.wineImage.map(item => item.response[0]).join(','))
          // formData.append('wineImage', this.wineInfo.wineImage.map(item => item.response[0])[0])
          formData.append('packageImage', this.wineInfo.packageImage.map(item => item.response[0]).join(','))
          formData.append('coverImage', this.wineInfo.coverImage.map(item => item.response[0]).join(','))
          formData.append('detailTopImage', this.wineInfo.detailTopImage.map(item => item.response[0]).join(','))
          formData.append('detailImage', this.wineInfo.detailImage.map(item => item.response[0]).join(','))
          const res = await uploadWine(formData)
          const body = res.body || 0
          if (body !== 0) {
            this.updateSend = false
            this.$message({
              type: 'success',
              message: `${this.curRowId ? '修改' : '上架'}成功!`
            })
            this.dialogVisible = false
            this.listQuery.page = 1
            this.getList()
          } else {
            this.updateSend = false
            this.$message.error('操作失败')
          }
        } else {
          this.$message.warning('信息不完整')
        }
      })
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
    async handleUp(row) {
      this.$confirm('确定上架?')
        .then(async() => {
          const res = await updateWine({
            data: {
              wineId: row.wineId,
              isShow: '1'
            }
          })
          if (res.body === 1) {
            this.$message({
              type: 'success',
              message: '上架成功!'
            })
            this.$set(row, 'isShow', '1')
          }
        })
        .catch(err => { console.log(err) })
    },
    handleDown(row) {
      this.$confirm('确定下架?')
        .then(async() => {
          const res = await updateWine({
            data: {
              wineId: row.wineId,
              isShow: '0'
            }
          })
          if (res.body === 1) {
            this.$message({
              type: 'success',
              message: '下架成功!'
            })
            this.$set(row, 'isShow', '0')
          }
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
