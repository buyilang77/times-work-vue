import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  }
]

export const asyncRoutes = [
  {
    path: '/manuscript',
    component: Layout,
    // alwaysShow: true, // will always show the root menu
    name: 'Manuscript',
    meta: { title: '稿件管理', icon: 'el-icon-document' },
    children: [
      {
        path: 'create',
        name: 'ManuscriptCreat',
        component: () => import('@/views/manuscript/create'),
        meta: { title: '创建', icon: 'form', roles: ['text_editor'] }
      },
      {
        path: 'index',
        name: 'ManuscriptList',
        component: () => import('@/views/manuscript/index'),
        meta: { title: '列表', icon: 'list' }
      },
      {
        path: 'pending',
        name: 'ManuscriptPending',
        component: () => import('@/views/manuscript/index'),
        meta: { title: '待处理', icon: 'list', roles: ['writing_editor'] }
      },
      {
        path: 'review',
        name: 'ManuscriptReview',
        component: () => import('@/views/manuscript/index'),
        meta: { title: '待审核', icon: 'list', roles: ['advanced_editor'] }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'ManuscriptEdit',
        component: () => import('@/views/manuscript/edit'),
        meta: { title: '编辑稿件', activeMenu: '/example/list' },
        hidden: true
      }
    ]
  },
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/role',
    name: 'Permission',
    meta: {
      title: '权限管理',
      icon: 'lock'
      // roles: ['admin', 'writing_editor']
    }
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
