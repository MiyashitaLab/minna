import React, { PureComponent } from 'react';
import autobind from 'autobind';
import Dropzone from 'react-dropzone';
import io from 'socket.io-client';
import Slider from './Slider';
import libpath from 'path';
import Nice from 'react-icons/lib/fa/heart';
import Bad from 'react-icons/lib/fa/close';
import { dropzone } from './App.scss';

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
				<Dropzone onDrop={this.onDrop} multiple={false} className={dropzone}>
					<p>ここで曲を選択するよ</p>
				</Dropzone>
				<p>
					<input type='checkbox' />
					割り込むよ
				</p>
				<button onClick={this.onClick}>送信するよ</button>
				<div styleName='flex'>
					<div>
						<h2>Volume</h2>
						<p>{volume.toFixed(2)}</p>
						<Slider width={300} height={20} onChange={this.onChangeVolumeSlider} value={volume} background='rgb(158, 158, 158)' fill='rgb(33, 150, 243)' />
						<h2>Vote</h2>
						<p styleName='voted'>
							<span styleName='voted-nice-n'>{nice}</span>
							/
							<span styleName='voted-bad-n'>{bad}</span>
						</p>
						<button styleName='nice' onClick={this.onClickNice}><Nice />いいね</button>
						<button styleName='bad' onClick={this.onClickBad}><Bad />よくないね</button>
					</div>
					<div>
						<h2>Setlist</h2>
						<div styleName='setlist'>
							{files.map((a, i) => {
								a = libpath.basename(a);
								a = a.slice(0, -libpath.extname(a).length);
								a = a.substring(0, a.lastIndexOf('.'));

								return (
									<div data-active={i === index} key={i}>
										<div>{i}</div>
										<div>{a}</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
				<div styleName='overlay' style={{ display: overlay ? 'flex' : 'none' }}>
					<p>送信中だよ</p>
				</div>
			</div>
		);
	}
}
