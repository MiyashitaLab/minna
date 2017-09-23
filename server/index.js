const express = require('express');
const multer = require('multer');
const libpath = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const io = require('socket.io')(app.listen(8000));
const upload = multer({ dest: libpath.join(__dirname, '../client/app/dst/assets') });

let files = [];
let volume = 0.5;
let index = -1;
let nice = 0;
let bad = 0;

app.use(cors());
app.use('/', express.static(libpath.join(__dirname, 'dst/')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/upload', upload.single('music'), (req, res) => {
	const { file: { path, originalname }, body: { skip } } = req;
	const ext = libpath.extname(originalname);
	const name = originalname.slice(0, -ext.length);
	const nextPath = libpath.join(libpath.dirname(path), `${name}.${Date.now()}${ext}`);

	fs.rename(path, nextPath, (err) => {
		if (err) {
			console.error(err);
			res.sendStatus(500);
		}

		if (skip === 'true') {
			files = files.slice(0, index + 1).concat(nextPath, files.slice(index + 1));
		} else {
			files.push(nextPath);
		}

		io.emit('server/update:files', { files });
		res.sendStatus(200);
	});
});

io.on('connection', (client) => {
	client.emit('server/hello', { volume, files, index, nice, bad });
	client.on('client/update:volume', ({ volume: next }) => {
		volume = next;
		io.emit('server/update:volume', { volume });
	});
	client.on('client/update:index', ({ index: next }) => {
		index = next;
		io.emit('server/update:index', { index });
	});
	client.on('client/update:nice', ({ nice: next }) => {
		nice = next;
		io.emit('server/update:nice', { nice });
	});
	client.on('client/update:bad', ({ bad: next }) => {
		bad = next;
		io.emit('server/update:bad', { bad });
	});
	client.on('client/reset:voted', () => {
		nice = 0;
		bad = 0;
		io.emit('server/reset:voted');
	});
});