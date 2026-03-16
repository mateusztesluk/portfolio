import React from 'react';
import { connect } from 'react-redux';
import { useState } from 'react';

import InputWidget from 'shared/components/widgets/input/input';
import ButtonWidget from 'shared/components/widgets/button/button';

import { User } from 'shared/interfaces/user';
import { notifySuccess } from 'actions/notify';
import { setUserData } from 'actions/user';


interface ReduxDispatch {
  notifySuccess: (msg: string) => void;
  setUserData: (data: User) => void;
}

interface Props extends ReduxDispatch {

}

interface Account {
  username?: string;
  email?: string;
}

const EditProfileComponent = (props: Props) => {
  const [formData, setFormData] = useState<Account>({
    username: '',
    email: '',
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // _service.putUser(data).then(response => {
    //   props.notifySuccess('User data updated');
    //   props.setUserData(response);
    // }).catch(err => {});
  };

  const onFieldChange = (key: keyof Account, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  return (
    <form className="blog-edit-profile" onSubmit={onSubmit}>
      <div className="form-field">
        <InputWidget placeholder="Username" name="username" onChange={(value: string) => onFieldChange('username', value)}/>
      </div>
      <div className="form-field">
        <InputWidget placeholder="Email" name="email" onChange={(value: string) => onFieldChange('email', value)}/>
      </div>
      <ButtonWidget type={"submit"} text={"Update"}/>
    </form>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    notifySuccess: (msg: string) => dispatch(notifySuccess(msg)),
    setUserData: (data: User) => dispatch(setUserData(data)),
  };
};

const EditProfile = connect(null, mapDispatchToProps)(EditProfileComponent);

export default EditProfile;