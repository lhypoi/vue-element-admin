/** When your routing table is too long, you can split it into small modules **/
import Layout from '@/layout'

const pageRouter = [
  {
    path: '/teacher-manage',
    component: Layout,
    children: [{
      path: '/teacher-manage',
      component: () => import('@/pages/jkdk/teacher-manage'),
      name: '老师管理',
      meta: { title: '老师管理', icon: 'shop', affix: true }
    }]
  },
  {
    path: '/agent-manage',
    component: Layout,
    children: [{
      path: '/agent-manage',
      component: () => import('@/pages/jkdk/agent-manage'),
      name: '代理商管理',
      meta: { title: '代理商管理', icon: 'promoter', affix: true }
    }]
  },
  {
    path: '/course-manage',
    component: Layout,
    children: [{
      path: '/course-manage',
      component: () => import('@/pages/jkdk/course-manage'),
      name: '课程管理',
      meta: { title: '课程管理', icon: 'category', affix: true }
    }]
  }
  // {
  //   path: '/shop-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/shop-manage',
  //     component: () => import('@/pages/shop-manage/index'),
  //     name: '商品管理',
  //     meta: { title: '商品管理', icon: 'shop', affix: true }
  //   }]
  // },
  // {
  //   path: '/order-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/order-manage',
  //     component: () => import('@/pages/order-manage/index'),
  //     name: '订单管理',
  //     meta: { title: '订单管理', icon: 'order', affix: true }
  //   }]
  // },
  // {
  //   path: '/points-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/points-manage',
  //     component: () => import('@/pages/points-manage/index'),
  //     name: '积分管理',
  //     meta: { title: '积分管理', icon: 'promoter', affix: true }
  //   }]
  // }
  // {
  //   path: '/category-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/category-manage',
  //     component: () => import('@/pages/category-manage/index'),
  //     name: '分类管理',
  //     meta: { title: '分类管理', icon: 'category', affix: true }
  //   }]
  // },
  // {
  //   path: '/coupon-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/coupon-manage',
  //     component: () => import('@/pages/coupon-manage/index'),
  //     name: '优惠券管理',
  //     meta: { title: '优惠券管理', icon: 'coupon', affix: true }
  //   }]
  // },
  // {
  //   path: '/promoter-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/promoter-manage',
  //     component: () => import('@/pages/promoter-manage/index'),
  //     name: '推销商管理',
  //     meta: { title: '推销商管理', icon: 'promoter', affix: true }
  //   }]
  // },
  // {
  //   path: '/withdraw-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/withdraw-manage',
  //     component: () => import('@/pages/withdraw-manage/index'),
  //     name: '提现管理',
  //     meta: { title: '提现管理', icon: 'withdraw', affix: true }
  //   }]
  // },
  // {
  //   path: '/brand-manage',
  //   component: Layout,
  //   children: [{
  //     path: '/brand-manage',
  //     component: () => import('@/pages/upload-brand/index'),
  //     name: '图片管理',
  //     meta: { title: '图片管理', icon: 'picture', affix: true }
  //   }]
  // },
  // {
  //   path: '/global-info',
  //   component: Layout,
  //   children: [{
  //     path: '/global-info',
  //     component: () => import('@/pages/global-info/index'),
  //     name: '通知管理',
  //     meta: { title: '通知管理', icon: 'inform', affix: true }
  //   }]
  // },
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
