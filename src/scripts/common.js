import Vue from 'vue';

// 注册组件
const components = {
};
Object.keys(components).forEach(key => {
  Vue.component(key, components[key]);
});
