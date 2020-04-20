import axios from '../../scripts/axios';

export default {
  namespaced: true,
  state: {
    userInfo: {},
  },

  actions: {
    postRegister (ctx, params) {
      return axios.post('/register', params);
    },
    postLogin (ctx, params) {
      return axios.post('/login', params)
        .then(res => ctx.commit('setUserInfo', res))
        .catch(err => console.log(err));
    },
    uploadAvatar (ctx, params) {
      return axios.post('/user/avatar', params)
        .then(res => console.log(res))
        .catch(err => console.log(err));
    },
    updateUsername (ctx, params) {
      return axios.post('/user/name', params)
        .then(res => ctx.commit('setUserName', res.data))
        .catch(err => console.log(err));
    },
    updateUserPw (ctx, params) {
      return axios.post('/user/pw', params);
    },
    updateUserMajor (ctx, params) {
      return axios.post('/user/major', params)
        .then(res => ctx.commit('setUserMajor', res.data))
        .catch(err => console.log(err));
    },
    updateUserMessage (ctx, params) {
      return axios.post('/user/message', params)
        .then(res => ctx.commit('setUserMessage', res.data))
        .catch(err => console.log(err));
    },
    getAttributes (ctx, { id }) {
      return axios.get(`/user/attributes/${id}`);
    },
  },

  getters: {
  },

  mutations: {
    setUserInfo (state, payload) {
      state.userInfo = payload;
      if (payload) {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('username', payload.username);
        if (payload.avatar) localStorage.setItem('avatar', payload.avatar);
        if (payload.major) localStorage.setItem('major', payload.major);
        if (payload.message) localStorage.setItem('message', payload.message);
      }
      return payload;
    },
    setUserAvatar (state, payload) {
      state.userInfo.avatar = payload.url;
      localStorage.setItem('avatar', payload.url);
    },
    setUserName (state, payload) {
      state.userInfo.username = payload.username;
      localStorage.setItem('username', payload.username);
    },
    setUserMajor (state, payload) {
      state.userInfo.major = payload.major;
      localStorage.setItem('major', payload.major);
    },
    setUserMessage (state, payload) {
      state.userInfo.message = payload.message;
      localStorage.setItem('message', payload.message);
    },
  },
}
