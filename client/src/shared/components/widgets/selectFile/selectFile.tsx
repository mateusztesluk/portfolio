import React, { useState } from 'react';

import './selectFile.scss';
import BackupIcon from '@mui/icons-material/Backup';


interface Props {
  onChange?: (file: File) => void;
  name?: string;
  orderNumber?: number;
  initialValue?: string | null;
}

const SelectFileWidget = (props: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    setSelectedFile(file)
    props.onChange && props.onChange(file);
  };

  let imageConfig = {
    imageTag: <></>,
    classImgResize: ''
  };
  if (selectedFile || props.initialValue) {
    const imageUrl = props.initialValue && !selectedFile
      ? props.initialValue
      : selectedFile
        ? URL.createObjectURL(selectedFile)
        : '';
    imageConfig.imageTag = <img className="widget-select-file__img" src={imageUrl} alt={imageUrl} />;
    imageConfig.classImgResize = 'widget-select-file--resize';
  }

  return (
    <div className={`widget-select-file ${imageConfig.classImgResize}`}>
      {imageConfig.imageTag}
      <label
        htmlFor={`widget-select-file-id-${props.orderNumber}`}
        className="widget-select-file__label"
      >
        <BackupIcon fontSize="large" style={{verticalAlign: 'text-top', marginRight: '1rem'}}/>
        {selectedFile?.name || 'Select file...'}
      </label>
      <input
        id={`widget-select-file-id-${props.orderNumber}`}
        className="widget-select-file__input"
        type="file"
        name={props.name}
        accept="image/*"
        onChange={(e) => onFileChange(e)}
        />
    </div>
  )
}

export default SelectFileWidget;