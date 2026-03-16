import axios from 'configAxios';
import { getConfigBlog } from 'config';


class TokenInterceptor {
  initInterceptor() {
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem(getConfigBlog('tokenKey'));
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    });
  }
}

export default TokenInterceptor;