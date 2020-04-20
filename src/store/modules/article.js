import axios from '../../scripts/axios';

export default {
  namespaced: true,

  actions: {
    postArticle (ctx, params) {
      return axios.post('/article/create', params);
    },
    deleteArticle (ctx, params) {
      return axios.delete(`/article/delete/${params.id}`);
    },
    postComment (ctx, params) {
      return axios.post('/comment', params);
    },
    postReply (ctx, params) {
      return axios.post('/reply', params);
    },
    deleteComment (ctx, params) {
      return axios.delete(`/comment/delete/${params.id}`);
    },
    deleteReply (ctx, params) {
      return axios.delete(`/reply/delete/${params.id}`);
    },
    postLike (ctx, params) {
      return axios.post('/article/like', params);
    },
    uploadImg (ctx, formdata) {
      return axios({
        url: '/article/img',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    deleteImg (ctx, params) {
      return axios.post('/article/delImg', params);
    },
    deleteLike (ctx, params) {
      return axios.delete(`/article/deleteLike/${params.id}`);
    },
    postIsLiked (ctx, params) {
      return axios.post('/article/isLiked', params);
    },
    getActicleList (ctx, params) {
      return axios({
        url: '/article/getList',
        params,
      });
    },
    getArticleDetail (ctx, { id }) {
      return axios.get(`/article/${id}`);
    },
  },

  mutations: {

  },
}
