import { AxiosResponse, AxiosError } from 'axios';
import axios from 'configAxios';
import { getConfigBlog, getConfigUrlSrvAuth } from "config";

interface ErrorResponseData {
  message?: string;
  non_field_errors?: string[];
}

class ErrorResponseInterceptor {
  staticMessages = {
    504: 'Problem with server connection',
    0: 'Unrecognized error',
  }


  initInterceptor(notifyError: (msg: string) => void, setToken: (token: string) => void) {
    axios.interceptors.response.use((config: AxiosResponse) => {
      return config;
    }, (error: AxiosError<ErrorResponseData>) => {
      return new Promise((resolve, reject) => {
        const retryableError = error as AxiosError<ErrorResponseData> & {
          config?: {
            _retry?: boolean;
            headers: { set: (name: string, value: string) => void };
          };
        };

        if (retryableError && retryableError.response?.status === 401 && retryableError.config && !retryableError.config._retry ) {
          const originalReq = retryableError.config;
          originalReq._retry = true;

          let res = fetch(getConfigUrlSrvAuth('refreshLogin'), {
              method: 'POST',
              mode: 'cors',
              cache: 'no-cache',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/json',
            },
              redirect: 'follow',
              referrer: 'no-referrer',
              body: JSON.stringify({
                  refresh: localStorage.getItem(getConfigBlog('refreshTokenKey'))
              }),
          }).then(res => res.json()).then(res => {
              setToken(res.access)
              originalReq.headers.set('Authorization', `Bearer ${res.access}`);
              return axios(originalReq as any);
          }).catch(err => {
            notifyError('Please login again!');
          });

          resolve(res);
        } else {
          const status = error.response?.status || 0;
          let msg = this.staticMessages[status];
          const data = error.response?.data || {};
          msg = msg || data.message || (data.non_field_errors && data.non_field_errors[0]) || this.staticMessages['0'];
          console.log('[ERROR]', msg);
          if (msg.length) {
            notifyError(msg);
            reject(error);
          }
        }
      })
    })
  }
}

export default ErrorResponseInterceptor;