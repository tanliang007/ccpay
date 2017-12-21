import Vue from 'vue'
import Router from 'vue-router'
import ManageMent from '@/components/management/management'
import NewAdd from '@/components/newadd/newadd'
import MakePlan from '@/components/makeplan/makeplan'
import ccDetail from '@/components/carddetail/carddetail'
import paymentStatus from '@/components/paymentStatus/paymentStatus'
import repaymentdetail from '@/components/repaymentdetail/repaymentdetail'
import nowdayplandetail from '@/components/nowdayplandetail/nowdayplandetail'
import Manualpayments from  '@/components/nowdayplandetail/Manualpayments'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'management',//动态路由参数需要这个name
      component: ManageMent
    },
    {
      path: '/newadd',
      name: 'newadd',
      component: NewAdd
    },
    {
      path: '/makeplan',
      name: 'makeplan',
      component: MakePlan
    },
    {
      path: '/carddetail',
      name: 'carddetail',
      component: ccDetail
    },
    {
      path: '/paymentStatus',
      name: 'paymentStatus',
      component: paymentStatus
    },
    {
      path: '/repaymentdetail',
      component: repaymentdetail
    },
    {
      path: '/nowdayplandetail',
      name: 'nowdayplandetail',
      component: nowdayplandetail 
    },
    {
      path: '/Manualpayments',
      name: 'Manualpayments',
      component: Manualpayments 
    }
  ]
})
  