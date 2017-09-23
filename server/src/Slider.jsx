import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import autobind from 'autobind';
import './Slider.scss';

export default class Slider extends PureComponent {
	constructor() {
		super();

		/** @type {HTMLCanvasElement} */
		this.$canvas = null;
		/** @type {CanvasRenderingContext2D} */
		this.ctx = null;
	}

	componentDidMount() {
		const $e = findDOMNode(this);
		this.$canvas = $e;
		this.ctx = $e.getContext('2d');
		this.draw();
	}

	componentDidUpdate() {
		this.draw();
	}

	draw() {
		const { $canvas, ctx, props: { value, fill } } = this;
		const { width, height } = $canvas.getBoundingClientRect();

		ctx.fillStyle = fill;
		ctx.clearRect(0, 0, width, height);
		ctx.fillRect(0, 0, width * value, height);
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseDown(e) {
		const { props: { onChange } } = this;

		onChange(this.nx(e));
		document.addEventListener('mousemove', this.onMouseMoveDoc);
		document.addEventListener('mouseup', this.onMouseUpDoc);
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMoveDoc(e) {
		const { props: { onChange } } = this;

		onChange(this.nx(e));
	}

	@autobind
	onMouseUpDoc() {
		document.removeEventListener('mousemove', this.onMouseMoveDoc);
		document.removeEventListener('mouseup', this.onMouseUpDoc);
	}

	/**
	 * @param {MouseEvent} e
	 * @returns {number}
	 */
	nx(e) {
		const { clientX } = e;
		const { $canvas } = this;
		const { left, width } = $canvas.getBoundingClientRect();

		return Math.max(0, Math.min(1, (clientX - left) / width));
	}

	render() {
		const { props: { width, height, background } } = this;

		return <canvas styleName='base' width={width} height={height} style={{ backgroundColor: background }} onMouseDown={this.onMouseDown} />;
	}
}