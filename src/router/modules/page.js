/** When your routing table is too long, you can split it into small modules **/

const pageRouter = [
  {
    path: '/order-manage',
    component: () => import('@/pages/order-manage/index'),
    name: '订单管理',
    meta: { title: '订单管理', icon: 'table', affix: true }
  }
]
export default pageRouter
