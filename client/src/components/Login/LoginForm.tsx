import React, {useState} from 'react';
import { connect } from 'react-redux';

import './LoginForm.scss';
import InputWidget from 'shared/components/widgets/input/input';
import ErrorWidget from 'shared/components/widgets/error/error';
import ButtonWidget from 'shared/components/widgets/button/button';

import { notifySuccess } from 'actions/notify';
import { setToken } from 'actions/token';
import { RegisterFormType } from 'shared/interfaces/user';
import { getConfigBlog, getConfigUrlSrvAuth  } from "config";
import HttpService from 'shared/services/HttpService'


interface Props {
  setToken: (token: string) => void;
  handleClose: (logged: boolean) => void;
  notifySuccess: (msg: string) => void;
  setRegistration: (type: number) => void;
}

interface Credentials {
  username: string;
  password: string;
}

export const LoginFormComponent = (props: Props) => {
  const _httpService: HttpService = new HttpService();
  const [credentials, setCredentials] = useState<Credentials>({username: '', password: ''});
  const [validationError, setValidationError] = useState<{valid: boolean, msg: string}>({valid: true, msg: "Username and password must be filled"});

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (credentials.username && credentials.password) {
      const url = getConfigUrlSrvAuth('login');
      _httpService.post(url, credentials).then(response => {
        props.setToken(response.access);
        localStorage.setItem(getConfigBlog('refreshTokenKey'), response.refresh);
        props.handleClose(true);
        props.notifySuccess('Now you are logged in!');
      }).catch(err => {});
    } else {
      setNonValid();
    }
  }

  const setNonValid = () => {
    setValidationError({
      ...validationError,
      valid: false,
    });
    setTimeout(() => setValidationError({
      ...validationError,
      valid: true,
    }), 4000)
  }

  const onUsernameChange = (value: string) => {
    setCredentials({
      ...credentials,
      username: value
    });
  }

  const onPasswordChange = (value: string) => {
    setCredentials({
      ...credentials,
      password: value
    });
  }

  return (
    <div className="login">
      <form className="login__form" onSubmit={(e) => handleSubmit(e)}>
        <div className="form-field">
          <InputWidget placeholder="Username" onChange={(value: string) => onUsernameChange(value)}/>
        </div>
        <div className="form-field">
          <InputWidget type="password" placeholder="Password" onChange={(value: string) => onPasswordChange(value)}/>
        </div>
        <ErrorWidget text={validationError.valid ? "" : validationError.msg}/>
        <div className="login__actions">
          <ButtonWidget type={"button"} onClick={(e) => props.setRegistration(RegisterFormType.FULL)} text={"Sign up"}/>
          <ButtonWidget type={"submit"} text={"Login"}/>
        </div>
      </form>
    </div>
    )
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setToken: (token: string) => dispatch(setToken(token)),
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg)),
  };
};

export const LoginForm = connect(null, mapDispatchToProps)(LoginFormComponent);