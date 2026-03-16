import React from 'react';
import { connect } from 'react-redux';
import { useState } from 'react';

import InputWidget from 'shared/components/widgets/input/input';
import ButtonWidget from 'shared/components/widgets/button/button';

import { notifySuccess } from 'actions/notify';


interface ReduxDispatch {
  notifySuccess: (msg: string) => void;
}

interface Props extends ReduxDispatch {

}

interface Account {
  oldPassword?: string;
  newPassword?: string;
  newConfirmationPassword?: string;
}

const ChangePasswordComponent = (props: Props) => {
  const [formData, setFormData] = useState<Account>({
    oldPassword: '',
    newPassword: '',
    newConfirmationPassword: '',
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // _service.putUser(data).then(response => {
    //   props.notifySuccess('User data updated');
    // }).catch(err => {});
  };

  const onFieldChange = (key: keyof Account, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  return (
    <form className="blog-change-password" onSubmit={onSubmit}>
      <div className="form-field">
        <InputWidget placeholder="Old password" name="oldPassword" onChange={(value: string) => onFieldChange('oldPassword', value)}/>
      </div>
      <div className="form-field">
        <InputWidget placeholder="New password" name="newPassword" onChange={(value: string) => onFieldChange('newPassword', value)}/>
      </div>
      <div className="form-field">
        <InputWidget placeholder="Confirm new password" name="newConfirmationPassword" onChange={(value: string) => onFieldChange('newConfirmationPassword', value)}/>
      </div>
      <ButtonWidget type={"submit"} text={"Update"}/>
    </form>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg)),
  };
};

const ChangePassword = connect(null, mapDispatchToProps)(ChangePasswordComponent);

export default ChangePassword;