import axios from '../../scripts/axios';

export default {
  namespaced: true,
  state: {
    tags: [],
  },

  actions: {
    getAllTags (ctx) {
      return axios.get('/tags/getList')
      .then(res => ctx.commit('setAllTags', res))
      .catch(err => console.log(err));
    },
    getTagByName (ctx, params) {
      return axios({
        url: '/tags/query',
        params,
      });
    },
  },

  mutations: {
    setAllTags (state, payload) {
      state.tags = payload.data;
      return payload;
    },
  },
}
