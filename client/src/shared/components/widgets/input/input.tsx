import React, { useEffect, useState } from 'react';

import './input.scss';


interface Props {
  id?: string;
  onChange?: (val: string) => void;
  refe?: any;
  name?: string;
  placeholder?: string;
  type?: string;
  initialValue?: string;
}

const InputWidget = ({ id, onChange: onValueChange, refe, name, placeholder, type, initialValue }: Props) => {
  const [state, setstate] = useState('');

  const onChange = (value: string) => {
    if (onValueChange) onValueChange(value);
    setstate(value);
  }

  useEffect(() => {
    if (typeof initialValue === 'string') {
      setstate(initialValue);
    }
  }, [initialValue])


  return (
    <input
      id={id}
      className="widget-input"
      type={type || 'text'}
      placeholder={placeholder}
      name={name || 'input'}
      ref={refe}
      onChange={e => onChange(e.target.value)}
      value={state}
    />
  )
}

export default InputWidget;