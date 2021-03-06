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
    path: '/code-manage',
    component: Layout,
    children: [{
      path: '/code-manage',
      component: () => import('@/pages/code-manage/index'),
      name: '推荐码管理',
      meta: { title: '推荐码管理', icon: 'table', affix: true }
    }]
  }
]
export default pageRouter
