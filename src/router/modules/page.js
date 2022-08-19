/** When your routing table is too long, you can split it into small modules **/
import Layout from '@/layout'

const pageRouter = [
  {
    path: '/order-manage',
    component: Layout,
    children: [{
      path: '/',
      component: () => import('@/pages/order-manage/index'),
      name: '订单管理',
      meta: { title: '订单管理', icon: 'table', affix: true }
    }]
  },
  {
    path: '/shop-manage',
    component: Layout,
    children: [{
      path: '/shop-manage',
      component: () => import('@/pages/shop-manage/index'),
      name: '商品管理',
      meta: { title: '商品管理', icon: 'table', affix: true }
    }]
  },
  {
    path: '/category-manage',
    component: Layout,
    children: [{
      path: '/category-manage',
      component: () => import('@/pages/category-manage/index'),
      name: '分类管理',
      meta: { title: '分类管理', icon: 'table', affix: true }
    }]
  },
  {
    path: '/coupon-manage',
    component: Layout,
    children: [{
      path: '/coupon-manage',
      component: () => import('@/pages/coupon-manage/index'),
      name: '优惠券管理',
      meta: { title: '优惠券管理', icon: 'table', affix: true }
    }]
  },
  {
    path: '/promoter-manage',
    component: Layout,
    children: [{
      path: '/promoter-manage',
      component: () => import('@/pages/promoter-manage/index'),
      name: '推销商管理',
      meta: { title: '推销商管理', icon: 'table', affix: true }
    }]
  },
  {
    path: '/withdraw-manage',
    component: Layout,
    children: [{
      path: '/withdraw-manage',
      component: () => import('@/pages/withdraw-manage/index'),
      name: '提现管理',
      meta: { title: '提现管理', icon: 'table', affix: true }
    }]
  },
  // {
  //   path: '/code-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/code-manage',
  //     component: () => import('@/pages/code-manage/index'),
  //     name: '推荐码管理',
  //     meta: { title: '推荐码管理', icon: 'table', affix: true }
  //   }]
  // }
]
export default pageRouter
