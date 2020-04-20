import axios from '../../scripts/axios';

export default {
  namespaced: true,

  actions: {
    getQuestionList (ctx, params) {
      return axios({
        url: '/question/getList',
        params,
      });
    },
    getSimpleQuestionList (ctx, params) {
      return axios({
        url: '/question/getSimpleList',
        params,
      });
    },
    postQuestion (ctx, params) {
      return axios.post('/question/create', params);
    },
    getQuestionDetail (ctx, { id }) {
      return axios.get(`/question/${id}`);
    },
    getAnswerList (ctx, params) {
      return axios({
        url: '/answer/getList',
        params,
      });
    },
    postLike (ctx, params) {
      return axios.post('/answer/like', params);
    },
    deleteLike (ctx, params) {
      return axios.delete(`/answer/deleteLike/${params.id}`);
    },
    postIsLiked (ctx, params) {
      return axios.post('/answer/isLiked', params);
    },
    postAdopt (ctx, params) {
      return axios.post('/answer/adopt', params);
    },
    deleteAdopt (ctx, params) {
      return axios.delete(`/answer/deleteAdopt/${params.id}`);
    },
  },
}
