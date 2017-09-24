import React, { PureComponent } from 'react';
import autobind from 'autobind';
import io from 'socket.io-client';
import Dropzone from './Dropzone';
import Setlist from './Setlist';
import Overlay from './Overlay';
import Volume from './Volume';
import Vote from './Vote';
import './App.scss';

const { protocol, hostname } = location;
const target = `${protocol}//${hostname}:8000`;
const socket = io(target);

export default class App extends PureComponent {
	constructor() {
		super();

		this.state = {
			/** @type {File} */
			file: null,
			overlay: false,
			volume: 0,
			index: -1,
			files: [],
			bad: 0,
			nice: 0
		};

		socket.on('server/hello', this.onHello);
		socket.on('server/update:files', this.onFiles);
		socket.on('server/update:index', this.onIndex);
		socket.on('server/update:volume', this.onVolume);
		socket.on('server/update:nice', this.onNice);
		socket.on('server/update:bad', this.onBad);
		socket.on('server/reset:voted', this.onResetVoted);
	}

	@autobind
	onHello({ volume, index, files, bad, nice }) {
		this.setState({ volume, index, files, bad, nice });
	}

	@autobind
	onFiles({ files }) {
		this.setState({ files });
	}

	@autobind
	onIndex({ index }) {
		this.setState({ index });
	}

	@autobind
	onVolume({ volume }) {
		this.setState({ volume });
	}

	@autobind
	onDrop(files) {
		this.setState({ file: files[0] });
	}

	@autobind
	onNice({ nice }) {
		this.setState({ nice });
	}

	@autobind
	onBad({ bad }) {
		this.setState({ bad });
	}

	@autobind
	onResetVoted() {
		this.setState({ nice: 0, bad: 0 });
	}

	@autobind
	onClick() {
		const { state: { file } } = this;

		if (file) {
			this.setState({ overlay: true }, () => {
				const body = new FormData();
				body.append('music', file);
				body.append('skip', document.querySelector('[type="checkbox"]').checked);

				fetch(`${target}/upload`, {
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

	@autobind
	onClickNice() {
		let { state: { nice } } = this;

		nice += 1;
		socket.emit('client/update:nice', { nice });
		this.setState({ nice });
	}

	@autobind
	onClickBad() {
		let { state: { bad } } = this;

		bad += 1;
		socket.emit('client/update:bad', { bad });
		this.setState({ bad });
	}

	render() {
		const { state: { file, overlay, volume, files, index, bad, nice } } = this;

		return (
			<div styleName='base'>
				<h1>Minna: みんなの曲流せる君</h1>
				<p>{file ? `選択された曲は"${file.name}"だよ` : '早く曲を選択してね'}</p>
				<Dropzone onDrop={this.onDrop}>
					<p>ここで曲を選択するよ</p>
				</Dropzone>
				<p>
					<input type='checkbox' />
					割り込むよ
				</p>
				<button onClick={this.onClick} className='btn'>送信するよ</button>
				<div styleName='flex'>
					<div>
						<h2>Volume</h2>
						<Volume onChange={this.onChangeVolumeSlider} value={volume} />
						<h2>Vote</h2>
						<Vote nice={nice} bad={bad} addNice={this.onClickNice} addBad={this.onClickBad} />
					</div>
					<div>
						<h2>Setlist</h2>
						<Setlist filenames={files} active={index} />
					</div>
				</div>
				<Overlay visible={overlay}>
					<p>送信中だよ</p>
				</Overlay>
			</div>
		);
	}
}
