import common from './modules/common';
import user from './modules/user';
import article from './modules/article';
import question from './modules/question';
import draft from './modules/draft';
import tags from './modules/tags';
import course from './modules/course';

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  namespaced: true,
  modules: {
    common,
    user,
    article,
    draft,
    question,
    tags,
    course,
  },
});
