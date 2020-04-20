import axios from '../../scripts/axios';

export default {
  namespaced: true,

  actions: {
    // getGlobalMap: makeAction({
    //   method: '',
    //   type: '',
    //   url: '',
    // }),
    // getInfo (context) {
    //   axios.get('/tags/getList')
    //   .then(res => {
    //     context.commit('changeList',res)
    //   }).catch(err => {
    //     console.log(err)
    //   })
    // }
    getInfo () {
      return axios.get('/tags/getList');
    },
    getImages (ctx, params) {
      return axios.get(params.url);
    },
  },

  getters: {
  },

  mutations: {
  },
}
