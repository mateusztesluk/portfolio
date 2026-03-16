import React from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';

import { notifyError } from 'actions/notify';
import { User } from 'shared/interfaces/user';


interface State {
  user: User;
}

interface Props {
  component: React.ComponentType<any>;
  user: User;
  app: string;
  notifyError: (msg: string) => void;
}

const Guard = ({ component: Component, user, app, notifyError, ...rest }: Props) => {
  React.useEffect(() => {
    if (!user?.username) {
      notifyError('Please sign in to have full access!');
    }
  }, [notifyError, user]);

  return user?.username
    ? <Component {...rest} />
    : <Navigate to={`/${app}`} replace />;
}




const mapDispatchToProps = (dispatch: any) => {
  return {
    notifyError: (msg: string) => dispatch(notifyError(msg)),
  };
};

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
  };
}

export const AuthGuard = connect(mapStateToProps, mapDispatchToProps)(Guard);