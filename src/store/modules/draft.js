import axios from '../../scripts/axios';

export default {
  namespaced: true,

  actions: {
    postDraft (ctx, params) {
      return axios.post('/draft', params);
    },
    deleteDraft (ctx, params) {
      return axios.delete(`/draft/delete/${params.id}`);
    },
    getDraftList (ctx, { page, pageSize = 10 }) {
      return axios({
        url: '/draft/getList',
        params: {
          page,
          pageSize,
        },
      });
    },
    getDraftDetail (ctx, { id }) {
      return axios.get(`/draft/${id}`);
    },
  },
}
