import React, { PureComponent } from 'react';
import autobind from 'autobind';
import Dropzone from 'react-dropzone';
import io from 'socket.io-client';
import Slider from './Slider';
import { dropzone } from './App.scss';

const socket = io('http://localhost:8000');

export default class App extends PureComponent {
	constructor() {
		super();

		this.state = {
			/** @type {File} */
			file: null,
			overlay: false,
			volume: 0
		};

		socket.on('server/hello', this.onHello);
	}

	@autobind
	onHello({ volume }) {
		this.setState({ volume });
	}

	@autobind
	onDrop(files) {
		this.setState({ file: files[0] });
	}

	@autobind
	onClick() {
		const { state: { file } } = this;

		if (file) {
			this.setState({ overlay: true }, () => {
				const body = new FormData();
				body.append('music', file);

				fetch('http://localhost:8000/upload', {
					method: 'POST',
					body
				}).then(({ status }) => {
					if (status === 200) {
						this.setState({ file: null, overlay: false });
						alert('送信されたよ');
					} else {
						Promise.reject('サーバでエラー吐いてるわ');
					}
				}).catch((err) => {
					console.error(err);
					this.setState({ overlay: false });
				});
			});
		} else {
			alert('早く曲を選択してね');
		}
	}

	/**
	 * @param {number} volume
	 */
	@autobind
	onChangeVolumeSlider(volume) {
		socket.emit('client/update:volume', { volume });
		this.setState({ volume });
	}

	render() {
		const { state: { file, overlay, volume } } = this;

		return (
			<div styleName='base'>
				<h1>Minna: みんなの曲流せる君</h1>
				<p>{file ? `選択された曲は"${file.name}"だよ` : '早く曲を選択してね'}</p>
				<Dropzone onDrop={this.onDrop} multiple={false} className={dropzone}>
					<p>ここで曲を選択するよ</p>
				</Dropzone>
				<button onClick={this.onClick}>送信するよ</button>
				<div styleName='overlay' style={{ display: overlay ? 'flex' : 'none' }}>
					<p>送信中だよ</p>
				</div>
				<h2>Volume</h2>
				<p>{volume.toFixed(2)}</p>
				<Slider width={300} height={20} onChange={this.onChangeVolumeSlider} value={volume} background='rgb(158, 158, 158)' fill='rgb(33, 150, 243)' />
			</div>
		);
	}
}
