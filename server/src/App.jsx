import React, { PureComponent } from 'react';
import autobind from 'autobind';
import Dropzone from 'react-dropzone';
import { dropzone } from './App.scss';

export default class App extends PureComponent {
	constructor() {
		super();

		this.state = {
			/** @type {File} */
			file: null,
			overlay: false
		};
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

	render() {
		const { state: { file, overlay } } = this;

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
			</div>
		);
	}
}
