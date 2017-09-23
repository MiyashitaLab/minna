import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import autobind from 'autobind';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

export default class App extends PureComponent {
	constructor() {
		super();

		this.state = { src: '' };

		/** @type {HTMLAudioElement} */
		this.$e = null;
		/** @type {string[]} */
		this.files = [];
		this.index = -1;
		this.wait = true;

		socket.on('server/hello', this.onHello);
		socket.on('server/update:volume', this.onVolume);
		socket.on('server/update:files', this.onFiles);
	}

	componentDidMount() {
		this.$e = findDOMNode(this);
	}

	componentDidUpdate() {
		const { $e } = this;

		this.wait = false;
		$e.play();
	}

	@autobind
	onHello({ volume, index, files }) {
		const { $e } = this;

		$e.volume = volume;
		this.index = index;
		this.files = files;
	}

	@autobind
	onVolume({ volume }) {
		const { $e } = this;

		$e.volume = volume;
	}

	@autobind
	onFiles({ files }) {
		const { wait } = this;

		this.files = files;

		if (wait) {
			this.wait = false;
			this.index += 1;
			socket.emit('client/update:index', { index: this.index });
			this.setState({ src: this.files[this.index] });
		}
	}

	@autobind
	onPause() {
		const { $e: { currentTime, duration } } = this;

		if (currentTime === duration) {
			const { files, index } = this;

			if (index < files.length - 1) {
				this.index += 1;
				socket.emit('client/update:index', { index: this.index });
				this.setState({ src: files[this.index] });
			} else {
				this.wait = true;
			}
		}
	}

	render() {
		const { state: { src } } = this;

		return <audio src={src} controls onPause={this.onPause} />;
	}
}
