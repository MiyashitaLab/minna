const { app, BrowserWindow } = require('electron');
const libpath = require('path');

/** @type {Electron.BrowserWindow} */
let browserWindow = null;

const create = () => {
	const w = new BrowserWindow({
		width: 800,
		height: 600
	});
	w.loadURL(`file://${libpath.join(__dirname, 'dst/index.html')}`);
	w.on('closed', () => { browserWindow = null; });

	browserWindow = w;
};

app.on('ready', () => {
	create();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!browserWindow) {
		create();
	}
});