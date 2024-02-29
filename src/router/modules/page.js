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
]
export default pageRouter
