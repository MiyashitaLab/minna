import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import fs from 'fs';
import libpath from 'path';
import autobind from 'autobind';

const DIR = libpath.join(__dirname, 'assets');

const readdir = () => new Promise((resolve, reject) => {
	fs.readdir(DIR, (err, files) => {
		if (err) {
			reject(err);
		} else {
			resolve(files.map((a) => libpath.join(DIR, a)));
		}
	});
});

export default class App extends PureComponent {
	constructor() {
		super();

		this.state = { src: '' };

		/** @type {HTMLAudioElement} */
		this.$e = null;
		this.files = [];
		this.index = 0;
	}

	componentDidMount() {
		this.$e = findDOMNode(this);

		this.loop();
	}

	componentDidUpdate() {
		const { $e } = this;

		$e.play();
	}

	/**
	 * @param {Object} state
	 * @param {Function} callback
	 */
	setStateAsync(state, callback = () => { }) {
		return new Promise((resolve) => {
			this.setState(state, () => {
				callback();
				resolve();
			});
		});
	}

	@autobind
	onPause() {
		const { $e: { currentTime, duration } } = this;

		if (currentTime === duration) {
			this.index += 1;
		}
	}

	@autobind
	loop() {
		(async () => {
			const { index } = this;
			const files = await readdir();

			this.files = files;

			if (index < files.length) {
				await this.setStateAsync({ src: files[index] });
			}
		})().catch(console.error).then(() => requestAnimationFrame(this.loop));
	}

	render() {
		const { state: { src } } = this;

		return <audio src={src} controls onPause={this.onPause} />;
	}
}
