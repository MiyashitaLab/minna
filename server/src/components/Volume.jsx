import React from 'react';
import Slider from './Slider';

const Volume = ({ value, onChange }) => (
	<div>
		<p>{value.toFixed(2)}</p>
		<Slider width={300} height={20} onChange={onChange} value={value} background='rgb(158, 158, 158)' fill='rgb(33, 150, 243)' />
	</div>
);

export default Volume;