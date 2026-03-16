import React, { RefObject, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import './Sidebar.scss';
import MenuIcon from '@mui/icons-material/Menu';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';

import { getConfigBlog, getConfigRoutesBlog } from 'config';
import { setOpenLoginDialog } from 'actions/login-dialog';
import { User } from 'shared/interfaces/user';
import { resetToken } from 'actions/token';
import { notifySuccess } from 'actions/notify';
import { setUserData } from 'actions/user';


interface ReduxState {
  user?: User;
  token?: string;
}

interface ReduxDispatch {
  setOpenLoginDialog: (open: boolean) => void;
  resetToken: () => void;
  setUserData: (data: User) => void;
  notifySuccess: (msg: string) => void;
}

interface Props extends ReduxState, ReduxDispatch {
  children: ReactNode;
}

interface ComponentState {
  showSidebar: boolean;
  showNavbar: boolean;
  logoChanged: boolean;
}

class BlogSidebarComponent extends React.Component <Props, ComponentState>  {
  _ref: RefObject<HTMLDivElement> = React.createRef();
  state = {
    showSidebar: true,
    showNavbar: false,
    logoChanged: false,
  }

  componentDidMount() {
    if (this.isAppropriateWidth()) {
      this.setState({showNavbar: true});
      this.setState({showSidebar: false});
    }
  }

  isAppropriateWidth() {
    return window.innerWidth < 1000
  }

  toggleSidebar() {
    this.setState({showSidebar: !this.state.showSidebar});
  }

  handleToggleSidebarIfSmallScreen() {
    if (this.isAppropriateWidth()) this.toggleSidebar();
  }

  handleLogin() {
    this.handleToggleSidebarIfSmallScreen();
    if (this.props.token) {
      this.props.resetToken();
      localStorage.removeItem(getConfigBlog('tokenKey'));
      localStorage.removeItem(getConfigBlog('refreshTokenKey'));
      this.props.setUserData({});
      this.props.notifySuccess('Logout confirmed');
    } else {
      this.props.setOpenLoginDialog(true);
    }
  };

  renderLoginButton() {
    return this.props.token ? 'Logout' : 'Login';
  };

  renderSidebar() {
    const IconLogo = this.state.logoChanged ? FlightLandIcon : FlightTakeoffIcon;

    return (
      <div className={`blog__sidebar ${this.state.showSidebar ? 'blog__sidebar--show' : 'blog__sidebar--hide'}`} ref={this._ref}>
        <div className="blog__top">
          <Link to="/" className="blog__logo" onMouseEnter={() => this.setState({logoChanged: true})} onMouseLeave={() => this.setState({logoChanged: false})}>
            <div className="blog__eyebrow">Travel editorial</div>
            <div className="blog__header">
              <IconLogo fontSize="inherit" className="blog__travel-icon" />
              <span>Blog</span>
            </div>
            <div className="blog__subheader">Stories, places and visual notes from the road.</div>
          </Link>
          <div className="blog__navs">
            <Link to={getConfigRoutesBlog('dashboard')} onClick={() => this.handleToggleSidebarIfSmallScreen()} className="blog__nav-link">Dashboard</Link>
            <Link to={getConfigRoutesBlog('authors')} onClick={() => this.handleToggleSidebarIfSmallScreen()} className="blog__nav-link">Authors</Link>
            <Link to={getConfigRoutesBlog('sites')} onClick={() => this.handleToggleSidebarIfSmallScreen()} className="blog__nav-link">Sites</Link>
            <Link to={getConfigRoutesBlog('addNew')} onClick={() => this.handleToggleSidebarIfSmallScreen()} className="blog__nav-link">Add blog</Link>
          </div>
        </div>
        <div className="blog__bottom">
          {this.props.token && <Link to={getConfigRoutesBlog('profile')} onClick={() => this.handleToggleSidebarIfSmallScreen()} className="blog__profile">{this.props.user?.username}</Link>}
          <div className="blog__login" onClick={() => this.handleLogin()}>
            {this.renderLoginButton()}
          </div>
        </div>
      </div>
    )
  }

  renderNavbar() {
    return (
      <div className="blog__navbar">
        <MenuIcon className="blog__navbar-icon" fontSize="large" onClick={() => this.toggleSidebar()}/>
      </div>
    )
  }

  render() {
    return (
      <div className="blog">
        {this.state.showSidebar && this.renderSidebar()}
        <div className="blog__main">
          {this.state.showNavbar && this.renderNavbar()}
          {this.props.children}
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: ReduxState) => {
  return {
    user: state.user,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setOpenLoginDialog: (open: boolean) => dispatch(setOpenLoginDialog(open)),
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg)),
    resetToken: () => dispatch(resetToken()),
    setUserData: (data: User) => dispatch(setUserData(data)),
  };
};

export const BlogSidebar = connect(mapStateToProps, mapDispatchToProps)(BlogSidebarComponent);