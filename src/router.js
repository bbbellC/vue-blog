import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: () => import('./pages/index.vue'),
    },
    // {
    //   path: '/article',
    //   component: () => import('./pages/index.vue'),
    // },
    {
      path: '/article/create',
      name: 'article',
      component: () => import('./pages/article-create.vue'),
    },
    {
      path: '/article/:id',
      component: () => import('./pages/article-detail.vue'),
    },
    {
      path: '/draft',
      component: () => import('./pages/draft-list.vue'),
    },
    {
      path: '/u/:id',
      component: () => import('./pages/my.vue'),
    },
    {
      path: '/setting',
      component: () => import('./pages/setting.vue'),
    },
    {
      path: '/courses',
      component: () => import('./pages/course-list.vue'),
    },
    {
      path: '/course/:id',
      component: () => import('./pages/course-detail.vue'),
    },
    {
      path: '/question/create',
      name: 'question',
      component: () => import('./pages/question-create.vue'),
    },
    {
      path: '/question/:id',
      component: () => import('./pages/question-detail.vue'),
    },
  ],
});
