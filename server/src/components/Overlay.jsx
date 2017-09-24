import React from 'react';
import './Overlay.scss';

const Overlay = ({ visible, children }) => (
	<div styleName='base' style={{ display: visible ? 'flex' : 'none' }}>
		{children}
	</div>
);

export default Overlay;