const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8086',
  //baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8086' : 'http://112.74.43.202:8086',
  timeout: 5000  // 请求超时时间
});

//拦截请求
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      //config.headers.common['Authorization'] = 'Bearer ' + token
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)
//拦截响应
instance.interceptors.response.use(
  response => {
    return response.data
  },
)

// const makeAction = ({ method = 'get', url }) => {
//   return new Promise((resolve, reject) => {
//     instance({
//       method,
//       url,
//     })
//     .then(res => {
//       if (res.status === 200) {
//         resolve(res.data);
//       } else {
//         reject(res);
//       }
//     })
//     .catch(err => {
//       reject(err);
//     })
//   });
// };

export default instance;
