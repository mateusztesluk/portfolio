import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import './App.scss';

import { Notification } from 'shared/interfaces/notification.interface';
import { Blog } from './Blog/Blog';
import { Dashboard } from './Dashboard/Dashboard';
import { Photos } from './Photos/Photos';
import { NotFound } from 'shared/components/NotFound';
import { LoginDialog } from './Login/LoginDialog';
import { notifyError } from 'actions/notify';
import { setToken } from 'actions/token';
import { setUserData } from 'actions/user';
import { User } from 'shared/interfaces/user';
import { getConfigBlog, getConfigUrlSrvAuth } from 'config';
import HttpService from 'shared/services/HttpService';
import Interceptor from 'shared/interceptors/interceptor';


interface ReduxState {
  notify: Notification;
}

interface Props {
  notify: Notification;
  notifyError: (msg: string) => void;
  setToken: (token: string) => void;
  setUserData: (data: User) => void;
}

interface ComponentState {
  notificationOpen: boolean;
}

class App extends React.Component <Props, ComponentState> {
  private _httpService: HttpService = new HttpService();
  private _interceptor: Interceptor = new Interceptor();
  state = {
    notificationOpen: false,
  };

  constructor(props: Props) {
    super(props);
    this._interceptor.initInterceptors(props.notifyError, props.setToken);
    const token = localStorage.getItem(getConfigBlog('tokenKey'));
    props.setToken(token || '');
    if (token) this.getUserData();
  }

  componentDidUpdate(prevProps: Props) {
    const notification = this.props.notify;
    if (prevProps.notify !== notification && notification?.msg) {
      this.setState({ notificationOpen: true });
    }
  }

  getUserData() {
    this._httpService.get(getConfigUrlSrvAuth('me')).then((response: User) => {
      this.props.setUserData(response);
    }).catch(err => {});
  }

  handleNotificationClose = () => {
    this.setState({ notificationOpen: false });
  };

  renderRouter() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/blog/*" element={<Blog />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    );
  }

  render() {
    const severity = ['error', 'warning', 'info', 'success'].includes(this.props.notify?.type)
      ? this.props.notify.type as 'error' | 'warning' | 'info' | 'success'
      : 'info';

    return (
      <>
        {this.renderRouter()}
        <Snackbar
          open={this.state.notificationOpen}
          autoHideDuration={4000}
          onClose={this.handleNotificationClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: '2.4rem !important', right: '2.4rem !important' }}
        >
          <Alert
            onClose={this.handleNotificationClose}
            severity={severity}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: '28rem',
              borderRadius: '18px',
              boxShadow: '0 18px 40px rgba(17,35,43,0.18)',
              alignItems: 'center'
            }}
          >
            {this.props.notify?.msg}
          </Alert>
        </Snackbar>
        <LoginDialog />
      </>
    );
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
      notify: state.notify,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    notifyError: (msg: string) => dispatch(notifyError(msg)),
    setToken: (token: string) => dispatch(setToken(token)),
    setUserData: (data: User) => dispatch(setUserData(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
