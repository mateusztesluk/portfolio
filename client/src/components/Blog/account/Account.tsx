import React from 'react';
import { connect } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import './Account.scss';

import { User } from 'shared/interfaces/user';
import ChangePassword from './changePassword/ChangePassword';
import EditProfile from './editProfile/EditProfile';
import Admin from './admin/Admin';


interface ReduxState {
  user: User;

}

interface Props extends ReduxState {

}

enum PanelCondition {
  isSuperuser=1,
}

interface PanelConfig {
  [name: string]: {component: JSX.Element; condition?: PanelCondition}
}

const panels: PanelConfig = {
  'Edit profile': {
    component: <EditProfile />,
  },
  'Change password': {
    component: <ChangePassword />,
  },
  'Admin': {
    component: <Admin />,
    condition: PanelCondition.isSuperuser,
  },
};

const AccountComponent = (props: Props) => {

  const manageCondition = (cond: undefined | PanelCondition) => {
    switch (cond) {
      case PanelCondition.isSuperuser:
        return props.user.is_superuser;
      default:
        return true;
    }
  }

  return (
    <div className="blog-account">
      {Object.keys(panels).map((key: string, index: number) => {
        return manageCondition(panels[key].condition) ? <Accordion key={key}>
                <AccordionSummary
                  key={index}
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel-content"
                >
                  {key}
                </AccordionSummary>
                <AccordionDetails>
                  {panels[key].component}
                </AccordionDetails>
              </Accordion> : <></>
      })}
    </div>
  );
};


const mapStateToProps = (state: ReduxState) => {
  return {
    user: state.user,
  };
};

const Account = connect(mapStateToProps)(AccountComponent);
export default Account;
