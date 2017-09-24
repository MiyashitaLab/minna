import React from 'react';
import Nice from 'react-icons/lib/fa/heart';
import Bad from 'react-icons/lib/fa/close';
import './Vote.scss';

const Vote = ({ nice, bad, addNice, addBad }) => (
	<div>
		<p styleName='base'>
			<span className='red-text'>{nice}</span>/<span className='blue-text'>{bad}</span>
		</p>
		<button className='red btn' onClick={addNice}>
			<Nice />いいね
		</button>
		<button className='blue btn' onClick={addBad}>
			<Bad />よくないね
		</button>
	</div>
);

export default Vote;