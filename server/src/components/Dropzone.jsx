import React from 'react';
import Dropzone from 'react-dropzone';
import './Dropzone.scss';

const NewDropzone = ({ onDrop, children }) => (
	<Dropzone onDrop={onDrop} multiple={false} styleName='base'>
		{children}
	</Dropzone>
);

export default NewDropzone;