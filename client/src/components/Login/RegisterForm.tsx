import React, { useState } from 'react';
import { connect } from 'react-redux';

import './RegisterForm.scss';
import InputWidget from 'shared/components/widgets/input/input';
import ErrorWidget from 'shared/components/widgets/error/error';
import ButtonWidget from 'shared/components/widgets/button/button';

import { notifySuccess } from 'actions/notify';
import { User, Profile, RegisterFormType } from 'shared/interfaces/user';
import { getConfigUrlSrvAuth } from "config";
import HttpService from 'shared/services/HttpService'


interface Props {
  user: User;
  registerType: number;
  notifySuccess: (msg: string) => void;
  setRegistration: (register: number) => void;
}

interface State {
  user: User;
}

interface Account {
  username?: string;
  password?: string;
  passwordConfirmation?: string;
  email?: string;
  profile?: Profile;
}

export const RegisterFormComponent = (props: Props) => {
  const _httpService: HttpService = new HttpService();
  const [validationError, setValidationError] = useState<{valid: boolean, msg: string}>({valid: true, msg: "Passwords must be the same"});
  const [formData, setFormData] = useState<Account>({
    username: '',
    password: '',
    passwordConfirmation: '',
    email: '',
  });

  const onFieldChange = (key: keyof Account, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: Account = { ...formData };

    if (!data.username || (props.registerType === RegisterFormType.FULL && (!data.password || !data.passwordConfirmation || !data.email))) {
      setValidationError({
        valid: false,
        msg: 'Please fill all required fields',
      });
      setTimeout(() => setValidationError({
        valid: true,
        msg: "Passwords must be the same",
      }), 4000);
      return;
    }

    if (data.password !== data.passwordConfirmation) {
      setValidationError({
        ...validationError,
        valid: false
      });
      setTimeout(() => setValidationError({
        ...validationError,
        valid: true,
      }), 4000)
    } else {
      delete data.passwordConfirmation;
      const payload: Account = {...data, profile: {facebook_id: props.user.profile?.facebook_id}};
      const url = getConfigUrlSrvAuth('register');
      _httpService.post(url, payload).then(reponse => {
        props.setRegistration(RegisterFormType.NONE);
        props.notifySuccess('Register successfully! Login again to authenticate yourself')
      }).catch(err => {

      })
    }
  };

  const renderAdditionalFields = () => {
    return (
      <div className="register-form__additional-fields">
        <div className="form-field">
          <InputWidget type="password" placeholder="Password" name="password" onChange={(value: string) => onFieldChange('password', value)}/>
        </div>
        <ErrorWidget text={!formData.password ? "Password is required!" : ""}/>
        <div className="form-field">
          <InputWidget type="password" placeholder="Password Confirmation" name="passwordConfirmation" onChange={(value: string) => onFieldChange('passwordConfirmation', value)}/>
        </div>
        <ErrorWidget text={!formData.passwordConfirmation ? "Password confirmation is required!" : ""}/>
        <ErrorWidget text={validationError.valid ? "" : validationError.msg}/>
        <div className="form-field">
          <InputWidget type="email" placeholder="Email" name="email" onChange={(value: string) => onFieldChange('email', value)}/>
        </div>
        <ErrorWidget text={!formData.email ? "Email is required!" : ""}/>
      </div>
    )
  }

  const renderBasicFields = () => {
    return (
      <div className="register-form__basic-fields">
        <div className="form-field">
          <InputWidget placeholder="Username" name="username" onChange={(value: string) => onFieldChange('username', value)}/>
        </div>
        <ErrorWidget text={!formData.username ? "Username is required!" : ""}/>
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div className="register-form__actions">
        <ButtonWidget type={"button"} onClick={(e) => props.setRegistration(RegisterFormType.NONE)} text={"Back"}/>
        <ButtonWidget type={"submit"} text={"Register"}/>
      </div>
    )
  }

  return (
    <form className="register-form" onSubmit={onSubmit}>
      {renderBasicFields()}
      {props.registerType === RegisterFormType.FULL ? renderAdditionalFields() : <></>}
      {renderActions()}
    </form>
  );
};

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg)),
  };
};

export const RegisterForm = connect(mapStateToProps, mapDispatchToProps)(RegisterFormComponent);