import React from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import './Dialog.scss';


interface Props {
    onClose: () => void;
    open: boolean;
    children?: any;
    title?: string;
}

export const Dialog = (props: Props) => {

  const onBackgroundClick = (event) => {
    if(event.target === event.currentTarget) {
        props.onClose();
    }
  }

  return (
    <div className={`dialog ${props.open ? 'dialog--show' : ''}`} onClick={(e) => onBackgroundClick(e)}>
      <div className="dialog__box">
        <CloseOutlinedIcon className="dialog__exit-icon" fontSize="large" onClick={props.onClose} />
        <h3 className="dialog__title">{props.title}</h3>
        {props.children}
      </div>
    </div>
  );
};