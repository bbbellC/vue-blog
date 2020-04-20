import Vue from 'vue'
import App from './App.vue'
import router from './router';
import store from './store/index';

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import './styles/theme.less';
import './assets/iconfont/iconfont.css';
import 'highlight.js/styles/atom-one-light.css';


import VCharts from 'v-charts';

Vue.config.productionTip = false

// Vue.use(ViewUI, {
//   size: 'large',
// });
// use
Vue.use(mavonEditor);
Vue.use(ViewUI);
Vue.use(VCharts);

new Vue({
  el: '#app',
  store,
  router,
  ...App,
});