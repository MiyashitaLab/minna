import React from 'react';
import libpath from 'path';
import './Setlist.scss';

const Setlist = ({ filenames, active }) => (
	<div styleName='base'>
		{filenames.map((a, i) => {
			a = libpath.basename(a);
			a = a.slice(0, -libpath.extname(a).length);
			a = a.substring(0, a.lastIndexOf('.'));

			return (
				<div data-active={i === active} key={i}>
					<div>{i}</div>
					<div>{a}</div>
				</div>
			);
		})}
	</div>
);

export default Setlist;