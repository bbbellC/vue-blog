import axios from '../../scripts/axios';

export default {
  namespaced: true,
  state: {
    courses: [],
    majors: [],
  },

  actions: {
    getAllCourses (ctx) {
      return axios.get('/courses/getList')
      .then(res => ctx.commit('setAllCourses', res))
      .catch(err => console.log(err));
    },
    getCourseByName (ctx, params) {
      return axios({
        url: '/courses/query',
        params,
      });
    },
    getAllMajors (ctx) {
      return axios.get('/majors/getList')
      .then(res => ctx.commit('setAllMajors', res))
      .catch(err => console.log(err));
    },
  },

  mutations: {
    setAllCourses (state, payload) {
      state.courses = payload.data;
      return payload;
    },
    setAllMajors (state, payload) {
      state.majors = payload.data;
      return payload;
    },
  },
}
