const express = require('express');
const multer = require('multer');
const libpath = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const State = require('./state');

const app = express();
const io = require('socket.io')(app.listen(8000));
const upload = multer({ dest: libpath.join(__dirname, '../client/app/dst/assets') });
const state = new State(io, {
	files: [],
	volume: 0.5,
	index: -1,
	nice: 0,
	bad: 0
});

app.use(cors());
app.use('/', express.static(libpath.join(__dirname, 'dst/')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/upload', upload.single('music'), (req, res) => {
	const { file: { path, originalname }, body: { skip } } = req;
	const ext = libpath.extname(originalname);
	const name = originalname.slice(0, -ext.length);
	const nextPath = libpath.join(libpath.dirname(path), `${name}.${Date.now()}${ext}`);
	let files = state.get('files');

	fs.rename(path, nextPath, (err) => {
		if (err) {
			console.error(err);
			res.sendStatus(500);
		}

		if (skip === 'true') {
			const index = state.get('index');
			files = files.slice(0, index + 1).concat(nextPath, files.slice(index + 1));
		} else {
			files.push(nextPath);
		}

		state.merge({ files });
		res.sendStatus(200);
	});
});

io.on('connection', (client) => {
	client.emit('server/hello', state.all());
	client.on('client/update:volume', ({ volume }) => state.merge({ volume }));
	client.on('client/update:index', ({ index }) => state.merge({ index }));
	client.on('client/update:nice', ({ nice }) => state.merge({ nice }));
	client.on('client/update:bad', ({ bad }) => state.merge({ bad }));
	client.on('client/reset:voted', () => {
		state.merge({ nice: 0, bad: 0 }, false);
		io.emit('server/reset:voted');
	});
});