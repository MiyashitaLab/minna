const { fromJS, Map, List } = require('immutable');

module.exports = class State {

	/**
	 * @param {SocketIO.Server} io
	 * @param {{}} initial
	 */
	constructor(io, initial) {
		this.io = io;
		this.state = fromJS(initial);
	}

	/**
	 * @param {string} k
	 * @param {any} v
	 * @param {boolean} emit
	 */
	privateSet(k, v, emit = true) {
		const { state, io } = this;

		this.state = state.set(k, fromJS(v));

		if (emit) {
			io.emit(`server/update:${k}`, { [k]: this.toJS(v) });
		}
	}

	/**
	 * @param {string} k
	 * @param {any} v
	 * @param {boolean} emit
	 */
	set(k, v, emit = true) {
		this.privateSet(k, v, emit);
	}

	/**
	 * @param {{}} o
	 * @param {boolean} emit
	 */
	merge(o, emit = true) {
		Object.keys(o).forEach((k) => {
			this.privateSet(k, o[k], emit);
		});
	}

	/**
	 * @param {string} k
	 * @returns {any}
	 */
	get(k) {
		const { state } = this;

		return state.get(k).toJS();
	}

	/**
	 * @returns {{}}
	 */
	all() {
		const { state } = this;

		return state.toJS();
	}

	/**
	 * @param {any} v
	 * @returns {any}
	 */
	toJS(v) {
		if (Map.isMap(v) || List.isList(v)) {
			return v.toJS();
		}

		return v;
	}
};
